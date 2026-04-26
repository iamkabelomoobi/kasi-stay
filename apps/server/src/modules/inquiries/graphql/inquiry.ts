import type { Inquiry, Property } from "@kasistay/db";
import { builder } from "../../../app/builder";
import { PropertyRef } from "../../properties/graphql/property";
import { createInquiry, updateInquiryStatus } from "../mutations";
import { getInquiry, listInquiries } from "../queries";
import {
  InquiryFilterInput,
  InquiryInput,
  InquiryStatusUpdateInput,
} from "../inquiry.types";

type InquiryShape = Inquiry & {
  property?: Property | null;
};

export const InquiryRef = builder.objectRef<InquiryShape>("Inquiry");
InquiryRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    propertyId: t.id({ resolve: (parent) => parent.propertyId }),
    userId: t.id({
      resolve: (parent) => parent.userId ?? null,
      nullable: true,
    }),
    name: t.string({ resolve: (parent) => parent.name }),
    email: t.string({ resolve: (parent) => parent.email }),
    phone: t.string({
      resolve: (parent) => parent.phone ?? null,
      nullable: true,
    }),
    message: t.string({
      resolve: (parent) => parent.message ?? null,
      nullable: true,
    }),
    source: t.string({ resolve: (parent) => parent.source }),
    status: t.string({ resolve: (parent) => parent.status }),
    property: t.field({
      type: PropertyRef,
      nullable: true,
      resolve: (parent) => parent.property ?? null,
    }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

builder.queryField("inquiry", (t) =>
  t.field({
    type: InquiryRef,
    nullable: true,
    authScopes: { isAuthenticated: true },
    description: "Fetch a single inquiry by ID",
    args: {
      inquiryId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => getInquiry(String(args.inquiryId), ctx),
  }),
);

builder.queryField("inquiries", (t) =>
  t.field({
    type: [InquiryRef],
    authScopes: { isAuthenticated: true },
    description: "List inquiries visible to the current user",
    args: {
      filter: t.arg({ type: InquiryFilterInput, required: false }),
    },
    resolve: (_, args, ctx) => listInquiries(ctx, args.filter ?? undefined),
  }),
);

builder.mutationField("createInquiry", (t) =>
  t.field({
    type: InquiryRef,
    description: "Create a property inquiry",
    args: {
      propertyId: t.arg.id({ required: true }),
      input: t.arg({ type: InquiryInput, required: true }),
    },
    resolve: (_, args, ctx) => createInquiry(String(args.propertyId), args.input, ctx),
  }),
);

builder.mutationField("updateInquiryStatus", (t) =>
  t.field({
    type: InquiryRef,
    authScopes: { isAuthenticated: true },
    description: "Update inquiry status",
    args: {
      inquiryId: t.arg.id({ required: true }),
      input: t.arg({ type: InquiryStatusUpdateInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      updateInquiryStatus(String(args.inquiryId), args.input, ctx),
  }),
);
