import { Context } from "../../../app/context";

export const getRenters = async (
  ctx: Context,
  query?: object,
  search?: { name?: string | null; email?: string | null },
) => {
  const orFilters: Array<Record<string, unknown>> = [];

  if (search?.name) {
    orFilters.push({
      user: {
        name: { contains: search.name, mode: "insensitive" },
      },
    });
  }

  if (search?.email) {
    orFilters.push({
      user: {
        email: { contains: search.email, mode: "insensitive" },
      },
    });
  }

  return ctx.prisma.renter.findMany({
    ...(query ?? {}),
    ...(orFilters.length > 0
      ? {
          where: {
            OR: orFilters,
          },
        }
      : {}),
    orderBy: {
      createdAt: "desc",
    },
  });
};
