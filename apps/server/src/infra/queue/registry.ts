import { QueueJobName, QueueProcessor } from "./queue-types";

const processorRegistry = new Map<QueueJobName, QueueProcessor<unknown>>();

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
