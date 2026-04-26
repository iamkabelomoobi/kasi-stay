import { UserRole } from "@kasistay/db";
import { Context } from "../../../app/context";
import { notFound, unauthorized } from "../../../utils/errors";
import { agencyInclude } from "../queries";

const assertAgencyManager = async (
  agencyId: string,
  ctx: Context,
) => {
  const agency = await ctx.prisma.agency.findUnique({
    where: { id: agencyId },
  });

  if (!agency) {
    notFound("Agency not found");
  }

  const existingAgency = agency!;

  if (!ctx.isAdmin && existingAgency.ownerId !== ctx.assertAuth().id) {
    unauthorized();
  }

  return existingAgency;
};

export const createAgency = async (
  input: {
    name: string;
    logo?: string | null;
    licenseNumber?: string | null;
    ownerId?: string | null;
  },
  ctx: Context,
) => {
  const user = ctx.assertAuth();
  const ownerId = ctx.isAdmin ? input.ownerId ?? user.id : user.id;

  if (!(ctx.isAdmin || ctx.isOwner)) {
    unauthorized();
  }

  await ctx.prisma.user.update({
    where: { id: ownerId },
    data: {
      role: UserRole.OWNER,
    },
  });

  return ctx.prisma.agency.create({
    data: {
      name: input.name,
      logo: input.logo ?? null,
      licenseNumber: input.licenseNumber ?? null,
      ownerId,
    },
    include: agencyInclude,
  });
};

export const updateAgency = async (
  agencyId: string,
  input: {
    name?: string | null;
    logo?: string | null;
    licenseNumber?: string | null;
  },
  ctx: Context,
) => {
  await assertAgencyManager(agencyId, ctx);

  return ctx.prisma.agency.update({
    where: { id: agencyId },
    include: agencyInclude,
    data: {
      ...(input.name != null && { name: input.name }),
      ...(input.logo != null && { logo: input.logo }),
      ...(input.licenseNumber != null && {
        licenseNumber: input.licenseNumber,
      }),
    },
  });
};

export const addAgencyAgent = async (
  agencyId: string,
  agentId: string,
  ctx: Context,
) => {
  await assertAgencyManager(agencyId, ctx);

  await ctx.prisma.user.update({
    where: { id: agentId },
    data: {
      role: UserRole.AGENT,
      agencyId,
    },
  });

  return ctx.prisma.agency.findUnique({
    where: { id: agencyId },
    include: agencyInclude,
  });
};

export const removeAgencyAgent = async (
  agencyId: string,
  agentId: string,
  ctx: Context,
) => {
  await assertAgencyManager(agencyId, ctx);

  await ctx.prisma.user.updateMany({
    where: {
      id: agentId,
      agencyId,
    },
    data: {
      agencyId: null,
    },
  });

  return ctx.prisma.agency.findUnique({
    where: { id: agencyId },
    include: agencyInclude,
  });
};
