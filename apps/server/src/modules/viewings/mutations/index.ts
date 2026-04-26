import { InquiryStatus, Prisma, ViewingStatus } from "@kasistay/db";
import { Context } from "../../../app/context";
import { enqueueNotificationEmail } from "../../notifications/jobs";
import { badInput, notFound, unauthorized } from "../../../utils/errors";
import { viewingInclude } from "../queries";

const assertCanManageViewing = async (
  viewingId: string,
  ctx: Context,
  transaction?: Prisma.TransactionClient,
) => {
  const db = transaction ?? ctx.prisma;
  const viewing = await db.viewing.findUnique({
    where: { id: viewingId },
    include: {
      property: {
        select: {
          agentId: true,
          agency: {
            select: {
              ownerId: true,
            },
          },
        },
      },
    },
  });

  if (!viewing) {
    notFound("Viewing not found");
  }

  if (ctx.isAdmin) {
    return viewing!;
  }

  const userId = ctx.assertAuth().id;
  if (
    viewing!.property.agentId !== userId &&
    viewing!.property.agency?.ownerId !== userId
  ) {
    unauthorized();
  }

  return viewing!;
};

const assertCanAccessViewingAsParticipant = async (
  viewingId: string,
  ctx: Context,
  transaction?: Prisma.TransactionClient,
) => {
  const db = transaction ?? ctx.prisma;
  const viewing = await db.viewing.findUnique({
    where: { id: viewingId },
    include: {
      property: {
        select: {
          agentId: true,
          agency: {
            select: {
              ownerId: true,
            },
          },
        },
      },
    },
  });

  if (!viewing) {
    notFound("Viewing not found");
  }

  if (ctx.isAdmin) {
    return viewing!;
  }

  const userId = ctx.assertAuth().id;
  if (
    viewing!.userId !== userId &&
    viewing!.property.agentId !== userId &&
    viewing!.property.agency?.ownerId !== userId
  ) {
    unauthorized();
  }

  return viewing!;
};

export const scheduleViewing = async (
  inquiryId: string,
  input: {
    scheduledAt: Date;
  },
  ctx: Context,
) => {
  const user = ctx.assertAuth();

  const viewing = await ctx.prisma.$transaction(async (tx) => {
    const inquiry = await tx.inquiry.findUnique({
      where: { id: inquiryId },
      select: {
        propertyId: true,
        userId: true,
        property: {
          select: {
            title: true,
            agentId: true,
            agent: {
              select: {
                email: true,
                name: true,
              },
            },
            agency: {
              select: {
                owner: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!inquiry) {
      notFound("Inquiry not found");
    }

    const canSchedule =
      ctx.isAdmin ||
      inquiry!.userId === user.id ||
      inquiry!.property.agentId === user.id ||
      inquiry!.property.agency?.owner?.id === user.id;

    if (!canSchedule) {
      unauthorized();
    }

    const viewerUserId = inquiry!.userId ?? user.id;
    if (!viewerUserId) {
      badInput("Viewing requires an authenticated user");
    }

    const viewing = await tx.viewing.create({
      data: {
        inquiryId,
        propertyId: inquiry!.propertyId,
        userId: viewerUserId,
        scheduledAt: input.scheduledAt,
        status: ViewingStatus.PENDING,
      },
      include: viewingInclude,
    });

    await tx.inquiry.update({
      where: { id: inquiryId },
      data: {
        status: InquiryStatus.VIEWING,
      },
    });

    const notificationRecipients = [
      inquiry!.property.agentId,
      inquiry!.property.agency?.owner?.id,
      inquiry!.userId,
    ].filter((value, index, values): value is string => {
      return Boolean(value) && values.indexOf(value) === index;
    });

    if (notificationRecipients.length) {
      await tx.notification.createMany({
        data: notificationRecipients.map((userId) => ({
          userId,
          type: "VIEWING_SCHEDULED",
          title: "Viewing scheduled",
          body: `A viewing was scheduled for ${inquiry!.property.title}`,
          metadata: {
            viewingId: viewing.id,
            inquiryId,
            propertyId: inquiry!.propertyId,
          } satisfies Prisma.InputJsonValue,
        })),
      });
    }

    return viewing;
  });

  const emailRecipients = [
    viewing.user?.email
      ? {
          email: viewing.user.email,
          name: viewing.user.name ?? "Viewer",
        }
      : null,
    viewing.property.agent?.email
      ? {
          email: viewing.property.agent.email,
          name: viewing.property.agent.name ?? "Agent",
        }
      : null,
    viewing.property.agency?.owner?.email
      ? {
          email: viewing.property.agency.owner.email,
          name: viewing.property.agency.owner.name ?? viewing.property.agency.name,
        }
      : null,
  ].filter(
    (
      recipient,
      index,
      recipients,
    ): recipient is { email: string; name: string } =>
      Boolean(recipient) &&
      recipients.findIndex((item) => item?.email === recipient?.email) === index,
  );

  await Promise.all(
    emailRecipients.map((recipient) =>
      enqueueNotificationEmail({
        to: recipient.email,
        subject: `Viewing scheduled: ${viewing.property.title}`,
        text: `A viewing for ${viewing.property.title} is scheduled on ${viewing.scheduledAt.toISOString()}.`,
        html: `<p>A viewing for <strong>${viewing.property.title}</strong> is scheduled on <strong>${viewing.scheduledAt.toISOString()}</strong>.</p>`,
      }),
    ),
  );

  return viewing;
};

export const confirmViewing = async (viewingId: string, ctx: Context) => {
  return ctx.prisma.$transaction(async (tx) => {
    const viewing = await assertCanManageViewing(viewingId, ctx, tx);

    if (viewing.status !== ViewingStatus.PENDING) {
      badInput("Only pending viewings can be confirmed");
    }

    const updated = await tx.viewing.update({
      where: { id: viewingId },
      data: { status: ViewingStatus.CONFIRMED },
      include: viewingInclude,
    });

    await tx.notification.create({
      data: {
        userId: updated.userId,
        type: "VIEWING_CONFIRMED",
        title: "Viewing confirmed",
        body: "Your viewing has been confirmed",
        metadata: {
          viewingId,
        } satisfies Prisma.InputJsonValue,
      },
    });

    return updated;
  });
};

export const cancelViewing = async (viewingId: string, ctx: Context) => {
  return ctx.prisma.$transaction(async (tx) => {
    const viewing = await assertCanAccessViewingAsParticipant(viewingId, ctx, tx);

    if (viewing.status === ViewingStatus.COMPLETED) {
      badInput("Completed viewings cannot be cancelled");
    }

    const updated = await tx.viewing.update({
      where: { id: viewingId },
      data: { status: ViewingStatus.CANCELLED },
      include: viewingInclude,
    });

    await tx.notification.create({
      data: {
        userId: updated.userId,
        type: "VIEWING_CANCELLED",
        title: "Viewing cancelled",
        body: "Your viewing has been cancelled",
        metadata: {
          viewingId,
        } satisfies Prisma.InputJsonValue,
      },
    });

    return updated;
  });
};

export const completeViewing = async (viewingId: string, ctx: Context) => {
  return ctx.prisma.$transaction(async (tx) => {
    const viewing = await assertCanManageViewing(viewingId, ctx, tx);

    if (viewing.status !== ViewingStatus.CONFIRMED) {
      badInput("Only confirmed viewings can be completed");
    }

    return tx.viewing.update({
      where: { id: viewingId },
      data: { status: ViewingStatus.COMPLETED },
      include: viewingInclude,
    });
  });
};
