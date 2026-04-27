import { builder } from "../../../app/builder";
import {
  calculateAffordability,
  calculateBond,
  createAttorneyProfile,
  deleteAttorneyProfile,
  updateAttorneyProfile,
} from "../mutations";
import { getAttorney, listAttorneys, type AttorneyProfileShape } from "../queries";
import {
  AffordabilityCalculatorInput,
  AttorneyFilterInput,
  AttorneyProfileInput,
  AttorneyProfileUpdateInput,
  BondCalculatorInput,
} from "../tool.types";

const BondCalculatorResultRef = builder.simpleObject("BondCalculatorResult", {
  fields: (t) => ({
    principal: t.float(),
    monthlyRepayment: t.float(),
    totalRepayment: t.float(),
    totalInterest: t.float(),
  }),
});

const AffordabilityCalculatorResultRef = builder.simpleObject(
  "AffordabilityCalculatorResult",
  {
    fields: (t) => ({
      disposableIncome: t.float(),
      maxAffordableRepayment: t.float(),
      maxLoanAmount: t.float(),
      estimatedPurchasePrice: t.float(),
    }),
  },
);

const AttorneyProfileRef =
  builder.objectRef<AttorneyProfileShape>("AttorneyProfile");
AttorneyProfileRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    slug: t.string({ resolve: (parent) => parent.slug }),
    name: t.string({ resolve: (parent) => parent.name }),
    firmName: t.string({
      nullable: true,
      resolve: (parent) => parent.firmName ?? null,
    }),
    description: t.string({
      nullable: true,
      resolve: (parent) => parent.description ?? null,
    }),
    city: t.string({ resolve: (parent) => parent.city }),
    email: t.string({
      nullable: true,
      resolve: (parent) => parent.email ?? null,
    }),
    phone: t.string({
      nullable: true,
      resolve: (parent) => parent.phone ?? null,
    }),
    websiteUrl: t.string({
      nullable: true,
      resolve: (parent) => parent.websiteUrl ?? null,
    }),
    imageUrl: t.string({
      nullable: true,
      resolve: (parent) => parent.imageUrl ?? null,
    }),
    status: t.string({ resolve: (parent) => parent.status }),
    publishedAt: t.field({
      type: "Date",
      nullable: true,
      resolve: (parent) => parent.publishedAt ?? null,
    }),
    createdById: t.id({
      nullable: true,
      resolve: (parent) => parent.createdById ?? null,
    }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

builder.queryField("attorneys", (t) =>
  t.field({
    type: [AttorneyProfileRef],
    args: {
      filter: t.arg({ type: AttorneyFilterInput, required: false }),
    },
    resolve: (_, args, ctx) => listAttorneys(ctx, args.filter ?? undefined),
  }),
);

builder.queryField("attorney", (t) =>
  t.field({
    type: AttorneyProfileRef,
    nullable: true,
    args: {
      attorneyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => getAttorney(String(args.attorneyId), ctx),
  }),
);

builder.mutationField("calculateBond", (t) =>
  t.field({
    type: BondCalculatorResultRef,
    args: {
      input: t.arg({ type: BondCalculatorInput, required: true }),
    },
    resolve: (_, args) => calculateBond(args.input),
  }),
);

builder.mutationField("calculateAffordability", (t) =>
  t.field({
    type: AffordabilityCalculatorResultRef,
    args: {
      input: t.arg({ type: AffordabilityCalculatorInput, required: true }),
    },
    resolve: (_, args) => calculateAffordability(args.input),
  }),
);

builder.mutationField("createAttorneyProfile", (t) =>
  t.field({
    type: AttorneyProfileRef,
    authScopes: { isAdmin: true },
    args: {
      input: t.arg({ type: AttorneyProfileInput, required: true }),
    },
    resolve: (_, args, ctx) => createAttorneyProfile(args.input, ctx),
  }),
);

builder.mutationField("updateAttorneyProfile", (t) =>
  t.field({
    type: AttorneyProfileRef,
    authScopes: { isAdmin: true },
    args: {
      attorneyId: t.arg.id({ required: true }),
      input: t.arg({ type: AttorneyProfileUpdateInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      updateAttorneyProfile(String(args.attorneyId), args.input, ctx),
  }),
);

builder.mutationField("deleteAttorneyProfile", (t) =>
  t.field({
    type: AttorneyProfileRef,
    authScopes: { isAdmin: true },
    args: {
      attorneyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      deleteAttorneyProfile(String(args.attorneyId), ctx),
  }),
);
