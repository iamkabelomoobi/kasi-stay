import { builder } from "../../../app/builder";
import {
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from "../mutations";
import { listNotifications, type NotificationShape } from "../queries";
import { NotificationFilterInput } from "../notification.types";

const NotificationRef = builder.objectRef<NotificationShape>("Notification");
NotificationRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    userId: t.id({ resolve: (parent) => parent.userId }),
    type: t.string({ resolve: (parent) => parent.type }),
    title: t.string({ resolve: (parent) => parent.title }),
    body: t.string({ resolve: (parent) => parent.body }),
    isRead: t.boolean({ resolve: (parent) => parent.isRead }),
    metadataJson: t.string({
      resolve: (parent) => JSON.stringify(parent.metadata ?? null),
    }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

builder.queryField("notifications", (t) =>
  t.field({
    type: [NotificationRef],
    authScopes: { isAuthenticated: true },
    description: "List notifications for the current user",
    args: {
      filter: t.arg({ type: NotificationFilterInput, required: false }),
    },
    resolve: (_, args, ctx) => listNotifications(ctx, args.filter ?? undefined),
  }),
);

builder.mutationField("markNotificationRead", (t) =>
  t.field({
    type: NotificationRef,
    authScopes: { isAuthenticated: true },
    description: "Mark a notification as read",
    args: {
      notificationId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      markNotificationRead(String(args.notificationId), ctx),
  }),
);

builder.mutationField("markAllNotificationsRead", (t) =>
  t.field({
    type: "Boolean",
    authScopes: { isAuthenticated: true },
    description: "Mark all notifications as read",
    resolve: (_, __, ctx) => markAllNotificationsRead(ctx),
  }),
);

builder.mutationField("deleteNotification", (t) =>
  t.field({
    type: "Boolean",
    authScopes: { isAuthenticated: true },
    description: "Delete a notification",
    args: {
      notificationId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => deleteNotification(String(args.notificationId), ctx),
  }),
);
