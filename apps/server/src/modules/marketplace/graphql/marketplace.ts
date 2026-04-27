import { builder } from "../../../app/builder";
import {
  archiveMarketplaceItem,
  createMarketplaceItem,
  deleteMarketplaceItem,
  publishMarketplaceItem,
  saveMarketplaceItem,
  unsaveMarketplaceItem,
  updateMarketplaceItem,
} from "../mutations";
import {
  getMarketplaceItem,
  listMarketplaceItems,
  listMyMarketplaceItems,
  listSavedMarketplaceItems,
  type MarketplaceItemShape,
  type MarketplaceSavedItemShape,
} from "../queries";
import {
  MarketplaceItemFilterInput,
  MarketplaceItemInput,
  MarketplaceItemUpdateInput,
} from "../marketplace.types";

const MarketplaceItemRef =
  builder.objectRef<MarketplaceItemShape>("MarketplaceItem");
MarketplaceItemRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    ownerId: t.id({ resolve: (parent) => parent.ownerId }),
    title: t.string({ resolve: (parent) => parent.title }),
    slug: t.string({ resolve: (parent) => parent.slug }),
    description: t.string({
      nullable: true,
      resolve: (parent) => parent.description ?? null,
    }),
    category: t.string({ resolve: (parent) => parent.category }),
    status: t.string({ resolve: (parent) => parent.status }),
    condition: t.string({ resolve: (parent) => parent.condition }),
    price: t.float({
      nullable: true,
      resolve: (parent) => (parent.price != null ? Number(parent.price) : null),
    }),
    currency: t.string({ resolve: (parent) => parent.currency }),
    city: t.string({ resolve: (parent) => parent.city }),
    locationText: t.string({
      nullable: true,
      resolve: (parent) => parent.locationText ?? null,
    }),
    imageUrlsJson: t.string({
      nullable: true,
      resolve: (parent) =>
        parent.imageUrls != null ? JSON.stringify(parent.imageUrls) : null,
    }),
    isNegotiable: t.boolean({ resolve: (parent) => parent.isNegotiable }),
    ownerName: t.string({ resolve: (parent) => parent.owner.name }),
    publishedAt: t.field({
      type: "Date",
      nullable: true,
      resolve: (parent) => parent.publishedAt ?? null,
    }),
    archivedAt: t.field({
      type: "Date",
      nullable: true,
      resolve: (parent) => parent.archivedAt ?? null,
    }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

const MarketplaceSavedItemRef =
  builder.objectRef<MarketplaceSavedItemShape>("MarketplaceSavedItem");
MarketplaceSavedItemRef.implement({
  fields: (t) => ({
    userId: t.id({ resolve: (parent) => parent.userId }),
    itemId: t.id({ resolve: (parent) => parent.itemId }),
    savedAt: t.field({ type: "Date", resolve: (parent) => parent.savedAt }),
    item: t.field({
      type: MarketplaceItemRef,
      resolve: (parent) => parent.item,
    }),
  }),
});

builder.queryField("marketplaceItems", (t) =>
  t.field({
    type: [MarketplaceItemRef],
    args: {
      filter: t.arg({ type: MarketplaceItemFilterInput, required: false }),
    },
    resolve: (_, args, ctx) => listMarketplaceItems(ctx, args.filter ?? undefined),
  }),
);

builder.queryField("marketplaceItem", (t) =>
  t.field({
    type: MarketplaceItemRef,
    nullable: true,
    args: {
      itemId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => getMarketplaceItem(String(args.itemId), ctx),
  }),
);

builder.queryField("myMarketplaceItems", (t) =>
  t.field({
    type: [MarketplaceItemRef],
    authScopes: { isAuthenticated: true },
    resolve: (_, __, ctx) => listMyMarketplaceItems(ctx),
  }),
);

builder.queryField("savedMarketplaceItems", (t) =>
  t.field({
    type: [MarketplaceSavedItemRef],
    authScopes: { isAuthenticated: true },
    resolve: (_, __, ctx) => listSavedMarketplaceItems(ctx),
  }),
);

builder.mutationField("createMarketplaceItem", (t) =>
  t.field({
    type: MarketplaceItemRef,
    authScopes: { isAuthenticated: true },
    args: {
      input: t.arg({ type: MarketplaceItemInput, required: true }),
    },
    resolve: (_, args, ctx) => createMarketplaceItem(args.input, ctx),
  }),
);

builder.mutationField("updateMarketplaceItem", (t) =>
  t.field({
    type: MarketplaceItemRef,
    authScopes: { isAuthenticated: true },
    args: {
      itemId: t.arg.id({ required: true }),
      input: t.arg({ type: MarketplaceItemUpdateInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      updateMarketplaceItem(String(args.itemId), args.input, ctx),
  }),
);

builder.mutationField("deleteMarketplaceItem", (t) =>
  t.field({
    type: MarketplaceItemRef,
    authScopes: { isAuthenticated: true },
    args: {
      itemId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      deleteMarketplaceItem(String(args.itemId), ctx),
  }),
);

builder.mutationField("publishMarketplaceItem", (t) =>
  t.field({
    type: MarketplaceItemRef,
    authScopes: { isAuthenticated: true },
    args: {
      itemId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      publishMarketplaceItem(String(args.itemId), ctx),
  }),
);

builder.mutationField("archiveMarketplaceItem", (t) =>
  t.field({
    type: MarketplaceItemRef,
    authScopes: { isAuthenticated: true },
    args: {
      itemId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      archiveMarketplaceItem(String(args.itemId), ctx),
  }),
);

builder.mutationField("saveMarketplaceItem", (t) =>
  t.field({
    type: MarketplaceSavedItemRef,
    authScopes: { isAuthenticated: true },
    args: {
      itemId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => saveMarketplaceItem(String(args.itemId), ctx),
  }),
);

builder.mutationField("unsaveMarketplaceItem", (t) =>
  t.field({
    type: "Boolean",
    authScopes: { isAuthenticated: true },
    args: {
      itemId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => unsaveMarketplaceItem(String(args.itemId), ctx),
  }),
);
