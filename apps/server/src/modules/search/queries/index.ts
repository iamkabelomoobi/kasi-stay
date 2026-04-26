import { Prisma } from "@kasistay/db";
import { Context } from "../../../app/context";
import {
  cache,
  cacheKeys,
  config,
  createCacheKeyHash,
  deletePropertySearchDocument,
  searchPropertyIds,
  type PropertySearchDocument,
  upsertPropertySearchDocument,
} from "../../../infra";
import { badInput } from "../../../utils/errors";
import { calculateGeoDistanceKm } from "../../../utils/geo-distance";
import {
  buildPropertyWhere,
  propertyInclude,
  type PropertyListFilter,
} from "../../properties/queries";

type SearchSort =
  | "featured"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "distance";

type PropertySearchFilter = PropertyListFilter & {
  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number | null;
  sort?: string | null;
};

type SearchableProperty = Prisma.PropertyGetPayload<{
  include: typeof propertyInclude;
}>;

const parseSort = (value: string | null | undefined): SearchSort => {
  if (!value) return "featured";

  const normalized = value.toLowerCase().trim();
  switch (normalized) {
    case "featured":
    case "newest":
    case "price_asc":
    case "price_desc":
    case "distance":
      return normalized;
    default:
      badInput(`Invalid search sort: ${value}`);
  }

  return "featured";
};

const getPrismaOrderBy = (
  sort: SearchSort,
): Prisma.PropertyOrderByWithRelationInput[] => {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" }];
    case "price_asc":
      return [{ price: "asc" }, { createdAt: "desc" }];
    case "price_desc":
      return [{ price: "desc" }, { createdAt: "desc" }];
    case "featured":
    case "distance":
      return [{ isFeatured: "desc" }, { createdAt: "desc" }];
  }
};

const assertGeoFilterValidity = (
  filter: PropertySearchFilter | undefined,
  sort: SearchSort,
): void => {
  const hasGeoCoordinates =
    filter?.latitude != null && filter.longitude != null;
  const hasGeoRadius = filter?.radiusKm != null;

  if (sort === "distance" && !hasGeoCoordinates) {
    badInput("Distance sorting requires latitude and longitude");
  }

  if (hasGeoRadius && !hasGeoCoordinates) {
    badInput("Radius filtering requires latitude and longitude");
  }
};

const searchPropertiesFromDatabase = async (
  ctx: Context,
  filter: PropertySearchFilter | undefined,
  sort: SearchSort,
): Promise<SearchableProperty[]> => {
  const hasGeoCoordinates =
    filter?.latitude != null && filter.longitude != null;
  const limit = filter?.limit ?? 20;
  const offset = filter?.offset ?? 0;
  const baseFilter: PropertyListFilter = {
    q: filter?.q,
    listingType: filter?.listingType,
    propertyType: filter?.propertyType,
    city: filter?.city,
    minPrice: filter?.minPrice,
    maxPrice: filter?.maxPrice,
    bedrooms: filter?.bedrooms,
    bathrooms: filter?.bathrooms,
    minArea: filter?.minArea,
    maxArea: filter?.maxArea,
    status: filter?.status,
    agencyId: filter?.agencyId,
    agentId: filter?.agentId,
    isFeatured: filter?.isFeatured,
  };

  const useInMemoryGeoProcessing = hasGeoCoordinates || sort === "distance";
  const properties = await ctx.prisma.property.findMany({
    include: propertyInclude,
    where: buildPropertyWhere(ctx, baseFilter),
    orderBy: getPrismaOrderBy(sort),
    ...(useInMemoryGeoProcessing
      ? {}
      : {
          take: limit,
          skip: offset,
        }),
  });

  if (!useInMemoryGeoProcessing) {
    return properties;
  }

  const propertiesWithDistance = properties
    .map((property) => {
      const latitude = property.location?.latitude;
      const longitude = property.location?.longitude;
      const distanceKm =
        latitude != null &&
        longitude != null &&
        filter?.latitude != null &&
        filter.longitude != null
          ? calculateGeoDistanceKm(
              filter.latitude,
              filter.longitude,
              latitude,
              longitude,
            )
          : null;

      return { property, distanceKm };
    })
    .filter(({ distanceKm }) =>
      filter?.radiusKm != null
        ? distanceKm != null && distanceKm <= filter.radiusKm
        : true,
    );

  if (sort === "distance") {
    propertiesWithDistance.sort((left, right) => {
      if (left.distanceKm == null) return 1;
      if (right.distanceKm == null) return -1;
      return left.distanceKm - right.distanceKm;
    });
  }

  return propertiesWithDistance
    .slice(offset, offset + limit)
    .map(({ property }) => property);
};

