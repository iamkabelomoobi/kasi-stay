import { builder } from "../../../app/builder";
import { PropertyRef } from "../../properties/graphql/property";
import { createReview, deleteReview } from "../mutations";
import { listPropertyReviews, type ReviewShape } from "../queries";
import { ReviewInput } from "../review.types";

const ReviewRef = builder.objectRef<ReviewShape>("Review");
ReviewRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    propertyId: t.id({ resolve: (parent) => parent.propertyId }),
    userId: t.id({ resolve: (parent) => parent.userId }),
    rating: t.int({ resolve: (parent) => parent.rating }),
    comment: t.string({
      nullable: true,
      resolve: (parent) => parent.comment ?? null,
    }),
    property: t.field({
      type: PropertyRef,
      nullable: true,
      resolve: (parent) => parent.property ?? null,
    }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

builder.queryField("propertyReviews", (t) =>
  t.field({
    type: [ReviewRef],
    description: "List reviews for a property",
    args: {
      propertyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => listPropertyReviews(String(args.propertyId), ctx),
  }),
);

builder.mutationField("createReview", (t) =>
  t.field({
    type: ReviewRef,
    authScopes: { isAuthenticated: true },
    description: "Create or update a property review",
    args: {
      propertyId: t.arg.id({ required: true }),
      input: t.arg({ type: ReviewInput, required: true }),
    },
    resolve: (_, args, ctx) => createReview(String(args.propertyId), args.input, ctx),
  }),
);

builder.mutationField("deleteReview", (t) =>
  t.field({
    type: ReviewRef,
    authScopes: { isAuthenticated: true },
    description: "Delete a review",
    args: {
      reviewId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => deleteReview(String(args.reviewId), ctx),
  }),
);
