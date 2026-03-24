import { Context } from "../../../app/context";

export const getMyProfile = async (ctx: Context, query?: object) => {
  const user = ctx.assertCustomer();

  return ctx.prisma.customer.findUnique({
    ...(query ?? {}),
    where: { userId: user.id },
  });
};
