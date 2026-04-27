import { builder } from "../../app/builder";

export const AgentApplicationInput = builder.inputType("AgentApplicationInput", {
  fields: (t) => ({
    phone: t.string({ required: false }),
    city: t.string({ required: false }),
    experience: t.string({ required: false }),
    licenseNumber: t.string({ required: false }),
    motivation: t.string({ required: false }),
  }),
});

export const AgentApplicationFilterInput = builder.inputType(
  "AgentApplicationFilterInput",
  {
    fields: (t) => ({
      status: t.string({ required: false }),
      limit: t.int({ required: false }),
      offset: t.int({ required: false }),
    }),
  },
);

export const AgencyAdvertisingRequestInput = builder.inputType(
  "AgencyAdvertisingRequestInput",
  {
    fields: (t) => ({
      agencyName: t.string({ required: true }),
      contactEmail: t.string({ required: true }),
      contactPhone: t.string({ required: false }),
      websiteUrl: t.string({ required: false }),
      budget: t.string({ required: false }),
      message: t.string({ required: false }),
    }),
  },
);

export const AgencyAdvertisingRequestFilterInput = builder.inputType(
  "AgencyAdvertisingRequestFilterInput",
  {
    fields: (t) => ({
      status: t.string({ required: false }),
      limit: t.int({ required: false }),
      offset: t.int({ required: false }),
    }),
  },
);

export const AgencyAdvertisingRequestStatusInput = builder.inputType(
  "AgencyAdvertisingRequestStatusInput",
  {
    fields: (t) => ({
      status: t.string({ required: true }),
      rejectionReason: t.string({ required: false }),
    }),
  },
);
