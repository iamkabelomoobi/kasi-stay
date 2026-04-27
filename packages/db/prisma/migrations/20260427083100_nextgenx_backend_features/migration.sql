-- CreateEnum
CREATE TYPE "RoommateProfileStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GenderIdentity" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "GenderPreference" AS ENUM ('ANY', 'MALE', 'FEMALE', 'NON_BINARY', 'OTHER');

-- CreateEnum
CREATE TYPE "MarketplaceCategory" AS ENUM ('FURNITURE', 'APPLIANCES', 'HOME_DECOR', 'ELECTRONICS', 'ROOM_ESSENTIALS', 'OTHER');

-- CreateEnum
CREATE TYPE "MarketplaceItemStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SOLD');

-- CreateEnum
CREATE TYPE "MarketplaceItemCondition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'NEEDS_REPAIR');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('CLEANING', 'TRANSPORT', 'PLUMBING', 'ELECTRICAL', 'MOVING', 'HANDYMAN', 'SECURITY', 'OTHER');

-- CreateEnum
CREATE TYPE "ServiceProviderStatus" AS ENUM ('PENDING', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ServiceListingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ConversationContextType" AS ENUM ('PROPERTY', 'ROOMMATE', 'MARKETPLACE_ITEM', 'SERVICE');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AttorneyProfileStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ArticleCategoryCode" AS ENUM ('PROPERTY_ADVICE', 'PROPERTY_NEWS', 'RENTING_GUIDE', 'SELLERS_GUIDE', 'BUY_TO_LET', 'PROPERTY_DEVELOPER', 'PROPERTY_FLIPPING', 'LIFESTYLE_DECOR', 'NEIGHBOURHOOD');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StaticPageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StaticPageType" AS ENUM ('ABOUT_US', 'PRIVACY_POLICY', 'TERMS_AND_CONDITIONS', 'COOKIE_POLICY', 'PAIA_MANUAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CareerPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContactMessageStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED', 'SPAM');

-- CreateEnum
CREATE TYPE "ApplicationReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "RoommateProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "age" INTEGER,
    "occupation" TEXT,
    "city" TEXT NOT NULL,
    "area" TEXT,
    "budgetMin" DECIMAL(12,2),
    "budgetMax" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'ZAR',
    "moveInDate" TIMESTAMP(3),
    "gender" "GenderIdentity",
    "preferredGender" "GenderPreference",
    "smokingFriendly" BOOLEAN NOT NULL DEFAULT false,
    "petsFriendly" BOOLEAN NOT NULL DEFAULT false,
    "photoUrl" TEXT,
    "status" "RoommateProfileStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoommateProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoommateSavedProfile" (
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoommateSavedProfile_pkey" PRIMARY KEY ("userId","profileId")
);

-- CreateTable
CREATE TABLE "MarketplaceItem" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" "MarketplaceCategory" NOT NULL,
    "status" "MarketplaceItemStatus" NOT NULL DEFAULT 'DRAFT',
    "condition" "MarketplaceItemCondition" NOT NULL DEFAULT 'GOOD',
    "price" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'ZAR',
    "city" TEXT NOT NULL,
    "locationText" TEXT,
    "imageUrls" JSONB,
    "isNegotiable" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceSavedItem" (
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketplaceSavedItem_pkey" PRIMARY KEY ("userId","itemId")
);

