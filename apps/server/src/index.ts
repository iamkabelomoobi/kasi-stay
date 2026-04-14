import { disconnectDatabase } from "@kasistay/db";
import { pathToFileURL } from "node:url";
import { createServerRuntime } from "./app/server";
import { seedAdmin } from "./infra";

export const bootstrapServer = async (): Promise<void> => {
  const runtime = await createServerRuntime();
  await seedAdmin();

  const handleSignal = (signal: NodeJS.Signals) => {
    void runtime.stop(signal).finally(() => {
      process.exit(0);
    });
  };

  process.once("SIGINT", () => {
    handleSignal("SIGINT");
  });
  process.once("SIGTERM", () => {
    handleSignal("SIGTERM");
  });

  await runtime.start();
};

export const startServer = async (): Promise<void> => {
  try {
    await bootstrapServer();
  } catch (error) {
    console.error("Failed to start server:", error);
    await disconnectDatabase();
    process.exit(1);
  }
};

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  void startServer();
}
