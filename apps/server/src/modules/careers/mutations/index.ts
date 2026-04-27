import { CareerPostStatus } from "@kasistay/db";
import { Context } from "../../../app/context";
import { badInput, notFound } from "../../../utils/errors";
import { generateUniqueSlug } from "../../../utils/generate-unique-slug";
import { parseEnum } from "../../../utils/parse-enum";

const resolveCareerStatus = (value: string | null | undefined) =>
  parseEnum(CareerPostStatus, value, "career post status");

const resolveCareerSlug = async (
  input: { slug?: string | null; title: string },
  ctx: Context,
  careerPostId?: string,
) =>
  generateUniqueSlug(input.slug?.trim() || input.title, async (slug) => {
    const existing = await ctx.prisma.careerPost.findUnique({ where: { slug } });
    return Boolean(existing && existing.id !== careerPostId);
  });

export const createCareerPost = async (
  input: {
    title: string;
    slug?: string | null;
    summary?: string | null;
    description: string;
    location?: string | null;
    employmentType?: string | null;
    status?: string | null;
  },
  ctx: Context,
) => {
  const user = ctx.assertAdmin();
  const status = resolveCareerStatus(input.status) ?? CareerPostStatus.DRAFT;

  return ctx.prisma.careerPost.create({
    data: {
      title: input.title,
      slug: await resolveCareerSlug(input, ctx),
      summary: input.summary ?? null,
      description: input.description,
      location: input.location ?? null,
      employmentType: input.employmentType ?? null,
      status,
      publishedAt: status === CareerPostStatus.PUBLISHED ? new Date() : null,
      createdById: user.id,
    },
  });
};

export const updateCareerPost = async (
  careerPostId: string,
  input: {
    title?: string | null;
    slug?: string | null;
    summary?: string | null;
    description?: string | null;
    location?: string | null;
    employmentType?: string | null;
    status?: string | null;
  },
  ctx: Context,
) => {
  ctx.assertAdmin();
  const existing = await ctx.prisma.careerPost.findUnique({
    where: { id: careerPostId },
  });

  if (!existing) {
    notFound("Career post not found");
  }

  const current = existing!;
  const status = resolveCareerStatus(input.status) ?? current.status;

  return ctx.prisma.careerPost.update({
    where: { id: careerPostId },
    data: {
      ...(input.title != null && { title: input.title }),
      ...(input.summary !== undefined && { summary: input.summary }),
      ...(input.description != null && { description: input.description }),
      ...(input.location !== undefined && { location: input.location }),
      ...(input.employmentType !== undefined && {
        employmentType: input.employmentType,
      }),
      ...(input.status != null && {
        status,
        publishedAt: status === CareerPostStatus.PUBLISHED ? new Date() : null,
      }),
      ...((input.slug != null || input.title != null) && {
        slug: await resolveCareerSlug(
          {
            slug: input.slug ?? current.slug,
            title: input.title ?? current.title,
          },
          ctx,
          careerPostId,
        ),
      }),
    },
  });
};

export const archiveCareerPost = async (careerPostId: string, ctx: Context) => {
  ctx.assertAdmin();
  const existing = await ctx.prisma.careerPost.findUnique({
    where: { id: careerPostId },
  });

  if (!existing) {
    notFound("Career post not found");
  }

  return ctx.prisma.careerPost.update({
    where: { id: careerPostId },
    data: {
      status: CareerPostStatus.ARCHIVED,
      publishedAt: null,
    },
  });
};

export const submitJobApplication = async (
  careerPostId: string,
  input: {
    fullName: string;
    email: string;
    phone?: string | null;
    coverLetter?: string | null;
    resumeUrl?: string | null;
  },
  ctx: Context,
) => {
  const user = ctx.assertAuth();
  const careerPost = await ctx.prisma.careerPost.findUnique({
    where: { id: careerPostId },
  });

  if (!careerPost || careerPost.status !== CareerPostStatus.PUBLISHED) {
    notFound("Career post not found");
  }

  const existing = await ctx.prisma.jobApplication.findUnique({
    where: {
      careerPostId_userId: {
        careerPostId,
        userId: user.id,
      },
    },
  });

  if (existing) {
    badInput("You have already applied for this role");
  }

  return ctx.prisma.jobApplication.create({
    data: {
      careerPostId,
      userId: user.id,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone ?? null,
      coverLetter: input.coverLetter ?? null,
      resumeUrl: input.resumeUrl ?? null,
    },
  });
};
