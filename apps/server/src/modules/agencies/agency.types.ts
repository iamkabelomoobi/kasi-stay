import { builder } from "../../app/builder";

export const AgencyInput = builder.inputType("AgencyInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    logo: t.string({ required: false }),
    licenseNumber: t.string({ required: false }),
    ownerId: t.id({ required: false }),
  }),
});

export const AgencyUpdateInput = builder.inputType("AgencyUpdateInput", {
  fields: (t) => ({
    name: t.string({ required: false }),
    logo: t.string({ required: false }),
    licenseNumber: t.string({ required: false }),
  }),
});
