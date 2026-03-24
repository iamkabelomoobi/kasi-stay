import { Context } from "../../../app/context";

export const getAdmin = async (id: string, ctx: Context, query?: object) => {
  return ctx.prisma.admin.findUnique({
    ...(query ?? {}),
    where: { id },
  });
};
