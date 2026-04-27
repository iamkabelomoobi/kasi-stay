import { AttorneyProfileStatus } from "@kasistay/db";
import { Context } from "../../../app/context";
import { notFound } from "../../../utils/errors";
import { generateUniqueSlug } from "../../../utils/generate-unique-slug";
import { parseEnum } from "../../../utils/parse-enum";

const resolveAttorneyStatus = (value: string | null | undefined) =>
  parseEnum(AttorneyProfileStatus, value, "attorney profile status");

const resolveAttorneySlug = async (
  input: { slug?: string | null; name: string },
  ctx: Context,
  attorneyId?: string,
) =>
  generateUniqueSlug(input.slug?.trim() || input.name, async (slug) => {
    const existing = await ctx.prisma.attorneyProfile.findUnique({
      where: { slug },
    });
    return Boolean(existing && existing.id !== attorneyId);
  });

export const calculateBond = (input: {
  propertyPrice: number;
  deposit?: number | null;
  annualInterestRate: number;
  termMonths?: number | null;
}) => {
  const principal = Math.max(input.propertyPrice - (input.deposit ?? 0), 0);
  const termMonths = input.termMonths ?? 240;
  const monthlyRate = input.annualInterestRate / 100 / 12;

  const monthlyRepayment =
    monthlyRate === 0
      ? principal / termMonths
      : (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -termMonths);

  const totalRepayment = monthlyRepayment * termMonths;
  const totalInterest = totalRepayment - principal;

  return {
    principal,
    monthlyRepayment,
    totalRepayment,
    totalInterest,
  };
};

export const calculateAffordability = (input: {
  monthlyIncome: number;
  monthlyExpenses?: number | null;
  monthlyDebtRepayments?: number | null;
  annualInterestRate: number;
  termMonths?: number | null;
  deposit?: number | null;
  affordabilityRatio?: number | null;
}) => {
  const monthlyExpenses = input.monthlyExpenses ?? 0;
  const monthlyDebtRepayments = input.monthlyDebtRepayments ?? 0;
  const affordabilityRatio = input.affordabilityRatio ?? 0.3;
  const disposableIncome = Math.max(
    input.monthlyIncome - monthlyExpenses - monthlyDebtRepayments,
    0,
  );
  const maxAffordableRepayment = disposableIncome * affordabilityRatio;
  const termMonths = input.termMonths ?? 240;
  const monthlyRate = input.annualInterestRate / 100 / 12;

  const maxLoanAmount =
    monthlyRate === 0
      ? maxAffordableRepayment * termMonths
      : maxAffordableRepayment *
        ((1 - (1 + monthlyRate) ** -termMonths) / monthlyRate);

  return {
    disposableIncome,
    maxAffordableRepayment,
    maxLoanAmount,
    estimatedPurchasePrice: maxLoanAmount + (input.deposit ?? 0),
  };
};

export const createAttorneyProfile = async (
  input: {
    name: string;
    slug?: string | null;
    firmName?: string | null;
    description?: string | null;
    city: string;
    email?: string | null;
    phone?: string | null;
    websiteUrl?: string | null;
    imageUrl?: string | null;
    status?: string | null;
  },
  ctx: Context,
) => {
  const user = ctx.assertAdmin();
  const status = resolveAttorneyStatus(input.status) ?? AttorneyProfileStatus.DRAFT;

  return ctx.prisma.attorneyProfile.create({
    data: {
      name: input.name,
      slug: await resolveAttorneySlug(input, ctx),
      firmName: input.firmName ?? null,
      description: input.description ?? null,
      city: input.city,
      email: input.email ?? null,
      phone: input.phone ?? null,
      websiteUrl: input.websiteUrl ?? null,
      imageUrl: input.imageUrl ?? null,
      status,
      publishedAt: status === AttorneyProfileStatus.PUBLISHED ? new Date() : null,
      createdById: user.id,
    },
  });
};

export const updateAttorneyProfile = async (
  attorneyId: string,
  input: {
    name?: string | null;
    slug?: string | null;
    firmName?: string | null;
    description?: string | null;
    city?: string | null;
    email?: string | null;
    phone?: string | null;
    websiteUrl?: string | null;
    imageUrl?: string | null;
    status?: string | null;
  },
  ctx: Context,
) => {
  ctx.assertAdmin();
  const existing = await ctx.prisma.attorneyProfile.findUnique({
    where: { id: attorneyId },
  });

  if (!existing) {
    notFound("Attorney not found");
  }
  const current = existing!;

  const status = resolveAttorneyStatus(input.status) ?? current.status;

  return ctx.prisma.attorneyProfile.update({
    where: { id: attorneyId },
    data: {
      ...(input.name != null && { name: input.name }),
      ...(input.firmName !== undefined && { firmName: input.firmName }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.city != null && { city: input.city }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.websiteUrl !== undefined && { websiteUrl: input.websiteUrl }),
      ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
      ...(input.status != null && {
        status,
        publishedAt: status === AttorneyProfileStatus.PUBLISHED ? new Date() : null,
      }),
      ...((input.slug != null || input.name != null) && {
        slug: await resolveAttorneySlug(
          {
            slug: input.slug ?? current.slug,
            name: input.name ?? current.name,
          },
          ctx,
          attorneyId,
        ),
      }),
    },
  });
};

export const deleteAttorneyProfile = async (
  attorneyId: string,
  ctx: Context,
) => {
  ctx.assertAdmin();
  const existing = await ctx.prisma.attorneyProfile.findUnique({
    where: { id: attorneyId },
  });

  if (!existing) {
    notFound("Attorney not found");
  }

  return ctx.prisma.attorneyProfile.delete({
    where: { id: attorneyId },
  });
};
