import { prisma, PropertyStatus } from "@kasistay/db";
import { sendEmail } from "@kasistay/email";
import { logger } from "@kasistay/logger";
import { Context } from "../../../app/context";
import { createRecurringJob } from "../../queue";
import { registerQueueProcessor } from "../../queue/registry";
import { LISTING_BOOST_EXPIRY_JOB } from "../../../modules/boosts/jobs";
import {
  NOTIFICATION_EMAIL_JOB,
  type NotificationEmailPayload,
} from "../../../modules/notifications/jobs";
import { PROPERTY_EXPIRY_JOB } from "../../../modules/properties/jobs";
import { propertyInclude } from "../../../modules/properties/queries";
import { SAVED_SEARCH_ALERT_JOB } from "../../../modules/saved/jobs";
import {
  PROPERTY_SEARCH_SYNC_JOB,
  type PropertySearchSyncPayload,
} from "../../../modules/search/jobs";
import {
  removePropertyFromSearchIndex,
  searchProperties,
  syncPropertySearchDocument,
} from "../../../modules/search/queries";
import { config } from "../../config";

const syncPropertyById = async (propertyId: string): Promise<void> => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: propertyInclude,
  });

  if (!property) {
    await removePropertyFromSearchIndex(propertyId);
    return;
  }

  await syncPropertySearchDocument(property);
};

const processNotificationEmail = async (
  payload: NotificationEmailPayload,
): Promise<void> => {
  await sendEmail(payload);
};

const processPropertySearchSync = async (
  payload: PropertySearchSyncPayload,
): Promise<void> => {
  if (payload.action === "delete") {
    await removePropertyFromSearchIndex(payload.propertyId);
    return;
  }

  await syncPropertyById(payload.propertyId);
};

const processPropertyExpiry = async (): Promise<void> => {
  const now = new Date();
  const expiringProperties = await prisma.property.findMany({
    where: {
      expiresAt: {
        lte: now,
      },
      status: {
        in: [PropertyStatus.DRAFT, PropertyStatus.PUBLISHED],
      },
    },
    select: {
      id: true,
    },
  });

  if (expiringProperties.length === 0) {
    return;
  }

  await prisma.property.updateMany({
    where: {
      id: {
        in: expiringProperties.map((property) => property.id),
      },
    },
    data: {
      status: PropertyStatus.ARCHIVED,
    },
  });

  await Promise.all(
    expiringProperties.map((property) => syncPropertyById(property.id)),
  );
};

const processListingBoostExpiry = async (): Promise<void> => {
  const now = new Date();
  const expiredBoosts = await prisma.listingBoost.findMany({
    where: {
      expiresAt: {
        lte: now,
      },
    },
    select: {
      propertyId: true,
    },
    distinct: ["propertyId"],
  });

  if (expiredBoosts.length === 0) {
    return;
  }

  await Promise.all(
    expiredBoosts.map(async ({ propertyId }) => {
      const activeBoostCount = await prisma.listingBoost.count({
        where: {
          propertyId,
          expiresAt: {
            gt: now,
          },
        },
      });

      await prisma.property.update({
        where: { id: propertyId },
        data: {
          isFeatured: activeBoostCount > 0,
        },
      });

      await syncPropertyById(propertyId);
    }),
  );
};

const processSavedSearchAlerts = async (): Promise<void> => {
  const publicContext = Context.internal();
  const savedSearches = await prisma.savedSearch.findMany({
    where: {
      alertEnabled: true,
    },
    include: {
      user: true,
    },
  });

  for (const savedSearch of savedSearches) {
    const filter =
      savedSearch.filters &&
      typeof savedSearch.filters === "object" &&
      !Array.isArray(savedSearch.filters)
        ? {
            ...(savedSearch.filters as Record<string, unknown>),
            limit:
              typeof (savedSearch.filters as Record<string, unknown>).limit ===
              "number"
                ? (savedSearch.filters as Record<string, unknown>).limit
                : 50,
          }
        : { limit: 50 };

    const matchingProperties = await searchProperties(
      publicContext,
      filter as Parameters<typeof searchProperties>[1],
    );

    const newProperties = matchingProperties.filter((property) =>
      savedSearch.lastNotifiedAt
        ? property.createdAt > savedSearch.lastNotifiedAt
        : true,
    );

    if (newProperties.length > 0) {
      await prisma.notification.create({
        data: {
          userId: savedSearch.userId,
          type: "SAVED_SEARCH_ALERT",
          title: "New properties matched your saved search",
          body: `${newProperties.length} new listing(s) matched your saved search`,
          metadata: {
            savedSearchId: savedSearch.id,
            propertyIds: newProperties.map((property) => property.id),
          },
        },
      });

      if (savedSearch.user.email) {
        await processNotificationEmail({
          to: savedSearch.user.email,
          subject: "New properties matched your saved search",
          text: `We found ${newProperties.length} new listing(s) that match your saved search.`,
          html: `<p>We found <strong>${newProperties.length}</strong> new listing(s) that match your saved search.</p><ul>${newProperties
            .slice(0, 5)
            .map((property) => `<li>${property.title}</li>`)
            .join("")}</ul>`,
        });
      }
    }

    await prisma.savedSearch.update({
      where: { id: savedSearch.id },
      data: {
        lastNotifiedAt: new Date(),
      },
    });
  }
};

export const registerPropertyPlatformProcessors = (): void => {
  registerQueueProcessor(NOTIFICATION_EMAIL_JOB, processNotificationEmail);
  registerQueueProcessor(PROPERTY_SEARCH_SYNC_JOB, processPropertySearchSync);
  registerQueueProcessor(PROPERTY_EXPIRY_JOB, processPropertyExpiry);
  registerQueueProcessor(LISTING_BOOST_EXPIRY_JOB, processListingBoostExpiry);
  registerQueueProcessor(SAVED_SEARCH_ALERT_JOB, processSavedSearchAlerts);

  createRecurringJob({
    name: PROPERTY_EXPIRY_JOB,
    payload: {},
    intervalMs: config.queue.jobs.propertyExpiryIntervalMs,
    runOnStart: true,
  });

  createRecurringJob({
    name: LISTING_BOOST_EXPIRY_JOB,
    payload: {},
    intervalMs: config.queue.jobs.listingBoostExpiryIntervalMs,
    runOnStart: true,
  });

  createRecurringJob({
    name: SAVED_SEARCH_ALERT_JOB,
    payload: {},
    intervalMs: config.queue.jobs.savedSearchAlertIntervalMs,
    runOnStart: true,
  });

  logger.info("[infra.workers] Registered property platform processors");
};
