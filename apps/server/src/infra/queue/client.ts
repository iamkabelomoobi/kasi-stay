import { logger } from "@kasistay/logger";
import { Queue, Worker, type JobsOptions } from "bullmq";
import Redis from "ioredis";
import { config } from "../config";
import { getQueueProcessor, listRecurringJobs } from "./registry";
import {
  QueueJob,
  QueueJobName,
  QueueJobOptions,
  QueueRetryOptions,
} from "./queue-types";

const pendingJobs: QueueJob<unknown>[] = [];

let queueConnection: Redis | null = null;
let queueClient: Queue<unknown> | null = null;
let queueWorker: Worker<unknown> | null = null;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const isBullMqEnabled = (): boolean =>
  config.queue.driver === "bullmq" && Boolean(config.redis.url);

const resolveRetryOptions = (options?: QueueJobOptions): QueueRetryOptions => ({
  attempts: options?.retry?.attempts ?? config.queue.retry.attempts,
  backoff: {
    strategy: (options?.retry?.backoff?.strategy ??
      config.queue.retry.backoff.strategy) as QueueRetryOptions["backoff"]["strategy"],
    delayMs:
      options?.retry?.backoff?.delayMs ?? config.queue.retry.backoff.delayMs,
  },
});

const getBackoffDelay = (
  strategy: QueueRetryOptions["backoff"]["strategy"],
  baseDelayMs: number,
  attempt: number,
): number => {
  if (strategy === "fixed") {
    return baseDelayMs;
  }

  return baseDelayMs * 2 ** (attempt - 1);
};

const resolveBullMqConnection = (): Redis | null => {
  if (!isBullMqEnabled() || !config.redis.url) {
    return null;
  }

  if (queueConnection) {
    return queueConnection;
  }

  queueConnection = new Redis(config.redis.url, {
    keyPrefix: config.redis.keyPrefix,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    connectTimeout: config.redis.connectTimeoutMs,
  });

  queueConnection.on("error", (error) => {
    logger.error("[infra.queue] BullMQ Redis connection error", { error });
  });

  return queueConnection;
};

const resolveBullMqQueue = async (): Promise<Queue<unknown> | null> => {
  const connection = resolveBullMqConnection();
  if (!connection) {
    return null;
  }

  if (queueClient) {
    return queueClient;
  }

  if (connection.status === "wait") {
    await connection.connect();
  }

  queueClient = new Queue(config.queue.name, {
    connection,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: 1000,
    },
  });

  return queueClient;
};

const executeProcessor = async (
  jobName: QueueJobName,
  payload: unknown,
): Promise<void> => {
  const processor = getQueueProcessor(jobName);
  if (!processor) {
    logger.warn(`No registered processor for job: ${jobName}`);
    return;
  }

  await processor(payload);
};

const executeWithRetry = async (job: QueueJob<unknown>): Promise<void> => {
  const retryOptions = resolveRetryOptions(job.options);

  for (let attempt = 1; attempt <= retryOptions.attempts; attempt += 1) {
    try {
      await executeProcessor(job.name, job.payload);
      return;
    } catch (error) {
      if (attempt >= retryOptions.attempts) {
        logger.error(
          `Queue job failed after ${attempt} attempts: ${job.name}`,
          error,
        );
        throw error;
      }

      const delayMs = getBackoffDelay(
        retryOptions.backoff.strategy,
        retryOptions.backoff.delayMs,
        attempt,
      );
      logger.warn(
        `Queue job failed (attempt ${attempt}/${retryOptions.attempts}): ${job.name}. Retrying in ${delayMs}ms.`,
      );
      await sleep(delayMs);
    }
  }
};

const toBullMqOptions = (options?: QueueJobOptions): JobsOptions => {
  const retryOptions = resolveRetryOptions(options);

  return {
    delay: options?.delayMs ?? 0,
    attempts: retryOptions.attempts,
    backoff: {
      type: retryOptions.backoff.strategy,
      delay: retryOptions.backoff.delayMs,
    },
    removeOnComplete: true,
    removeOnFail: 1000,
  };
};

const startRecurringSchedulers = (): (() => void) => {
  const timers = listRecurringJobs().map((job) => {
    const enqueueRecurringJob = () => {
      void enqueueJob({
        name: job.name,
        payload: job.payload,
        options: job.options,
      });
    };

    if (job.runOnStart) {
      enqueueRecurringJob();
    }

    return setInterval(enqueueRecurringJob, job.intervalMs);
  });

  return () => {
    timers.forEach((timer) => {
      clearInterval(timer);
    });
  };
};

export const enqueueJob = async <TPayload>(
  job: QueueJob<TPayload>,
): Promise<void> => {
  const queue = await resolveBullMqQueue();
  if (queue) {
    await queue.add(job.name, job.payload as Record<string, unknown>, toBullMqOptions(job.options));
    return;
  }

  const normalizedJob = job as QueueJob<unknown>;

  if (normalizedJob.options?.delayMs && normalizedJob.options.delayMs > 0) {
    setTimeout(() => {
      pendingJobs.push(normalizedJob);
    }, normalizedJob.options.delayMs);
    return;
  }

  pendingJobs.push(normalizedJob);
};

export const processPendingJobs = async (): Promise<void> => {
  while (pendingJobs.length > 0) {
    const nextJob = pendingJobs.shift();
    if (!nextJob) {
      break;
    }

    await executeWithRetry(nextJob);
  }
};

export const startQueueWorker = async (): Promise<() => Promise<void>> => {
  const stopRecurringSchedulers = startRecurringSchedulers();

  if (isBullMqEnabled()) {
    const connection = resolveBullMqConnection();
    if (connection) {
      if (connection.status === "wait") {
        await connection.connect();
      }

      queueWorker = new Worker(
        config.queue.name,
        async (job) => {
          await executeProcessor(job.name as QueueJobName, job.data);
        },
        {
          connection,
          concurrency: config.queue.worker.concurrency,
        },
      );

      queueWorker.on("error", (error) => {
        logger.error("[infra.queue] Worker error", { error });
      });

      queueWorker.on("failed", (job, error) => {
        logger.error("[infra.queue] Worker job failed", {
          jobName: job?.name,
          jobId: job?.id,
          error,
        });
      });

      return async () => {
        stopRecurringSchedulers();
        await queueWorker?.close();
        queueWorker = null;
        await queueClient?.close();
        queueClient = null;
        await queueConnection?.quit();
        queueConnection = null;
      };
    }
  }

  const interval = setInterval(() => {
    void processPendingJobs();
  }, config.queue.worker.pollIntervalMs);

  return async () => {
    stopRecurringSchedulers();
    clearInterval(interval);
  };
};
