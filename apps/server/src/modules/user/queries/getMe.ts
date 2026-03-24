import { Context } from "../../../app/context";

export const getMe = async (ctx: Context, query?: object) => {
  const user = ctx.assertAuth();
  return ctx.prisma.user.findUnique({
    ...(query ?? {}),
    where: { id: user.id },
  });
};
