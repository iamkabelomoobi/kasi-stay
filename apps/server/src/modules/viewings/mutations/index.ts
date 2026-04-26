import { InquiryStatus, Prisma, ViewingStatus } from "@kasistay/db";
import { Context } from "../../../app/context";
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

  return ctx.prisma.$transaction(async (tx) => {
    const inquiry = await tx.inquiry.findUnique({
      where: { id: inquiryId },
      include: {
        property: {
          select: {
            title: true,
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

    if (!inquiry) {
      notFound("Inquiry not found");
    }

    const canSchedule =
      ctx.isAdmin ||
      inquiry!.userId === user.id ||
      inquiry!.property.agentId === user.id ||
      inquiry!.property.agency?.ownerId === user.id;

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
      inquiry!.property.agency?.ownerId,
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
