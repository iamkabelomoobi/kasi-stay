import { ReportReason, ReportStatus } from "@kasistay/db";
import { Context } from "../../../app/context";
import { badInput, notFound } from "../../../utils/errors";
import { reportInclude } from "../queries";

const parseEnum = <T extends Record<string, string>>(
  enumObject: T,
  value: string | null | undefined,
  field: string,
): T[keyof T] | undefined => {
  if (value == null) return undefined;
  const normalized = value.toUpperCase().trim();
  const parsed = enumObject[normalized as keyof T];

  if (!parsed) {
    badInput(`Invalid ${field}: ${value}`);
  }

  return parsed;
};

export const createReport = async (
  propertyId: string,
  input: {
    reason: string;
    description?: string | null;
  },
  ctx: Context,
) => {
  const user = ctx.assertAuth();
  const property = await ctx.prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });

  if (!property) {
    notFound("Property not found");
  }

  const reason = parseEnum(ReportReason, input.reason, "report reason");
  if (!reason) {
    badInput("Report reason is required");
  }

  return ctx.prisma.report.create({
    data: {
      propertyId,
      userId: user.id,
      reason: reason!,
      description: input.description ?? null,
    },
    include: reportInclude,
  });
};

export const resolveReport = async (reportId: string, ctx: Context) => {
  ctx.assertAdmin();

  const report = await ctx.prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    notFound("Report not found");
  }

  return ctx.prisma.report.update({
    where: { id: reportId },
    data: {
      status: ReportStatus.RESOLVED,
    },
    include: reportInclude,
  });
};
