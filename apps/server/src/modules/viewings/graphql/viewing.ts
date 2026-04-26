import type { Property, Viewing } from "@kasistay/db";
import { builder } from "../../../app/builder";
import { PropertyRef } from "../../properties/graphql/property";
import {
  cancelViewing,
  completeViewing,
  confirmViewing,
  scheduleViewing,
} from "../mutations";
import { getViewing, listViewings } from "../queries";
import { ScheduleViewingInput, ViewingFilterInput } from "../viewing.types";

type ViewingShape = Viewing & {
  property?: Property | null;
};

export const ViewingRef = builder.objectRef<ViewingShape>("Viewing");
ViewingRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    inquiryId: t.id({ resolve: (parent) => parent.inquiryId }),
    propertyId: t.id({ resolve: (parent) => parent.propertyId }),
    userId: t.id({ resolve: (parent) => parent.userId }),
    scheduledAt: t.field({ type: "Date", resolve: (parent) => parent.scheduledAt }),
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

builder.queryField("viewing", (t) =>
  t.field({
    type: ViewingRef,
    nullable: true,
    authScopes: { isAuthenticated: true },
    description: "Fetch a single viewing by ID",
    args: {
      viewingId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => getViewing(String(args.viewingId), ctx),
  }),
);

builder.queryField("viewings", (t) =>
  t.field({
    type: [ViewingRef],
    authScopes: { isAuthenticated: true },
    description: "List viewings visible to the current user",
    args: {
      filter: t.arg({ type: ViewingFilterInput, required: false }),
    },
    resolve: (_, args, ctx) => listViewings(ctx, args.filter ?? undefined),
  }),
);

builder.mutationField("scheduleViewing", (t) =>
  t.field({
    type: ViewingRef,
    authScopes: { isAuthenticated: true },
    description: "Schedule a viewing for an inquiry",
    args: {
      inquiryId: t.arg.id({ required: true }),
      input: t.arg({ type: ScheduleViewingInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      scheduleViewing(String(args.inquiryId), args.input, ctx),
  }),
);

builder.mutationField("confirmViewing", (t) =>
  t.field({
    type: ViewingRef,
    authScopes: { isAuthenticated: true },
    description: "Confirm a scheduled viewing",
    args: {
      viewingId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => confirmViewing(String(args.viewingId), ctx),
  }),
);

builder.mutationField("cancelViewing", (t) =>
  t.field({
    type: ViewingRef,
    authScopes: { isAuthenticated: true },
    description: "Cancel a viewing",
    args: {
      viewingId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => cancelViewing(String(args.viewingId), ctx),
  }),
);

builder.mutationField("completeViewing", (t) =>
  t.field({
    type: ViewingRef,
    authScopes: { isAuthenticated: true },
    description: "Complete a confirmed viewing",
    args: {
      viewingId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => completeViewing(String(args.viewingId), ctx),
  }),
);
