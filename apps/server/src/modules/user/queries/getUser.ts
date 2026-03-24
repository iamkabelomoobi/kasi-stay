import { Context } from "../../../app/context";

export const getUser = async (id: string, ctx: Context, query?: object) => {
  return ctx.prisma.user.findUnique({
    ...(query ?? {}),
    where: { id },
  });
};
