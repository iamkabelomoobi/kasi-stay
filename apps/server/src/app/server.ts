import express from "express";
import http from "http";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { toNodeHandler } from "better-auth/node";
import { auth } from "@kasistay/auth";
import { connectDatabase, disconnectDatabase } from "@kasistay/db";
import { logger } from "@kasistay/logger";
import { config } from "../infra";
import { Context } from "./context";
import { schema } from "./index";
import ip from "ip";

type ServerRuntime = {
  app: express.Express;
  httpServer: http.Server;
  start: (port?: number) => Promise<number>;
  stop: (reason?: string) => Promise<void>;
};

export const createServerRuntime = async (): Promise<ServerRuntime> => {
  try {
    await connectDatabase();
  } catch (error) {
    logger.error("Failed to connect to database", { error });
    throw error;
  }

  const app = express();
  const httpServer = http.createServer(app);

  let apolloServer: ApolloServer<Context>;
  try {
    apolloServer = new ApolloServer<Context>({ schema });
    await apolloServer.start();
  } catch (error) {
    logger.error("Failed to start Apollo Server", { error });
    throw error;
  }

  app.use(
    cors({
      origin: config.server.corsOrigins,
      credentials: true,
    }),
  );

  app.all("/api/auth/*", toNodeHandler(auth));
  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(apolloServer, {
      context: ({ req }) => Context.fromRequest(req),
    }),
  );

  let stopping = false;

  const stop = async (reason = "shutdown"): Promise<void> => {
    if (stopping) return;
    stopping = true;
    logger.info(`[server] ${reason} received, shutting down.`);
    await apolloServer.stop();
    await disconnectDatabase();
    await new Promise<void>((resolve, reject) => {
      httpServer.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  };

  const start = async (port = config.server.port): Promise<number> => {
    return await new Promise<number>((resolve) => {
      httpServer.listen({ port }, () => {
        const address = httpServer.address();
        const actualPort =
          typeof address === "object" && address ? address.port : port;
        logger.info({
          message: "Server is running",
          host: ip.address(),
          port: actualPort,
        });
        resolve(actualPort);
      });
    });
  };

  return { app, httpServer, start, stop };
};
