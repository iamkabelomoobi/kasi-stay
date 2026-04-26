import { Prisma } from "@kasistay/db";
import { Context } from "../../../app/context";
import { badInput } from "../../../utils/errors";
import { calculateGeoDistanceKm } from "../../../utils/geo-distance";
import {
  buildPropertyWhere,
  propertyInclude,
  type PropertyListFilter,
} from "../../properties/queries";

type SearchSort = "featured" | "newest" | "price_asc" | "price_desc" | "distance";

type PropertySearchFilter = PropertyListFilter & {
  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number | null;
  sort?: string | null;
};

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

export const searchProperties = async (
  ctx: Context,
  filter?: PropertySearchFilter,
) => {
  const sort = parseSort(filter?.sort);
  const hasGeoCoordinates =
    filter?.latitude != null && filter.longitude != null;
  const hasGeoRadius = filter?.radiusKm != null;

  if (sort === "distance" && !hasGeoCoordinates) {
    badInput("Distance sorting requires latitude and longitude");
  }

  if (hasGeoRadius && !hasGeoCoordinates) {
    badInput("Radius filtering requires latitude and longitude");
  }

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
        latitude != null && longitude != null && filter?.latitude != null &&
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
      filter?.radiusKm != null ? distanceKm != null && distanceKm <= filter.radiusKm : true
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
