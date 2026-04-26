import { builder } from "../../../app/builder";
import { PropertyMediaRef, PropertyRef } from "../../properties/graphql/property";
import {
  addPropertyMedia,
  createPropertyMediaUploadTarget,
  deletePropertyMedia,
  reorderPropertyMedia,
  setPrimaryPropertyMedia,
} from "../mutations";
import { getPropertyMedia } from "../queries";
import {
  AddPropertyMediaInput,
  CreatePropertyMediaUploadTargetInput,
  PropertyMediaReorderInput,
} from "../media.types";

const PropertyMediaUploadTargetRef = builder.simpleObject(
  "PropertyMediaUploadTarget",
  {
    fields: (t) => ({
      key: t.string(),
      uploadUrl: t.string(),
      publicUrl: t.string(),
      expiresInSeconds: t.int(),
      contentType: t.string(),
    }),
  },
);

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

builder.mutationField("createPropertyMediaUploadTarget", (t) =>
  t.field({
    type: PropertyMediaUploadTargetRef,
    authScopes: { isAuthenticated: true },
    description:
      "Create a pre-signed upload target for property media stored in S3-compatible storage",
    args: {
      propertyId: t.arg.id({ required: true }),
      input: t.arg({ type: CreatePropertyMediaUploadTargetInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      createPropertyMediaUploadTarget(String(args.propertyId), args.input, ctx),
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
