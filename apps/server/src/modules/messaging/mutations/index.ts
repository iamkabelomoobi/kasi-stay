import {
  ConversationContextType,
  MessageType,
} from "@kasistay/db";
import { Context } from "../../../app/context";
import { badInput, notFound, unauthorized } from "../../../utils/errors";
import { notifyUsers } from "../../../utils/notify-users";
import { parseEnum } from "../../../utils/parse-enum";
import { assertConversationAccess, conversationInclude } from "../queries";

type CreateConversationRecordInput = {
  createdById: string;
  participantUserIds: string[];
  subject?: string | null;
  contextType?: ConversationContextType | null;
  contextId?: string | null;
  initialMessage?: string | null;
};

const getConversationNotification = (contextType?: ConversationContextType | null) => {
  switch (contextType) {
    case ConversationContextType.PROPERTY:
      return {
        type: "PROPERTY_CONVERSATION_MESSAGE",
        title: "New property message",
      };
    case ConversationContextType.ROOMMATE:
      return {
        type: "ROOMMATE_CONVERSATION_MESSAGE",
        title: "New roommate message",
      };
    case ConversationContextType.MARKETPLACE_ITEM:
      return {
        type: "MARKETPLACE_CONVERSATION_MESSAGE",
        title: "New marketplace message",
      };
    case ConversationContextType.SERVICE:
      return {
        type: "SERVICE_CONVERSATION_MESSAGE",
        title: "New service message",
      };
    default:
      return {
        type: "CONVERSATION_MESSAGE",
        title: "New message",
      };
  }
};

const validateConversationContext = async (
  ctx: Context,
  contextType?: ConversationContextType | null,
  contextId?: string | null,
) => {
  if (!contextType || !contextId) {
    return;
  }

  switch (contextType) {
    case ConversationContextType.PROPERTY: {
      const property = await ctx.prisma.property.findUnique({
        where: { id: contextId },
        select: { id: true },
      });
      if (!property) notFound("Property not found");
      break;
    }
    case ConversationContextType.ROOMMATE: {
      const profile = await ctx.prisma.roommateProfile.findUnique({
        where: { id: contextId },
        select: { id: true },
      });
      if (!profile) notFound("Roommate profile not found");
      break;
    }
    case ConversationContextType.MARKETPLACE_ITEM: {
      const item = await ctx.prisma.marketplaceItem.findUnique({
        where: { id: contextId },
        select: { id: true },
      });
      if (!item) notFound("Marketplace item not found");
      break;
    }
    case ConversationContextType.SERVICE: {
      const [request, listing] = await Promise.all([
        ctx.prisma.serviceRequest.findUnique({
          where: { id: contextId },
          select: { id: true },
        }),
        ctx.prisma.serviceListing.findUnique({
          where: { id: contextId },
          select: { id: true },
        }),
      ]);
      if (!request && !listing) notFound("Service context not found");
      break;
    }
  }
};

const getConversationParticipants = async (
  participantUserIds: string[],
  createdById: string,
  ctx: Context,
) => {
  const uniqueUserIds = Array.from(
    new Set([...participantUserIds.map(String), createdById]),
  );

  if (uniqueUserIds.length < 2) {
    badInput("At least two unique participants are required");
  }

  const users = await ctx.prisma.user.findMany({
    where: {
      id: {
        in: uniqueUserIds,
      },
    },
    select: {
      id: true,
    },
  });

  if (users.length !== uniqueUserIds.length) {
    badInput("One or more conversation participants do not exist");
  }

  return uniqueUserIds;
};

