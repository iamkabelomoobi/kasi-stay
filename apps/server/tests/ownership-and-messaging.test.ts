import assert from "node:assert/strict";
import { test } from "node:test";
import { MessageType } from "@kasistay/db";
import {
  markConversationRead,
  sendMessageRecord,
} from "../src/modules/messaging/mutations/index.ts";
import { updateMarketplaceItem } from "../src/modules/marketplace/mutations/index.ts";

test("marketplace mutations reject non-owner updates", async () => {
  const ctx = {
    isAdmin: false,
    assertAuth: () => ({ id: "user-1" }),
    prisma: {
      marketplaceItem: {
        findUnique: async () => ({
          id: "item-1",
          ownerId: "user-2",
        }),
      },
    },
  } as never;

  await assert.rejects(
    () => updateMarketplaceItem("item-1", { title: "Updated" }, ctx),
    /Unauthorized/,
  );
});

test("sendMessageRecord persists a message and updates participant state", async () => {
  const transactionCalls: string[] = [];
  const createdAt = new Date("2026-04-27T10:00:00.000Z");

  const ctx = {
    isAdmin: false,
    prisma: {
      conversation: {
        findUnique: async () => ({
          id: "conversation-1",
          contextType: null,
          contextId: null,
          participants: [{ userId: "user-1" }],
        }),
      },
      $transaction: async (
        callback: (tx: {
          message: {
            create: (args: Record<string, unknown>) => Promise<unknown>;
          };
          conversation: {
            update: (args: Record<string, unknown>) => Promise<unknown>;
          };
          conversationParticipant: {
            updateMany: (args: Record<string, unknown>) => Promise<unknown>;
            update: (args: Record<string, unknown>) => Promise<unknown>;
          };
        }) => Promise<unknown>,
      ) =>
        callback({
          message: {
            create: async () => {
              transactionCalls.push("message.create");
              return {
                id: "message-1",
                conversationId: "conversation-1",
                senderId: "user-1",
                body: "Hello there",
                type: MessageType.TEXT,
                createdAt,
                updatedAt: createdAt,
              };
            },
          },
          conversation: {
            update: async () => {
              transactionCalls.push("conversation.update");
              return undefined;
            },
          },
          conversationParticipant: {
            updateMany: async () => {
              transactionCalls.push("conversationParticipant.updateMany");
              return { count: 1 };
            },
            update: async () => {
              transactionCalls.push("conversationParticipant.update");
              return undefined;
            },
          },
        }),
    },
  } as never;

  const message = await sendMessageRecord(
    {
      conversationId: "conversation-1",
      senderId: "user-1",
      body: "Hello there",
    },
    ctx,
  );

  assert.equal(message.body, "Hello there");
  assert.deepEqual(transactionCalls, [
    "message.create",
    "conversation.update",
    "conversationParticipant.updateMany",
    "conversationParticipant.update",
  ]);
});

test("markConversationRead updates the participant record after access is confirmed", async () => {
  const lastReadAt = new Date("2026-04-27T11:00:00.000Z");
  const ctx = {
    isAdmin: false,
    assertAuth: () => ({ id: "user-1" }),
    prisma: {
      conversation: {
        findUnique: async () => ({
          id: "conversation-1",
          participants: [{ userId: "user-1", user: { id: "user-1" } }],
        }),
      },
      conversationParticipant: {
        update: async () => ({
          conversationId: "conversation-1",
          userId: "user-1",
          joinedAt: new Date("2026-04-27T09:00:00.000Z"),
          archivedAt: null,
          lastReadAt,
          user: {
            id: "user-1",
            name: "Reader",
            email: "reader@example.com",
          },
        }),
      },
    },
  } as never;

  const result = await markConversationRead("conversation-1", ctx);
  assert.equal(result.userId, "user-1");
  assert.equal(result.conversationId, "conversation-1");
  assert.equal(result.lastReadAt?.toISOString(), lastReadAt.toISOString());
});
