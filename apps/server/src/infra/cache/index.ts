import { logger } from "@kasistay/logger";
import { createHash } from "node:crypto";
import Redis from "ioredis";
import { config } from "../config";

type CacheEntry = {
  value: string;
  expiresAt: number | null;
};

type CacheAdapter = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ttlSeconds?: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
  setIfNotExists: (
    key: string,
    value: string,
    ttlSeconds?: number,
  ) => Promise<boolean>;
  disconnect: () => Promise<void>;
};

const memoryCache = new Map<string, CacheEntry>();

const now = () => Date.now();

const resolveExpiry = (ttlSeconds?: number): number | null => {
  if (!ttlSeconds || ttlSeconds <= 0) {
    return null;
  }

  return now() + ttlSeconds * 1000;
};

const sweepExpiredMemoryEntry = (key: string): CacheEntry | null => {
  const entry = memoryCache.get(key) ?? null;
  if (!entry) {
    return null;
  }

  if (entry.expiresAt != null && entry.expiresAt <= now()) {
    memoryCache.delete(key);
    return null;
  }

  return entry;
};

const createMemoryCacheAdapter = (): CacheAdapter => ({
  async get(key) {
    return sweepExpiredMemoryEntry(key)?.value ?? null;
  },
  async set(key, value, ttlSeconds) {
    memoryCache.set(key, {
      value,
      expiresAt: resolveExpiry(ttlSeconds),
    });
  },
  async delete(key) {
    memoryCache.delete(key);
  },
  async setIfNotExists(key, value, ttlSeconds) {
    const existing = sweepExpiredMemoryEntry(key);
    if (existing) {
      return false;
    }

    memoryCache.set(key, {
      value,
      expiresAt: resolveExpiry(ttlSeconds),
    });
    return true;
  },
  async disconnect() {},
});

let redisClient: Redis | null = null;
let redisDisabled = false;

const buildRedisClient = (): Redis | null => {
  if (redisDisabled || !config.redis.enabled || !config.redis.url) {
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  redisClient = new Redis(config.redis.url, {
    keyPrefix: config.redis.keyPrefix,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    connectTimeout: config.redis.connectTimeoutMs,
  });

  redisClient.on("error", (error) => {
    logger.warn("[infra.cache] Redis client error; falling back to memory cache", {
      error,
    });
    redisDisabled = true;
  });

  return redisClient;
};

const createRedisCacheAdapter = (): CacheAdapter => ({
  async get(key) {
    const client = buildRedisClient();
    if (!client) {
      return createMemoryCacheAdapter().get(key);
    }

    try {
      if (client.status === "wait") {
        await client.connect();
      }
      return await client.get(key);
    } catch (error) {
      logger.warn("[infra.cache] Redis get failed; using memory cache", {
        error,
        key,
      });
      redisDisabled = true;
      return createMemoryCacheAdapter().get(key);
    }
  },
  async set(key, value, ttlSeconds) {
    const client = buildRedisClient();
    if (!client) {
      return createMemoryCacheAdapter().set(key, value, ttlSeconds);
    }

    try {
      if (client.status === "wait") {
        await client.connect();
      }

      if (ttlSeconds && ttlSeconds > 0) {
        await client.set(key, value, "EX", ttlSeconds);
        return;
      }

      await client.set(key, value);
    } catch (error) {
      logger.warn("[infra.cache] Redis set failed; using memory cache", {
        error,
        key,
      });
      redisDisabled = true;
      await createMemoryCacheAdapter().set(key, value, ttlSeconds);
    }
  },
  async delete(key) {
    const client = buildRedisClient();
    if (!client) {
      return createMemoryCacheAdapter().delete(key);
    }

    try {
      if (client.status === "wait") {
        await client.connect();
      }
      await client.del(key);
    } catch (error) {
      logger.warn("[infra.cache] Redis delete failed; using memory cache", {
        error,
        key,
      });
      redisDisabled = true;
      await createMemoryCacheAdapter().delete(key);
    }
  },
  async setIfNotExists(key, value, ttlSeconds) {
    const client = buildRedisClient();
    if (!client) {
      return createMemoryCacheAdapter().setIfNotExists(key, value, ttlSeconds);
    }

    try {
      if (client.status === "wait") {
        await client.connect();
      }

      const response = ttlSeconds && ttlSeconds > 0
        ? await client.set(key, value, "EX", ttlSeconds, "NX")
        : await client.set(key, value, "NX");

      return response === "OK";
    } catch (error) {
      logger.warn(
        "[infra.cache] Redis setIfNotExists failed; using memory cache",
        {
          error,
          key,
        },
      );
      redisDisabled = true;
      return createMemoryCacheAdapter().setIfNotExists(key, value, ttlSeconds);
    }
  },
  async disconnect() {
    if (!redisClient) {
      return;
    }

    await redisClient.quit();
    redisClient = null;
  },
});

const cacheAdapter: CacheAdapter = config.redis.enabled
  ? createRedisCacheAdapter()
  : createMemoryCacheAdapter();

export const createCacheKeyHash = (value: unknown): string => {
  const normalized =
    typeof value === "string" ? value : JSON.stringify(value ?? null);
  return createHash("sha256").update(normalized).digest("hex");
};

export const cache = {
  async get(key: string): Promise<string | null> {
    return cacheAdapter.get(key);
  },

  async getJson<T>(key: string): Promise<T | null> {
    const value = await cacheAdapter.get(key);
    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    await cacheAdapter.set(key, value, ttlSeconds);
  },

  async setJson<T>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<void> {
    await cacheAdapter.set(key, JSON.stringify(value), ttlSeconds);
  },

  async delete(key: string): Promise<void> {
    await cacheAdapter.delete(key);
  },

  async setIfNotExists(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<boolean> {
    return cacheAdapter.setIfNotExists(key, value, ttlSeconds);
  },

  async remember<T>(
    key: string,
    ttlSeconds: number,
    loader: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.getJson<T>(key);
    if (cached != null) {
      return cached;
    }

    const resolved = await loader();
    await this.setJson(key, resolved, ttlSeconds);
    return resolved;
  },

  async disconnect(): Promise<void> {
    await cacheAdapter.disconnect();
  },
};

export const cacheKeys = {
  propertySearch: (hash: string) => `property-search:${hash}`,
  propertyView: (propertyId: string, ipAddress: string) =>
    `property-view:${propertyId}:${ipAddress}`,
};
