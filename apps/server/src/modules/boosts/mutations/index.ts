import { ListingBoostType, Prisma, PropertyStatus } from "@kasistay/db";
import { Context } from "../../../app/context";
import { badInput, notFound, unauthorized } from "../../../utils/errors";
import { listingBoostInclude } from "../queries";

const parseEnum = <T extends Record<string, string>>(
  enumObject: T,
  value: string | null | undefined,
  field: string,
): T[keyof T] | undefined => {
  if (value == null) return undefined;
  const normalized = value.toUpperCase().trim();
  const parsed = enumObject[normalized as keyof T];

  if (!parsed) {
    badInput(`Invalid ${field}: ${value}`);
  }

  return parsed;
};

const assertCanManagePropertyBoost = async (
  propertyId: string,
  ctx: Context,
  transaction?: Prisma.TransactionClient,
) => {
  const db = transaction ?? ctx.prisma;
  const property = await db.property.findUnique({
    where: { id: propertyId },
    include: {
      agency: {
        select: {
          ownerId: true,
        },
      },
    },
  });

  if (!property) {
    notFound("Property not found");
  }

  if (ctx.isAdmin) {
    return property!;
  }

  const userId = ctx.assertAuth().id;
  if (property!.agentId !== userId && property!.agency?.ownerId !== userId) {
    unauthorized();
  }

  return property!;
};

const ensureBoostCreditsAvailable = async (
  userId: string,
  ctx: Context,
  transaction: Prisma.TransactionClient,
) => {
  if (ctx.isAdmin) {
    return;
  }

  const now = new Date();
  const activeSubscription = await transaction.agentSubscription.findFirst({
    where: {
      agentId: userId,
      isActive: true,
      expiresAt: {
        gt: now,
      },
    },
    include: {
      plan: true,
    },
    orderBy: {
      expiresAt: "desc",
    },
  });

  if (!activeSubscription) {
    badInput("An active subscription is required before boosting listings");
  }

  const activeBoostCount = await transaction.listingBoost.count({
    where: {
      agentId: userId,
      expiresAt: {
        gt: now,
      },
    },
  });

  if (activeBoostCount >= activeSubscription!.plan.boostCredits) {
    badInput("Boost credit limit reached for the active subscription");
  }
};

export const createPropertyBoost = async (
  propertyId: string,
  input: {
    type: string;
    expiresAt: Date;
  },
  ctx: Context,
) => {
  const boostType = parseEnum(ListingBoostType, input.type, "listing boost type");
  if (!boostType) {
    badInput("Boost type is required");
  }

  return ctx.prisma.$transaction(async (tx) => {
    const property = await assertCanManagePropertyBoost(propertyId, ctx, tx);

    if (
      property!.status !== PropertyStatus.PUBLISHED &&
      property!.status !== PropertyStatus.DRAFT
    ) {
      badInput("Only active listings can be boosted");
    }

    const actingUserId = property!.agentId ?? ctx.assertAuth().id;
    await ensureBoostCreditsAvailable(actingUserId, ctx, tx);

    const boost = await tx.listingBoost.create({
      data: {
        propertyId,
        agentId: actingUserId,
        type: boostType!,
        startsAt: new Date(),
        expiresAt: input.expiresAt,
      },
      include: listingBoostInclude,
    });

    await tx.property.update({
      where: { id: propertyId },
      data: {
        isFeatured: true,
      },
    });

    return boost;
  });
};

export const deletePropertyBoost = async (boostId: string, ctx: Context) => {
  return ctx.prisma.$transaction(async (tx) => {
    const boost = await tx.listingBoost.findUnique({
      where: { id: boostId },
      include: {
        property: {
          select: {
            id: true,
            agentId: true,
            agency: {
              select: {
                ownerId: true,
              },
            },
          },
        },
      },
    });

    if (!boost) {
      notFound("Listing boost not found");
    }

    if (!ctx.isAdmin) {
      const userId = ctx.assertAuth().id;
      if (
        boost!.property.agentId !== userId &&
        boost!.property.agency?.ownerId !== userId
      ) {
        unauthorized();
      }
    }

    await tx.listingBoost.delete({
      where: { id: boostId },
    });

    const activeBoostCount = await tx.listingBoost.count({
      where: {
        propertyId: boost!.propertyId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (activeBoostCount === 0) {
      await tx.property.update({
        where: { id: boost!.propertyId },
        data: {
          isFeatured: false,
        },
      });
    }

    return true;
  });
};
