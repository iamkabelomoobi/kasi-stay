import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient, Prisma } from "./generated/prisma/client";

const currentDir = dirname(fileURLToPath(import.meta.url));

loadEnv({ path: resolve(currentDir, "../../.env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

type ConnectDatabaseOptions = {
  retries?: number;
  retryDelayMs?: number;
};

const globalForPrisma = globalThis as typeof globalThis & {
  prismaAdapter?: PrismaPg;
  prisma?: PrismaClient;
};

const adapter =
  globalForPrisma.prismaAdapter ?? new PrismaPg({ connectionString });

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaAdapter = adapter;
  globalForPrisma.prisma = prisma;
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const connectDatabase = async (
  options: ConnectDatabaseOptions = {},
): Promise<void> => {
  const retries =
    options.retries ?? parseInt(process.env.DB_CONNECT_RETRIES || "5", 10);
  const retryDelayMs =
    options.retryDelayMs ??
    parseInt(process.env.DB_CONNECT_RETRY_DELAY_MS || "2000", 10);

  for (let attempt = 1; attempt <= retries + 1; attempt += 1) {
    try {
      await prisma.$connect();
      if (attempt > 1) {
        console.info(`[db] Connected after ${attempt} attempts.`);
      }
      return;
    } catch (error) {
      if (attempt > retries) {
        throw error;
      }
      console.warn(
        `[db] Connection attempt ${attempt} failed. Retrying in ${retryDelayMs}ms...`,
      );
      await sleep(retryDelayMs);
    }
  }
};

const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
};

export { prisma, connectDatabase, disconnectDatabase, Prisma };
export type { PrismaClient };
export * from "./generated/prisma/client";
