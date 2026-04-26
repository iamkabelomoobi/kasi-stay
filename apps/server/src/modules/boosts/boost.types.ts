import { builder } from "../../app/builder";

export const ListingBoostInput = builder.inputType("ListingBoostInput", {
  fields: (t) => ({
    type: t.string({ required: true }),
    expiresAt: t.field({ type: "Date", required: true }),
  }),
});
