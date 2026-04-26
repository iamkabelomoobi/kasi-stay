import { builder } from "../../../app/builder";
import { PropertyRef } from "../../properties/graphql/property";
import { createPropertyBoost, deletePropertyBoost } from "../mutations";
import { getPropertyBoosts, type ListingBoostShape } from "../queries";
import { ListingBoostInput } from "../boost.types";

const ListingBoostRef = builder.objectRef<ListingBoostShape>("ListingBoost");
ListingBoostRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    propertyId: t.id({ resolve: (parent) => parent.propertyId }),
    agentId: t.id({ resolve: (parent) => parent.agentId }),
    type: t.string({ resolve: (parent) => parent.type }),
    startsAt: t.field({ type: "Date", resolve: (parent) => parent.startsAt }),
    expiresAt: t.field({ type: "Date", resolve: (parent) => parent.expiresAt }),
    property: t.field({
      type: PropertyRef,
      nullable: true,
      resolve: (parent) => parent.property ?? null,
    }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

builder.queryField("propertyBoosts", (t) =>
  t.field({
    type: [ListingBoostRef],
    description: "List boosts for a property",
    args: {
      propertyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => getPropertyBoosts(String(args.propertyId), ctx),
  }),
);

builder.mutationField("createPropertyBoost", (t) =>
  t.field({
    type: ListingBoostRef,
    authScopes: { isAuthenticated: true },
    description: "Create a listing boost for a property",
    args: {
      propertyId: t.arg.id({ required: true }),
      input: t.arg({ type: ListingBoostInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      createPropertyBoost(String(args.propertyId), args.input, ctx),
  }),
);

builder.mutationField("deletePropertyBoost", (t) =>
  t.field({
    type: "Boolean",
    authScopes: { isAuthenticated: true },
    description: "Delete a listing boost",
    args: {
      boostId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => deletePropertyBoost(String(args.boostId), ctx),
  }),
);
