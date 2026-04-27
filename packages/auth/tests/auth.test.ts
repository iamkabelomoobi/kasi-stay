import assert from "node:assert/strict";
import { test } from "node:test";
import { prisma, UserRole } from "@kasistay/db";
import { createRoleRecord } from "../src/utils/create-role-record.ts";

test("createRoleRecord defaults invalid roles to renter and provisions renter state", async () => {
  const originalTransaction = prisma.$transaction.bind(prisma);
  const userUpdates: Array<Record<string, unknown>> = [];
  const renterCreates: Array<Record<string, unknown>> = [];

  Object.assign(prisma, {
    $transaction: async (
      callback: (tx: {
        user: {
          update: (args: Record<string, unknown>) => Promise<unknown>;
        };
        admin: {
          deleteMany: (args: Record<string, unknown>) => Promise<unknown>;
          create: (args: Record<string, unknown>) => Promise<unknown>;
        };
        renter: {
          deleteMany: (args: Record<string, unknown>) => Promise<unknown>;
          create: (args: Record<string, unknown>) => Promise<unknown>;
        };
      }) => Promise<unknown>,
    ) =>
      callback({
        user: {
          update: async (args: Record<string, unknown>) => {
            userUpdates.push(args);
            return args;
          },
        },
        admin: {
          deleteMany: async () => undefined,
          create: async () => undefined,
        },
        renter: {
          deleteMany: async () => undefined,
          create: async (args: Record<string, unknown>) => {
            renterCreates.push(args);
            return args;
          },
        },
      }),
  });

  try {
    await createRoleRecord({
      id: "user-1",
      role: "NOT_A_REAL_ROLE",
    });
  } finally {
    Object.assign(prisma, {
      $transaction: originalTransaction,
    });
  }

  assert.deepEqual(userUpdates, [
    {
      where: { id: "user-1" },
      data: { role: UserRole.RENTER },
    },
  ]);
  assert.deepEqual(renterCreates, [
    {
      data: { userId: "user-1" },
    },
  ]);
});
