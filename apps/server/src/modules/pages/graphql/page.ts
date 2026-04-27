import { builder } from "../../../app/builder";
import {
  archiveStaticPage,
  createStaticPage,
  publishStaticPage,
  updateStaticPage,
} from "../mutations";
import {
  getStaticPage,
  getStaticPageBySlug,
  listStaticPages,
  type StaticPageShape,
} from "../queries";
import {
  StaticPageFilterInput,
  StaticPageInput,
  StaticPageUpdateInput,
} from "../page.types";

const StaticPageRef = builder.objectRef<StaticPageShape>("StaticPage");
StaticPageRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    slug: t.string({ resolve: (parent) => parent.slug }),
    type: t.string({ resolve: (parent) => parent.type }),
    title: t.string({ resolve: (parent) => parent.title }),
    summary: t.string({
      nullable: true,
      resolve: (parent) => parent.summary ?? null,
    }),
    content: t.string({ resolve: (parent) => parent.content }),
    status: t.string({ resolve: (parent) => parent.status }),
    publishedAt: t.field({
      type: "Date",
      nullable: true,
      resolve: (parent) => parent.publishedAt ?? null,
    }),
    createdById: t.id({
      nullable: true,
      resolve: (parent) => parent.createdById ?? null,
    }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

builder.queryField("staticPage", (t) =>
  t.field({
    type: StaticPageRef,
    nullable: true,
    args: {
      pageId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => getStaticPage(String(args.pageId), ctx),
  }),
);

builder.queryField("staticPageBySlug", (t) =>
  t.field({
    type: StaticPageRef,
    nullable: true,
    args: {
      slug: t.arg.string({ required: true }),
    },
    resolve: (_, args, ctx) => getStaticPageBySlug(args.slug, ctx),
  }),
);

builder.queryField("staticPages", (t) =>
  t.field({
    type: [StaticPageRef],
    args: {
      filter: t.arg({ type: StaticPageFilterInput, required: false }),
    },
    resolve: (_, args, ctx) => listStaticPages(ctx, args.filter ?? undefined),
  }),
);

builder.mutationField("createStaticPage", (t) =>
  t.field({
    type: StaticPageRef,
    authScopes: { isAdmin: true },
    args: {
      input: t.arg({ type: StaticPageInput, required: true }),
    },
    resolve: (_, args, ctx) => createStaticPage(args.input, ctx),
  }),
);

builder.mutationField("updateStaticPage", (t) =>
  t.field({
    type: StaticPageRef,
    authScopes: { isAdmin: true },
    args: {
      pageId: t.arg.id({ required: true }),
      input: t.arg({ type: StaticPageUpdateInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      updateStaticPage(String(args.pageId), args.input, ctx),
  }),
);

builder.mutationField("publishStaticPage", (t) =>
  t.field({
    type: StaticPageRef,
    authScopes: { isAdmin: true },
    args: {
      pageId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => publishStaticPage(String(args.pageId), ctx),
  }),
);

builder.mutationField("archiveStaticPage", (t) =>
  t.field({
    type: StaticPageRef,
    authScopes: { isAdmin: true },
    args: {
      pageId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => archiveStaticPage(String(args.pageId), ctx),
  }),
);
