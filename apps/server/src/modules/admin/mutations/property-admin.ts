import { PropertyStatus } from "@kasistay/db";
import { Context } from "../../../app/context";
import { notFound } from "../../../utils/errors";
import { propertyInclude } from "../../properties/queries";

export const approvePropertyForAdmin = async (
  propertyId: string,
  ctx: Context,
) => {
  ctx.assertAdmin();

  const property = await ctx.prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });

  if (!property) {
    notFound("Property not found");
  }

  return ctx.prisma.property.update({
    where: { id: propertyId },
    data: {
      isVerified: true,
    },
    include: propertyInclude,
  });
};

export const rejectPropertyForAdmin = async (
  propertyId: string,
  ctx: Context,
) => {
  ctx.assertAdmin();

  const property = await ctx.prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });

  if (!property) {
    notFound("Property not found");
  }

  return ctx.prisma.property.update({
    where: { id: propertyId },
    data: {
      isVerified: false,
      status: PropertyStatus.ARCHIVED,
    },
    include: propertyInclude,
  });
};
