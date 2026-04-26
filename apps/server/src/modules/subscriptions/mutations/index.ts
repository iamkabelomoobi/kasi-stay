import { Prisma } from "@kasistay/db";
import { Context } from "../../../app/context";
import { badInput, notFound, unauthorized } from "../../../utils/errors";
import { agentSubscriptionInclude } from "../queries";

const assertAdmin = (ctx: Context): void => {
  if (!ctx.isAdmin) {
    unauthorized();
  }
};

const parseFeaturesJson = (value: string | null | undefined) => {
  if (value == null) {
    return undefined;
  }

  try {
    return JSON.parse(value) as Prisma.InputJsonValue;
  } catch {
    badInput("featuresJson must be valid JSON");
  }
};

export const createSubscriptionPlan = async (
  input: {
    name: string;
    price: number;
    featuresJson?: string | null;
    listingLimit: number;
    boostCredits: number;
    durationDays: number;
  },
  ctx: Context,
) => {
  assertAdmin(ctx);

  return ctx.prisma.subscriptionPlan.create({
    data: {
      name: input.name,
      price: input.price,
      features: parseFeaturesJson(input.featuresJson),
      listingLimit: input.listingLimit,
      boostCredits: input.boostCredits,
      durationDays: input.durationDays,
    },
  });
};

export const updateSubscriptionPlan = async (
  planId: string,
  input: {
    name?: string | null;
    price?: number | null;
    featuresJson?: string | null;
    listingLimit?: number | null;
    boostCredits?: number | null;
    durationDays?: number | null;
  },
  ctx: Context,
) => {
  assertAdmin(ctx);

  const existing = await ctx.prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!existing) {
    notFound("Subscription plan not found");
  }

  return ctx.prisma.subscriptionPlan.update({
    where: { id: planId },
    data: {
      ...(input.name != null && { name: input.name }),
      ...(input.price != null && { price: input.price }),
      ...(input.featuresJson != null && {
        features: parseFeaturesJson(input.featuresJson),
      }),
      ...(input.listingLimit != null && { listingLimit: input.listingLimit }),
      ...(input.boostCredits != null && { boostCredits: input.boostCredits }),
      ...(input.durationDays != null && { durationDays: input.durationDays }),
    },
  });
};

export const deleteSubscriptionPlan = async (planId: string, ctx: Context) => {
  assertAdmin(ctx);

  const existing = await ctx.prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!existing) {
    notFound("Subscription plan not found");
  }

  return ctx.prisma.subscriptionPlan.delete({
    where: { id: planId },
  });
};

export const subscribeToPlan = async (
  input: {
    planId: string;
    agentId?: string | null;
  },
  ctx: Context,
) => {
  const user = ctx.assertAuth();
  const agentId = ctx.isAdmin ? input.agentId ?? user.id : user.id;

  if (!(ctx.isAdmin || ctx.isAgent || ctx.isOwner)) {
    unauthorized();
  }

  const plan = await ctx.prisma.subscriptionPlan.findUnique({
    where: { id: input.planId },
  });

  if (!plan) {
    notFound("Subscription plan not found");
  }

  const startsAt = new Date();
  const expiresAt = new Date(startsAt);
  expiresAt.setDate(expiresAt.getDate() + plan!.durationDays);

  return ctx.prisma.$transaction(async (tx) => {
    await tx.agentSubscription.updateMany({
      where: {
        agentId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return tx.agentSubscription.create({
      data: {
        agentId,
        planId: input.planId,
        startsAt,
        expiresAt,
        isActive: true,
      },
      include: agentSubscriptionInclude,
    });
  });
};
