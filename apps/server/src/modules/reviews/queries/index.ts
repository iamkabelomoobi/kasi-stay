import type { Prisma, Property, Review } from "@kasistay/db";
import { Context } from "../../../app/context";
import { notFound } from "../../../utils/errors";
import { propertyInclude } from "../../properties/queries";

export type ReviewShape = Review & {
  property?: Property | null;
};

export const reviewInclude = {
  property: {
    include: propertyInclude,
  },
} satisfies Prisma.ReviewInclude;

export const listPropertyReviews = async (propertyId: string, ctx: Context) => {
  const property = await ctx.prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });

  if (!property) {
    notFound("Property not found");
  }

  return ctx.prisma.review.findMany({
    where: {
      propertyId,
    },
    include: reviewInclude,
    orderBy: { createdAt: "desc" },
  });
};
