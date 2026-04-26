import { logger } from "@kasistay/logger";
import { Client, type estypes } from "@elastic/elasticsearch";
import { config } from "../config";

export type PropertySearchDocument = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  status: string;
  listingType: string;
  propertyType: string;
  price?: number | null;
  currency: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  builtUpArea?: number | null;
  isFeatured: boolean;
  createdAt: string;
  city?: string | null;
  neighborhood?: string | null;
  amenityIds: string[];
  location?: {
    lat: number;
    lon: number;
  } | null;
};

type PropertySearchFilters = {
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
  isFeatured?: boolean | null;
  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number | null;
  sort?: "featured" | "newest" | "price_asc" | "price_desc" | "distance";
  limit?: number;
  offset?: number;
};

let elasticClient: Client | null = null;
let searchDisabled = false;

const propertySearchIndexName = `${config.search.indexPrefix}${config.search.propertyIndex}`;

const buildSearchClient = (): Client | null => {
  if (searchDisabled || !config.search.enabled || !config.search.node) {
    return null;
  }

  if (elasticClient) {
    return elasticClient;
  }

  elasticClient = new Client({
    node: config.search.node,
    auth: config.search.username
      ? {
          username: config.search.username,
          password: config.search.password,
        }
      : undefined,
    requestTimeout: config.search.requestTimeoutMs,
  });

  return elasticClient;
};

const ensureSearchEnabled = (): Client | null => {
  const client = buildSearchClient();
  if (!client) {
    return null;
  }

  return client;
};

export const ensurePropertySearchIndex = async (): Promise<void> => {
  const client = ensureSearchEnabled();
  if (!client) {
    return;
  }

  try {
    const exists = await client.indices.exists({ index: propertySearchIndexName });
    if (exists) {
      return;
    }

    await client.indices.create({
      index: propertySearchIndexName,
      mappings: {
        properties: {
          id: { type: "keyword" },
          slug: { type: "keyword" },
          title: { type: "text" },
          description: { type: "text" },
          status: { type: "keyword" },
          listingType: { type: "keyword" },
          propertyType: { type: "keyword" },
          price: { type: "double" },
          currency: { type: "keyword" },
          bedrooms: { type: "integer" },
          bathrooms: { type: "integer" },
          builtUpArea: { type: "double" },
          isFeatured: { type: "boolean" },
          createdAt: { type: "date" },
          city: {
            type: "text",
            fields: {
              keyword: { type: "keyword" },
            },
          },
          neighborhood: { type: "text" },
          amenityIds: { type: "keyword" },
          location: { type: "geo_point" },
        },
      },
    });
  } catch (error) {
    logger.warn("[infra.search] Failed to ensure property index; search fallback remains active", {
      error,
    });
    searchDisabled = true;
  }
};

const buildSort = (
  filters: PropertySearchFilters,
): estypes.SortCombinations[] => {
  switch (filters.sort) {
    case "newest":
      return [{ createdAt: { order: "desc" as const } }];
    case "price_asc":
      return [{ price: { order: "asc" as const, missing: "_last" } }];
    case "price_desc":
      return [{ price: { order: "desc" as const, missing: "_last" } }];
    case "distance":
      if (filters.latitude == null || filters.longitude == null) {
        return [{ isFeatured: { order: "desc" as const } }];
      }

      return [
        {
          _geo_distance: {
            location: {
              lat: filters.latitude,
              lon: filters.longitude,
            },
            order: "asc" as const,
            unit: "km" as const,
          },
        },
      ];
    case "featured":
    default:
      return [
        { isFeatured: { order: "desc" as const } },
        { createdAt: { order: "desc" as const } },
      ];
  }
};

export const searchPropertyIds = async (
  filters: PropertySearchFilters,
): Promise<string[] | null> => {
  const client = ensureSearchEnabled();
  if (!client) {
    return null;
  }

  try {
    const must: Array<Record<string, unknown>> = [];
    const filterClauses: Array<Record<string, unknown>> = [
      { term: { status: "PUBLISHED" } },
    ];

    if (filters.q?.trim()) {
      must.push({
        multi_match: {
          query: filters.q.trim(),
          fields: ["title^3", "description", "neighborhood", "city"],
        },
      });
    }

    if (filters.listingType) {
      filterClauses.push({ term: { listingType: filters.listingType.toUpperCase() } });
    }

    if (filters.propertyType) {
      filterClauses.push({ term: { propertyType: filters.propertyType.toUpperCase() } });
    }

    if (filters.city) {
      filterClauses.push({ term: { "city.keyword": filters.city } });
    }

    if (filters.isFeatured != null) {
      filterClauses.push({ term: { isFeatured: filters.isFeatured } });
    }

    if (filters.bedrooms != null) {
      filterClauses.push({ range: { bedrooms: { gte: filters.bedrooms } } });
    }

    if (filters.bathrooms != null) {
      filterClauses.push({ range: { bathrooms: { gte: filters.bathrooms } } });
    }

    if (filters.minPrice != null || filters.maxPrice != null) {
      filterClauses.push({
        range: {
          price: {
            ...(filters.minPrice != null && { gte: filters.minPrice }),
            ...(filters.maxPrice != null && { lte: filters.maxPrice }),
          },
        },
      });
    }

    if (filters.minArea != null || filters.maxArea != null) {
      filterClauses.push({
        range: {
          builtUpArea: {
            ...(filters.minArea != null && { gte: filters.minArea }),
            ...(filters.maxArea != null && { lte: filters.maxArea }),
          },
        },
      });
    }

    if (
      filters.latitude != null &&
      filters.longitude != null &&
      filters.radiusKm != null
    ) {
      filterClauses.push({
        geo_distance: {
          distance: `${filters.radiusKm}km`,
          location: {
            lat: filters.latitude,
            lon: filters.longitude,
          },
        },
      });
    }

    const result = await client.search<PropertySearchDocument>({
      index: propertySearchIndexName,
      from: filters.offset ?? 0,
      size: filters.limit ?? 20,
      query: {
        bool: {
          must,
          filter: filterClauses,
        },
      },
      sort: buildSort(filters),
      _source: ["id"],
    });

    return result.hits.hits
      .map((hit) => hit._source?.id ?? null)
      .filter((value): value is string => Boolean(value));
  } catch (error) {
    logger.warn("[infra.search] Elasticsearch search failed; search fallback remains active", {
      error,
    });
    searchDisabled = true;
    return null;
  }
};

export const upsertPropertySearchDocument = async (
  document: PropertySearchDocument,
): Promise<void> => {
  const client = ensureSearchEnabled();
  if (!client) {
    return;
  }

  try {
    await ensurePropertySearchIndex();
    await client.index({
      index: propertySearchIndexName,
      id: document.id,
      document,
      refresh: false,
    });
  } catch (error) {
    logger.warn("[infra.search] Failed to index property document", {
      error,
      propertyId: document.id,
    });
    searchDisabled = true;
  }
};

export const deletePropertySearchDocument = async (
  propertyId: string,
): Promise<void> => {
  const client = ensureSearchEnabled();
  if (!client) {
    return;
  }

  try {
    await client.delete({
      index: propertySearchIndexName,
      id: propertyId,
      refresh: false,
    });
  } catch (error) {
    logger.warn("[infra.search] Failed to delete property document", {
      error,
      propertyId,
    });
  }
};

export const disconnectSearch = async (): Promise<void> => {
  if (!elasticClient) {
    return;
  }

  await elasticClient.close();
  elasticClient = null;
};

export const propertySearchIndex = {
  name: propertySearchIndexName,
};
