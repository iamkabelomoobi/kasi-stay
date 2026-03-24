import { IncomingHttpHeaders } from "http";
import { getBetterAuthHeaders, auth } from "@paystay/auth";

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

export const getSessionFromHeaders = async (
  headers: IncomingHttpHeaders,
): Promise<Session | null> =>
  auth.api.getSession({
    headers: getBetterAuthHeaders(headers),
  });
