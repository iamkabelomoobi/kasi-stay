import "dotenv/config";
import { connectDatabase, disconnectDatabase } from "@kasistay/db";
import { logger } from "@kasistay/logger";
import { startQueueWorker } from "../queue/client";
import { registerAuthProcessors } from "./processors";

let stopWorker: (() => void) | null = null;

export const bootstrapWorkers = async (): Promise<void> => {
  await connectDatabase();

  registerAuthProcessors();
  stopWorker = startQueueWorker();

  logger.info("Worker runtime started");
};

const shutdownWorkers = async (signal: NodeJS.Signals): Promise<void> => {
  logger.info(`Received ${signal}. Shutting down workers.`);

  if (stopWorker) {
    stopWorker();
  }

  await disconnectDatabase();
  process.exit(0);
};

if (require.main === module) {
  process.once("SIGINT", () => {
    void shutdownWorkers("SIGINT");
  });
  process.once("SIGTERM", () => {
    void shutdownWorkers("SIGTERM");
  });

  void bootstrapWorkers().catch(async (error) => {
    logger.error("Failed to start workers", error);
    await disconnectDatabase();
    process.exit(1);
  });
}
