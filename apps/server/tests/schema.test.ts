import assert from "node:assert/strict";
import { test } from "node:test";
import { printSchema } from "graphql";

process.env.DATABASE_URL ??=
  "postgresql://kasistay:kasistay@127.0.0.1:5432/kasistay_dev";

const expectOperation = (schemaText: string, operation: string) => {
  assert.match(schemaText, new RegExp(`\\b${operation}\\b`));
};

test("schema exposes the NEXTGENX backend operations", async () => {
  const { schema } = await import("../src/app/index.ts");
  const schemaText = printSchema(schema);

  const operations = [
    "roommateProfiles",
    "roommateProfile",
    "myRoommateProfile",
    "savedRoommateProfiles",
    "upsertRoommateProfile",
    "deleteRoommateProfile",
    "saveRoommateProfile",
    "unsaveRoommateProfile",
    "marketplaceItems",
    "marketplaceItem",
    "myMarketplaceItems",
    "savedMarketplaceItems",
    "createMarketplaceItem",
    "updateMarketplaceItem",
    "deleteMarketplaceItem",
    "publishMarketplaceItem",
    "archiveMarketplaceItem",
    "saveMarketplaceItem",
    "unsaveMarketplaceItem",
    "serviceListings",
    "serviceListing",
    "serviceProviders",
    "serviceProvider",
    "myServiceRequests",
    "createServiceProvider",
    "updateServiceProvider",
    "createServiceListing",
    "updateServiceListing",
    "deleteServiceListing",
    "requestService",
    "updateServiceRequestStatus",
    "conversations",
    "conversation",
    "messages",
    "createConversation",
    "sendMessage",
    "markConversationRead",
    "archiveConversation",
    "attorneys",
    "attorney",
    "calculateBond",
    "calculateAffordability",
    "createAttorneyProfile",
    "updateAttorneyProfile",
    "deleteAttorneyProfile",
    "articles",
    "article",
    "articleBySlug",
    "articleCategories",
    "createArticle",
    "updateArticle",
    "publishArticle",
    "archiveArticle",
    "deleteArticle",
    "staticPage",
    "staticPageBySlug",
    "staticPages",
    "createStaticPage",
    "updateStaticPage",
    "publishStaticPage",
    "archiveStaticPage",
    "careerPosts",
    "careerPost",
    "createCareerPost",
    "updateCareerPost",
    "archiveCareerPost",
    "submitJobApplication",
    "submitContactMessage",
    "contactMessages",
    "applyAsAgent",
    "requestAgencyAdvertising",
    "professionalApplications",
    "approveAgentApplication",
    "rejectAgentApplication",
    "agencyAdvertisingRequests",
    "updateAgencyAdvertisingRequestStatus",
  ];

  for (const operation of operations) {
    expectOperation(schemaText, operation);
  }
});
