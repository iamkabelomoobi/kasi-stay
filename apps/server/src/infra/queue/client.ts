import { logger } from "@kasistay/logger";
import { config } from "../config";
import { getQueueProcessor } from "./registry";
import {
  QueueJob,
  QueueJobOptions,
  QueueRetryOptions,
} from "./queue-types";

const pendingJobs: QueueJob<unknown>[] = [];

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const resolveRetryOptions = (options?: QueueJobOptions): QueueRetryOptions => ({
  attempts: options?.retry?.attempts ?? config.queue.retry.attempts,
  backoff: {
    strategy: (options?.retry?.backoff?.strategy ??
      config.queue.retry.backoff
        .strategy) as QueueRetryOptions["backoff"]["strategy"],
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

const executeWithRetry = async (job: QueueJob<unknown>): Promise<void> => {
  const processor = getQueueProcessor(job.name);
  if (!processor) {
    logger.warn(`No registered processor for job: ${job.name}`);
    return;
  }

  const retryOptions = resolveRetryOptions(job.options);

  for (let attempt = 1; attempt <= retryOptions.attempts; attempt += 1) {
    try {
      await processor(job.payload);
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

export const enqueueJob = async <TPayload>(
  job: QueueJob<TPayload>,
): Promise<void> => {
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

export const startQueueWorker = (): (() => void) => {
  const interval = setInterval(() => {
    void processPendingJobs();
  }, config.queue.worker.pollIntervalMs);

  return () => {
    clearInterval(interval);
  };
};
