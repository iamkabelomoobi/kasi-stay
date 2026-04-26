import type { ListingBoost, Prisma, Property } from "@kasistay/db";
import { Context } from "../../../app/context";
import { notFound } from "../../../utils/errors";
import { propertyInclude } from "../../properties/queries";

export type ListingBoostShape = ListingBoost & {
  property?: Property | null;
};

export const listingBoostInclude = {
  property: {
    include: propertyInclude,
  },
} satisfies Prisma.ListingBoostInclude;

export const getPropertyBoosts = async (propertyId: string, ctx: Context) => {
  const property = await ctx.prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });

  if (!property) {
    notFound("Property not found");
  }

  return ctx.prisma.listingBoost.findMany({
    where: {
      propertyId,
    },
    include: listingBoostInclude,
    orderBy: [{ expiresAt: "desc" }, { createdAt: "desc" }],
  });
};
