import { builder } from "../../../app/builder";
import { PropertyRef } from "../../properties/graphql/property";
import {
  createSavedSearch,
  deleteSavedSearch,
  saveProperty,
  toggleSavedSearchAlert,
  unsaveProperty,
} from "../mutations";
import {
  listSavedProperties,
  listSavedSearches,
  type SavedPropertyShape,
  type SavedSearchShape,
} from "../queries";
import { SavedSearchInput } from "../saved.types";

const SavedPropertyRef = builder.objectRef<SavedPropertyShape>("SavedProperty");
SavedPropertyRef.implement({
  fields: (t) => ({
    userId: t.id({ resolve: (parent) => parent.userId }),
    propertyId: t.id({ resolve: (parent) => parent.propertyId }),
    savedAt: t.field({ type: "Date", resolve: (parent) => parent.savedAt }),
    property: t.field({
      type: PropertyRef,
      nullable: true,
      resolve: (parent) => parent.property ?? null,
    }),
  }),
});

const SavedSearchRef = builder.objectRef<SavedSearchShape>("SavedSearch");
SavedSearchRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    userId: t.id({ resolve: (parent) => parent.userId }),
    filtersJson: t.string({
      resolve: (parent) => JSON.stringify(parent.filters),
    }),
    alertEnabled: t.boolean({ resolve: (parent) => parent.alertEnabled }),
    lastNotifiedAt: t.field({
      type: "Date",
      nullable: true,
      resolve: (parent) => parent.lastNotifiedAt ?? null,
    }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

builder.queryField("savedProperties", (t) =>
  t.field({
    type: [SavedPropertyRef],
    authScopes: { isAuthenticated: true },
    description: "List saved properties for the current user",
    resolve: (_, __, ctx) => listSavedProperties(ctx),
  }),
);

builder.queryField("savedSearches", (t) =>
  t.field({
    type: [SavedSearchRef],
    authScopes: { isAuthenticated: true },
    description: "List saved searches for the current user",
    resolve: (_, __, ctx) => listSavedSearches(ctx),
  }),
);

builder.mutationField("saveProperty", (t) =>
  t.field({
    type: SavedPropertyRef,
    authScopes: { isAuthenticated: true },
    description: "Save a property for the current user",
    args: {
      propertyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => saveProperty(String(args.propertyId), ctx),
  }),
);

builder.mutationField("unsaveProperty", (t) =>
  t.field({
    type: "Boolean",
    authScopes: { isAuthenticated: true },
    description: "Remove a property from the current user's saved list",
    args: {
      propertyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => unsaveProperty(String(args.propertyId), ctx),
  }),
);

builder.mutationField("createSavedSearch", (t) =>
  t.field({
    type: SavedSearchRef,
    authScopes: { isAuthenticated: true },
    description: "Create a saved search for the current user",
    args: {
      input: t.arg({ type: SavedSearchInput, required: true }),
    },
    resolve: (_, args, ctx) => createSavedSearch(args.input, ctx),
  }),
);

builder.mutationField("deleteSavedSearch", (t) =>
  t.field({
    type: "Boolean",
    authScopes: { isAuthenticated: true },
    description: "Delete a saved search",
    args: {
      savedSearchId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => deleteSavedSearch(String(args.savedSearchId), ctx),
  }),
);

builder.mutationField("toggleSavedSearchAlert", (t) =>
  t.field({
    type: SavedSearchRef,
    authScopes: { isAuthenticated: true },
    description: "Toggle alerts for a saved search",
    args: {
      savedSearchId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      toggleSavedSearchAlert(String(args.savedSearchId), ctx),
  }),
);
