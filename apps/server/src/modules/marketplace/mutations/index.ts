import {
  MarketplaceCategory,
  MarketplaceItemCondition,
  MarketplaceItemStatus,
  Prisma,
} from "@kasistay/db";
import { Context } from "../../../app/context";
import { badInput, notFound, unauthorized } from "../../../utils/errors";
import { generateUniqueSlug } from "../../../utils/generate-unique-slug";
import { parseEnum } from "../../../utils/parse-enum";
import {
  marketplaceItemInclude,
  savedMarketplaceItemInclude,
  type MarketplaceItemShape,
  type MarketplaceSavedItemShape,
} from "../queries";

const parseImageUrls = (
  value: string | null | undefined,
): Prisma.JsonArray | typeof Prisma.JsonNull => {
  if (value == null || value.trim() === "") {
    return Prisma.JsonNull;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
      badInput("imageUrlsJson must be a JSON array of strings");
    }
    return parsed as Prisma.JsonArray;
  } catch {
    badInput("imageUrlsJson must be valid JSON");
  }

  return Prisma.JsonNull;
};

const assertCanManageMarketplaceItem = async (
  itemId: string,
  ctx: Context,
) => {
  const item = await ctx.prisma.marketplaceItem.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    notFound("Marketplace item not found");
  }
  const current = item!;

  if (!ctx.isAdmin && current.ownerId !== ctx.assertAuth().id) {
    unauthorized();
  }

  return current;
};

const resolveMarketplaceSlug = async (
  input: { slug?: string | null; title: string },
  ctx: Context,
  itemId?: string,
) =>
  generateUniqueSlug(input.slug?.trim() || input.title, async (slug) => {
    const existing = await ctx.prisma.marketplaceItem.findUnique({
      where: { slug },
    });
    return Boolean(existing && existing.id !== itemId);
  });

export const createMarketplaceItem = async (
  input: {
    title: string;
    slug?: string | null;
    description?: string | null;
    category: string;
    condition?: string | null;
    price?: number | null;
    currency?: string | null;
    city: string;
    locationText?: string | null;
    imageUrlsJson?: string | null;
    isNegotiable?: boolean | null;
  },
  ctx: Context,
) : Promise<MarketplaceItemShape> => {
  const user = ctx.assertAuth();
  const category = parseEnum(
    MarketplaceCategory,
    input.category,
    "marketplace category",
  );
  const condition =
    parseEnum(
      MarketplaceItemCondition,
      input.condition ?? undefined,
      "marketplace item condition",
    ) ?? MarketplaceItemCondition.GOOD;

  return ctx.prisma.marketplaceItem.create({
    data: {
      ownerId: user.id,
      title: input.title,
      slug: await resolveMarketplaceSlug(input, ctx),
      description: input.description ?? null,
      category: category!,
      condition,
      price: input.price ?? null,
      currency: input.currency ?? "ZAR",
      city: input.city,
      locationText: input.locationText ?? null,
      imageUrls: parseImageUrls(input.imageUrlsJson),
      isNegotiable: input.isNegotiable ?? false,
      status: MarketplaceItemStatus.DRAFT,
    },
    include: marketplaceItemInclude,
  });
};

export const updateMarketplaceItem = async (
  itemId: string,
  input: {
    title?: string | null;
    slug?: string | null;
    description?: string | null;
    category?: string | null;
    condition?: string | null;
    price?: number | null;
    currency?: string | null;
    city?: string | null;
    locationText?: string | null;
    imageUrlsJson?: string | null;
    isNegotiable?: boolean | null;
    status?: string | null;
  },
  ctx: Context,
) : Promise<MarketplaceItemShape> => {
  const current = await assertCanManageMarketplaceItem(itemId, ctx);
  const category = parseEnum(
    MarketplaceCategory,
    input.category ?? undefined,
    "marketplace category",
  );
  const condition = parseEnum(
    MarketplaceItemCondition,
    input.condition ?? undefined,
    "marketplace item condition",
  );
  const status = parseEnum(
    MarketplaceItemStatus,
    input.status ?? undefined,
    "marketplace item status",
  );

  return ctx.prisma.marketplaceItem.update({
    where: { id: itemId },
    data: {
      ...(input.title != null && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(category && { category }),
      ...(condition && { condition }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.currency != null && { currency: input.currency }),
      ...(input.city != null && { city: input.city }),
      ...(input.locationText !== undefined && { locationText: input.locationText }),
      ...(input.imageUrlsJson !== undefined && {
        imageUrls: parseImageUrls(input.imageUrlsJson),
      }),
      ...(input.isNegotiable != null && {
        isNegotiable: input.isNegotiable,
      }),
      ...(status && {
        status,
        publishedAt: status === MarketplaceItemStatus.PUBLISHED ? new Date() : null,
        archivedAt: status === MarketplaceItemStatus.ARCHIVED ? new Date() : null,
      }),
      ...((input.slug != null || input.title != null) && {
        slug: await resolveMarketplaceSlug(
          {
            slug: input.slug ?? current.slug,
            title: input.title ?? current.title,
          },
          ctx,
          itemId,
        ),
      }),
    },
    include: marketplaceItemInclude,
  });
};

export const deleteMarketplaceItem = async (
  itemId: string,
  ctx: Context,
): Promise<MarketplaceItemShape> => {
  await assertCanManageMarketplaceItem(itemId, ctx);
  return ctx.prisma.marketplaceItem.delete({
    where: { id: itemId },
    include: marketplaceItemInclude,
  });
};

export const publishMarketplaceItem = async (
  itemId: string,
  ctx: Context,
): Promise<MarketplaceItemShape> => {
  await assertCanManageMarketplaceItem(itemId, ctx);
  return ctx.prisma.marketplaceItem.update({
    where: { id: itemId },
    data: {
      status: MarketplaceItemStatus.PUBLISHED,
      publishedAt: new Date(),
      archivedAt: null,
    },
    include: marketplaceItemInclude,
  });
};

export const archiveMarketplaceItem = async (
  itemId: string,
  ctx: Context,
): Promise<MarketplaceItemShape> => {
  await assertCanManageMarketplaceItem(itemId, ctx);
  return ctx.prisma.marketplaceItem.update({
    where: { id: itemId },
    data: {
      status: MarketplaceItemStatus.ARCHIVED,
      archivedAt: new Date(),
      publishedAt: null,
    },
    include: marketplaceItemInclude,
  });
};

export const saveMarketplaceItem = async (
  itemId: string,
  ctx: Context,
): Promise<MarketplaceSavedItemShape> => {
  const user = ctx.assertAuth();
  const item = await ctx.prisma.marketplaceItem.findUnique({
    where: { id: itemId },
  });

  if (!item || item.status !== MarketplaceItemStatus.PUBLISHED) {
    notFound("Marketplace item not found");
  }

  return ctx.prisma.marketplaceSavedItem.upsert({
    where: {
      userId_itemId: {
        userId: user.id,
        itemId,
      },
    },
    update: {
      savedAt: new Date(),
    },
    create: {
      userId: user.id,
      itemId,
    },
    include: savedMarketplaceItemInclude,
  });
};

export const unsaveMarketplaceItem = async (itemId: string, ctx: Context) => {
  const user = ctx.assertAuth();
  await ctx.prisma.marketplaceSavedItem.delete({
    where: {
      userId_itemId: {
        userId: user.id,
        itemId,
      },
    },
  });
  return true;
};
