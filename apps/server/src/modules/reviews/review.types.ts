import { builder } from "../../app/builder";

export const ReviewInput = builder.inputType("ReviewInput", {
  fields: (t) => ({
    rating: t.int({ required: true }),
    comment: t.string({ required: false }),
  }),
});
