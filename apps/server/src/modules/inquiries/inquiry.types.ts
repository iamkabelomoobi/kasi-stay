import { builder } from "../../app/builder";

export const InquiryInput = builder.inputType("InquiryInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    email: t.string({ required: true }),
    phone: t.string({ required: false }),
    message: t.string({ required: false }),
    source: t.string({ required: false }),
  }),
});

export const InquiryFilterInput = builder.inputType("InquiryFilterInput", {
  fields: (t) => ({
    propertyId: t.id({ required: false }),
    userId: t.id({ required: false }),
    status: t.string({ required: false }),
    limit: t.int({ required: false }),
    offset: t.int({ required: false }),
  }),
});

export const InquiryStatusUpdateInput = builder.inputType(
  "InquiryStatusUpdateInput",
  {
    fields: (t) => ({
      status: t.string({ required: true }),
    }),
  },
);
