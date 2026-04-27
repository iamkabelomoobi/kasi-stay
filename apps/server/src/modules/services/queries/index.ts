import {
  Prisma,
  ServiceCategory,
  ServiceListingStatus,
  ServiceProviderStatus,
} from "@kasistay/db";
import { Context } from "../../../app/context";
import { notFound } from "../../../utils/errors";
import { parseEnum } from "../../../utils/parse-enum";

export type ServiceProviderFilter = {
  q?: string | null;
  city?: string | null;
  status?: string | null;
  limit?: number | null;
  offset?: number | null;
};

export type ServiceListingFilter = {
  category?: string | null;
  city?: string | null;
  providerId?: string | null;
  status?: string | null;
  limit?: number | null;
  offset?: number | null;
};

export const serviceProviderInclude = {
  user: true,
} satisfies Prisma.ServiceProviderInclude;

export const serviceListingInclude = {
  provider: {
    include: serviceProviderInclude,
  },
} satisfies Prisma.ServiceListingInclude;

export const serviceRequestInclude = {
  listing: {
    include: serviceListingInclude,
  },
  requester: true,
} satisfies Prisma.ServiceRequestInclude;

export type ServiceProviderShape = Prisma.ServiceProviderGetPayload<{
  include: typeof serviceProviderInclude;
}>;

export type ServiceListingShape = Prisma.ServiceListingGetPayload<{
  include: typeof serviceListingInclude;
}>;

export type ServiceRequestShape = Prisma.ServiceRequestGetPayload<{
  include: typeof serviceRequestInclude;
}>;

const canReadServiceProvider = (
  provider: { userId: string; status: ServiceProviderStatus },
  ctx: Context,
): boolean =>
  ctx.isAdmin ||
  provider.status === ServiceProviderStatus.ACTIVE ||
  ctx.session?.user.id === provider.userId;

const canReadServiceListing = (
  listing: { status: ServiceListingStatus; provider: { userId: string } },
  ctx: Context,
): boolean =>
  ctx.isAdmin ||
  listing.status === ServiceListingStatus.PUBLISHED ||
  ctx.session?.user.id === listing.provider.userId;

const buildProviderWhere = (
  ctx: Context,
  filter?: ServiceProviderFilter,
): Prisma.ServiceProviderWhereInput => {
  const status = parseEnum(
    ServiceProviderStatus,
    filter?.status ?? undefined,
    "service provider status",
  );

  return {
    ...(ctx.isAdmin
      ? status
        ? { status }
        : {}
      : { status: ServiceProviderStatus.ACTIVE }),
    ...(filter?.city && {
      city: {
        contains: filter.city,
        mode: "insensitive",
      },
    }),
    ...(filter?.q && {
      OR: [
        { businessName: { contains: filter.q, mode: "insensitive" } },
        { description: { contains: filter.q, mode: "insensitive" } },
        { serviceArea: { contains: filter.q, mode: "insensitive" } },
      ],
    }),
  };
};

const buildListingWhere = (
  ctx: Context,
  filter?: ServiceListingFilter,
): Prisma.ServiceListingWhereInput => {
  const category = parseEnum(
    ServiceCategory,
    filter?.category ?? undefined,
    "service category",
  );
  const status = parseEnum(
    ServiceListingStatus,
    filter?.status ?? undefined,
    "service listing status",
  );

  return {
    ...(ctx.isAdmin
      ? status
        ? { status }
        : {}
      : { status: ServiceListingStatus.PUBLISHED }),
    ...(category && { category }),
    ...(filter?.providerId && { providerId: String(filter.providerId) }),
    ...(filter?.city && {
      city: {
        contains: filter.city,
        mode: "insensitive",
      },
    }),
  };
};

export const listServiceProviders = async (
  ctx: Context,
  filter?: ServiceProviderFilter,
) =>
  ctx.prisma.serviceProvider.findMany({
    where: buildProviderWhere(ctx, filter),
    include: serviceProviderInclude,
    orderBy: [{ businessName: "asc" }],
    take: filter?.limit ?? 20,
    skip: filter?.offset ?? 0,
  });

export const getServiceProvider = async (providerId: string, ctx: Context) => {
  const provider = await ctx.prisma.serviceProvider.findUnique({
    where: { id: providerId },
    include: serviceProviderInclude,
  });

  if (!provider || !canReadServiceProvider(provider, ctx)) {
    notFound("Service provider not found");
  }

  return provider;
};

export const listServiceListings = async (
  ctx: Context,
  filter?: ServiceListingFilter,
) =>
  ctx.prisma.serviceListing.findMany({
    where: buildListingWhere(ctx, filter),
    include: serviceListingInclude,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: filter?.limit ?? 20,
    skip: filter?.offset ?? 0,
  });

export const getServiceListing = async (listingId: string, ctx: Context) => {
  const listing = await ctx.prisma.serviceListing.findUnique({
    where: { id: listingId },
    include: serviceListingInclude,
  });

  if (!listing || !canReadServiceListing(listing, ctx)) {
    notFound("Service listing not found");
  }

  return listing;
};

export const listMyServiceRequests = async (ctx: Context) => {
  const user = ctx.assertAuth();
  return ctx.prisma.serviceRequest.findMany({
    where: {
      requesterId: user.id,
    },
    include: serviceRequestInclude,
    orderBy: [{ createdAt: "desc" }],
  });
};
