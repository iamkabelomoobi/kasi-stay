import { builder } from "../../../app/builder";
import {
  archiveArticle,
  createArticle,
  deleteArticle,
  publishArticle,
  updateArticle,
} from "../mutations";
import {
  getArticle,
  getArticleBySlug,
  listArticleCategories,
  listArticles,
  type ArticleCategoryShape,
  type ArticleShape,
} from "../queries";
import { ArticleFilterInput, ArticleInput, ArticleUpdateInput } from "../article.types";

const ArticleCategoryRef =
  builder.objectRef<ArticleCategoryShape>("ArticleCategory");
ArticleCategoryRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    code: t.string({ resolve: (parent) => parent.code }),
    name: t.string({ resolve: (parent) => parent.name }),
    slug: t.string({ resolve: (parent) => parent.slug }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

const ArticleRef = builder.objectRef<ArticleShape>("Article");
ArticleRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    categoryId: t.id({ resolve: (parent) => parent.categoryId }),
    authorId: t.id({
      nullable: true,
      resolve: (parent) => parent.authorId ?? null,
    }),
    title: t.string({ resolve: (parent) => parent.title }),
    slug: t.string({ resolve: (parent) => parent.slug }),
    summary: t.string({
      nullable: true,
      resolve: (parent) => parent.summary ?? null,
    }),
    content: t.string({ resolve: (parent) => parent.content }),
    coverImageUrl: t.string({
      nullable: true,
      resolve: (parent) => parent.coverImageUrl ?? null,
    }),
    status: t.string({ resolve: (parent) => parent.status }),
    publishedAt: t.field({
      type: "Date",
      nullable: true,
      resolve: (parent) => parent.publishedAt ?? null,
    }),
    category: t.field({
      type: ArticleCategoryRef,
      resolve: (parent) => parent.category,
    }),
    authorName: t.string({
      nullable: true,
      resolve: (parent) => parent.author?.name ?? null,
    }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

builder.queryField("articles", (t) =>
  t.field({
    type: [ArticleRef],
    description: "List published articles or all articles for admins",
    args: {
      filter: t.arg({ type: ArticleFilterInput, required: false }),
    },
    resolve: (_, args, ctx) => listArticles(ctx, args.filter ?? undefined),
  }),
);

builder.queryField("article", (t) =>
  t.field({
    type: ArticleRef,
    nullable: true,
    description: "Fetch an article by ID",
    args: {
      articleId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => getArticle(String(args.articleId), ctx),
  }),
);

builder.queryField("articleBySlug", (t) =>
  t.field({
    type: ArticleRef,
    nullable: true,
    description: "Fetch an article by slug",
    args: {
      slug: t.arg.string({ required: true }),
    },
    resolve: (_, args, ctx) => getArticleBySlug(args.slug, ctx),
  }),
);

builder.queryField("articleCategories", (t) =>
  t.field({
    type: [ArticleCategoryRef],
    description: "List article categories",
    resolve: (_, __, ctx) => listArticleCategories(ctx),
  }),
);

builder.mutationField("createArticle", (t) =>
  t.field({
    type: ArticleRef,
    authScopes: { isAdmin: true },
    args: {
      input: t.arg({ type: ArticleInput, required: true }),
    },
    resolve: (_, args, ctx) => createArticle(args.input, ctx),
  }),
);

builder.mutationField("updateArticle", (t) =>
  t.field({
    type: ArticleRef,
    authScopes: { isAdmin: true },
    args: {
      articleId: t.arg.id({ required: true }),
      input: t.arg({ type: ArticleUpdateInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      updateArticle(String(args.articleId), args.input, ctx),
  }),
);

builder.mutationField("publishArticle", (t) =>
  t.field({
    type: ArticleRef,
    authScopes: { isAdmin: true },
    args: {
      articleId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => publishArticle(String(args.articleId), ctx),
  }),
);

builder.mutationField("archiveArticle", (t) =>
  t.field({
    type: ArticleRef,
    authScopes: { isAdmin: true },
    args: {
      articleId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => archiveArticle(String(args.articleId), ctx),
  }),
);

builder.mutationField("deleteArticle", (t) =>
  t.field({
    type: ArticleRef,
    authScopes: { isAdmin: true },
    args: {
      articleId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => deleteArticle(String(args.articleId), ctx),
  }),
);
