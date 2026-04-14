import { Context } from "../../../app/context";
import { Prisma } from "@kasistay/db";

export const updateAdmin = async (
  id: string,
  data: { name?: string; email?: string; image?: string },
  ctx: Context,
  query?: object,
  transaction?: Prisma.TransactionClient,
) => {
  const db = transaction ?? ctx.prisma;

  return db.admin.update({
    ...(query ?? {}),
    where: { id },
    data: {
      user: {
        update: data,
      },
    },
  });
};
