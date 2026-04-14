import "dotenv/config";

const adminUrl = process.env.ADMIN_URL || "http://localhost:3001";
const customerUrl = process.env.CUSTOMER_URL || "http://localhost:3000";
const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || "4000"}`;
const payfastSandbox = process.env.PAYFAST_SANDBOX !== "false";

export const config = {
  frontend: {
    admin: adminUrl,
    customer: customerUrl,
  },
  server: {
    url: serverUrl,
    port: parseInt(process.env.PORT || "4000", 10),
    corsOrigins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
      : [adminUrl, customerUrl],
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
