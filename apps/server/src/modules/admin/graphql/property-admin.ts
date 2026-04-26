import { builder } from "../../../app/builder";
import { PropertyRef } from "../../properties/graphql/property";
import {
  approvePropertyForAdmin,
  rejectPropertyForAdmin,
} from "../mutations/property-admin";
import {
  getAdminAnalyticsOverview,
  listPendingProperties,
} from "../queries/property-admin";

const AdminAnalyticsOverviewRef = builder.simpleObject(
  "AdminAnalyticsOverview",
  {
    fields: (t) => ({
      totalProperties: t.int(),
      pendingProperties: t.int(),
      totalInquiries: t.int(),
      openReports: t.int(),
      activeSubscriptions: t.int(),
    }),
  },
);

builder.queryField("adminPendingProperties", (t) =>
  t.field({
    type: [PropertyRef],
    authScopes: { isAdmin: true },
    description: "List properties pending admin approval",
    resolve: (_, __, ctx) => listPendingProperties(ctx),
  }),
);

builder.queryField("adminAnalyticsOverview", (t) =>
  t.field({
    type: AdminAnalyticsOverviewRef,
    authScopes: { isAdmin: true },
    description: "Return aggregate admin dashboard metrics",
    resolve: (_, __, ctx) => getAdminAnalyticsOverview(ctx),
  }),
);

builder.mutationField("approvePropertyForAdmin", (t) =>
  t.field({
    type: PropertyRef,
    authScopes: { isAdmin: true },
    description: "Approve a property listing",
    args: {
      propertyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      approvePropertyForAdmin(String(args.propertyId), ctx),
  }),
);

builder.mutationField("rejectPropertyForAdmin", (t) =>
  t.field({
    type: PropertyRef,
    authScopes: { isAdmin: true },
    description: "Reject and archive a property listing",
    args: {
      propertyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      rejectPropertyForAdmin(String(args.propertyId), ctx),
  }),
);
