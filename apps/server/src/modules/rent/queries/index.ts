import { PropertyStatus } from "@kasistay/db";
import { Context } from "../../../app/context";
import { notFound, unauthorized } from "../../../utils/errors";

const canReadPropertyRentDetail = (
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

export const getPropertyRentDetail = async (
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
      rentDetail: true,
    },
  });

  if (!property) {
    notFound("Property not found");
  }

  if (!canReadPropertyRentDetail(ctx, property!)) {
    unauthorized();
  }

  if (!property!.rentDetail) {
    notFound("Rent detail not found");
  }

  return property!.rentDetail;
};
