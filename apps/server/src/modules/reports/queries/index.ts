import { Prisma, Property, Report, ReportStatus } from "@kasistay/db";
import { Context } from "../../../app/context";
import { badInput } from "../../../utils/errors";
import { propertyInclude } from "../../properties/queries";

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

export type ReportShape = Report & {
  property?: Property | null;
};

export const reportInclude = {
  property: {
    include: propertyInclude,
  },
} satisfies Prisma.ReportInclude;

export const listReports = async (
  ctx: Context,
  filter?: {
    status?: string | null;
  },
) => {
  ctx.assertAdmin();
  const status = parseEnum(ReportStatus, filter?.status ?? undefined, "report status");

  return ctx.prisma.report.findMany({
    where: {
      ...(status && { status }),
    },
    include: reportInclude,
    orderBy: { createdAt: "desc" },
  });
};
