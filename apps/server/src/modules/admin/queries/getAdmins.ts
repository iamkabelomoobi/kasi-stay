import { Context } from "../../../app/context";

export const getAdmins = async (ctx: Context, query?: object) => {
  return ctx.prisma.admin.findMany({
    ...(query ?? {}),
  });
};
