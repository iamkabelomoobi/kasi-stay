import { Context } from "../../../app/context";

export const getUsers = async (
  ctx: Context,
  query?: object,
  search?: { name?: string | null; email?: string | null },
) => {
  return ctx.prisma.user.findMany({
    ...(query ?? {}),
    where: {
      ...(search?.name && {
        name: { contains: search.name, mode: "insensitive" },
      }),
      ...(search?.email && {
        email: { contains: search.email, mode: "insensitive" },
      }),
    },
  });
};
