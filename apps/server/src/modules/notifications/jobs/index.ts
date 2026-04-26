import type { EmailPayload } from "@kasistay/email";
import { createJobEnqueuer } from "../../../infra/queue";

export const NOTIFICATION_EMAIL_JOB = "notifications.email" as const;

export type NotificationEmailPayload = EmailPayload;

export const enqueueNotificationEmail =
  createJobEnqueuer<NotificationEmailPayload>(NOTIFICATION_EMAIL_JOB);
