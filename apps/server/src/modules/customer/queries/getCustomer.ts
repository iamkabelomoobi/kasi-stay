import { Context } from "../../../app/context";

export const getCustomer = async (id: string, ctx: Context, query?: object) => {
  return ctx.prisma.customer.findUnique({
    ...(query ?? {}),
    where: { id },
  });
};
