import { builder } from "../../../app/builder";
import {
  applyAsAgent,
  approveAgentApplication,
  rejectAgentApplication,
  requestAgencyAdvertising,
  updateAgencyAdvertisingRequestStatus,
} from "../mutations";
import {
  listAgencyAdvertisingRequests,
  listAgentApplications,
  type AgencyAdvertisingRequestShape,
  type AgentApplicationShape,
} from "../queries";
import {
  AgencyAdvertisingRequestFilterInput,
  AgencyAdvertisingRequestInput,
  AgencyAdvertisingRequestStatusInput,
  AgentApplicationFilterInput,
  AgentApplicationInput,
} from "../professional.types";

const AgentApplicationRef =
  builder.objectRef<AgentApplicationShape>("AgentApplication");
AgentApplicationRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    userId: t.id({ resolve: (parent) => parent.userId }),
    phone: t.string({
      nullable: true,
      resolve: (parent) => parent.phone ?? null,
    }),
    city: t.string({
      nullable: true,
      resolve: (parent) => parent.city ?? null,
    }),
    experience: t.string({
      nullable: true,
      resolve: (parent) => parent.experience ?? null,
    }),
    licenseNumber: t.string({
      nullable: true,
      resolve: (parent) => parent.licenseNumber ?? null,
    }),
    motivation: t.string({
      nullable: true,
      resolve: (parent) => parent.motivation ?? null,
    }),
    status: t.string({ resolve: (parent) => parent.status }),
    rejectionReason: t.string({
      nullable: true,
      resolve: (parent) => parent.rejectionReason ?? null,
    }),
    reviewedById: t.id({
      nullable: true,
      resolve: (parent) => parent.reviewedById ?? null,
    }),
    reviewedAt: t.field({
      type: "Date",
      nullable: true,
      resolve: (parent) => parent.reviewedAt ?? null,
    }),
    applicantName: t.string({
      resolve: (parent) => parent.user.name,
    }),
    applicantEmail: t.string({
      resolve: (parent) => parent.user.email,
    }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

const AgencyAdvertisingRequestRef =
  builder.objectRef<AgencyAdvertisingRequestShape>("AgencyAdvertisingRequest");
AgencyAdvertisingRequestRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    userId: t.id({ resolve: (parent) => parent.userId }),
    agencyName: t.string({ resolve: (parent) => parent.agencyName }),
    contactEmail: t.string({ resolve: (parent) => parent.contactEmail }),
    contactPhone: t.string({
      nullable: true,
      resolve: (parent) => parent.contactPhone ?? null,
    }),
    websiteUrl: t.string({
      nullable: true,
      resolve: (parent) => parent.websiteUrl ?? null,
    }),
    budget: t.string({
      nullable: true,
      resolve: (parent) => parent.budget ?? null,
    }),
    message: t.string({
      nullable: true,
      resolve: (parent) => parent.message ?? null,
    }),
    status: t.string({ resolve: (parent) => parent.status }),
    rejectionReason: t.string({
      nullable: true,
      resolve: (parent) => parent.rejectionReason ?? null,
    }),
    reviewedById: t.id({
      nullable: true,
      resolve: (parent) => parent.reviewedById ?? null,
    }),
    reviewedAt: t.field({
      type: "Date",
      nullable: true,
      resolve: (parent) => parent.reviewedAt ?? null,
    }),
    requesterName: t.string({
      resolve: (parent) => parent.user.name,
    }),
    requesterEmail: t.string({
      resolve: (parent) => parent.user.email,
    }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

builder.queryField("professionalApplications", (t) =>
  t.field({
    type: [AgentApplicationRef],
    authScopes: { isAdmin: true },
    args: {
      filter: t.arg({ type: AgentApplicationFilterInput, required: false }),
    },
    resolve: (_, args, ctx) => listAgentApplications(ctx, args.filter ?? undefined),
  }),
);

builder.queryField("agencyAdvertisingRequests", (t) =>
  t.field({
    type: [AgencyAdvertisingRequestRef],
    authScopes: { isAdmin: true },
    args: {
      filter: t.arg({
        type: AgencyAdvertisingRequestFilterInput,
        required: false,
      }),
    },
    resolve: (_, args, ctx) =>
      listAgencyAdvertisingRequests(ctx, args.filter ?? undefined),
  }),
);

builder.mutationField("applyAsAgent", (t) =>
  t.field({
    type: AgentApplicationRef,
    authScopes: { isAuthenticated: true },
    args: {
      input: t.arg({ type: AgentApplicationInput, required: true }),
    },
    resolve: (_, args, ctx) => applyAsAgent(args.input, ctx),
  }),
);

builder.mutationField("requestAgencyAdvertising", (t) =>
  t.field({
    type: AgencyAdvertisingRequestRef,
    authScopes: { isAuthenticated: true },
    args: {
      input: t.arg({ type: AgencyAdvertisingRequestInput, required: true }),
    },
    resolve: (_, args, ctx) => requestAgencyAdvertising(args.input, ctx),
  }),
);

builder.mutationField("approveAgentApplication", (t) =>
  t.field({
    type: AgentApplicationRef,
    authScopes: { isAdmin: true },
    args: {
      applicationId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      approveAgentApplication(String(args.applicationId), ctx),
  }),
);

builder.mutationField("rejectAgentApplication", (t) =>
  t.field({
    type: AgentApplicationRef,
    authScopes: { isAdmin: true },
    args: {
      applicationId: t.arg.id({ required: true }),
      rejectionReason: t.arg.string({ required: false }),
    },
    resolve: (_, args, ctx) =>
      rejectAgentApplication(
        String(args.applicationId),
        args.rejectionReason ?? undefined,
        ctx,
      ),
  }),
);

builder.mutationField("updateAgencyAdvertisingRequestStatus", (t) =>
  t.field({
    type: AgencyAdvertisingRequestRef,
    authScopes: { isAdmin: true },
    args: {
      requestId: t.arg.id({ required: true }),
      input: t.arg({ type: AgencyAdvertisingRequestStatusInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      updateAgencyAdvertisingRequestStatus(
        String(args.requestId),
        args.input,
        ctx,
      ),
  }),
);
