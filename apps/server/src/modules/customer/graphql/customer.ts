import { builder } from "../../../app/builder";
import { getCustomer, getCustomers, getMyProfile } from "../queries";
import { deleteCustomer, updateCustomer } from "../mutations";

builder.prismaObject("Customer", {
  fields: (t) => ({
    id: t.exposeID("id"),
    userId: t.exposeString("userId"),
    user: t.relation("user"),
    createdAt: t.expose("createdAt", { type: "Date" }),
    updatedAt: t.expose("updatedAt", { type: "Date" }),
  }),
});

export const CustomerUpdateInput = builder.inputType("CustomerUpdateInput", {
  fields: (t) => ({
    name: t.string({ required: false }),
    email: t.string({ required: false }),
    image: t.string({ required: false }),
  }),
});

export const CustomerSearchInput = builder.inputType("CustomerSearchInput", {
  fields: (t) => ({
    name: t.string({ required: false }),
    email: t.string({ required: false }),
  }),
});

builder.queryField("customer", (t) =>
  t.prismaField({
    type: "Customer",
    nullable: true,
    authScopes: { isAuthenticated: true },
    description: "Get a customer profile by ID — admin or self",
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (query, _, args, ctx) => {
      const id = String(args.id);
      const sessionUser = ctx.assertAuth();

      if (!ctx.isAdmin) {
        const target = await ctx.prisma.customer.findUnique({
          where: { id },
          select: { userId: true },
        });

        if (!target || target.userId !== sessionUser.id) {
          throw new Error("Forbidden: admin or owner access required");
        }
      }

      return getCustomer(id, ctx, query);
    },
  }),
);

builder.queryField("myProfile", (t) =>
  t.prismaField({
    type: "Customer",
    nullable: true,
    authScopes: { isCustomer: true },
    description: "Get the current customer profile",
    resolve: async (query, _, __, ctx) => {
      return getMyProfile(ctx, query);
    },
  }),
);

builder.queryField("customers", (t) =>
  t.prismaField({
    type: ["Customer"],
    authScopes: { isAdmin: true },
    description: "Get all customer profiles — admin only",
    args: {
      search: t.arg({ type: CustomerSearchInput, required: false }),
    },
    resolve: async (query, _, args, ctx) => {
      return getCustomers(ctx, query, args.search ?? undefined);
    },
  }),
);

builder.mutationField("updateCustomer", (t) =>
  t.prismaField({
    type: "Customer",
    authScopes: { isAuthenticated: true },
    description: "Update a customer profile — admin or self",
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: CustomerUpdateInput, required: true }),
    },
    resolve: async (query, _, args, ctx) => {
      const id = String(args.id);
      const sessionUser = ctx.assertAuth();

      if (!ctx.isAdmin) {
        const target = await ctx.prisma.customer.findUnique({
          where: { id },
          select: { userId: true },
        });

        if (!target || target.userId !== sessionUser.id) {
          throw new Error("Forbidden: admin or owner access required");
        }
      }

      return updateCustomer(
        id,
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

builder.mutationField("deleteCustomer", (t) =>
  t.prismaField({
    type: "Customer",
    authScopes: { isAdmin: true },
    description: "Delete a customer profile — admin only",
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_, __, args, ctx) => {
      return deleteCustomer(String(args.id), ctx);
    },
  }),
);
