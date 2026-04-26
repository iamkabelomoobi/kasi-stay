import {
  QueueJobName,
  QueueProcessor,
  RecurringQueueJob,
} from "./queue-types";

const processorRegistry = new Map<QueueJobName, QueueProcessor<unknown>>();
const recurringJobRegistry = new Map<
  QueueJobName,
  RecurringQueueJob<unknown>
>();

export const registerQueueProcessor = <TPayload>(
  jobName: QueueJobName,
  processor: QueueProcessor<TPayload>,
): void => {
  processorRegistry.set(jobName, processor as QueueProcessor<unknown>);
};

export const getQueueProcessor = (
  jobName: QueueJobName,
): QueueProcessor<unknown> | undefined => processorRegistry.get(jobName);

export const listRegisteredProcessors = (): QueueJobName[] =>
  Array.from(processorRegistry.keys());

export const registerRecurringJob = <TPayload>(
  job: RecurringQueueJob<TPayload>,
): void => {
  recurringJobRegistry.set(job.name, job as RecurringQueueJob<unknown>);
};

export const listRecurringJobs = (): RecurringQueueJob<unknown>[] =>
  Array.from(recurringJobRegistry.values());
