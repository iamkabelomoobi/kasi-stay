import { Prisma } from "@kasistay/db";
import { Context } from "../app/context";
import { enqueueNotificationEmail } from "../modules/notifications/jobs";

type NotifyUsersInput = {
  userIds: string[];
  type: string;
  title: string;
  body: string;
  metadata?: Prisma.InputJsonValue;
  email?: {
    subject: string;
    text: string;
    html?: string;
  };
};

export const notifyUsers = async (
  ctx: Context,
  input: NotifyUsersInput,
): Promise<void> => {
  const userIds = Array.from(new Set(input.userIds.filter(Boolean)));
  if (userIds.length === 0) {
    return;
  }

  await ctx.prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: input.type,
      title: input.title,
      body: input.body,
      metadata: input.metadata,
    })),
  });

  if (!input.email) {
    return;
  }

  const recipients = await ctx.prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      email: true,
    },
  });

  const emails = recipients
    .map((recipient) => recipient.email)
    .filter((email): email is string => typeof email === "string");

  await Promise.all(
    emails.map((email) =>
      enqueueNotificationEmail({
        to: email,
        subject: input.email!.subject,
        text: input.email!.text,
        html: input.email!.html ?? input.email!.text,
      }),
    ),
  );
};
