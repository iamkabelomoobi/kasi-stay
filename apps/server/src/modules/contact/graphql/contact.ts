import { builder } from "../../../app/builder";
import { submitContactMessage } from "../mutations";
import { listContactMessages, type ContactMessageShape } from "../queries";
import { ContactMessageFilterInput, ContactMessageInput } from "../contact.types";

const ContactMessageRef = builder.objectRef<ContactMessageShape>("ContactMessage");
ContactMessageRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    userId: t.id({ resolve: (parent) => parent.userId }),
    name: t.string({ resolve: (parent) => parent.name }),
    email: t.string({ resolve: (parent) => parent.email }),
    phone: t.string({
      nullable: true,
      resolve: (parent) => parent.phone ?? null,
    }),
    subject: t.string({ resolve: (parent) => parent.subject }),
    message: t.string({ resolve: (parent) => parent.message }),
    status: t.string({ resolve: (parent) => parent.status }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

builder.queryField("contactMessages", (t) =>
  t.field({
    type: [ContactMessageRef],
    authScopes: { isAdmin: true },
    args: {
      filter: t.arg({ type: ContactMessageFilterInput, required: false }),
    },
    resolve: (_, args, ctx) => listContactMessages(ctx, args.filter ?? undefined),
  }),
);

builder.mutationField("submitContactMessage", (t) =>
  t.field({
    type: ContactMessageRef,
    authScopes: { isAuthenticated: true },
    args: {
      input: t.arg({ type: ContactMessageInput, required: true }),
    },
    resolve: (_, args, ctx) => submitContactMessage(args.input, ctx),
  }),
);
