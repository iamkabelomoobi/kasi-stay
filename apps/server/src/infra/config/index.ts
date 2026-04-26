import "dotenv/config";

const adminUrl = process.env.ADMIN_URL || "http://localhost:3001";
const renterUrl = process.env.RENTER_URL || "http://localhost:3000";
const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || "4000"}`;
const payfastSandbox = process.env.PAYFAST_SANDBOX !== "false";

export const config = {
  frontend: {
    admin: adminUrl,
    renter: renterUrl,
  },
  server: {
    url: serverUrl,
    port: parseInt(process.env.PORT || "4000", 10),
    corsOrigins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
      : [adminUrl, renterUrl],
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "900000", 10),
      max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
    },
  },
  logger: {
    logtail: {
      accessToken: process.env.LOGTAIL_ACCESS_TOKEN || "",
    },
  },
  notification: {
    nodemailer: {
      host: process.env.MAILHOG_HOST?.trim() || "localhost",
      port: parseInt(process.env.MAILHOG_PORT || "1025", 10),
      secure: process.env.MAILHOG_SECURE === "true",
      from:
        process.env.MAILHOG_FROM || "kasistay <no-reply@kasistay.local>",
      auth:
        process.env.MAILHOG_USER && process.env.MAILHOG_PASS
          ? {
            user: process.env.MAILHOG_USER,
            pass: process.env.MAILHOG_PASS,
          }
          : undefined,
    },
    resend: {
      apiKey: process.env.RESEND_API_KEY || "",
      from: process.env.RESEND_FROM || "",
    },
  },
  queue: {
    driver:
      process.env.QUEUE_DRIVER === "bullmq" ? "bullmq" : "memory",
    name: process.env.QUEUE_NAME || "kasistay-server",
    retry: {
      attempts: parseInt(process.env.QUEUE_RETRY_ATTEMPTS || "3", 10),
      backoff: {
        strategy:
          process.env.QUEUE_BACKOFF_STRATEGY === "fixed"
            ? "fixed"
            : "exponential",
        delayMs: parseInt(process.env.QUEUE_BACKOFF_DELAY_MS || "1000", 10),
      },
    },
    worker: {
      pollIntervalMs: parseInt(process.env.QUEUE_POLL_INTERVAL_MS || "500", 10),
    },
    jobs: {
      propertyExpiryIntervalMs: parseInt(
        process.env.PROPERTY_EXPIRY_JOB_INTERVAL_MS || `${1000 * 60 * 60 * 24}`,
        10,
      ),
      listingBoostExpiryIntervalMs: parseInt(
        process.env.LISTING_BOOST_EXPIRY_JOB_INTERVAL_MS ||
          `${1000 * 60 * 60 * 24}`,
        10,
      ),
      savedSearchAlertIntervalMs: parseInt(
        process.env.SAVED_SEARCH_ALERT_JOB_INTERVAL_MS ||
          `${1000 * 60 * 60 * 6}`,
        10,
      ),
    },
  },
  redis: {
    enabled: process.env.REDIS_ENABLED !== "false",
    url: process.env.REDIS_URL?.trim() || "",
    keyPrefix: process.env.REDIS_KEY_PREFIX?.trim() || "kasistay:",
    connectTimeoutMs: parseInt(
      process.env.REDIS_CONNECT_TIMEOUT_MS || "10000",
      10,
    ),
    propertySearchCacheTtlSeconds: parseInt(
      process.env.PROPERTY_SEARCH_CACHE_TTL_SECONDS || "60",
      10,
    ),
    propertyViewDebounceTtlSeconds: parseInt(
      process.env.PROPERTY_VIEW_DEBOUNCE_TTL_SECONDS || `${60 * 60 * 24}`,
      10,
    ),
  },
  search: {
    enabled: process.env.SEARCH_PROVIDER !== "database",
    node:
      process.env.ELASTICSEARCH_URL?.trim() ||
      process.env.ELASTICSEARCH_NODE?.trim() ||
      "",
    username: process.env.ELASTICSEARCH_USERNAME?.trim() || "",
    password: process.env.ELASTICSEARCH_PASSWORD?.trim() || "",
    indexPrefix: process.env.ELASTICSEARCH_INDEX_PREFIX?.trim() || "kasistay-",
    propertyIndex: process.env.ELASTICSEARCH_PROPERTY_INDEX || "properties",
    requestTimeoutMs: parseInt(
      process.env.ELASTICSEARCH_REQUEST_TIMEOUT_MS || "10000",
      10,
    ),
  },
  storage: {
    enabled: process.env.STORAGE_PROVIDER !== "none",
    bucket: process.env.AWS_S3_BUCKET?.trim() || "",
    region: process.env.AWS_REGION?.trim() || "",
    endpoint: process.env.AWS_S3_ENDPOINT?.trim() || "",
    publicBaseUrl: process.env.AWS_S3_PUBLIC_BASE_URL?.trim() || "",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim() || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim() || "",
    forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === "true",
    uploadUrlTtlSeconds: parseInt(
      process.env.AWS_S3_UPLOAD_URL_TTL_SECONDS || "900",
      10,
    ),
  },
  payfast: {
    merchantId: process.env.PAYFAST_MERCHANT_ID || "",
    merchantKey: process.env.PAYFAST_MERCHANT_KEY || "",
    passphrase: process.env.PAYFAST_PASSPHRASE || "",
    sandbox: payfastSandbox,
    processUrl:
      process.env.PAYFAST_PROCESS_URL ||
      (payfastSandbox
        ? "https://sandbox.payfast.co.za/eng/process"
        : "https://www.payfast.co.za/eng/process"),
    validateUrl:
      process.env.PAYFAST_VALIDATE_URL ||
      (payfastSandbox
        ? "https://sandbox.payfast.co.za/eng/query/validate"
        : "https://www.payfast.co.za/eng/query/validate"),
  },
};
