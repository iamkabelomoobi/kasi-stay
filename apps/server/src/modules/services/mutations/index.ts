import {
  ConversationContextType,
  Prisma,
  ServiceCategory,
  ServiceListingStatus,
  ServiceProviderStatus,
  ServiceRequestStatus,
} from "@kasistay/db";
import { Context } from "../../../app/context";
import { badInput, notFound, unauthorized } from "../../../utils/errors";
import { generateUniqueSlug } from "../../../utils/generate-unique-slug";
import { notifyUsers } from "../../../utils/notify-users";
import { parseEnum } from "../../../utils/parse-enum";
import { createConversationRecord } from "../../messaging/mutations";
import {
  serviceListingInclude,
  serviceProviderInclude,
  serviceRequestInclude,
  type ServiceListingShape,
  type ServiceProviderShape,
  type ServiceRequestShape,
} from "../queries";

const parseImageUrls = (
  value: string | null | undefined,
): Prisma.JsonArray | typeof Prisma.JsonNull => {
  if (value == null || value.trim() === "") {
    return Prisma.JsonNull;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
      badInput("imageUrlsJson must be a JSON array of strings");
    }
    return parsed as Prisma.JsonArray;
  } catch {
    badInput("imageUrlsJson must be valid JSON");
  }

  return Prisma.JsonNull;
};

const assertCanManageServiceProvider = async (
  providerId: string,
  ctx: Context,
) => {
  const provider = await ctx.prisma.serviceProvider.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    notFound("Service provider not found");
  }
  const current = provider!;

  if (!ctx.isAdmin && current.userId !== ctx.assertAuth().id) {
    unauthorized();
  }

  return current;
};

const assertCanManageServiceListing = async (
  listingId: string,
  ctx: Context,
) => {
  const listing = await ctx.prisma.serviceListing.findUnique({
    where: { id: listingId },
    include: {
      provider: true,
    },
  });

  if (!listing) {
    notFound("Service listing not found");
  }
  const current = listing!;

  if (!ctx.isAdmin && current.provider.userId !== ctx.assertAuth().id) {
    unauthorized();
  }

  return current;
};

const resolveProviderSlug = async (
  input: { slug?: string | null; businessName: string },
  ctx: Context,
  providerId?: string,
) =>
  generateUniqueSlug(input.slug?.trim() || input.businessName, async (slug) => {
    const existing = await ctx.prisma.serviceProvider.findUnique({
      where: { slug },
    });
    return Boolean(existing && existing.id !== providerId);
  });

const resolveListingSlug = async (
  input: { slug?: string | null; title: string },
  ctx: Context,
  listingId?: string,
) =>
  generateUniqueSlug(input.slug?.trim() || input.title, async (slug) => {
    const existing = await ctx.prisma.serviceListing.findUnique({
      where: { slug },
    });
    return Boolean(existing && existing.id !== listingId);
  });

const getTargetProvider = async (
  ctx: Context,
  providerId?: string | null,
) => {
  const user = ctx.assertAuth();

  if (providerId) {
    return assertCanManageServiceProvider(String(providerId), ctx);
  }

  const provider = await ctx.prisma.serviceProvider.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!provider) {
    notFound("Create a service provider profile first");
  }

  return provider!;
};

export const createServiceProvider = async (
  input: {
    businessName: string;
    slug?: string | null;
    description?: string | null;
    email?: string | null;
    phone?: string | null;
    city: string;
    serviceArea?: string | null;
    logoUrl?: string | null;
    status?: string | null;
  },
  ctx: Context,
) : Promise<ServiceProviderShape> => {
  const user = ctx.assertAuth();
  const existing = await ctx.prisma.serviceProvider.findUnique({
    where: { userId: user.id },
  });

  if (existing) {
    badInput("You already have a service provider profile");
  }

  const status =
    parseEnum(
      ServiceProviderStatus,
      input.status ?? undefined,
      "service provider status",
    ) ?? ServiceProviderStatus.ACTIVE;

  return ctx.prisma.serviceProvider.create({
    data: {
      userId: user.id,
      businessName: input.businessName,
      slug: await resolveProviderSlug(input, ctx),
      description: input.description ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      city: input.city,
      serviceArea: input.serviceArea ?? null,
      logoUrl: input.logoUrl ?? null,
      status,
    },
    include: serviceProviderInclude,
  });
};

export const updateServiceProvider = async (
  providerId: string,
  input: {
    businessName?: string | null;
    slug?: string | null;
    description?: string | null;
    email?: string | null;
    phone?: string | null;
    city?: string | null;
    serviceArea?: string | null;
    logoUrl?: string | null;
    status?: string | null;
  },
  ctx: Context,
) : Promise<ServiceProviderShape> => {
  const current = await assertCanManageServiceProvider(providerId, ctx);
  const status = parseEnum(
    ServiceProviderStatus,
    input.status ?? undefined,
    "service provider status",
  );

  return ctx.prisma.serviceProvider.update({
    where: { id: providerId },
    data: {
      ...(input.businessName != null && { businessName: input.businessName }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.city != null && { city: input.city }),
      ...(input.serviceArea !== undefined && { serviceArea: input.serviceArea }),
      ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
      ...(status && { status }),
      ...((input.slug != null || input.businessName != null) && {
        slug: await resolveProviderSlug(
          {
            slug: input.slug ?? current.slug,
            businessName: input.businessName ?? current.businessName,
          },
          ctx,
          providerId,
        ),
      }),
    },
    include: serviceProviderInclude,
  });
};

