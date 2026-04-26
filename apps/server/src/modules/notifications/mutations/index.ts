import { Context } from "../../../app/context";
import { notFound } from "../../../utils/errors";

export const markNotificationRead = async (
  notificationId: string,
  ctx: Context,
) => {
  const user = ctx.assertAuth();
  const notification = await ctx.prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId: user.id,
    },
  });

  if (!notification) {
    notFound("Notification not found");
  }

  return ctx.prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

export const markAllNotificationsRead = async (ctx: Context) => {
  const user = ctx.assertAuth();

  await ctx.prisma.notification.updateMany({
    where: {
      userId: user.id,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return true;
};

export const deleteNotification = async (
  notificationId: string,
  ctx: Context,
) => {
  const user = ctx.assertAuth();
  const notification = await ctx.prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId: user.id,
    },
  });

  if (!notification) {
    notFound("Notification not found");
  }

  await ctx.prisma.notification.delete({
    where: { id: notificationId },
  });

  return true;
};
