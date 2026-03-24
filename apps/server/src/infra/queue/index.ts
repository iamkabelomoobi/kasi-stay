import { enqueueJob } from "./client";
import { QueueJobName, QueueJobOptions } from "./queue-types";

export const createJobEnqueuer = <TPayload>(jobName: QueueJobName) => {
  return async (
    payload: TPayload,
    options?: QueueJobOptions,
  ): Promise<void> => {
    await enqueueJob({ name: jobName, payload, options });
  };
};
