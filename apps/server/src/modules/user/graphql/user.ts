import { builder } from "../../../app/builder";
import { getMe, getUser, getUsers } from "../queries";
import { deleteUser, updateUser } from "../mutations";

builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    email: t.exposeString("email"),
    emailVerified: t.exposeBoolean("emailVerified"),
    role: t.exposeString("role"),
    image: t.exposeString("image", { nullable: true }),
    admin: t.relation("admin", { nullable: true }),
    renter: t.relation("renter", { nullable: true }),
  }),
});

export const UserUpdateInput = builder.inputType("UserUpdateInput", {
  fields: (t) => ({
    name: t.string({ required: false }),
    email: t.string({ required: false }),
    image: t.string({ required: false }),
  }),
});

export const UserSearchInput = builder.inputType("UserSearchInput", {
  fields: (t) => ({
    name: t.string({ required: false }),
    email: t.string({ required: false }),
  }),
});

builder.queryField("me", (t) =>
  t.prismaField({
    type: "User",
    nullable: true,
    authScopes: { isAuthenticated: true },
    description: "Get the currently authenticated user",
    resolve: async (query, _, __, ctx) => {
      return getMe(ctx, query);
    },
  }),
);

builder.queryField("user", (t) =>
  t.prismaField({
    type: "User",
    nullable: true,
    authScopes: { isAdmin: true },
    description: "Get a user by ID — admin only",
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (query, _, args, ctx) => {
      return getUser(String(args.id), ctx, query);
    },
  }),
);

builder.queryField("users", (t) =>
  t.prismaField({
    type: ["User"],
    authScopes: { isAdmin: true },
    description: "Get all users — admin only",
    args: {
      search: t.arg({ type: UserSearchInput, required: false }),
    },
    resolve: async (query, _, args, ctx) => {
      return getUsers(ctx, query, args.search ?? undefined);
    },
  }),
);

builder.mutationField("updateUser", (t) =>
  t.prismaField({
    type: "User",
    authScopes: { isAuthenticated: true },
    description: "Update a user — admin or self only",
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: UserUpdateInput, required: true }),
    },
    resolve: async (query, _, args, ctx) => {
      const user = ctx.assertAuth();
      if (!ctx.isAdmin && user.id !== String(args.id)) {
        throw new Error("Forbidden: admin or owner access required");
      }
      return updateUser(
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

builder.mutationField("deleteUser", (t) =>
  t.prismaField({
    type: "User",
    authScopes: { isAdmin: true },
    description: "Delete a user by ID — admin only",
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_, __, args, ctx) => {
      return deleteUser(String(args.id), ctx);
    },
  }),
);
