import { builder } from "../../../app/builder";
import { getMyProfile, getRenter, getRenters } from "../queries";
import { deleteRenter, updateRenter } from "../mutations";
import { assertRenterAccess } from "../../../lib/assertRenterAccess";
import { RenterUpdateInput, RenterSearchInput } from "../renter.types";

builder.prismaObject("Renter", {
  fields: (t) => ({
    id: t.exposeID("id"),
    userId: t.exposeString("userId"),
    user: t.relation("user"),
    createdAt: t.expose("createdAt", { type: "Date" }),
    updatedAt: t.expose("updatedAt", { type: "Date" }),
  }),
});

builder.queryField("renter", (t) =>
  t.prismaField({
    type: "Renter",
    nullable: true,
    authScopes: { isAuthenticated: true },
    description: "Get a renter profile by ID — admin or self",
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (query, _, args, ctx) => {
      const id = String(args.id);
      await assertRenterAccess(id, ctx);
      return getRenter(id, ctx, query);
    },
  }),
);

builder.queryField("myProfile", (t) =>
  t.prismaField({
    type: "Renter",
    nullable: true,
    authScopes: { isRenter: true },
    description: "Get the current renter profile",
    resolve: (query, _, __, ctx) => getMyProfile(ctx, query),
  }),
);

builder.queryField("renters", (t) =>
  t.prismaField({
    type: ["Renter"],
    authScopes: { isAdmin: true },
    description: "Get all renter profiles — admin only",
    args: {
      search: t.arg({ type: RenterSearchInput, required: false }),
    },
    resolve: (query, _, args, ctx) =>
      getRenters(ctx, query, args.search ?? undefined),
  }),
);

builder.mutationField("updateRenter", (t) =>
  t.prismaField({
    type: "Renter",
    authScopes: { isAuthenticated: true },
    description: "Update a renter profile — admin or self",
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: RenterUpdateInput, required: true }),
    },
    resolve: async (query, _, args, ctx) => {
      const id = String(args.id);
      await assertRenterAccess(id, ctx);

      return updateRenter(
        id,
        {
          ...(args.input.name != null && { name: args.input.name }),
          ...(args.input.email != null && { email: args.input.email }),
          ...(args.input.image != null && { image: args.input.image }),
        },
        ctx,
        query,
      );
    },
  }),
);

builder.mutationField("deleteRenter", (t) =>
  t.prismaField({
    type: "Renter",
    authScopes: { isAdmin: true },
    description: "Delete a renter profile — admin only",
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: (_, __, args, ctx) => deleteRenter(String(args.id), ctx),
  }),
);
