import type { Agency } from "@kasistay/db";
import { builder } from "../../../app/builder";
import {
  addAgencyAgent,
  createAgency,
  removeAgencyAgent,
  updateAgency,
} from "../mutations";
import { getAgency } from "../queries";
import { AgencyInput, AgencyUpdateInput } from "../agency.types";

type AgencyShape = Agency & {
  owner?: unknown;
  agents?: unknown[];
  listings?: unknown[];
};

const AgencyRef = builder.objectRef<AgencyShape>("Agency");
AgencyRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    name: t.string({ resolve: (parent) => parent.name }),
    logo: t.string({
      resolve: (parent) => parent.logo ?? null,
      nullable: true,
    }),
    licenseNumber: t.string({
      resolve: (parent) => parent.licenseNumber ?? null,
      nullable: true,
    }),
    ownerId: t.id({ resolve: (parent) => parent.ownerId }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

builder.queryField("agency", (t) =>
  t.field({
    type: AgencyRef,
    nullable: true,
    description: "Fetch a single agency by ID",
    args: {
      agencyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => getAgency(String(args.agencyId), ctx),
  }),
);

builder.mutationField("createAgency", (t) =>
  t.field({
    type: AgencyRef,
    authScopes: { isAuthenticated: true },
    description: "Create an agency",
    args: {
      input: t.arg({ type: AgencyInput, required: true }),
    },
    resolve: (_, args, ctx) => createAgency(args.input, ctx),
  }),
);

builder.mutationField("updateAgency", (t) =>
  t.field({
    type: AgencyRef,
    authScopes: { isAuthenticated: true },
    description: "Update an agency",
    args: {
      agencyId: t.arg.id({ required: true }),
      input: t.arg({ type: AgencyUpdateInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      updateAgency(String(args.agencyId), args.input, ctx),
  }),
);

builder.mutationField("addAgencyAgent", (t) =>
  t.field({
    type: AgencyRef,
    authScopes: { isAuthenticated: true },
    description: "Attach a user as an agency agent",
    args: {
      agencyId: t.arg.id({ required: true }),
      agentId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      addAgencyAgent(String(args.agencyId), String(args.agentId), ctx),
  }),
);

builder.mutationField("removeAgencyAgent", (t) =>
  t.field({
    type: AgencyRef,
    authScopes: { isAuthenticated: true },
    description: "Remove a user from an agency's agent roster",
    args: {
      agencyId: t.arg.id({ required: true }),
      agentId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      removeAgencyAgent(String(args.agencyId), String(args.agentId), ctx),
  }),
);
