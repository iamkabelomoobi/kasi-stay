import { ArticleStatus, Prisma } from "@kasistay/db";
import { Context } from "../../../app/context";
import { notFound } from "../../../utils/errors";
import { parseEnum } from "../../../utils/parse-enum";

export type ArticleFilter = {
  q?: string | null;
  categorySlug?: string | null;
  slug?: string | null;
  status?: string | null;
  limit?: number | null;
  offset?: number | null;
};

export const articleInclude = {
  category: true,
  author: true,
} satisfies Prisma.ArticleInclude;

export type ArticleShape = Prisma.ArticleGetPayload<{
  include: typeof articleInclude;
}>;

export type ArticleCategoryShape = Prisma.ArticleCategoryGetPayload<Record<string, never>>;

const canReadArticle = (
  article: { status: ArticleStatus },
  ctx: Context,
): boolean => ctx.isAdmin || article.status === ArticleStatus.PUBLISHED;

const buildArticleWhere = (
  ctx: Context,
  filter?: ArticleFilter,
): Prisma.ArticleWhereInput => {
  const status = parseEnum(ArticleStatus, filter?.status ?? undefined, "article status");

  return {
    ...(ctx.isAdmin
      ? status
        ? { status }
        : {}
      : { status: ArticleStatus.PUBLISHED }),
    ...(filter?.categorySlug && {
      category: {
        is: {
          slug: filter.categorySlug,
        },
      },
    }),
    ...(filter?.slug && { slug: filter.slug }),
    ...(filter?.q && {
      OR: [
        { title: { contains: filter.q, mode: "insensitive" } },
        { summary: { contains: filter.q, mode: "insensitive" } },
        { content: { contains: filter.q, mode: "insensitive" } },
      ],
    }),
  };
};

export const listArticleCategories = async (ctx: Context) =>
  ctx.prisma.articleCategory.findMany({
    orderBy: [{ name: "asc" }],
  });

export const listArticles = async (ctx: Context, filter?: ArticleFilter) =>
  ctx.prisma.article.findMany({
    where: buildArticleWhere(ctx, filter),
    include: articleInclude,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: filter?.limit ?? 20,
    skip: filter?.offset ?? 0,
  });

export const getArticle = async (articleId: string, ctx: Context) => {
  const article = await ctx.prisma.article.findUnique({
    where: { id: articleId },
    include: articleInclude,
  });

  if (!article || !canReadArticle(article, ctx)) {
    notFound("Article not found");
  }

  return article;
};

export const getArticleBySlug = async (slug: string, ctx: Context) => {
  const article = await ctx.prisma.article.findUnique({
    where: { slug },
    include: articleInclude,
  });

  if (!article || !canReadArticle(article, ctx)) {
    notFound("Article not found");
  }

  return article;
};
