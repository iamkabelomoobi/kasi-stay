import { ApplicationReviewStatus, Prisma } from "@kasistay/db";
import { Context } from "../../../app/context";
import { parseEnum } from "../../../utils/parse-enum";

export type ApplicationFilter = {
  status?: string | null;
  limit?: number | null;
  offset?: number | null;
};

export const agentApplicationInclude = {
  user: true,
} satisfies Prisma.AgentApplicationInclude;

export const agencyAdvertisingRequestInclude = {
  user: true,
} satisfies Prisma.AgencyAdvertisingRequestInclude;

export type AgentApplicationShape = Prisma.AgentApplicationGetPayload<{
  include: typeof agentApplicationInclude;
}>;

export type AgencyAdvertisingRequestShape = Prisma.AgencyAdvertisingRequestGetPayload<{
  include: typeof agencyAdvertisingRequestInclude;
}>;

const buildStatusWhere = (status?: string | null) => {
  const parsed = parseEnum(
    ApplicationReviewStatus,
    status ?? undefined,
    "application review status",
  );

  return parsed ? { status: parsed } : undefined;
};

export const listAgentApplications = async (
  ctx: Context,
  filter?: ApplicationFilter,
) => {
  ctx.assertAdmin();
  return ctx.prisma.agentApplication.findMany({
    where: buildStatusWhere(filter?.status),
    include: agentApplicationInclude,
    orderBy: [{ createdAt: "desc" }],
    take: filter?.limit ?? 20,
    skip: filter?.offset ?? 0,
  });
};

export const listAgencyAdvertisingRequests = async (
  ctx: Context,
  filter?: ApplicationFilter,
) => {
  ctx.assertAdmin();
  return ctx.prisma.agencyAdvertisingRequest.findMany({
    where: buildStatusWhere(filter?.status),
    include: agencyAdvertisingRequestInclude,
    orderBy: [{ createdAt: "desc" }],
    take: filter?.limit ?? 20,
    skip: filter?.offset ?? 0,
  });
};