const buildSearchCachePayload = (
  ctx: Context,
  filter: PropertySearchFilter | undefined,
) => ({
  scope: ctx.isAdmin ? "admin" : "public",
  filter: filter ?? null,
});

const hydrateOrderedProperties = async (
  ctx: Context,
  propertyIds: string[],
): Promise<SearchableProperty[]> => {
  if (propertyIds.length === 0) {
    return [];
  }

  const properties = await ctx.prisma.property.findMany({
    where: {
      id: {
        in: propertyIds,
      },
    },
    include: propertyInclude,
  });

  const propertyMap = new Map(properties.map((property) => [property.id, property]));

  return propertyIds
    .map((propertyId) => propertyMap.get(propertyId) ?? null)
    .filter((property): property is SearchableProperty => Boolean(property));
};

export const buildPropertySearchDocument = (
  property: SearchableProperty,
): PropertySearchDocument => ({
  id: property.id,
  slug: property.slug,
  title: property.title,
  description: property.description ?? null,
  status: property.status,
  listingType: property.listingType,
  propertyType: property.propertyType,
  price: property.price != null ? Number(property.price) : null,
  currency: property.currency,
  bedrooms: property.bedrooms ?? null,
  bathrooms: property.bathrooms ?? null,
  builtUpArea: property.builtUpArea ?? null,
  isFeatured: property.isFeatured,
  createdAt: property.createdAt.toISOString(),
  city: property.location?.city ?? null,
  neighborhood: property.location?.neighborhood ?? null,
  amenityIds: property.amenities.map((amenity) => amenity.amenityId),
  location:
    property.location?.latitude != null && property.location.longitude != null
      ? {
          lat: property.location.latitude,
          lon: property.location.longitude,
        }
      : null,
});

export const syncPropertySearchDocument = async (
  property: SearchableProperty,
): Promise<void> => {
  await upsertPropertySearchDocument(buildPropertySearchDocument(property));
};

export const removePropertyFromSearchIndex = async (
  propertyId: string,
): Promise<void> => {
  await deletePropertySearchDocument(propertyId);
};

export const searchProperties = async (
  ctx: Context,
  filter?: PropertySearchFilter,
) => {
  const sort = parseSort(filter?.sort);
  assertGeoFilterValidity(filter, sort);

  const cacheKey = cacheKeys.propertySearch(
    createCacheKeyHash(buildSearchCachePayload(ctx, filter)),
  );

  const propertyIds = await cache.remember<string[]>(
    cacheKey,
    config.redis.propertySearchCacheTtlSeconds,
    async () => {
      const elasticIds = await searchPropertyIds({
        q: filter?.q,
        listingType: filter?.listingType,
        propertyType: filter?.propertyType,
        city: filter?.city,
        minPrice: filter?.minPrice,
        maxPrice: filter?.maxPrice,
        bedrooms: filter?.bedrooms,
        bathrooms: filter?.bathrooms,
        minArea: filter?.minArea,
        maxArea: filter?.maxArea,
        isFeatured: filter?.isFeatured,
        latitude: filter?.latitude,
        longitude: filter?.longitude,
        radiusKm: filter?.radiusKm,
        sort,
        limit: filter?.limit ?? 20,
        offset: filter?.offset ?? 0,
      });

      if (elasticIds) {
        return elasticIds;
      }

      const fallbackProperties = await searchPropertiesFromDatabase(ctx, filter, sort);
      return fallbackProperties.map((property) => property.id);
    },
  );

  return hydrateOrderedProperties(ctx, propertyIds);
};