export const createServiceListing = async (
  input: {
    providerId?: string | null;
    title: string;
    slug?: string | null;
    description?: string | null;
    category: string;
    status?: string | null;
    startingPrice?: number | null;
    currency?: string | null;
    city: string;
    serviceArea?: string | null;
    imageUrlsJson?: string | null;
  },
  ctx: Context,
) : Promise<ServiceListingShape> => {
  const provider = await getTargetProvider(ctx, input.providerId ?? undefined);
  const currentProvider = provider!;
  const category = parseEnum(ServiceCategory, input.category, "service category");
  const status =
    parseEnum(
      ServiceListingStatus,
      input.status ?? undefined,
      "service listing status",
    ) ?? ServiceListingStatus.PUBLISHED;

  return ctx.prisma.serviceListing.create({
    data: {
      providerId: currentProvider.id,
      title: input.title,
      slug: await resolveListingSlug(input, ctx),
      description: input.description ?? null,
      category: category!,
      status,
      startingPrice: input.startingPrice ?? null,
      currency: input.currency ?? "ZAR",
      city: input.city,
      serviceArea: input.serviceArea ?? null,
      imageUrls: parseImageUrls(input.imageUrlsJson),
      publishedAt: status === ServiceListingStatus.PUBLISHED ? new Date() : null,
    },
    include: serviceListingInclude,
  });
};

export const updateServiceListing = async (
  listingId: string,
  input: {
    title?: string | null;
    slug?: string | null;
    description?: string | null;
    category?: string | null;
    status?: string | null;
    startingPrice?: number | null;
    currency?: string | null;
    city?: string | null;
    serviceArea?: string | null;
    imageUrlsJson?: string | null;
  },
  ctx: Context,
) : Promise<ServiceListingShape> => {
  const current = await assertCanManageServiceListing(listingId, ctx);
  const category = parseEnum(
    ServiceCategory,
    input.category ?? undefined,
    "service category",
  );
  const status = parseEnum(
    ServiceListingStatus,
    input.status ?? undefined,
    "service listing status",
  );

  return ctx.prisma.serviceListing.update({
    where: { id: listingId },
    data: {
      ...(input.title != null && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(category && { category }),
      ...(status && {
        status,
        publishedAt: status === ServiceListingStatus.PUBLISHED ? new Date() : null,
      }),
      ...(input.startingPrice !== undefined && {
        startingPrice: input.startingPrice,
      }),
      ...(input.currency != null && { currency: input.currency }),
      ...(input.city != null && { city: input.city }),
      ...(input.serviceArea !== undefined && { serviceArea: input.serviceArea }),
      ...(input.imageUrlsJson !== undefined && {
        imageUrls: parseImageUrls(input.imageUrlsJson),
      }),
      ...((input.slug != null || input.title != null) && {
        slug: await resolveListingSlug(
          {
            slug: input.slug ?? current.slug,
            title: input.title ?? current.title,
          },
          ctx,
          listingId,
        ),
      }),
    },
    include: serviceListingInclude,
  });
};

export const deleteServiceListing = async (
  listingId: string,
  ctx: Context,
) : Promise<ServiceListingShape> => {
  await assertCanManageServiceListing(listingId, ctx);
  return ctx.prisma.serviceListing.delete({
    where: { id: listingId },
    include: serviceListingInclude,
  });
};

export const requestService = async (
  listingId: string,
  input: {
    message?: string | null;
    preferredDate?: Date | null;
  },
  ctx: Context,
) : Promise<ServiceRequestShape> => {
  const user = ctx.assertAuth();
  const listing = await ctx.prisma.serviceListing.findUnique({
    where: { id: listingId },
    include: {
      provider: true,
    },
  });

  if (!listing || listing.status !== ServiceListingStatus.PUBLISHED) {
    notFound("Service listing not found");
  }
  const current = listing!;

  const request = await ctx.prisma.serviceRequest.create({
    data: {
      listingId,
      requesterId: user.id,
      message: input.message ?? null,
      preferredDate: input.preferredDate ?? null,
    },
    include: serviceRequestInclude,
  });

  const conversation = await createConversationRecord(
    {
      createdById: user.id,
      participantUserIds: [current.provider.userId],
      subject: `Service request: ${current.title}`,
      contextType: ConversationContextType.SERVICE,
      contextId: request.id,
      initialMessage:
        input.message?.trim() || `New service request for ${current.title}`,
    },
    ctx,
  );

  await notifyUsers(ctx, {
    userIds: [current.provider.userId],
    type: "SERVICE_REQUEST_CREATED",
    title: "New service request",
    body: `${user.name} requested ${current.title}.`,
    metadata: {
      serviceRequestId: request.id,
      serviceListingId: current.id,
      conversationId: conversation.id,
    },
  });

  return request;
};

export const updateServiceRequestStatus = async (
  requestId: string,
  input: {
    status: string;
  },
  ctx: Context,
) : Promise<ServiceRequestShape> => {
  const user = ctx.assertAuth();
  const request = await ctx.prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: {
      listing: {
        include: {
          provider: true,
        },
      },
    },
  });

  if (!request) {
    notFound("Service request not found");
  }
  const current = request!;

  if (!ctx.isAdmin && current.listing.provider.userId !== user.id) {
    unauthorized();
  }

  const status = parseEnum(
    ServiceRequestStatus,
    input.status,
    "service request status",
  );

  const updated = await ctx.prisma.serviceRequest.update({
    where: { id: requestId },
    data: {
      status: status!,
    },
    include: serviceRequestInclude,
  });

  await notifyUsers(ctx, {
    userIds: [updated.requesterId],
    type: "SERVICE_REQUEST_UPDATED",
    title: "Service request updated",
    body: `Your service request for ${updated.listing.title} is now ${status}.`,
    metadata: {
      serviceRequestId: updated.id,
      status,
    },
  });

  return updated;
};
