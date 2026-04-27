import { builder } from "../../app/builder";

export const ConversationFilterInput = builder.inputType(
  "ConversationFilterInput",
  {
    fields: (t) => ({
      contextType: t.string({ required: false }),
      contextId: t.id({ required: false }),
      includeArchived: t.boolean({ required: false }),
      limit: t.int({ required: false }),
      offset: t.int({ required: false }),
    }),
  },
);

export const CreateConversationInput = builder.inputType(
  "CreateConversationInput",
  {
    fields: (t) => ({
      participantUserIds: t.idList({ required: true }),
      subject: t.string({ required: false }),
      contextType: t.string({ required: false }),
      contextId: t.id({ required: false }),
      initialMessage: t.string({ required: false }),
    }),
  },
);

export const SendMessageInput = builder.inputType("SendMessageInput", {
  fields: (t) => ({
    body: t.string({ required: true }),
  }),
});
