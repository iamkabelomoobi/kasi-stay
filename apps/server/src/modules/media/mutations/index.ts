import { Prisma, PropertyMediaType } from "@kasistay/db";
import { Context } from "../../../app/context";
import {
  config,
  createPropertyUploadTarget,
  deleteStorageObject,
} from "../../../infra";
import { badInput, notFound, unauthorized } from "../../../utils/errors";
import { propertyInclude } from "../../properties/queries";

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

const assertCanManageProperty = async (
  propertyId: string,
  ctx: Context,
  transaction?: Prisma.TransactionClient,
) => {
  const db = transaction ?? ctx.prisma;
  const property = await db.property.findUnique({
    where: { id: propertyId },
    include: {
      agency: {
        select: {
          ownerId: true,
        },
      },
    },
  });

  if (!property) {
    notFound("Property not found");
  }

  if (ctx.isAdmin) {
    return property!;
  }

  const userId = ctx.assertAuth().id;
  if (property!.agentId !== userId && property!.agency?.ownerId !== userId) {
    unauthorized();
  }

  return property!;
};

const MAX_MEDIA_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const allowedUploadContentTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "application/pdf",
]);

export const createPropertyMediaUploadTarget = async (
  propertyId: string,
  input: {
    filename: string;
    contentType: string;
    sizeBytes: number;
  },
  ctx: Context,
) => {
  await assertCanManageProperty(propertyId, ctx);

  if (!config.storage.enabled) {
    badInput("Storage uploads are not configured");
  }

  if (!allowedUploadContentTypes.has(input.contentType)) {
    badInput(`Unsupported media content type: ${input.contentType}`);
  }

  if (input.sizeBytes <= 0 || input.sizeBytes > MAX_MEDIA_FILE_SIZE_BYTES) {
    badInput("Media uploads must be between 1 byte and 10MB");
  }

  const uploadTarget = await createPropertyUploadTarget({
    propertyId,
    filename: input.filename,
    contentType: input.contentType,
  });

  return {
    ...uploadTarget,
    contentType: input.contentType,
  };
};

export const addPropertyMedia = async (
  propertyId: string,
  input: {
    media: Array<{
      url: string;
      type?: string | null;
      order?: number | null;
      isPrimary?: boolean | null;
    }>;
  },
  ctx: Context,
) => {
  if (!input.media.length) {
    badInput("At least one media item is required");
  }

  return ctx.prisma.$transaction(async (tx) => {
    await assertCanManageProperty(propertyId, ctx, tx);

    const existingMedia = await tx.propertyMedia.findMany({
      where: { propertyId },
      orderBy: [{ isPrimary: "desc" }, { order: "asc" }, { createdAt: "asc" }],
    });

    if (existingMedia.length + input.media.length > 20) {
      badInput("A property can only have up to 20 media items");
    }

    const requestedPrimaryIndex = input.media.findIndex(
      (item) => item.isPrimary === true,
    );

    if (requestedPrimaryIndex >= 0) {
      await tx.propertyMedia.updateMany({
        where: { propertyId },
        data: { isPrimary: false },
      });
    }

    await tx.property.update({
      where: { id: propertyId },
      data: {
        media: {
          create: input.media.map((item, index) => ({
            url: item.url,
            type:
              parseEnum(
                PropertyMediaType,
                item.type ?? undefined,
                "media type",
              ) ?? PropertyMediaType.IMAGE,
            order: item.order ?? existingMedia.length + index,
            isPrimary:
              requestedPrimaryIndex >= 0
                ? requestedPrimaryIndex === index
                : existingMedia.length === 0 && index === 0,
          })),
        },
      },
    });

    return tx.property.findUnique({
      where: { id: propertyId },
      include: propertyInclude,
    });
  });
};

export const reorderPropertyMedia = async (
  propertyId: string,
  input: {
    items: Array<{
      mediaId: string;
      order: number;
    }>;
  },
  ctx: Context,
) => {
  if (!input.items.length) {
    badInput("At least one media reorder item is required");
  }

  return ctx.prisma.$transaction(async (tx) => {
    await assertCanManageProperty(propertyId, ctx, tx);

    const mediaIds = input.items.map((item) => item.mediaId);
    const uniqueMediaIds = new Set(mediaIds);
    if (uniqueMediaIds.size !== mediaIds.length) {
      badInput("Media reorder items must be unique");
    }

    const existingMedia = await tx.propertyMedia.findMany({
      where: {
        propertyId,
        id: {
          in: mediaIds,
        },
      },
    });

    if (existingMedia.length !== mediaIds.length) {
      notFound("One or more media items were not found");
    }

    await Promise.all(
      input.items.map((item) =>
        tx.propertyMedia.update({
          where: { id: item.mediaId },
          data: { order: item.order },
        })
      ),
    );

    return tx.propertyMedia.findMany({
      where: { propertyId },
      orderBy: [{ isPrimary: "desc" }, { order: "asc" }, { createdAt: "asc" }],
    });
  });
};

export const setPrimaryPropertyMedia = async (
  propertyId: string,
  mediaId: string,
  ctx: Context,
) => {
  return ctx.prisma.$transaction(async (tx) => {
    await assertCanManageProperty(propertyId, ctx, tx);

    const media = await tx.propertyMedia.findFirst({
      where: {
        id: mediaId,
        propertyId,
      },
    });

    if (!media) {
      notFound("Property media not found");
    }

    await tx.propertyMedia.updateMany({
      where: { propertyId },
      data: { isPrimary: false },
    });

    return tx.propertyMedia.update({
      where: { id: mediaId },
      data: { isPrimary: true },
    });
  });
};

export const deletePropertyMedia = async (
  propertyId: string,
  mediaId: string,
  ctx: Context,
) => {
  const { property, deletedMediaUrl } = await ctx.prisma.$transaction(async (tx) => {
    await assertCanManageProperty(propertyId, ctx, tx);

    const media = await tx.propertyMedia.findFirst({
      where: {
        id: mediaId,
        propertyId,
      },
    });

    if (!media) {
      notFound("Property media not found");
    }

    const deletedMediaUrl = media!.url;

    await tx.propertyMedia.delete({
      where: { id: mediaId },
    });

    if (media!.isPrimary) {
      const fallbackPrimary = await tx.propertyMedia.findFirst({
        where: { propertyId },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      });

      if (fallbackPrimary) {
        await tx.propertyMedia.update({
          where: { id: fallbackPrimary.id },
          data: { isPrimary: true },
        });
      }
    }

    const property = await tx.property.findUnique({
      where: { id: propertyId },
      include: propertyInclude,
    });

    return { property, deletedMediaUrl };
  });

  await deleteStorageObject({ url: deletedMediaUrl });
  return property;
};
