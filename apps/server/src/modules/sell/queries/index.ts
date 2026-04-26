import { PropertyStatus } from "@kasistay/db";
import { Context } from "../../../app/context";
import { notFound, unauthorized } from "../../../utils/errors";

const canReadPropertySellDetail = (
  ctx: Context,
  property: {
    status: PropertyStatus;
    agentId: string | null;
    agency?: { ownerId: string } | null;
  },
): boolean => {
  if (property.status === PropertyStatus.PUBLISHED || ctx.isAdmin) {
    return true;
  }

  const userId = ctx.session?.user.id;
  return userId != null &&
    (property.agentId === userId || property.agency?.ownerId === userId);
};

export const getPropertySellDetail = async (
  propertyId: string,
  ctx: Context,
) => {
  const property = await ctx.prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      agency: {
        select: {
          ownerId: true,
        },
      },
      sellDetail: {
        include: {
          priceHistory: true,
        },
      },
    },
  });

  if (!property) {
    notFound("Property not found");
  }

  if (!canReadPropertySellDetail(ctx, property!)) {
    unauthorized();
  }

  if (!property!.sellDetail) {
    notFound("Sell detail not found");
  }

  return property!.sellDetail;
};

export const getPropertySellPriceHistory = async (
  propertyId: string,
  ctx: Context,
) => {
  const property = await ctx.prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      agency: {
        select: {
          ownerId: true,
        },
      },
      sellDetail: {
        select: {
          id: true,
        },
      },
      priceHistory: true,
    },
  });

  if (!property) {
    notFound("Property not found");
  }

  if (!canReadPropertySellDetail(ctx, property!)) {
    unauthorized();
  }

  if (!property!.sellDetail) {
    notFound("Sell detail not found");
  }

  return property!.priceHistory;
};
