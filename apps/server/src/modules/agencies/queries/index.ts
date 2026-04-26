import { Context } from "../../../app/context";
import { notFound } from "../../../utils/errors";

export const agencyInclude = {
  owner: true,
  agents: true,
  listings: true,
} as const;

export const getAgency = async (agencyId: string, ctx: Context) => {
  const agency = await ctx.prisma.agency.findUnique({
    where: { id: agencyId },
    include: agencyInclude,
  });

  if (!agency) {
    notFound("Agency not found");
  }

  return agency;
};
