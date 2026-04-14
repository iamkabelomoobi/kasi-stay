import { Context } from "../../../app/context";
import { Prisma } from "@kasistay/db";

export const deleteCustomer = async (
  id: string,
  ctx: Context,
  transaction?: Prisma.TransactionClient,
) => {
  const db = transaction ?? ctx.prisma;

  return db.customer.delete({
    where: { id },
  });
};