-- CreateTable
CREATE TABLE "ServiceProvider" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "city" TEXT NOT NULL,
    "serviceArea" TEXT,
    "logoUrl" TEXT,
    "status" "ServiceProviderStatus" NOT NULL DEFAULT 'ACTIVE',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceListing" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" "ServiceCategory" NOT NULL,
    "status" "ServiceListingStatus" NOT NULL DEFAULT 'PUBLISHED',
    "startingPrice" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'ZAR',
    "city" TEXT NOT NULL,
    "serviceArea" TEXT,
    "imageUrls" JSONB,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "message" TEXT,
    "preferredDate" TIMESTAMP(3),
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "subject" TEXT,
    "contextType" "ConversationContextType",
    "contextId" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("conversationId","userId")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttorneyProfile" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firmName" TEXT,
    "description" TEXT,
    "city" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "websiteUrl" TEXT,
    "imageUrl" TEXT,
    "status" "AttorneyProfileStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttorneyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleCategory" (
    "id" TEXT NOT NULL,
    "code" "ArticleCategoryCode" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "authorId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaticPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "StaticPageType" NOT NULL DEFAULT 'CUSTOM',
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "status" "StaticPageStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaticPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "employmentType" TEXT,
    "status" "CareerPostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "careerPostId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "coverLetter" TEXT,
    "resumeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactMessageStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "experience" TEXT,
    "licenseNumber" TEXT,
    "motivation" TEXT,
    "status" "ApplicationReviewStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyAdvertisingRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agencyName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "websiteUrl" TEXT,
    "budget" TEXT,
    "message" TEXT,
    "status" "ApplicationReviewStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyAdvertisingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoommateProfile_userId_key" ON "RoommateProfile"("userId");

-- CreateIndex
CREATE INDEX "RoommateProfile_userId_idx" ON "RoommateProfile"("userId");

-- CreateIndex
CREATE INDEX "RoommateProfile_status_idx" ON "RoommateProfile"("status");

-- CreateIndex
CREATE INDEX "RoommateProfile_city_idx" ON "RoommateProfile"("city");

-- CreateIndex
CREATE INDEX "RoommateProfile_moveInDate_idx" ON "RoommateProfile"("moveInDate");

-- CreateIndex
CREATE INDEX "RoommateProfile_preferredGender_idx" ON "RoommateProfile"("preferredGender");

-- CreateIndex
CREATE INDEX "RoommateSavedProfile_profileId_idx" ON "RoommateSavedProfile"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceItem_slug_key" ON "MarketplaceItem"("slug");

-- CreateIndex
CREATE INDEX "MarketplaceItem_ownerId_idx" ON "MarketplaceItem"("ownerId");

-- CreateIndex
CREATE INDEX "MarketplaceItem_category_idx" ON "MarketplaceItem"("category");

-- CreateIndex
CREATE INDEX "MarketplaceItem_status_idx" ON "MarketplaceItem"("status");

-- CreateIndex
CREATE INDEX "MarketplaceItem_city_idx" ON "MarketplaceItem"("city");

-- CreateIndex
CREATE INDEX "MarketplaceItem_price_idx" ON "MarketplaceItem"("price");

-- CreateIndex
CREATE INDEX "MarketplaceItem_createdAt_idx" ON "MarketplaceItem"("createdAt");

-- CreateIndex
CREATE INDEX "MarketplaceSavedItem_itemId_idx" ON "MarketplaceSavedItem"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceProvider_userId_key" ON "ServiceProvider"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceProvider_slug_key" ON "ServiceProvider"("slug");

-- CreateIndex
CREATE INDEX "ServiceProvider_userId_idx" ON "ServiceProvider"("userId");

-- CreateIndex
CREATE INDEX "ServiceProvider_status_idx" ON "ServiceProvider"("status");

-- CreateIndex
CREATE INDEX "ServiceProvider_city_idx" ON "ServiceProvider"("city");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceListing_slug_key" ON "ServiceListing"("slug");

-- CreateIndex
CREATE INDEX "ServiceListing_providerId_idx" ON "ServiceListing"("providerId");

-- CreateIndex
CREATE INDEX "ServiceListing_category_idx" ON "ServiceListing"("category");

-- CreateIndex
CREATE INDEX "ServiceListing_status_idx" ON "ServiceListing"("status");

-- CreateIndex
CREATE INDEX "ServiceListing_city_idx" ON "ServiceListing"("city");

-- CreateIndex
CREATE INDEX "ServiceListing_createdAt_idx" ON "ServiceListing"("createdAt");

-- CreateIndex
CREATE INDEX "ServiceRequest_listingId_idx" ON "ServiceRequest"("listingId");

-- CreateIndex
CREATE INDEX "ServiceRequest_requesterId_idx" ON "ServiceRequest"("requesterId");

-- CreateIndex
CREATE INDEX "ServiceRequest_status_idx" ON "ServiceRequest"("status");

-- CreateIndex
CREATE INDEX "Conversation_createdById_idx" ON "Conversation"("createdById");

-- CreateIndex
CREATE INDEX "Conversation_contextType_contextId_idx" ON "Conversation"("contextType", "contextId");

-- CreateIndex
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");

-- CreateIndex
CREATE INDEX "ConversationParticipant_userId_archivedAt_idx" ON "ConversationParticipant"("userId", "archivedAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX "AttorneyProfile_slug_key" ON "AttorneyProfile"("slug");

-- CreateIndex
CREATE INDEX "AttorneyProfile_status_idx" ON "AttorneyProfile"("status");

-- CreateIndex
CREATE INDEX "AttorneyProfile_city_idx" ON "AttorneyProfile"("city");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleCategory_code_key" ON "ArticleCategory"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleCategory_slug_key" ON "ArticleCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_categoryId_idx" ON "Article"("categoryId");

-- CreateIndex
CREATE INDEX "Article_status_idx" ON "Article"("status");

-- CreateIndex
CREATE INDEX "Article_createdAt_idx" ON "Article"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StaticPage_slug_key" ON "StaticPage"("slug");

-- CreateIndex
CREATE INDEX "StaticPage_type_idx" ON "StaticPage"("type");

-- CreateIndex
CREATE INDEX "StaticPage_status_idx" ON "StaticPage"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CareerPost_slug_key" ON "CareerPost"("slug");

-- CreateIndex
CREATE INDEX "CareerPost_status_idx" ON "CareerPost"("status");

-- CreateIndex
CREATE INDEX "CareerPost_createdAt_idx" ON "CareerPost"("createdAt");

-- CreateIndex
CREATE INDEX "JobApplication_careerPostId_idx" ON "JobApplication"("careerPostId");

-- CreateIndex
CREATE INDEX "JobApplication_userId_idx" ON "JobApplication"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_careerPostId_userId_key" ON "JobApplication"("careerPostId", "userId");

-- CreateIndex
CREATE INDEX "ContactMessage_userId_idx" ON "ContactMessage"("userId");

-- CreateIndex
CREATE INDEX "ContactMessage_status_idx" ON "ContactMessage"("status");

-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");

-- CreateIndex
CREATE INDEX "AgentApplication_userId_idx" ON "AgentApplication"("userId");

-- CreateIndex
CREATE INDEX "AgentApplication_status_idx" ON "AgentApplication"("status");

-- CreateIndex
CREATE INDEX "AgentApplication_createdAt_idx" ON "AgentApplication"("createdAt");

-- CreateIndex
CREATE INDEX "AgencyAdvertisingRequest_userId_idx" ON "AgencyAdvertisingRequest"("userId");

-- CreateIndex
CREATE INDEX "AgencyAdvertisingRequest_status_idx" ON "AgencyAdvertisingRequest"("status");

-- CreateIndex
CREATE INDEX "AgencyAdvertisingRequest_createdAt_idx" ON "AgencyAdvertisingRequest"("createdAt");

-- AddForeignKey
ALTER TABLE "RoommateProfile" ADD CONSTRAINT "RoommateProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommateSavedProfile" ADD CONSTRAINT "RoommateSavedProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommateSavedProfile" ADD CONSTRAINT "RoommateSavedProfile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "RoommateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceItem" ADD CONSTRAINT "MarketplaceItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceSavedItem" ADD CONSTRAINT "MarketplaceSavedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceSavedItem" ADD CONSTRAINT "MarketplaceSavedItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MarketplaceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProvider" ADD CONSTRAINT "ServiceProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceListing" ADD CONSTRAINT "ServiceListing_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ServiceProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "ServiceListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttorneyProfile" ADD CONSTRAINT "AttorneyProfile_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ArticleCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaticPage" ADD CONSTRAINT "StaticPage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerPost" ADD CONSTRAINT "CareerPost_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_careerPostId_fkey" FOREIGN KEY ("careerPostId") REFERENCES "CareerPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentApplication" ADD CONSTRAINT "AgentApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyAdvertisingRequest" ADD CONSTRAINT "AgencyAdvertisingRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
