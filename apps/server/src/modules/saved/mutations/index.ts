import { Prisma } from "@kasistay/db";
import { Context } from "../../../app/context";
import { badInput, notFound } from "../../../utils/errors";
import { savedPropertyInclude } from "../queries";

export const saveProperty = async (propertyId: string, ctx: Context) => {
  const user = ctx.assertAuth();
  const property = await ctx.prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });

  if (!property) {
    notFound("Property not found");
  }

  return ctx.prisma.savedProperty.upsert({
    where: {
      userId_propertyId: {
        userId: user.id,
        propertyId,
      },
    },
    update: {
      savedAt: new Date(),
    },
    create: {
      userId: user.id,
      propertyId,
    },
    include: savedPropertyInclude,
  });
};

export const unsaveProperty = async (propertyId: string, ctx: Context) => {
  const user = ctx.assertAuth();

  await ctx.prisma.savedProperty.delete({
    where: {
      userId_propertyId: {
        userId: user.id,
        propertyId,
      },
    },
  });

  return true;
};

export const createSavedSearch = async (
  input: {
    filtersJson: string;
    alertEnabled?: boolean | null;
  },
  ctx: Context,
) => {
  const user = ctx.assertAuth();
  let filters: Prisma.InputJsonValue;

  try {
    filters = JSON.parse(input.filtersJson) as Prisma.InputJsonValue;
  } catch {
    badInput("filtersJson must be valid JSON");
  }

  return ctx.prisma.savedSearch.create({
    data: {
      userId: user.id,
      filters: filters!,
      alertEnabled: input.alertEnabled ?? true,
    },
  });
};

export const deleteSavedSearch = async (savedSearchId: string, ctx: Context) => {
  const user = ctx.assertAuth();
  const existing = await ctx.prisma.savedSearch.findFirst({
    where: {
      id: savedSearchId,
      userId: user.id,
    },
  });

  if (!existing) {
    notFound("Saved search not found");
  }

  await ctx.prisma.savedSearch.delete({
    where: { id: savedSearchId },
  });

  return true;
};

export const toggleSavedSearchAlert = async (
  savedSearchId: string,
  ctx: Context,
) => {
  const user = ctx.assertAuth();
  const existing = await ctx.prisma.savedSearch.findFirst({
    where: {
      id: savedSearchId,
      userId: user.id,
    },
  });

  if (!existing) {
    notFound("Saved search not found");
  }

  return ctx.prisma.savedSearch.update({
    where: { id: savedSearchId },
    data: {
      alertEnabled: !existing!.alertEnabled,
    },
  });
};
