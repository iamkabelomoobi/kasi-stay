import { fromNodeHeaders } from "better-auth/node";
import { IncomingHttpHeaders } from "http";

export const getBetterAuthHeaders = (headers: IncomingHttpHeaders): Headers => {
  const normalized = Object.fromEntries(
    Object.entries(headers)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join(", ") : (value as string),
      ]),
  );
  return fromNodeHeaders(normalized);
};