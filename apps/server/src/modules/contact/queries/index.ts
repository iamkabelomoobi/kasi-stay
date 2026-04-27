import { ContactMessageStatus, Prisma } from "@kasistay/db";
import { Context } from "../../../app/context";
import { parseEnum } from "../../../utils/parse-enum";

export type ContactMessageFilter = {
  status?: string | null;
  limit?: number | null;
  offset?: number | null;
};

export type ContactMessageShape = Prisma.ContactMessageGetPayload<Record<string, never>>;

export const listContactMessages = async (
  ctx: Context,
  filter?: ContactMessageFilter,
) => {
  ctx.assertAdmin();
  const status = parseEnum(
    ContactMessageStatus,
    filter?.status ?? undefined,
    "contact message status",
  );

  return ctx.prisma.contactMessage.findMany({
    where: status ? { status } : undefined,
    orderBy: [{ createdAt: "desc" }],
    take: filter?.limit ?? 20,
    skip: filter?.offset ?? 0,
  });
};
