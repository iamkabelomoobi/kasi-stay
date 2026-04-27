import {
  MarketplaceCategory,
  MarketplaceItemCondition,
  MarketplaceItemStatus,
  Prisma,
} from "@kasistay/db";
import { Context } from "../../../app/context";
import { notFound } from "../../../utils/errors";
import { parseEnum } from "../../../utils/parse-enum";

export type MarketplaceItemFilter = {
  category?: string | null;
  city?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  condition?: string | null;
  status?: string | null;
  limit?: number | null;
  offset?: number | null;
};

export const marketplaceItemInclude = {
  owner: true,
} satisfies Prisma.MarketplaceItemInclude;

export const savedMarketplaceItemInclude = {
  item: {
    include: marketplaceItemInclude,
  },
} satisfies Prisma.MarketplaceSavedItemInclude;

export type MarketplaceItemShape = Prisma.MarketplaceItemGetPayload<{
  include: typeof marketplaceItemInclude;
}>;

export type MarketplaceSavedItemShape = Prisma.MarketplaceSavedItemGetPayload<{
  include: typeof savedMarketplaceItemInclude;
}>;

const canReadMarketplaceItem = (
  item: { ownerId: string; status: MarketplaceItemStatus },
  ctx: Context,
): boolean =>
  ctx.isAdmin ||
  item.status === MarketplaceItemStatus.PUBLISHED ||
  ctx.session?.user.id === item.ownerId;

const buildMarketplaceWhere = (
  ctx: Context,
  filter?: MarketplaceItemFilter,
): Prisma.MarketplaceItemWhereInput => {
  const category = parseEnum(
    MarketplaceCategory,
    filter?.category ?? undefined,
    "marketplace category",
  );
  const condition = parseEnum(
    MarketplaceItemCondition,
    filter?.condition ?? undefined,
    "marketplace item condition",
  );
  const status = parseEnum(
    MarketplaceItemStatus,
    filter?.status ?? undefined,
    "marketplace item status",
  );

  return {
    ...(ctx.isAdmin
      ? status
        ? { status }
        : {}
      : { status: MarketplaceItemStatus.PUBLISHED }),
    ...(category && { category }),
    ...(condition && { condition }),
    ...(filter?.city && {
      city: {
        contains: filter.city,
        mode: "insensitive",
      },
    }),
    ...((filter?.minPrice != null || filter?.maxPrice != null) && {
      price: {
        ...(filter?.minPrice != null && { gte: filter.minPrice }),
        ...(filter?.maxPrice != null && { lte: filter.maxPrice }),
      },
    }),
  };
};

export const listMarketplaceItems = async (
  ctx: Context,
  filter?: MarketplaceItemFilter,
) =>
  ctx.prisma.marketplaceItem.findMany({
    where: buildMarketplaceWhere(ctx, filter),
    include: marketplaceItemInclude,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: filter?.limit ?? 20,
    skip: filter?.offset ?? 0,
  });

export const getMarketplaceItem = async (itemId: string, ctx: Context) => {
  const item = await ctx.prisma.marketplaceItem.findUnique({
    where: { id: itemId },
    include: marketplaceItemInclude,
  });

  if (!item || !canReadMarketplaceItem(item, ctx)) {
    notFound("Marketplace item not found");
  }

  return item;
};

export const listMyMarketplaceItems = async (ctx: Context) => {
  const user = ctx.assertAuth();
  return ctx.prisma.marketplaceItem.findMany({
    where: {
      ownerId: user.id,
    },
    include: marketplaceItemInclude,
    orderBy: [{ createdAt: "desc" }],
  });
};

export const listSavedMarketplaceItems = async (ctx: Context) => {
  const user = ctx.assertAuth();
  return ctx.prisma.marketplaceSavedItem.findMany({
    where: {
      userId: user.id,
    },
    include: savedMarketplaceItemInclude,
    orderBy: [{ savedAt: "desc" }],
  });
};
