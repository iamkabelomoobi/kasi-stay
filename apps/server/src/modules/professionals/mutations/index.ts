import { createRoleRecord } from "@kasistay/auth";
import { ApplicationReviewStatus, UserRole } from "@kasistay/db";
import { Context } from "../../../app/context";
import { badInput, notFound } from "../../../utils/errors";
import { notifyUsers } from "../../../utils/notify-users";
import { parseEnum } from "../../../utils/parse-enum";
import {
  agencyAdvertisingRequestInclude,
  agentApplicationInclude,
} from "../queries";

const resolveReviewStatus = (value: string | null | undefined) =>
  parseEnum(
    ApplicationReviewStatus,
    value,
    "application review status",
  );

export const applyAsAgent = async (
  input: {
    phone?: string | null;
    city?: string | null;
    experience?: string | null;
    licenseNumber?: string | null;
    motivation?: string | null;
  },
  ctx: Context,
) => {
  const user = ctx.assertAuth();
  const pending = await ctx.prisma.agentApplication.findFirst({
    where: {
      userId: user.id,
      status: ApplicationReviewStatus.PENDING,
    },
  });

  if (pending) {
    badInput("You already have a pending agent application");
  }

  return ctx.prisma.agentApplication.create({
    data: {
      userId: user.id,
      phone: input.phone ?? null,
      city: input.city ?? null,
      experience: input.experience ?? null,
      licenseNumber: input.licenseNumber ?? null,
      motivation: input.motivation ?? null,
    },
    include: agentApplicationInclude,
  });
};

export const requestAgencyAdvertising = async (
  input: {
    agencyName: string;
    contactEmail: string;
    contactPhone?: string | null;
    websiteUrl?: string | null;
    budget?: string | null;
    message?: string | null;
  },
  ctx: Context,
) => {
  const user = ctx.assertAuth();
  const pending = await ctx.prisma.agencyAdvertisingRequest.findFirst({
    where: {
      userId: user.id,
      status: ApplicationReviewStatus.PENDING,
    },
  });

  if (pending) {
    badInput("You already have a pending agency advertising request");
  }

  return ctx.prisma.agencyAdvertisingRequest.create({
    data: {
      userId: user.id,
      agencyName: input.agencyName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone ?? null,
      websiteUrl: input.websiteUrl ?? null,
      budget: input.budget ?? null,
      message: input.message ?? null,
    },
    include: agencyAdvertisingRequestInclude,
  });
};

export const approveAgentApplication = async (
  applicationId: string,
  ctx: Context,
) => {
  const admin = ctx.assertAdmin();
  const application = await ctx.prisma.agentApplication.findUnique({
    where: { id: applicationId },
    include: agentApplicationInclude,
  });

  if (!application) {
    notFound("Agent application not found");
  }
  const current = application!;

  await createRoleRecord({
    id: current.userId,
    role: UserRole.AGENT,
  });

  const updated = await ctx.prisma.agentApplication.update({
    where: { id: applicationId },
    data: {
      status: ApplicationReviewStatus.APPROVED,
      rejectionReason: null,
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
    include: agentApplicationInclude,
  });

  await notifyUsers(ctx, {
    userIds: [updated.userId],
    type: "AGENT_APPLICATION_APPROVED",
    title: "Agent application approved",
    body: "Your professional application has been approved.",
    metadata: {
      applicationId: updated.id,
    },
  });

  return updated;
};

export const rejectAgentApplication = async (
  applicationId: string,
  rejectionReason: string | null | undefined,
  ctx: Context,
) => {
  const admin = ctx.assertAdmin();
  const application = await ctx.prisma.agentApplication.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    notFound("Agent application not found");
  }

  const updated = await ctx.prisma.agentApplication.update({
    where: { id: applicationId },
    data: {
      status: ApplicationReviewStatus.REJECTED,
      rejectionReason: rejectionReason ?? null,
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
    include: agentApplicationInclude,
  });

  await notifyUsers(ctx, {
    userIds: [updated.userId],
    type: "AGENT_APPLICATION_REJECTED",
    title: "Agent application update",
    body: rejectionReason?.trim()
      ? `Your agent application was rejected: ${rejectionReason.trim()}`
      : "Your agent application was rejected.",
    metadata: {
      applicationId: updated.id,
    },
  });

  return updated;
};

export const updateAgencyAdvertisingRequestStatus = async (
  requestId: string,
  input: {
    status: string;
    rejectionReason?: string | null;
  },
  ctx: Context,
) => {
  const admin = ctx.assertAdmin();
  const request = await ctx.prisma.agencyAdvertisingRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    notFound("Agency advertising request not found");
  }

  const status = resolveReviewStatus(input.status);
  if (!status) {
    badInput("Status is required");
  }

  const updated = await ctx.prisma.agencyAdvertisingRequest.update({
    where: { id: requestId },
    data: {
      status,
      rejectionReason:
        status === ApplicationReviewStatus.REJECTED
          ? input.rejectionReason ?? null
          : null,
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
    include: agencyAdvertisingRequestInclude,
  });

  await notifyUsers(ctx, {
    userIds: [updated.userId],
    type: "AGENCY_ADVERTISING_REQUEST_UPDATED",
    title: "Agency advertising request updated",
    body:
      status === ApplicationReviewStatus.APPROVED
        ? "Your agency advertising request has been approved."
        : status === ApplicationReviewStatus.REJECTED
          ? input.rejectionReason?.trim()
            ? `Your agency advertising request was rejected: ${input.rejectionReason.trim()}`
            : "Your agency advertising request was rejected."
          : "Your agency advertising request has been updated.",
    metadata: {
      requestId: updated.id,
      status,
    },
  });

  return updated;
};
