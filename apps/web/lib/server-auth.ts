import { headers } from "next/headers";
import { logger } from "@kasistay/logger";
import type { Session } from "@kasistay/auth";

const authBaseURL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.NEXT_PUBLIC_AUTH_URL;

if (!authBaseURL && process.env.NODE_ENV === "production") {
  throw new Error(
    "Auth base URL is not configured. Set NEXT_PUBLIC_BETTER_AUTH_URL.",
  );
}

const baseURL = authBaseURL ?? "http://localhost:4000";

export type ServerSession = Session | null;

export const getServerSession = async (): Promise<ServerSession> => {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie");

  if (!cookie) return null;

  try {
    const response = await fetch(`${baseURL}/api/auth/get-session`, {
      cache: "no-store",
      headers: { cookie },
    });

    if (!response.ok) {
      logger.warn("Failed to fetch server session", {
        status: response.status,
        url: `${baseURL}/api/auth/get-session`,
      });
      return null;
    }

    return (await response.json()) as Session;
  } catch (error) {
    logger.error("Unexpected error fetching server session", { error });
    return null;
  }
};
