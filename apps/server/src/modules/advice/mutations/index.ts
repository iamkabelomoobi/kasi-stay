import { ArticleStatus } from "@kasistay/db";
import { Context } from "../../../app/context";
import { notFound } from "../../../utils/errors";
import { generateUniqueSlug } from "../../../utils/generate-unique-slug";
import { parseEnum } from "../../../utils/parse-enum";
import { articleInclude } from "../queries";

const ensureCategory = async (categoryId: string, ctx: Context) => {
  const category = await ctx.prisma.articleCategory.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    notFound("Article category not found");
  }
};

const resolveArticleStatus = (value: string | null | undefined) =>
  parseEnum(ArticleStatus, value, "article status");

const resolveArticleSlug = async (
  input: { slug?: string | null; title: string },
  ctx: Context,
  articleId?: string,
) => {
  const desiredSlug = input.slug?.trim() || input.title;
  const nextSlug = await generateUniqueSlug(desiredSlug, async (slug) => {
    const existing = await ctx.prisma.article.findUnique({ where: { slug } });
    return Boolean(existing && existing.id !== articleId);
  });

  return nextSlug;
};

const getPublishedAt = (status: ArticleStatus | undefined): Date | null =>
  status === ArticleStatus.PUBLISHED ? new Date() : null;

export const createArticle = async (
  input: {
    categoryId: string;
    title: string;
    slug?: string | null;
    summary?: string | null;
    content: string;
    coverImageUrl?: string | null;
    status?: string | null;
  },
  ctx: Context,
) => {
  const user = ctx.assertAdmin();
  await ensureCategory(String(input.categoryId), ctx);
  const status = resolveArticleStatus(input.status) ?? ArticleStatus.DRAFT;

  return ctx.prisma.article.create({
    data: {
      category: {
        connect: {
          id: String(input.categoryId),
        },
      },
      author: {
        connect: {
          id: user.id,
        },
      },
      title: input.title,
      slug: await resolveArticleSlug(input, ctx),
      summary: input.summary ?? null,
      content: input.content,
      coverImageUrl: input.coverImageUrl ?? null,
      status,
      publishedAt: getPublishedAt(status),
    },
    include: articleInclude,
  });
};

export const updateArticle = async (
  articleId: string,
  input: {
    categoryId?: string | null;
    title?: string | null;
    slug?: string | null;
    summary?: string | null;
    content?: string | null;
    coverImageUrl?: string | null;
    status?: string | null;
  },
  ctx: Context,
) => {
  ctx.assertAdmin();
  const existing = await ctx.prisma.article.findUnique({
    where: { id: articleId },
  });

  if (!existing) {
    notFound("Article not found");
  }

  if (input.categoryId) {
    await ensureCategory(String(input.categoryId), ctx);
  }

  const current = existing!;
  const status = resolveArticleStatus(input.status) ?? current.status;
  const shouldRegenerateSlug = input.slug != null || input.title != null;

  return ctx.prisma.article.update({
    where: { id: articleId },
    data: {
      ...(input.categoryId != null && {
        category: {
          connect: {
            id: String(input.categoryId),
          },
        },
      }),
      ...(input.title != null && { title: input.title }),
      ...(input.summary !== undefined && { summary: input.summary }),
      ...(input.content != null && { content: input.content }),
      ...(input.coverImageUrl !== undefined && { coverImageUrl: input.coverImageUrl }),
      ...(input.status != null && { status }),
      ...(shouldRegenerateSlug && {
        slug: await resolveArticleSlug(
          {
            slug: input.slug ?? current.slug,
            title: input.title ?? current.title,
          },
          ctx,
          articleId,
        ),
      }),
      ...(input.status != null && {
        publishedAt: getPublishedAt(status),
      }),
    },
    include: articleInclude,
  });
};

export const publishArticle = async (articleId: string, ctx: Context) => {
  ctx.assertAdmin();
  const existing = await ctx.prisma.article.findUnique({ where: { id: articleId } });
  if (!existing) {
    notFound("Article not found");
  }

  return ctx.prisma.article.update({
    where: { id: articleId },
    data: {
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    include: articleInclude,
  });
};

export const archiveArticle = async (articleId: string, ctx: Context) => {
  ctx.assertAdmin();
  const existing = await ctx.prisma.article.findUnique({ where: { id: articleId } });
  if (!existing) {
    notFound("Article not found");
  }

  return ctx.prisma.article.update({
    where: { id: articleId },
    data: {
      status: ArticleStatus.ARCHIVED,
      publishedAt: null,
    },
    include: articleInclude,
  });
};

export const deleteArticle = async (articleId: string, ctx: Context) => {
  ctx.assertAdmin();
  const existing = await ctx.prisma.article.findUnique({ where: { id: articleId } });
  if (!existing) {
    notFound("Article not found");
  }

  return ctx.prisma.article.delete({
    where: { id: articleId },
    include: articleInclude,
  });
};
