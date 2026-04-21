import { Context } from "../../../app/context";

export const getRenter = async (id: string, ctx: Context, query?: object) => {
  return ctx.prisma.renter.findUnique({
    ...(query ?? {}),
    where: { id },
  });
};
