import { enqueueJob } from "./client";
import {
  QueueJobName,
  QueueJobOptions,
  RecurringQueueJob,
} from "./queue-types";
import { registerRecurringJob } from "./registry";

export const createJobEnqueuer = <TPayload>(jobName: QueueJobName) => {
  return async (
    payload: TPayload,
    options?: QueueJobOptions,
  ): Promise<void> => {
    await enqueueJob({ name: jobName, payload, options });
  };
};

export const createRecurringJob = <TPayload>(
  job: RecurringQueueJob<TPayload>,
): void => {
  registerRecurringJob(job);
};
