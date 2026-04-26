import { builder } from "../../../app/builder";
import {
  createSubscriptionPlan,
  deleteSubscriptionPlan,
  subscribeToPlan,
  updateSubscriptionPlan,
} from "../mutations";
import {
  getMySubscriptions,
  listSubscriptionPlans,
  type AgentSubscriptionShape,
  type SubscriptionPlanShape,
} from "../queries";
import {
  SubscribeToPlanInput,
  SubscriptionPlanInput,
  SubscriptionPlanUpdateInput,
} from "../subscription.types";

const SubscriptionPlanRef =
  builder.objectRef<SubscriptionPlanShape>("SubscriptionPlan");
SubscriptionPlanRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    name: t.string({ resolve: (parent) => parent.name }),
    price: t.float({ resolve: (parent) => Number(parent.price) }),
    featuresJson: t.string({
      nullable: true,
      resolve: (parent) =>
        parent.features != null ? JSON.stringify(parent.features) : null,
    }),
    listingLimit: t.int({ resolve: (parent) => parent.listingLimit }),
    boostCredits: t.int({ resolve: (parent) => parent.boostCredits }),
    durationDays: t.int({ resolve: (parent) => parent.durationDays }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

const AgentSubscriptionRef =
  builder.objectRef<AgentSubscriptionShape>("AgentSubscription");
AgentSubscriptionRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    agentId: t.id({ resolve: (parent) => parent.agentId }),
    planId: t.id({ resolve: (parent) => parent.planId }),
    startsAt: t.field({ type: "Date", resolve: (parent) => parent.startsAt }),
    expiresAt: t.field({ type: "Date", resolve: (parent) => parent.expiresAt }),
    isActive: t.boolean({ resolve: (parent) => parent.isActive }),
    plan: t.field({
      type: SubscriptionPlanRef,
      nullable: true,
      resolve: (parent) => parent.plan ?? null,
    }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

builder.queryField("subscriptionPlans", (t) =>
  t.field({
    type: [SubscriptionPlanRef],
    description: "List available subscription plans",
    resolve: (_, __, ctx) => listSubscriptionPlans(ctx),
  }),
);

builder.queryField("mySubscriptions", (t) =>
  t.field({
    type: [AgentSubscriptionRef],
    authScopes: { isAuthenticated: true },
    description: "List subscriptions for the current agent or owner",
    resolve: (_, __, ctx) => getMySubscriptions(ctx),
  }),
);

builder.mutationField("createSubscriptionPlan", (t) =>
  t.field({
    type: SubscriptionPlanRef,
    authScopes: { isAdmin: true },
    description: "Create a subscription plan",
    args: {
      input: t.arg({ type: SubscriptionPlanInput, required: true }),
    },
    resolve: (_, args, ctx) => createSubscriptionPlan(args.input, ctx),
  }),
);

builder.mutationField("updateSubscriptionPlan", (t) =>
  t.field({
    type: SubscriptionPlanRef,
    authScopes: { isAdmin: true },
    description: "Update a subscription plan",
    args: {
      planId: t.arg.id({ required: true }),
      input: t.arg({ type: SubscriptionPlanUpdateInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      updateSubscriptionPlan(String(args.planId), args.input, ctx),
  }),
);

builder.mutationField("deleteSubscriptionPlan", (t) =>
  t.field({
    type: SubscriptionPlanRef,
    authScopes: { isAdmin: true },
    description: "Delete a subscription plan",
    args: {
      planId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => deleteSubscriptionPlan(String(args.planId), ctx),
  }),
);

builder.mutationField("subscribeToPlan", (t) =>
  t.field({
    type: AgentSubscriptionRef,
    authScopes: { isAuthenticated: true },
    description: "Subscribe an agent or owner to a plan",
    args: {
      input: t.arg({ type: SubscribeToPlanInput, required: true }),
    },
    resolve: (_, args, ctx) => subscribeToPlan(args.input, ctx),
  }),
);
