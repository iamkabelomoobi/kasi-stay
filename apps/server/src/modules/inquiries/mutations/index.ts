import { InquirySource, InquiryStatus, Prisma } from "@kasistay/db";
import { Context } from "../../../app/context";
import { enqueueNotificationEmail } from "../../notifications/jobs";
import { badInput, notFound, unauthorized } from "../../../utils/errors";
import { inquiryInclude } from "../queries";

const parseEnum = <T extends Record<string, string>>(
  enumObject: T,
  value: string | null | undefined,
  field: string,
): T[keyof T] | undefined => {
  if (value == null) return undefined;
  const normalized = value.toUpperCase().trim();
  const parsed = enumObject[normalized as keyof T];

  if (!parsed) {
    badInput(`Invalid ${field}: ${value}`);
  }

  return parsed;
};

const inquiryStatusRank: Record<InquiryStatus, number> = {
  [InquiryStatus.NEW]: 0,
  [InquiryStatus.CONTACTED]: 1,
  [InquiryStatus.VIEWING]: 2,
  [InquiryStatus.OFFER]: 3,
  [InquiryStatus.CLOSED]: 4,
};

const assertCanManageInquiry = async (
  inquiryId: string,
  ctx: Context,
  transaction?: Prisma.TransactionClient,
) => {
  const db = transaction ?? ctx.prisma;
  const inquiry = await db.inquiry.findUnique({
    where: { id: inquiryId },
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

  if (!inquiry) {
    notFound("Inquiry not found");
  }

  if (ctx.isAdmin) {
    return inquiry!;
  }

  const userId = ctx.assertAuth().id;
  if (
    inquiry!.property.agentId !== userId &&
    inquiry!.property.agency?.ownerId !== userId
  ) {
    unauthorized();
  }

  return inquiry!;
};

export const createInquiry = async (
  propertyId: string,
  input: {
    name: string;
    email: string;
    phone?: string | null;
    message?: string | null;
    source?: string | null;
  },
  ctx: Context,
) => {
  const property = await ctx.prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      agent: {
        select: {
          email: true,
          name: true,
        },
      },
      agency: {
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!property) {
    notFound("Property not found");
  }

  const source = parseEnum(
    InquirySource,
    input.source ?? undefined,
    "inquiry source",
  );

  const inquiry = await ctx.prisma.inquiry.create({
    data: {
      propertyId,
      userId: ctx.session?.user.id ?? null,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      message: input.message ?? null,
      source: source ?? InquirySource.ORGANIC,
    },
    include: inquiryInclude,
  });

  const notificationRecipients = [
    property!.agentId,
    property!.agency?.owner?.id,
  ].filter((value, index, values): value is string => {
    return Boolean(value) && values.indexOf(value) === index;
  });

  if (notificationRecipients.length) {
    await ctx.prisma.notification.createMany({
      data: notificationRecipients.map((userId) => ({
        userId,
        type: "INQUIRY_CREATED",
        title: "New property inquiry",
        body: `${input.name} sent an inquiry about ${property!.title}`,
        metadata: {
          inquiryId: inquiry.id,
          propertyId,
        } satisfies Prisma.InputJsonValue,
      })),
    });
  }

  const emailRecipients = [
    property!.agent?.email
      ? {
          email: property!.agent.email,
          name: property!.agent.name ?? "Agent",
        }
      : null,
    property!.agency?.owner?.email
      ? {
          email: property!.agency.owner.email,
          name: property!.agency.owner.name ?? property!.agency.name,
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
        subject: `New property inquiry: ${property!.title}`,
        text: `${input.name} submitted a new inquiry for ${property!.title}.`,
        html: `<p><strong>${input.name}</strong> submitted a new inquiry for <strong>${property!.title}</strong>.</p><p>Email: ${input.email}</p>${input.phone ? `<p>Phone: ${input.phone}</p>` : ""}${input.message ? `<p>Message: ${input.message}</p>` : ""}`,
      }),
    ),
  );

  return inquiry;
};

export const updateInquiryStatus = async (
  inquiryId: string,
  input: {
    status: string;
  },
  ctx: Context,
) => {
  const targetStatus = parseEnum(InquiryStatus, input.status, "inquiry status");
  if (!targetStatus) {
    badInput("Inquiry status is required");
  }

  return ctx.prisma.$transaction(async (tx) => {
    const inquiry = await assertCanManageInquiry(inquiryId, ctx, tx);
    const currentRank = inquiryStatusRank[inquiry.status];
    const nextRank = inquiryStatusRank[targetStatus!];

    if (nextRank < currentRank) {
      badInput(
        `Invalid inquiry status transition from ${inquiry.status} to ${targetStatus}`,
      );
    }

    if (targetStatus === InquiryStatus.VIEWING) {
      const viewingCount = await tx.viewing.count({
        where: { inquiryId },
      });

      if (viewingCount === 0) {
        badInput(
          "Create a viewing before moving an inquiry to VIEWING status",
        );
      }
    }

    const updatedInquiry = await tx.inquiry.update({
      where: { id: inquiryId },
      data: {
        status: targetStatus!,
      },
      include: inquiryInclude,
    });

    if (updatedInquiry.userId) {
      await tx.notification.create({
        data: {
          userId: updatedInquiry.userId,
          type: "INQUIRY_STATUS_UPDATED",
          title: "Inquiry status updated",
          body: `Your inquiry is now ${targetStatus}`,
          metadata: {
            inquiryId,
            status: targetStatus,
          } satisfies Prisma.InputJsonValue,
        },
      });
    }

    return updatedInquiry;
  });
};
