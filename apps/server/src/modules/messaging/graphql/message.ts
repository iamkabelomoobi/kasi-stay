import { builder } from "../../../app/builder";
import {
  archiveConversation,
  createConversation,
  markConversationRead,
  sendMessage,
} from "../mutations";
import {
  getConversation,
  listConversations,
  listMessages,
  type ConversationParticipantShape,
  type ConversationShape,
  type MessageShape,
} from "../queries";
import {
  ConversationFilterInput,
  CreateConversationInput,
  SendMessageInput,
} from "../messaging.types";

const ConversationParticipantRef =
  builder.objectRef<ConversationParticipantShape>("ConversationParticipant");
ConversationParticipantRef.implement({
  fields: (t) => ({
    conversationId: t.id({ resolve: (parent) => parent.conversationId }),
    userId: t.id({ resolve: (parent) => parent.userId }),
    joinedAt: t.field({ type: "Date", resolve: (parent) => parent.joinedAt }),
    lastReadAt: t.field({
      type: "Date",
      nullable: true,
      resolve: (parent) => parent.lastReadAt ?? null,
    }),
    archivedAt: t.field({
      type: "Date",
      nullable: true,
      resolve: (parent) => parent.archivedAt ?? null,
    }),
    userName: t.string({
      nullable: true,
      resolve: (parent) => parent.user?.name ?? null,
    }),
    userEmail: t.string({
      nullable: true,
      resolve: (parent) => parent.user?.email ?? null,
    }),
  }),
});

const MessageRef = builder.objectRef<MessageShape>("ConversationMessage");
MessageRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    conversationId: t.id({ resolve: (parent) => parent.conversationId }),
    senderId: t.id({ resolve: (parent) => parent.senderId }),
    body: t.string({ resolve: (parent) => parent.body }),
    type: t.string({ resolve: (parent) => parent.type }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

const ConversationRef = builder.objectRef<ConversationShape>("Conversation");
ConversationRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    createdById: t.id({ resolve: (parent) => parent.createdById }),
    subject: t.string({
      nullable: true,
      resolve: (parent) => parent.subject ?? null,
    }),
    contextType: t.string({
      nullable: true,
      resolve: (parent) => parent.contextType ?? null,
    }),
    contextId: t.id({
      nullable: true,
      resolve: (parent) => parent.contextId ?? null,
    }),
    lastMessageAt: t.field({
      type: "Date",
      nullable: true,
      resolve: (parent) => parent.lastMessageAt ?? null,
    }),
    participants: t.field({
      type: [ConversationParticipantRef],
      resolve: (parent) => parent.participants,
    }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

builder.queryField("conversations", (t) =>
  t.field({
    type: [ConversationRef],
    authScopes: { isAuthenticated: true },
    args: {
      filter: t.arg({ type: ConversationFilterInput, required: false }),
    },
    resolve: (_, args, ctx) => listConversations(ctx, args.filter ?? undefined),
  }),
);

builder.queryField("conversation", (t) =>
  t.field({
    type: ConversationRef,
    nullable: true,
    authScopes: { isAuthenticated: true },
    args: {
      conversationId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => getConversation(String(args.conversationId), ctx),
  }),
);

builder.queryField("messages", (t) =>
  t.field({
    type: [MessageRef],
    authScopes: { isAuthenticated: true },
    args: {
      conversationId: t.arg.id({ required: true }),
      limit: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
    },
    resolve: (_, args, ctx) =>
      listMessages(
        String(args.conversationId),
        ctx,
        args.limit ?? 50,
        args.offset ?? 0,
      ),
  }),
);

builder.mutationField("createConversation", (t) =>
  t.field({
    type: ConversationRef,
    authScopes: { isAuthenticated: true },
    args: {
      input: t.arg({ type: CreateConversationInput, required: true }),
    },
    resolve: (_, args, ctx) => createConversation(args.input, ctx),
  }),
);

builder.mutationField("sendMessage", (t) =>
  t.field({
    type: MessageRef,
    authScopes: { isAuthenticated: true },
    args: {
      conversationId: t.arg.id({ required: true }),
      input: t.arg({ type: SendMessageInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      sendMessage(String(args.conversationId), args.input, ctx),
  }),
);

builder.mutationField("markConversationRead", (t) =>
  t.field({
    type: ConversationParticipantRef,
    authScopes: { isAuthenticated: true },
    args: {
      conversationId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      markConversationRead(String(args.conversationId), ctx),
  }),
);

builder.mutationField("archiveConversation", (t) =>
  t.field({
    type: ConversationParticipantRef,
    authScopes: { isAuthenticated: true },
    args: {
      conversationId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      archiveConversation(String(args.conversationId), ctx),
  }),
);
