import { builder } from "../../app/builder";

export const RoommateProfileFilterInput = builder.inputType(
  "RoommateProfileFilterInput",
  {
    fields: (t) => ({
      city: t.string({ required: false }),
      minBudget: t.float({ required: false }),
      maxBudget: t.float({ required: false }),
      preferredGender: t.string({ required: false }),
      moveInDate: t.field({ type: "Date", required: false }),
      smokingFriendly: t.boolean({ required: false }),
      petsFriendly: t.boolean({ required: false }),
      status: t.string({ required: false }),
      limit: t.int({ required: false }),
      offset: t.int({ required: false }),
    }),
  },
);

export const RoommateProfileInput = builder.inputType("RoommateProfileInput", {
  fields: (t) => ({
    headline: t.string({ required: false }),
    bio: t.string({ required: false }),
    age: t.int({ required: false }),
    occupation: t.string({ required: false }),
    city: t.string({ required: true }),
    area: t.string({ required: false }),
    budgetMin: t.float({ required: false }),
    budgetMax: t.float({ required: false }),
    currency: t.string({ required: false }),
    moveInDate: t.field({ type: "Date", required: false }),
    gender: t.string({ required: false }),
    preferredGender: t.string({ required: false }),
    smokingFriendly: t.boolean({ required: false }),
    petsFriendly: t.boolean({ required: false }),
    photoUrl: t.string({ required: false }),
    status: t.string({ required: false }),
  }),
});
