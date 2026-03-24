export type QueueJobName = `${string}.${string}`;

export type QueueBackoffStrategy = "fixed" | "exponential";

export type QueueRetryOptions = {
  attempts: number;
  backoff: {
    strategy: QueueBackoffStrategy;
    delayMs: number;
  };
};

export type QueueJobOptions = {
  retry?: Partial<QueueRetryOptions>;
  delayMs?: number;
};

export type QueueJob<TPayload> = {
  name: QueueJobName;
  payload: TPayload;
  options?: QueueJobOptions;
};

export type QueueProcessor<TPayload> = (payload: TPayload) => Promise<void>;
