import { builder } from "../../app/builder";

export const AmenityFilterInput = builder.inputType("AmenityFilterInput", {
  fields: (t) => ({
    category: t.string({ required: false }),
  }),
});

export const AmenityInput = builder.inputType("AmenityInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    category: t.string({ required: true }),
  }),
});

export const AmenityUpdateInput = builder.inputType("AmenityUpdateInput", {
  fields: (t) => ({
    name: t.string({ required: false }),
    category: t.string({ required: false }),
  }),
});
