import { AttorneyProfileStatus, Prisma } from "@kasistay/db";
import { Context } from "../../../app/context";
import { notFound } from "../../../utils/errors";
import { parseEnum } from "../../../utils/parse-enum";

export type AttorneyFilter = {
  q?: string | null;
  city?: string | null;
  status?: string | null;
  limit?: number | null;
  offset?: number | null;
};

export type AttorneyProfileShape = Prisma.AttorneyProfileGetPayload<Record<string, never>>;

const buildAttorneyWhere = (
  ctx: Context,
  filter?: AttorneyFilter,
): Prisma.AttorneyProfileWhereInput => {
  const status = parseEnum(
    AttorneyProfileStatus,
    filter?.status ?? undefined,
    "attorney profile status",
  );

  return {
    ...(ctx.isAdmin
      ? status
        ? { status }
        : {}
      : { status: AttorneyProfileStatus.PUBLISHED }),
    ...(filter?.city && {
      city: {
        contains: filter.city,
        mode: "insensitive",
      },
    }),
    ...(filter?.q && {
      OR: [
        { name: { contains: filter.q, mode: "insensitive" } },
        { firmName: { contains: filter.q, mode: "insensitive" } },
        { description: { contains: filter.q, mode: "insensitive" } },
      ],
    }),
  };
};

export const listAttorneys = async (ctx: Context, filter?: AttorneyFilter) =>
  ctx.prisma.attorneyProfile.findMany({
    where: buildAttorneyWhere(ctx, filter),
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: filter?.limit ?? 20,
    skip: filter?.offset ?? 0,
  });

export const getAttorney = async (attorneyId: string, ctx: Context) => {
  const attorney = await ctx.prisma.attorneyProfile.findUnique({
    where: { id: attorneyId },
  });

  if (
    !attorney ||
    (!ctx.isAdmin && attorney.status !== AttorneyProfileStatus.PUBLISHED)
  ) {
    notFound("Attorney not found");
  }

  return attorney;
};
