import { createAuthClient } from "better-auth/react";

const authBaseURL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_AUTH_URL ||
  process.env.BETTER_AUTH_URL ||
  "http://localhost:4000";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  baseURL: authBaseURL,
});

export { createAuthClient };
