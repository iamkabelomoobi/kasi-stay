import { builder } from "../../../app/builder";
import { PropertyMediaRef, PropertyRef } from "../../properties/graphql/property";
import {
  addPropertyMedia,
  deletePropertyMedia,
  reorderPropertyMedia,
  setPrimaryPropertyMedia,
} from "../mutations";
import { getPropertyMedia } from "../queries";
import {
  AddPropertyMediaInput,
  PropertyMediaReorderInput,
} from "../media.types";

builder.queryField("propertyMedia", (t) =>
  t.field({
    type: [PropertyMediaRef],
    description: "List media for a property",
    args: {
      propertyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => getPropertyMedia(String(args.propertyId), ctx),
  }),
);

builder.mutationField("addPropertyMedia", (t) =>
  t.field({
    type: PropertyRef,
    nullable: true,
    authScopes: { isAuthenticated: true },
    description: "Attach media metadata to a property",
    args: {
      propertyId: t.arg.id({ required: true }),
      input: t.arg({ type: AddPropertyMediaInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      addPropertyMedia(String(args.propertyId), args.input, ctx),
  }),
);

builder.mutationField("reorderPropertyMedia", (t) =>
  t.field({
    type: [PropertyMediaRef],
    authScopes: { isAuthenticated: true },
    description: "Reorder existing property media",
    args: {
      propertyId: t.arg.id({ required: true }),
      input: t.arg({ type: PropertyMediaReorderInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      reorderPropertyMedia(String(args.propertyId), args.input, ctx),
  }),
);

builder.mutationField("setPrimaryPropertyMedia", (t) =>
  t.field({
    type: PropertyMediaRef,
    authScopes: { isAuthenticated: true },
    description: "Mark one media item as the primary property media",
    args: {
      propertyId: t.arg.id({ required: true }),
      mediaId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      setPrimaryPropertyMedia(
        String(args.propertyId),
        String(args.mediaId),
        ctx,
      ),
  }),
);

builder.mutationField("deletePropertyMedia", (t) =>
  t.field({
    type: PropertyRef,
    nullable: true,
    authScopes: { isAuthenticated: true },
    description: "Delete a property media item",
    args: {
      propertyId: t.arg.id({ required: true }),
      mediaId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      deletePropertyMedia(String(args.propertyId), String(args.mediaId), ctx),
  }),
);
