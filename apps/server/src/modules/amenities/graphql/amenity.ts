import { builder } from "../../../app/builder";
import { AmenityRef } from "../../properties/graphql/property";
import { createAmenity, deleteAmenity, updateAmenity } from "../mutations";
import { listAmenities } from "../queries";
import {
  AmenityFilterInput,
  AmenityInput,
  AmenityUpdateInput,
} from "../amenity.types";

builder.queryField("amenities", (t) =>
  t.field({
    type: [AmenityRef],
    description: "List amenities, optionally filtered by category",
    args: {
      filter: t.arg({ type: AmenityFilterInput, required: false }),
    },
    resolve: (_, args, ctx) => listAmenities(ctx, args.filter ?? undefined),
  }),
);

builder.mutationField("createAmenity", (t) =>
  t.field({
    type: AmenityRef,
    authScopes: { isAdmin: true },
    description: "Create an amenity",
    args: {
      input: t.arg({ type: AmenityInput, required: true }),
    },
    resolve: (_, args, ctx) => createAmenity(args.input, ctx),
  }),
);

builder.mutationField("updateAmenity", (t) =>
  t.field({
    type: AmenityRef,
    authScopes: { isAdmin: true },
    description: "Update an amenity",
    args: {
      amenityId: t.arg.id({ required: true }),
      input: t.arg({ type: AmenityUpdateInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      updateAmenity(String(args.amenityId), args.input, ctx),
  }),
);

builder.mutationField("deleteAmenity", (t) =>
  t.field({
    type: AmenityRef,
    authScopes: { isAdmin: true },
    description: "Delete an amenity",
    args: {
      amenityId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => deleteAmenity(String(args.amenityId), ctx),
  }),
);
