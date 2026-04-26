import type { Notification } from "@kasistay/db";
import { Context } from "../../../app/context";

export type NotificationShape = Notification;

export const listNotifications = async (
  ctx: Context,
  filter?: {
    unreadOnly?: boolean | null;
    limit?: number | null;
    offset?: number | null;
  },
) => {
  const user = ctx.assertAuth();
  return ctx.prisma.notification.findMany({
    where: {
      userId: user.id,
      ...(filter?.unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: filter?.limit ?? 50,
    skip: filter?.offset ?? 0,
  });
};
