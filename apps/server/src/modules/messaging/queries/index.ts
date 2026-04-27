import { ConversationContextType, Prisma } from "@kasistay/db";
import { Context } from "../../../app/context";
import { notFound, unauthorized } from "../../../utils/errors";
import { parseEnum } from "../../../utils/parse-enum";

export type ConversationFilter = {
  contextType?: string | null;
  contextId?: string | null;
  includeArchived?: boolean | null;
  limit?: number | null;
  offset?: number | null;
};

export const conversationInclude = {
  participants: {
    include: {
      user: true,
    },
  },
} satisfies Prisma.ConversationInclude;

export type ConversationShape = Prisma.ConversationGetPayload<{
  include: typeof conversationInclude;
}>;

export type MessageShape = Prisma.MessageGetPayload<Record<string, never>>;
export type ConversationParticipantShape = Prisma.ConversationParticipantGetPayload<{
  include: { user: true };
}>;

const buildConversationWhere = (
  ctx: Context,
  filter?: ConversationFilter,
): Prisma.ConversationWhereInput => {
  const contextType = parseEnum(
    ConversationContextType,
    filter?.contextType ?? undefined,
    "conversation context type",
  );

  return {
    ...(ctx.isAdmin
      ? {}
      : {
          participants: {
            some: {
              userId: ctx.assertAuth().id,
              ...(filter?.includeArchived ? {} : { archivedAt: null }),
            },
          },
        }),
    ...(contextType && { contextType }),
    ...(filter?.contextId && { contextId: String(filter.contextId) }),
  };
};

export const assertConversationAccess = async (
  conversationId: string,
  ctx: Context,
) => {
  const conversation = await ctx.prisma.conversation.findUnique({
    where: { id: conversationId },
    include: conversationInclude,
  });

  if (!conversation) {
    notFound("Conversation not found");
  }
  const current = conversation!;

  if (
    !ctx.isAdmin &&
    !current.participants.some(
      (participant) => participant.userId === ctx.assertAuth().id,
    )
  ) {
    unauthorized();
  }

  return current;
};

export const listConversations = async (
  ctx: Context,
  filter?: ConversationFilter,
) =>
  ctx.prisma.conversation.findMany({
    where: buildConversationWhere(ctx, filter),
    include: conversationInclude,
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
    take: filter?.limit ?? 20,
    skip: filter?.offset ?? 0,
  });

export const getConversation = async (conversationId: string, ctx: Context) =>
  assertConversationAccess(conversationId, ctx);

export const listMessages = async (
  conversationId: string,
  ctx: Context,
  limit = 50,
  offset = 0,
) => {
  await assertConversationAccess(conversationId, ctx);

  return ctx.prisma.message.findMany({
    where: {
      conversationId,
    },
    orderBy: [{ createdAt: "asc" }],
    take: limit,
    skip: offset,
  });
};
