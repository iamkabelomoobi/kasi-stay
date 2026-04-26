import type { AgentSubscription, Prisma, SubscriptionPlan } from "@kasistay/db";
import { Context } from "../../../app/context";
import { unauthorized } from "../../../utils/errors";

export type SubscriptionPlanShape = SubscriptionPlan;
export type AgentSubscriptionShape = AgentSubscription & {
  plan?: SubscriptionPlan | null;
};

export const agentSubscriptionInclude = {
  plan: true,
} satisfies Prisma.AgentSubscriptionInclude;

export const listSubscriptionPlans = async (ctx: Context) => {
  return ctx.prisma.subscriptionPlan.findMany({
    orderBy: [{ price: "asc" }, { createdAt: "asc" }],
  });
};

export const getMySubscriptions = async (ctx: Context) => {
  const user = ctx.assertAuth();

  if (!(ctx.isAdmin || ctx.isAgent || ctx.isOwner)) {
    unauthorized();
  }

  return ctx.prisma.agentSubscription.findMany({
    where: {
      agentId: user.id,
    },
    include: agentSubscriptionInclude,
    orderBy: [{ isActive: "desc" }, { expiresAt: "desc" }],
  });
};
