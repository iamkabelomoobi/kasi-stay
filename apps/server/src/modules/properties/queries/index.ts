import {
  ListingType,
  PriceFrequency,
  Prisma,
  PropertyStatus,
  PropertyType,
} from "@kasistay/db";
import { Context } from "../../../app/context";
import { badInput, notFound } from "../../../utils/errors";

const parseEnum = <T extends Record<string, string>>(
  enumObject: T,
  value: string | null | undefined,
  field: string,
): T[keyof T] | undefined => {
  if (value == null) return undefined;
  const normalized = value.toUpperCase().trim();
  const parsed = enumObject[normalized as keyof T];

  if (!parsed) {
    badInput(`Invalid ${field}: ${value}`);
  }

  return parsed;
};

export type PropertyListFilter = {
  q?: string | null;
  listingType?: string | null;
  propertyType?: string | null;
  city?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  minArea?: number | null;
  maxArea?: number | null;
  status?: string | null;
  agencyId?: string | null;
  agentId?: string | null;
  isFeatured?: boolean | null;
  limit?: number | null;
  offset?: number | null;
};

export const propertyInclude = {
  agent: true,
  agency: {
    include: {
      owner: true,
      agents: true,
    },
  },
  location: true,
  media: true,
  documents: true,
  amenities: {
    include: {
      amenity: true,
    },
  },
  buyDetail: {
    include: {
      paymentPlan: {
        include: {
          installments: true,
        },
      },
    },
  },
  rentDetail: true,
  sellDetail: {
    include: {
      priceHistory: true,
    },
  },
  priceHistory: true,
} satisfies Prisma.PropertyInclude;

const canReadProperty = (
  ctx: Context,
  property: {
    status: PropertyStatus;
    agentId: string | null;
    agency?: { ownerId: string } | null;
  },
): boolean => {
  if (property.status === PropertyStatus.PUBLISHED || ctx.isAdmin) {
    return true;
  }

  const userId = ctx.session?.user.id;
  return userId != null &&
    (property.agentId === userId || property.agency?.ownerId === userId);
};

export const getPropertyBySlug = async (
  slug: string,
  ctx: Context,
) => {
  const existing = await ctx.prisma.property.findUnique({
    where: { slug },
    include: {
      agency: {
        select: {
          ownerId: true,
        },
      },
    },
  });

  if (!existing || !canReadProperty(ctx, existing)) {
    notFound("Property not found");
  }

  return ctx.prisma.property.findUnique({
    where: { slug },
    include: propertyInclude,
  });
};

export const buildPropertyWhere = (
  ctx: Context,
  filter?: PropertyListFilter,
): Prisma.PropertyWhereInput => {
  const requestedStatus = parseEnum(
    PropertyStatus,
    filter?.status ?? undefined,
    "property status",
  );
  const listingType = parseEnum(
    ListingType,
    filter?.listingType ?? undefined,
    "listing type",
  );
  const propertyType = parseEnum(
    PropertyType,
    filter?.propertyType ?? undefined,
    "property type",
  );

  return {
    ...(ctx.isAdmin
      ? {}
      : {
          status: requestedStatus ?? PropertyStatus.PUBLISHED,
        }),
    ...(ctx.isAdmin && requestedStatus
      ? {
          status: requestedStatus,
        }
      : {}),
    ...(listingType && { listingType }),
    ...(propertyType && { propertyType }),
    ...(filter?.agencyId && { agencyId: String(filter.agencyId) }),
    ...(filter?.agentId && { agentId: String(filter.agentId) }),
    ...(filter?.isFeatured != null && { isFeatured: filter.isFeatured }),
    ...(filter?.bedrooms != null && { bedrooms: { gte: filter.bedrooms } }),
    ...(filter?.bathrooms != null && { bathrooms: { gte: filter.bathrooms } }),
    ...((filter?.minPrice != null || filter?.maxPrice != null) && {
      price: {
        ...(filter?.minPrice != null && { gte: filter.minPrice }),
        ...(filter?.maxPrice != null && { lte: filter.maxPrice }),
      },
    }),
    ...((filter?.minArea != null || filter?.maxArea != null) && {
      builtUpArea: {
        ...(filter?.minArea != null && { gte: filter.minArea }),
        ...(filter?.maxArea != null && { lte: filter.maxArea }),
      },
    }),
    ...(filter?.city && {
      location: {
        is: {
          city: {
            equals: filter.city,
            mode: "insensitive",
          },
        },
      },
    }),
    ...(filter?.q && {
      OR: [
        {
          title: {
            contains: filter.q,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: filter.q,
            mode: "insensitive",
          },
        },
        {
          location: {
            is: {
              city: {
                contains: filter.q,
                mode: "insensitive",
              },
            },
          },
        },
        {
          location: {
            is: {
              neighborhood: {
                contains: filter.q,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    }),
  };
};

export const listProperties = async (
  ctx: Context,
  filter?: PropertyListFilter,
) => {
  return ctx.prisma.property.findMany({
    include: propertyInclude,
    where: buildPropertyWhere(ctx, filter),
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: filter?.limit ?? 20,
    skip: filter?.offset ?? 0,
  });
};

export const getSimilarProperties = async (
  propertyId: string,
  ctx: Context,
  limit = 5,
) => {
  const property = await ctx.prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      location: true,
    },
  });

  if (!property) {
    notFound("Property not found");
  }

  const sourceProperty = property!;

  return ctx.prisma.property.findMany({
    include: propertyInclude,
    where: {
      id: { not: sourceProperty.id },
      status: PropertyStatus.PUBLISHED,
      listingType: sourceProperty.listingType,
      propertyType: sourceProperty.propertyType,
      ...(sourceProperty.location?.city && {
        location: {
          is: {
            city: {
              equals: sourceProperty.location.city,
              mode: "insensitive",
            },
          },
        },
      }),
    },
    take: limit,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });
};

export const getPropertyAnalytics = async (
  propertyId: string,
  ctx: Context,
) => {
  const property = await ctx.prisma.property.findUnique({
    where: { id: propertyId },
    select: { views: true },
  });

  if (!property) {
    notFound("Property not found");
  }

  const existingProperty = property!;
  const [inquiries, viewings, reviews] = await Promise.all([
    ctx.prisma.inquiry.count({ where: { propertyId } }),
    ctx.prisma.viewing.count({ where: { propertyId } }),
    ctx.prisma.review.count({ where: { propertyId } }),
  ]);

  return {
    views: existingProperty.views,
    inquiries,
    viewings,
    reviews,
  };
};

export const getPropertyPriceHistory = async (
  propertyId: string,
  ctx: Context,
) => {
  return ctx.prisma.priceHistory.findMany({
    where: { propertyId },
    orderBy: { changedAt: "desc" },
  });
};

export const getPropertyDefaultPriceFrequency = (
  listingType: ListingType,
): PriceFrequency =>
  listingType === ListingType.RENT ? PriceFrequency.MONTHLY : PriceFrequency.ONCE;
