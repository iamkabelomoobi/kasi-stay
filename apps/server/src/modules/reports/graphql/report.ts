import { builder } from "../../../app/builder";
import { PropertyRef } from "../../properties/graphql/property";
import { createReport, resolveReport } from "../mutations";
import { listReports, type ReportShape } from "../queries";
import { ReportFilterInput, ReportInput } from "../report.types";

const ReportRef = builder.objectRef<ReportShape>("Report");
ReportRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    propertyId: t.id({ resolve: (parent) => parent.propertyId }),
    userId: t.id({ resolve: (parent) => parent.userId }),
    reason: t.string({ resolve: (parent) => parent.reason }),
    description: t.string({
      nullable: true,
      resolve: (parent) => parent.description ?? null,
    }),
    status: t.string({ resolve: (parent) => parent.status }),
    property: t.field({
      type: PropertyRef,
      nullable: true,
      resolve: (parent) => parent.property ?? null,
    }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

builder.queryField("reports", (t) =>
  t.field({
    type: [ReportRef],
    authScopes: { isAdmin: true },
    description: "List reports for moderation",
    args: {
      filter: t.arg({ type: ReportFilterInput, required: false }),
    },
    resolve: (_, args, ctx) => listReports(ctx, args.filter ?? undefined),
  }),
);

builder.mutationField("createReport", (t) =>
  t.field({
    type: ReportRef,
    authScopes: { isAuthenticated: true },
    description: "Report a property",
    args: {
      propertyId: t.arg.id({ required: true }),
      input: t.arg({ type: ReportInput, required: true }),
    },
    resolve: (_, args, ctx) => createReport(String(args.propertyId), args.input, ctx),
  }),
);

builder.mutationField("resolveReport", (t) =>
  t.field({
    type: ReportRef,
    authScopes: { isAdmin: true },
    description: "Resolve a report",
    args: {
      reportId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => resolveReport(String(args.reportId), ctx),
  }),
);
