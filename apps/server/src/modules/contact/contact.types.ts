import { builder } from "../../app/builder";

export const ContactMessageInput = builder.inputType("ContactMessageInput", {
  fields: (t) => ({
    name: t.string({ required: false }),
    email: t.string({ required: false }),
    phone: t.string({ required: false }),
    subject: t.string({ required: true }),
    message: t.string({ required: true }),
  }),
});

export const ContactMessageFilterInput = builder.inputType(
  "ContactMessageFilterInput",
  {
    fields: (t) => ({
      status: t.string({ required: false }),
      limit: t.int({ required: false }),
      offset: t.int({ required: false }),
    }),
  },
);
