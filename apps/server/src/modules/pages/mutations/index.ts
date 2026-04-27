import { StaticPageStatus, StaticPageType } from "@kasistay/db";
import { Context } from "../../../app/context";
import { badInput, notFound } from "../../../utils/errors";
import { parseEnum } from "../../../utils/parse-enum";

const resolvePageStatus = (value: string | null | undefined) =>
  parseEnum(StaticPageStatus, value, "static page status");

const resolvePageType = (value: string | null | undefined) =>
  parseEnum(StaticPageType, value, "static page type");

const ensureUniqueSlug = async (
  slug: string,
  ctx: Context,
  pageId?: string,
): Promise<void> => {
  const existing = await ctx.prisma.staticPage.findUnique({
    where: { slug },
  });

  if (existing && existing.id !== pageId) {
    badInput("A static page with that slug already exists");
  }
};

export const createStaticPage = async (
  input: {
    slug: string;
    title: string;
    summary?: string | null;
    content: string;
    type?: string | null;
    status?: string | null;
  },
  ctx: Context,
) => {
  const user = ctx.assertAdmin();
  await ensureUniqueSlug(input.slug, ctx);
  const status = resolvePageStatus(input.status) ?? StaticPageStatus.DRAFT;
  const type = resolvePageType(input.type) ?? StaticPageType.CUSTOM;

  return ctx.prisma.staticPage.create({
    data: {
      slug: input.slug.trim(),
      title: input.title,
      summary: input.summary ?? null,
      content: input.content,
      type,
      status,
      publishedAt: status === StaticPageStatus.PUBLISHED ? new Date() : null,
      createdById: user.id,
    },
  });
};

export const updateStaticPage = async (
  pageId: string,
  input: {
    slug?: string | null;
    title?: string | null;
    summary?: string | null;
    content?: string | null;
    type?: string | null;
    status?: string | null;
  },
  ctx: Context,
) => {
  ctx.assertAdmin();
  const existing = await ctx.prisma.staticPage.findUnique({
    where: { id: pageId },
  });

  if (!existing) {
    notFound("Static page not found");
  }
  const current = existing!;

  if (input.slug) {
    await ensureUniqueSlug(input.slug, ctx, pageId);
  }

  const status = resolvePageStatus(input.status) ?? current.status;
  const type = resolvePageType(input.type) ?? current.type;

  return ctx.prisma.staticPage.update({
    where: { id: pageId },
    data: {
      ...(input.slug != null && { slug: input.slug.trim() }),
      ...(input.title != null && { title: input.title }),
      ...(input.summary !== undefined && { summary: input.summary }),
      ...(input.content != null && { content: input.content }),
      ...(input.type != null && { type }),
      ...(input.status != null && {
        status,
        publishedAt: status === StaticPageStatus.PUBLISHED ? new Date() : null,
      }),
    },
  });
};

export const publishStaticPage = async (pageId: string, ctx: Context) => {
  ctx.assertAdmin();
  const existing = await ctx.prisma.staticPage.findUnique({ where: { id: pageId } });
  if (!existing) {
    notFound("Static page not found");
  }

  return ctx.prisma.staticPage.update({
    where: { id: pageId },
    data: {
      status: StaticPageStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });
};

export const archiveStaticPage = async (pageId: string, ctx: Context) => {
  ctx.assertAdmin();
  const existing = await ctx.prisma.staticPage.findUnique({ where: { id: pageId } });
  if (!existing) {
    notFound("Static page not found");
  }

  return ctx.prisma.staticPage.update({
    where: { id: pageId },
    data: {
      status: StaticPageStatus.ARCHIVED,
      publishedAt: null,
    },
  });
};
