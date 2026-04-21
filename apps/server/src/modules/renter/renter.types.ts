import { builder } from "../../app/builder";

export const RenterUpdateInput = builder.inputType("RenterUpdateInput", {
  fields: (t) => ({
    name: t.string({ required: false }),
    email: t.string({ required: false }),
    image: t.string({ required: false }),
  }),
});

export const RenterSearchInput = builder.inputType("RenterSearchInput", {
  fields: (t) => ({
    name: t.string({ required: false }),
    email: t.string({ required: false }),
  }),
});
