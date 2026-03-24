import { Context } from "../../../app/context";
import { Prisma } from "@paystay/db";

export const updateUser = async (
  id: string,
  data: { name?: string; email?: string; image?: string },
  ctx: Context,
  query?: object,
  transaction?: Prisma.TransactionClient,
) => {
  const db = transaction ?? ctx.prisma;
  return db.user.update({
    ...(query ?? {}),
    where: { id },
    data,
  });
};
