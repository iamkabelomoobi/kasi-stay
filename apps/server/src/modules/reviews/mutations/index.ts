import { Context } from "../../../app/context";
import { badInput, notFound, unauthorized } from "../../../utils/errors";
import { reviewInclude } from "../queries";

export const createReview = async (
  propertyId: string,
  input: {
    rating: number;
    comment?: string | null;
  },
  ctx: Context,
) => {
  const user = ctx.assertAuth();

  if (input.rating < 1 || input.rating > 5) {
    badInput("Review rating must be between 1 and 5");
  }

  const property = await ctx.prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });

  if (!property) {
    notFound("Property not found");
  }

  return ctx.prisma.review.upsert({
    where: {
      propertyId_userId: {
        propertyId,
        userId: user.id,
      },
    },
    create: {
      propertyId,
      userId: user.id,
      rating: input.rating,
      comment: input.comment ?? null,
    },
    update: {
      rating: input.rating,
      comment: input.comment ?? null,
    },
    include: reviewInclude,
  });
};

export const deleteReview = async (reviewId: string, ctx: Context) => {
  const user = ctx.assertAuth();
  const review = await ctx.prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    notFound("Review not found");
  }

  if (!ctx.isAdmin && review!.userId !== user.id) {
    unauthorized();
  }

  return ctx.prisma.review.delete({
    where: { id: reviewId },
    include: reviewInclude,
  });
};
