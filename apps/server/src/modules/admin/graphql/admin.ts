import { builder } from "../../../app/builder";
import { getAdmin, getAdmins } from "../queries";
import { deleteAdmin, updateAdmin } from "../mutations";

builder.prismaObject("Admin", {
  fields: (t) => ({
    id: t.exposeID("id"),
    userId: t.exposeString("userId"),
    user: t.relation("user"),
  }),
});

export const AdminUpdateInput = builder.inputType("AdminUpdateInput", {
  fields: (t) => ({
    name: t.string({ required: false }),
    email: t.string({ required: false }),
    image: t.string({ required: false }),
  }),
});

builder.queryField("admin", (t) =>
  t.prismaField({
    type: "Admin",
    nullable: true,
    authScopes: { isAdmin: true },
    description: "Get an admin profile by ID — admin only",
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (query, _, args, ctx) => {
      return getAdmin(String(args.id), ctx, query);
    },
  }),
);

builder.queryField("admins", (t) =>
  t.prismaField({
    type: ["Admin"],
    authScopes: { isAdmin: true },
    description: "Get all admin profiles — admin only",
    resolve: async (query, _, __, ctx) => {
      return getAdmins(ctx, query);
    },
  }),
);

builder.mutationField("updateAdmin", (t) =>
  t.prismaField({
    type: "Admin",
    authScopes: { isAdmin: true },
    description: "Update an admin profile — admin only",
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: AdminUpdateInput, required: true }),
    },
    resolve: async (query, _, args, ctx) => {
      return updateAdmin(
        String(args.id),
        {
          ...(args.input.name && { name: args.input.name }),
          ...(args.input.email && { email: args.input.email }),
          ...(args.input.image && { image: args.input.image }),
        },
        ctx,
        query,
      );
    },
  }),
);

builder.mutationField("deleteAdmin", (t) =>
  t.prismaField({
    type: "Admin",
    authScopes: { isAdmin: true },
    description: "Delete an admin profile — admin only",
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_, __, args, ctx) => {
      return deleteAdmin(String(args.id), ctx);
    },
  }),
);
