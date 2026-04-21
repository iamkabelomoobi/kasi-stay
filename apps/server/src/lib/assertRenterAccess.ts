import { GraphQLError } from "graphql";
import { Context } from "../app/context";

export async function assertRenterAccess(id: string, ctx: Context) {
  if (ctx.isAdmin) return;

  const sessionUser = ctx.assertAuth();
  const target = await ctx.prisma.renter.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!target || target.userId !== sessionUser.id) {
    throw new GraphQLError("Forbidden: admin or owner access required", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}
