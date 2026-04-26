import { Prisma, Property, SavedProperty, SavedSearch } from "@kasistay/db";
import { Context } from "../../../app/context";
import { propertyInclude } from "../../properties/queries";

export const savedPropertyInclude = {
  property: {
    include: propertyInclude,
  },
} satisfies Prisma.SavedPropertyInclude;

export type SavedPropertyShape = SavedProperty & {
  property?: Property | null;
};

export type SavedSearchShape = SavedSearch;

export const listSavedProperties = async (ctx: Context) => {
  const user = ctx.assertAuth();
  return ctx.prisma.savedProperty.findMany({
    where: {
      userId: user.id,
    },
    include: savedPropertyInclude,
    orderBy: { savedAt: "desc" },
  });
};

export const listSavedSearches = async (ctx: Context) => {
  const user = ctx.assertAuth();
  return ctx.prisma.savedSearch.findMany({
    where: {
      userId: user.id,
    },
    orderBy: { createdAt: "desc" },
  });
};
