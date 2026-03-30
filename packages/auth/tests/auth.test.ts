import assert from "node:assert/strict";
import { mock, test } from "node:test";

test("signup post-processing sends a welcome email after provisioning the customer role", async () => {
  process.env.APP_NAME = "PayStay Test";

  const sendEmailCalls: Array<Record<string, unknown>> = [];
  const userUpdates: Array<Record<string, unknown>> = [];
  const customerUpserts: Array<Record<string, unknown>> = [];

  mock.module("@paystay/db", {
    namedExports: {
      prisma: {
        user: {
          update: async (args: Record<string, unknown>) => {
            userUpdates.push(args);
            return args;
          },
        },
        admin: {
          upsert: async (_args: Record<string, unknown>) => undefined,
        },
        customer: {
          upsert: async (args: Record<string, unknown>) => {
            customerUpserts.push(args);
            return args;
          },
        },
      },
      UserRole: {
        ADMIN: "ADMIN",
        CUSTOMER: "CUSTOMER",
      },
    },
  });

  mock.module("@paystay/email", {
    namedExports: {
      sendEmail: async (payload: Record<string, unknown>) => {
        sendEmailCalls.push(payload);
      },
      authenticationTemplates: {
        welcomeTemplate: ({
          email,
          name,
          appName,
        }: {
          email: string;
          name: string;
          appName: string;
        }) => ({
          to: email,
          subject: `Welcome to ${appName}`,
          html: `<p>Hello ${name}</p>`,
          text: `Hello ${name}`,
        }),
        passwordResetLinkTemplate: () => ({
          to: "unused@example.com",
          subject: "unused",
          html: "",
          text: "",
        }),
        passwordUpdateTemplate: () => ({
          to: "unused@example.com",
          subject: "unused",
          html: "",
          text: "",
        }),
      },
    },
  });

  mock.module("@paystay/logger", {
    namedExports: {
      logger: {
        warn: () => undefined,
        info: () => undefined,
        error: () => undefined,
        debug: () => undefined,
      },
    },
  });

  let authOptions:
    | {
        databaseHooks?: {
          user?: {
            create?: {
              after?: (user: Record<string, unknown>) => Promise<void>;
            };
          };
        };
      }
    | undefined;

  mock.module("better-auth", {
    namedExports: {
      betterAuth: (options: typeof authOptions) => {
        authOptions = options;

        return {
          api: {},
          $Infer: {
            Session: {
              user: {},
            },
          },
        };
      },
    },
  });

  mock.module("better-auth/adapters/prisma", {
    namedExports: {
      prismaAdapter: () => ({
        provider: "postgresql",
      }),
    },
  });

  await import("../src/libs/auth.ts");

  const afterCreate = authOptions?.databaseHooks?.user?.create?.after;

  assert.ok(afterCreate);

  await afterCreate({
    id: "user_123",
    name: "signup-user",
    email: "signup@example.com",
    role: "CUSTOMER",
  });

  assert.equal(userUpdates.length, 1);
  assert.equal(customerUpserts.length, 1);
  assert.equal(sendEmailCalls.length, 1);
  assert.equal(sendEmailCalls[0]?.to, "signup@example.com");
  assert.match(String(sendEmailCalls[0]?.subject), /welcome/i);
});
