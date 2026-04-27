import { Prisma, StaticPageStatus, StaticPageType } from "@kasistay/db";
import { Context } from "../../../app/context";
import { notFound } from "../../../utils/errors";
import { parseEnum } from "../../../utils/parse-enum";

export type StaticPageFilter = {
  q?: string | null;
  slug?: string | null;
  type?: string | null;
  status?: string | null;
  limit?: number | null;
  offset?: number | null;
};

export type StaticPageShape = Prisma.StaticPageGetPayload<Record<string, never>>;

const canReadPage = (page: { status: StaticPageStatus }, ctx: Context): boolean =>
  ctx.isAdmin || page.status === StaticPageStatus.PUBLISHED;

const buildPageWhere = (
  ctx: Context,
  filter?: StaticPageFilter,
): Prisma.StaticPageWhereInput => {
  const status = parseEnum(StaticPageStatus, filter?.status ?? undefined, "static page status");
  const type = parseEnum(StaticPageType, filter?.type ?? undefined, "static page type");

  return {
    ...(ctx.isAdmin
      ? status
        ? { status }
        : {}
      : { status: StaticPageStatus.PUBLISHED }),
    ...(type && { type }),
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

export const listStaticPages = async (ctx: Context, filter?: StaticPageFilter) =>
  ctx.prisma.staticPage.findMany({
    where: buildPageWhere(ctx, filter),
    orderBy: [{ type: "asc" }, { title: "asc" }],
    take: filter?.limit ?? 20,
    skip: filter?.offset ?? 0,
  });

export const getStaticPage = async (pageId: string, ctx: Context) => {
  const page = await ctx.prisma.staticPage.findUnique({
    where: { id: pageId },
  });

  if (!page || !canReadPage(page, ctx)) {
    notFound("Static page not found");
  }

  return page;
};

export const getStaticPageBySlug = async (slug: string, ctx: Context) => {
  const page = await ctx.prisma.staticPage.findUnique({
    where: { slug },
  });

  if (!page || !canReadPage(page, ctx)) {
    notFound("Static page not found");
  }

  return page;
};
