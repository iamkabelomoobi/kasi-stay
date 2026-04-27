import { builder } from "../../../app/builder";
import {
  createServiceListing,
  createServiceProvider,
  deleteServiceListing,
  requestService,
  updateServiceListing,
  updateServiceProvider,
  updateServiceRequestStatus,
} from "../mutations";
import {
  getServiceListing,
  getServiceProvider,
  listMyServiceRequests,
  listServiceListings,
  listServiceProviders,
  type ServiceListingShape,
  type ServiceProviderShape,
  type ServiceRequestShape,
} from "../queries";
import {
  ServiceListingFilterInput,
  ServiceListingInput,
  ServiceListingUpdateInput,
  ServiceProviderFilterInput,
  ServiceProviderInput,
  ServiceProviderUpdateInput,
  ServiceRequestInput,
  ServiceRequestStatusInput,
} from "../service.types";

const ServiceProviderRef =
  builder.objectRef<ServiceProviderShape>("ServiceProvider");
ServiceProviderRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    userId: t.id({ resolve: (parent) => parent.userId }),
    businessName: t.string({ resolve: (parent) => parent.businessName }),
    slug: t.string({ resolve: (parent) => parent.slug }),
    description: t.string({
      nullable: true,
      resolve: (parent) => parent.description ?? null,
    }),
    email: t.string({
      nullable: true,
      resolve: (parent) => parent.email ?? null,
    }),
    phone: t.string({
      nullable: true,
      resolve: (parent) => parent.phone ?? null,
    }),
    city: t.string({ resolve: (parent) => parent.city }),
    serviceArea: t.string({
      nullable: true,
      resolve: (parent) => parent.serviceArea ?? null,
    }),
    logoUrl: t.string({
      nullable: true,
      resolve: (parent) => parent.logoUrl ?? null,
    }),
    status: t.string({ resolve: (parent) => parent.status }),
    isVerified: t.boolean({ resolve: (parent) => parent.isVerified }),
    ownerName: t.string({ resolve: (parent) => parent.user.name }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

const ServiceListingRef =
  builder.objectRef<ServiceListingShape>("ServiceListing");
ServiceListingRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    providerId: t.id({ resolve: (parent) => parent.providerId }),
    title: t.string({ resolve: (parent) => parent.title }),
    slug: t.string({ resolve: (parent) => parent.slug }),
    description: t.string({
      nullable: true,
      resolve: (parent) => parent.description ?? null,
    }),
    category: t.string({ resolve: (parent) => parent.category }),
    status: t.string({ resolve: (parent) => parent.status }),
    startingPrice: t.float({
      nullable: true,
      resolve: (parent) =>
        parent.startingPrice != null ? Number(parent.startingPrice) : null,
    }),
    currency: t.string({ resolve: (parent) => parent.currency }),
    city: t.string({ resolve: (parent) => parent.city }),
    serviceArea: t.string({
      nullable: true,
      resolve: (parent) => parent.serviceArea ?? null,
    }),
    imageUrlsJson: t.string({
      nullable: true,
      resolve: (parent) =>
        parent.imageUrls != null ? JSON.stringify(parent.imageUrls) : null,
    }),
    publishedAt: t.field({
      type: "Date",
      nullable: true,
      resolve: (parent) => parent.publishedAt ?? null,
    }),
    provider: t.field({
      type: ServiceProviderRef,
      resolve: (parent) => parent.provider,
    }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

const ServiceRequestRef =
  builder.objectRef<ServiceRequestShape>("ServiceRequest");
ServiceRequestRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    listingId: t.id({ resolve: (parent) => parent.listingId }),
    requesterId: t.id({ resolve: (parent) => parent.requesterId }),
    message: t.string({
      nullable: true,
      resolve: (parent) => parent.message ?? null,
    }),
    preferredDate: t.field({
      type: "Date",
      nullable: true,
      resolve: (parent) => parent.preferredDate ?? null,
    }),
    status: t.string({ resolve: (parent) => parent.status }),
    listing: t.field({
      type: ServiceListingRef,
      resolve: (parent) => parent.listing,
    }),
    requesterName: t.string({ resolve: (parent) => parent.requester.name }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

builder.queryField("serviceProviders", (t) =>
  t.field({
    type: [ServiceProviderRef],
    args: {
      filter: t.arg({ type: ServiceProviderFilterInput, required: false }),
    },
    resolve: (_, args, ctx) => listServiceProviders(ctx, args.filter ?? undefined),
  }),
);

builder.queryField("serviceProvider", (t) =>
  t.field({
    type: ServiceProviderRef,
    nullable: true,
    args: {
      providerId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => getServiceProvider(String(args.providerId), ctx),
  }),
);

builder.queryField("serviceListings", (t) =>
  t.field({
    type: [ServiceListingRef],
    args: {
      filter: t.arg({ type: ServiceListingFilterInput, required: false }),
    },
    resolve: (_, args, ctx) => listServiceListings(ctx, args.filter ?? undefined),
  }),
);

builder.queryField("serviceListing", (t) =>
  t.field({
    type: ServiceListingRef,
    nullable: true,
    args: {
      listingId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => getServiceListing(String(args.listingId), ctx),
  }),
);

builder.queryField("myServiceRequests", (t) =>
  t.field({
    type: [ServiceRequestRef],
    authScopes: { isAuthenticated: true },
    resolve: (_, __, ctx) => listMyServiceRequests(ctx),
  }),
);

builder.mutationField("createServiceProvider", (t) =>
  t.field({
    type: ServiceProviderRef,
    authScopes: { isAuthenticated: true },
    args: {
      input: t.arg({ type: ServiceProviderInput, required: true }),
    },
    resolve: (_, args, ctx) => createServiceProvider(args.input, ctx),
  }),
);

builder.mutationField("updateServiceProvider", (t) =>
  t.field({
    type: ServiceProviderRef,
    authScopes: { isAuthenticated: true },
    args: {
      providerId: t.arg.id({ required: true }),
      input: t.arg({ type: ServiceProviderUpdateInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      updateServiceProvider(String(args.providerId), args.input, ctx),
  }),
);

builder.mutationField("createServiceListing", (t) =>
  t.field({
    type: ServiceListingRef,
    authScopes: { isAuthenticated: true },
    args: {
      input: t.arg({ type: ServiceListingInput, required: true }),
    },
    resolve: (_, args, ctx) => createServiceListing(args.input, ctx),
  }),
);

builder.mutationField("updateServiceListing", (t) =>
  t.field({
    type: ServiceListingRef,
    authScopes: { isAuthenticated: true },
    args: {
      listingId: t.arg.id({ required: true }),
      input: t.arg({ type: ServiceListingUpdateInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      updateServiceListing(String(args.listingId), args.input, ctx),
  }),
);

builder.mutationField("deleteServiceListing", (t) =>
  t.field({
    type: ServiceListingRef,
    authScopes: { isAuthenticated: true },
    args: {
      listingId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      deleteServiceListing(String(args.listingId), ctx),
  }),
);

builder.mutationField("requestService", (t) =>
  t.field({
    type: ServiceRequestRef,
    authScopes: { isAuthenticated: true },
    args: {
      listingId: t.arg.id({ required: true }),
      input: t.arg({ type: ServiceRequestInput, required: true }),
    },
    resolve: (_, args, ctx) => requestService(String(args.listingId), args.input, ctx),
  }),
);

builder.mutationField("updateServiceRequestStatus", (t) =>
  t.field({
    type: ServiceRequestRef,
    authScopes: { isAuthenticated: true },
    args: {
      requestId: t.arg.id({ required: true }),
      input: t.arg({ type: ServiceRequestStatusInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      updateServiceRequestStatus(String(args.requestId), args.input, ctx),
  }),
);
