import { CareerPostStatus, Prisma } from "@kasistay/db";
import { Context } from "../../../app/context";
import { notFound } from "../../../utils/errors";
import { parseEnum } from "../../../utils/parse-enum";

export type CareerPostFilter = {
  q?: string | null;
  status?: string | null;
  location?: string | null;
  limit?: number | null;
  offset?: number | null;
};

export type CareerPostShape = Prisma.CareerPostGetPayload<Record<string, never>>;
export type JobApplicationShape = Prisma.JobApplicationGetPayload<Record<string, never>>;

const canReadCareerPost = (
  post: { status: CareerPostStatus },
  ctx: Context,
): boolean => ctx.isAdmin || post.status === CareerPostStatus.PUBLISHED;

const buildCareerWhere = (
  ctx: Context,
  filter?: CareerPostFilter,
): Prisma.CareerPostWhereInput => {
  const status = parseEnum(CareerPostStatus, filter?.status ?? undefined, "career post status");

  return {
    ...(ctx.isAdmin
      ? status
        ? { status }
        : {}
      : { status: CareerPostStatus.PUBLISHED }),
    ...(filter?.location && {
      location: {
        contains: filter.location,
        mode: "insensitive",
      },
    }),
    ...(filter?.q && {
      OR: [
        { title: { contains: filter.q, mode: "insensitive" } },
        { summary: { contains: filter.q, mode: "insensitive" } },
        { description: { contains: filter.q, mode: "insensitive" } },
      ],
    }),
  };
};

export const listCareerPosts = async (ctx: Context, filter?: CareerPostFilter) =>
  ctx.prisma.careerPost.findMany({
    where: buildCareerWhere(ctx, filter),
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: filter?.limit ?? 20,
    skip: filter?.offset ?? 0,
  });

export const getCareerPost = async (careerPostId: string, ctx: Context) => {
  const post = await ctx.prisma.careerPost.findUnique({
    where: { id: careerPostId },
  });

  if (!post || !canReadCareerPost(post, ctx)) {
    notFound("Career post not found");
  }

  return post;
};
