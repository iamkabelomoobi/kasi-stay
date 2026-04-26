import { builder } from "../../app/builder";

export const SubscriptionPlanInput = builder.inputType("SubscriptionPlanInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    price: t.float({ required: true }),
    featuresJson: t.string({ required: false }),
    listingLimit: t.int({ required: true }),
    boostCredits: t.int({ required: true }),
    durationDays: t.int({ required: true }),
  }),
});

export const SubscriptionPlanUpdateInput = builder.inputType(
  "SubscriptionPlanUpdateInput",
  {
    fields: (t) => ({
      name: t.string({ required: false }),
      price: t.float({ required: false }),
      featuresJson: t.string({ required: false }),
      listingLimit: t.int({ required: false }),
      boostCredits: t.int({ required: false }),
      durationDays: t.int({ required: false }),
    }),
  },
);

export const SubscribeToPlanInput = builder.inputType("SubscribeToPlanInput", {
  fields: (t) => ({
    planId: t.id({ required: true }),
    agentId: t.id({ required: false }),
  }),
});
