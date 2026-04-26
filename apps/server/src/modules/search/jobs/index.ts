import { createJobEnqueuer } from "../../../infra/queue";

export const PROPERTY_SEARCH_SYNC_JOB = "search.propertySync" as const;

export type PropertySearchSyncPayload = {
  propertyId: string;
  action?: "upsert" | "delete";
};

export const enqueuePropertySearchSync =
  createJobEnqueuer<PropertySearchSyncPayload>(PROPERTY_SEARCH_SYNC_JOB);
