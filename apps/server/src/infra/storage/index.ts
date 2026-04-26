import { logger } from "@kasistay/logger";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { config } from "../config";

type CreatePropertyUploadTargetInput = {
  propertyId: string;
  filename: string;
  contentType: string;
};

type DeleteStorageObjectInput = {
  key?: string | null;
  url?: string | null;
};

let s3Client: S3Client | null = null;

const sanitizeFilename = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const extractExtension = (filename: string): string => {
  const cleanFilename = sanitizeFilename(filename);
  const dotIndex = cleanFilename.lastIndexOf(".");
  return dotIndex >= 0 ? cleanFilename.slice(dotIndex) : "";
};

const getS3Client = (): S3Client | null => {
  if (!config.storage.enabled) {
    return null;
  }

  if (s3Client) {
    return s3Client;
  }

  if (!config.storage.bucket || !config.storage.region) {
    return null;
  }

  s3Client = new S3Client({
    region: config.storage.region,
    endpoint: config.storage.endpoint || undefined,
    forcePathStyle: config.storage.forcePathStyle,
    credentials:
      config.storage.accessKeyId && config.storage.secretAccessKey
        ? {
            accessKeyId: config.storage.accessKeyId,
            secretAccessKey: config.storage.secretAccessKey,
          }
        : undefined,
  });

  return s3Client;
};

export const buildPropertyObjectKey = (
  propertyId: string,
  filename: string,
): string => {
  const extension = extractExtension(filename);
  return `properties/${propertyId}/${randomUUID()}${extension}`;
};

export const getStoragePublicUrl = (key: string): string => {
  if (config.storage.publicBaseUrl) {
    return `${config.storage.publicBaseUrl.replace(/\/$/, "")}/${key}`;
  }

  if (config.storage.endpoint) {
    return `${config.storage.endpoint.replace(/\/$/, "")}/${config.storage.bucket}/${key}`;
  }

  return `https://${config.storage.bucket}.s3.${config.storage.region}.amazonaws.com/${key}`;
};

export const extractStorageKeyFromUrl = (url: string): string | null => {
  if (!url.trim()) {
    return null;
  }

  const normalized = url.trim();
  const publicBaseUrl = config.storage.publicBaseUrl?.replace(/\/$/, "");
  if (publicBaseUrl && normalized.startsWith(publicBaseUrl)) {
    return normalized.slice(publicBaseUrl.length + 1);
  }

  const endpoint = config.storage.endpoint?.replace(/\/$/, "");
  if (endpoint && normalized.startsWith(`${endpoint}/${config.storage.bucket}/`)) {
    return normalized.slice(`${endpoint}/${config.storage.bucket}/`.length);
  }

  const bucketHost = `https://${config.storage.bucket}.s3.${config.storage.region}.amazonaws.com/`;
  if (normalized.startsWith(bucketHost)) {
    return normalized.slice(bucketHost.length);
  }

  return null;
};

export const createPropertyUploadTarget = async (
  input: CreatePropertyUploadTargetInput,
) => {
  const client = getS3Client();
  if (!client || !config.storage.bucket) {
    throw new Error("S3 storage is not configured");
  }

  const key = buildPropertyObjectKey(input.propertyId, input.filename);
  const command = new PutObjectCommand({
    Bucket: config.storage.bucket,
    Key: key,
    ContentType: input.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: config.storage.uploadUrlTtlSeconds,
  });

  return {
    key,
    uploadUrl,
    publicUrl: getStoragePublicUrl(key),
    expiresInSeconds: config.storage.uploadUrlTtlSeconds,
    headers: {
      "content-type": input.contentType,
    },
  };
};

export const deleteStorageObject = async (
  input: DeleteStorageObjectInput,
): Promise<void> => {
  const client = getS3Client();
  if (!client || !config.storage.bucket) {
    return;
  }

  const key = input.key ?? (input.url ? extractStorageKeyFromUrl(input.url) : null);
  if (!key) {
    return;
  }

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: config.storage.bucket,
        Key: key,
      }),
    );
  } catch (error) {
    logger.warn("[infra.storage] Failed to delete object from storage", {
      error,
      key,
    });
  }
};

export const disconnectStorage = async (): Promise<void> => {
  if (!s3Client) {
    return;
  }

  s3Client.destroy();
  s3Client = null;
};