export const sendMessageRecord = async (
  input: {
    conversationId: string;
    senderId: string;
    body: string;
    type?: MessageType;
  },
  ctx: Context,
) => {
  const conversation = await ctx.prisma.conversation.findUnique({
    where: { id: input.conversationId },
    include: conversationInclude,
  });

  if (!conversation) {
    notFound("Conversation not found");
  }
  const current = conversation!;

  if (
    !ctx.isAdmin &&
    !current.participants.some(
      (participant) => participant.userId === input.senderId,
    )
  ) {
    unauthorized();
  }

  const now = new Date();
  const message = await ctx.prisma.$transaction(async (tx) => {
    const created = await tx.message.create({
      data: {
        conversationId: input.conversationId,
        senderId: input.senderId,
        body: input.body,
        type: input.type ?? MessageType.TEXT,
      },
    });

    await tx.conversation.update({
      where: { id: input.conversationId },
      data: {
        lastMessageAt: created.createdAt,
      },
    });

    await tx.conversationParticipant.updateMany({
      where: {
        conversationId: input.conversationId,
      },
      data: {
        archivedAt: null,
      },
    });

    await tx.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: input.conversationId,
          userId: input.senderId,
        },
      },
      data: {
        lastReadAt: now,
        archivedAt: null,
      },
    });

    return created;
  });

  const recipients = current.participants
    .map((participant) => participant.userId)
    .filter((userId) => userId !== input.senderId);
  const notification = getConversationNotification(current.contextType);

  await notifyUsers(ctx, {
    userIds: recipients,
    type: notification.type,
    title: notification.title,
    body:
      input.body.length > 140
        ? `${input.body.slice(0, 137)}...`
        : input.body,
    metadata: {
      conversationId: input.conversationId,
      contextType: current.contextType,
      contextId: current.contextId,
      senderId: input.senderId,
    },
  });

  return message;
};

export const createConversationRecord = async (
  input: CreateConversationRecordInput,
  ctx: Context,
) => {
  await validateConversationContext(ctx, input.contextType, input.contextId);
  const participantUserIds = await getConversationParticipants(
    input.participantUserIds,
    input.createdById,
    ctx,
  );
  const now = new Date();

  const conversation = await ctx.prisma.conversation.create({
    data: {
      createdById: input.createdById,
      subject: input.subject ?? null,
      contextType: input.contextType ?? null,
      contextId: input.contextId ?? null,
      lastMessageAt: input.initialMessage?.trim() ? now : null,
      participants: {
        create: participantUserIds.map((userId) => ({
          userId,
          lastReadAt: userId === input.createdById && input.initialMessage?.trim()
            ? now
            : null,
        })),
      },
      ...(input.initialMessage?.trim()
        ? {
            messages: {
              create: {
                senderId: input.createdById,
                body: input.initialMessage.trim(),
                type: MessageType.TEXT,
              },
            },
          }
        : {}),
    },
    include: conversationInclude,
  });

  if (input.initialMessage?.trim()) {
    const recipients = conversation.participants
      .map((participant) => participant.userId)
      .filter((userId) => userId !== input.createdById);
    const notification = getConversationNotification(conversation.contextType);

    await notifyUsers(ctx, {
      userIds: recipients,
      type: notification.type,
      title: notification.title,
      body:
        input.initialMessage.length > 140
          ? `${input.initialMessage.slice(0, 137)}...`
          : input.initialMessage,
      metadata: {
        conversationId: conversation.id,
        contextType: conversation.contextType,
        contextId: conversation.contextId,
        senderId: input.createdById,
      },
    });
  }

  return conversation;
};

export const createConversation = async (
  input: {
    participantUserIds: string[];
    subject?: string | null;
    contextType?: string | null;
    contextId?: string | null;
    initialMessage?: string | null;
  },
  ctx: Context,
) => {
  const user = ctx.assertAuth();
  const contextType = parseEnum(
    ConversationContextType,
    input.contextType ?? undefined,
    "conversation context type",
  );

  return createConversationRecord(
    {
      createdById: user.id,
      participantUserIds: input.participantUserIds.map(String),
      subject: input.subject ?? null,
      contextType: contextType ?? null,
      contextId: input.contextId ? String(input.contextId) : null,
      initialMessage: input.initialMessage ?? null,
    },
    ctx,
  );
};

export const sendMessage = async (
  conversationId: string,
  input: { body: string },
  ctx: Context,
) => {
  const user = ctx.assertAuth();
  if (!input.body.trim()) {
    badInput("Message body is required");
  }

  await assertConversationAccess(conversationId, ctx);
  return sendMessageRecord(
    {
      conversationId,
      senderId: user.id,
      body: input.body.trim(),
    },
    ctx,
  );
};

export const markConversationRead = async (
  conversationId: string,
  ctx: Context,
) => {
  const user = ctx.assertAuth();
  await assertConversationAccess(conversationId, ctx);

  return ctx.prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.id,
      },
    },
    data: {
      lastReadAt: new Date(),
      archivedAt: null,
    },
    include: {
      user: true,
    },
  });
};

export const archiveConversation = async (
  conversationId: string,
  ctx: Context,
) => {
  const user = ctx.assertAuth();
  await assertConversationAccess(conversationId, ctx);

  return ctx.prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.id,
      },
    },
    data: {
      archivedAt: new Date(),
    },
    include: {
      user: true,
    },
  });
};
