import { Context } from "../../../app/context";

export const getMyProfile = async (ctx: Context, query?: object) => {
  const user = ctx.assertRenter();

  return ctx.prisma.renter.findUnique({
    ...(query ?? {}),
    where: { userId: user.id },
  });
};
