import {
  AmenityCategory,
  ArticleCategoryCode,
  ArticleStatus,
  ApplicationReviewStatus,
  AttorneyProfileStatus,
  BuyOwnerType,
  CareerPostStatus,
  CommissionPaidBy,
  ContactMessageStatus,
  ConversationContextType,
  Furnishing,
  GenderIdentity,
  GenderPreference,
  InquirySource,
  InquiryStatus,
  ListingBoostType,
  ListingType,
  MaintenanceBy,
  MarketplaceCategory,
  MarketplaceItemCondition,
  MarketplaceItemStatus,
  OccupancyStatus,
  OwnershipType,
  PriceFrequency,
  Prisma,
  PropertyDocumentType,
  PropertyMediaType,
  PropertyStatus,
  PropertyType,
  ReportReason,
  ReportStatus,
  RoommateProfileStatus,
  SellerType,
  ServiceCategory,
  ServiceListingStatus,
  ServiceProviderStatus,
  ServiceRequestStatus,
  StaticPageStatus,
  StaticPageType,
  TenantPreference,
  UserRole,
  ViewingStatus,
  prisma,
} from "../index";

const json = <T extends Prisma.InputJsonValue>(value: T): T => value;

const date = (value: string) => new Date(value);

const userDefinitions = {
  admin: {
    email: "admin.seed@kasistay.local",
    name: "Kasi Stay Admin",
    phone: "+27 82 000 0001",
    role: UserRole.ADMIN,
    avatar: "https://images.kasistay.local/users/admin.jpg",
  },
  agent: {
    email: "agent.seed@kasistay.local",
    name: "Thabo Agent",
    phone: "+27 82 000 0002",
    role: UserRole.AGENT,
    avatar: "https://images.kasistay.local/users/agent.jpg",
  },
  owner: {
    email: "owner.seed@kasistay.local",
    name: "Lerato Owner",
    phone: "+27 82 000 0003",
    role: UserRole.OWNER,
    avatar: "https://images.kasistay.local/users/owner.jpg",
  },
  buyer: {
    email: "buyer.seed@kasistay.local",
    name: "Sipho Buyer",
    phone: "+27 82 000 0004",
    role: UserRole.BUYER,
    avatar: "https://images.kasistay.local/users/buyer.jpg",
  },
  renter: {
    email: "renter.seed@kasistay.local",
    name: "Nomsa Renter",
    phone: "+27 82 000 0005",
    role: UserRole.RENTER,
    avatar: "https://images.kasistay.local/users/renter.jpg",
  },
  provider: {
    email: "provider.seed@kasistay.local",
    name: "Bongani Services",
    phone: "+27 82 000 0006",
    role: UserRole.OWNER,
    avatar: "https://images.kasistay.local/users/provider.jpg",
  },
} as const;

const articleCategories = [
  {
    code: ArticleCategoryCode.PROPERTY_ADVICE,
    name: "Property Advice",
    slug: "property-advice",
  },
  {
    code: ArticleCategoryCode.PROPERTY_NEWS,
    name: "Property News",
    slug: "property-news",
  },
  {
    code: ArticleCategoryCode.RENTING_GUIDE,
    name: "Renting Guide",
    slug: "renting-guide",
  },
  {
    code: ArticleCategoryCode.SELLERS_GUIDE,
    name: "Sellers Guide",
    slug: "sellers-guide",
  },
  {
    code: ArticleCategoryCode.BUY_TO_LET,
    name: "Buy to Let",
    slug: "buy-to-let",
  },
  {
    code: ArticleCategoryCode.PROPERTY_DEVELOPER,
    name: "Property Developer",
    slug: "property-developer",
  },
  {
    code: ArticleCategoryCode.PROPERTY_FLIPPING,
    name: "Property Flipping",
    slug: "property-flipping",
  },
  {
    code: ArticleCategoryCode.LIFESTYLE_DECOR,
    name: "Lifestyle & Decor",
    slug: "lifestyle-decor",
  },
  {
    code: ArticleCategoryCode.NEIGHBOURHOOD,
    name: "Neighbourhood",
    slug: "neighbourhood",
  },
];

const staticPages = [
  {
    slug: "about-us",
    type: StaticPageType.ABOUT_US,
    title: "About Kasi Stay",
    summary: "How Kasi Stay helps people buy, rent, share, and move locally.",
    content:
      "Kasi Stay connects property seekers, roommates, service professionals, and local businesses through one trusted platform.",
  },
  {
    slug: "privacy-policy",
    type: StaticPageType.PRIVACY_POLICY,
    title: "Privacy Policy",
    summary: "How we collect, use, and protect personal information.",
    content:
      "This privacy policy explains what data Kasi Stay collects, why it is collected, and how users can request access, correction, or deletion.",
  },
  {
    slug: "terms-and-conditions",
    type: StaticPageType.TERMS_AND_CONDITIONS,
    title: "Terms and Conditions",
    summary: "Platform terms for buyers, renters, agents, and service providers.",
    content:
      "These terms govern use of Kasi Stay listings, messaging, marketplace postings, professional services, and editorial content.",
  },
  {
    slug: "cookie-policy",
    type: StaticPageType.COOKIE_POLICY,
    title: "Cookie Policy",
    summary: "How cookies and similar technologies are used on the platform.",
    content:
      "Kasi Stay uses cookies for authentication, security, analytics, and experience improvements. Users can manage browser cookie preferences at any time.",
  },
  {
    slug: "paia-manual",
    type: StaticPageType.PAIA_MANUAL,
    title: "PAIA Manual",
    summary: "Promotion of Access to Information Act manual.",
    content:
      "This PAIA manual sets out the information records held by Kasi Stay and the process for access requests under applicable South African law.",
  },
];

const syncRoleRecord = async (userId: string, role: UserRole) => {
  await prisma.$transaction(async (tx) => {
    await tx.admin.deleteMany({ where: { userId } });
    await tx.renter.deleteMany({ where: { userId } });

    if (role === UserRole.ADMIN) {
      await tx.admin.create({ data: { userId } });
    }

    if (role === UserRole.RENTER) {
      await tx.renter.create({ data: { userId } });
    }
  });
};

const upsertUser = async (definition: (typeof userDefinitions)[keyof typeof userDefinitions]) => {
  const user = await prisma.user.upsert({
    where: { email: definition.email },
    update: {
      name: definition.name,
      phone: definition.phone,
      role: definition.role,
      emailVerified: true,
      isVerified: true,
      avatar: definition.avatar,
      image: definition.avatar,
    },
    create: {
      email: definition.email,
      name: definition.name,
      phone: definition.phone,
      role: definition.role,
      emailVerified: true,
      isVerified: true,
      avatar: definition.avatar,
      image: definition.avatar,
    },
  });

  await syncRoleRecord(user.id, definition.role);

  return user;
};

const seedUsers = async () => {
  const admin = await upsertUser(userDefinitions.admin);
  const agent = await upsertUser(userDefinitions.agent);
  const owner = await upsertUser(userDefinitions.owner);
  const buyer = await upsertUser(userDefinitions.buyer);
  const renter = await upsertUser(userDefinitions.renter);
  const provider = await upsertUser(userDefinitions.provider);

  return {
    admin,
    agent,
    owner,
    buyer,
    renter,
    provider,
  };
};

const seedAmenities = async () => {
  const amenities = [
    { name: "24/7 Security", category: AmenityCategory.BUILDING },
    { name: "Backup Water", category: AmenityCategory.BUILDING },
    { name: "Fibre Internet", category: AmenityCategory.UNIT },
    { name: "Parking Bay", category: AmenityCategory.ACCESSIBILITY },
    { name: "City Views", category: AmenityCategory.VIEW },
  ];

  return Promise.all(
    amenities.map((amenity) =>
      prisma.amenity.upsert({
        where: { name: amenity.name },
        update: { category: amenity.category },
        create: amenity,
      }),
    ),
  );
};

const seedAgency = async (users: Awaited<ReturnType<typeof seedUsers>>) => {
  const agency = await prisma.agency.upsert({
    where: { licenseNumber: "KASI-STAY-AGENCY-001" },
    update: {
      name: "Kasi Stay Premier Realty",
      logo: "https://images.kasistay.local/agencies/premier-realty.png",
      ownerId: users.owner.id,
    },
    create: {
      name: "Kasi Stay Premier Realty",
      logo: "https://images.kasistay.local/agencies/premier-realty.png",
      licenseNumber: "KASI-STAY-AGENCY-001",
      ownerId: users.owner.id,
    },
  });

  await prisma.user.update({
    where: { id: users.agent.id },
    data: { agencyId: agency.id },
  });

  return agency;
};

const seedSubscriptionPlans = async () => {
  const starterPlan = await prisma.subscriptionPlan.upsert({
    where: { id: "seed-plan-starter" },
    update: {
      name: "Starter Agent",
      price: "499.00",
      listingLimit: 10,
      boostCredits: 2,
      durationDays: 30,
      features: json([
        "10 live listings",
        "2 boost credits",
        "Email support",
      ]),
    },
    create: {
      id: "seed-plan-starter",
      name: "Starter Agent",
      price: "499.00",
      listingLimit: 10,
      boostCredits: 2,
      durationDays: 30,
      features: json([
        "10 live listings",
        "2 boost credits",
        "Email support",
      ]),
    },
  });

  const growthPlan = await prisma.subscriptionPlan.upsert({
    where: { id: "seed-plan-growth" },
    update: {
      name: "Growth Agency",
      price: "1299.00",
      listingLimit: 50,
      boostCredits: 12,
      durationDays: 30,
      features: json([
        "50 live listings",
        "12 boost credits",
        "Priority support",
      ]),
    },
    create: {
      id: "seed-plan-growth",
      name: "Growth Agency",
      price: "1299.00",
      listingLimit: 50,
      boostCredits: 12,
      durationDays: 30,
      features: json([
        "50 live listings",
        "12 boost credits",
        "Priority support",
      ]),
    },
  });

  return { starterPlan, growthPlan };
};

const seedProperties = async (
  users: Awaited<ReturnType<typeof seedUsers>>,
  agencyId: string,
  amenities: Awaited<ReturnType<typeof seedAmenities>>,
) => {
  const buyProperty = await prisma.property.upsert({
    where: { slug: "seed-soweto-family-townhouse" },
    update: {
      title: "Modern family townhouse in Soweto",
      description:
        "A move-in ready townhouse close to schools, transport links, and retail.",
      status: PropertyStatus.PUBLISHED,
      listingType: ListingType.BUY,
      propertyType: PropertyType.TOWNHOUSE,
      price: "1250000.00",
      currency: "ZAR",
      priceFrequency: PriceFrequency.ONCE,
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 2,
      builtUpArea: 164,
      plotArea: 240,
      furnishing: Furnishing.SEMI,
      occupancyStatus: OccupancyStatus.VACANT,
      availableFrom: date("2026-05-01T00:00:00.000Z"),
      agentId: users.agent.id,
      agencyId,
      views: 428,
      isFeatured: true,
      isVerified: true,
      permitNumber: "BUY-SEED-001",
      expiresAt: date("2026-12-31T00:00:00.000Z"),
    },
    create: {
      slug: "seed-soweto-family-townhouse",
      title: "Modern family townhouse in Soweto",
      description:
        "A move-in ready townhouse close to schools, transport links, and retail.",
      status: PropertyStatus.PUBLISHED,
      listingType: ListingType.BUY,
      propertyType: PropertyType.TOWNHOUSE,
      price: "1250000.00",
      currency: "ZAR",
      priceFrequency: PriceFrequency.ONCE,
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 2,
      builtUpArea: 164,
      plotArea: 240,
      furnishing: Furnishing.SEMI,
      occupancyStatus: OccupancyStatus.VACANT,
      availableFrom: date("2026-05-01T00:00:00.000Z"),
      agentId: users.agent.id,
      agencyId,
      views: 428,
      isFeatured: true,
      isVerified: true,
      permitNumber: "BUY-SEED-001",
      expiresAt: date("2026-12-31T00:00:00.000Z"),
    },
  });

  const rentProperty = await prisma.property.upsert({
    where: { slug: "seed-midrand-studio-rental" },
    update: {
      title: "Secure studio rental in Midrand",
      description:
        "A furnished studio with fibre, backup water, and easy Gautrain access.",
      status: PropertyStatus.PUBLISHED,
      listingType: ListingType.RENT,
      propertyType: PropertyType.STUDIO,
      price: "7800.00",
      currency: "ZAR",
      priceFrequency: PriceFrequency.MONTHLY,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpaces: 1,
      builtUpArea: 49,
      furnishing: Furnishing.FURNISHED,
      occupancyStatus: OccupancyStatus.VACANT,
      availableFrom: date("2026-05-15T00:00:00.000Z"),
      agentId: users.agent.id,
      agencyId,
      views: 267,
      isFeatured: false,
      isVerified: true,
      permitNumber: "RENT-SEED-001",
      expiresAt: date("2026-10-31T00:00:00.000Z"),
    },
    create: {
      slug: "seed-midrand-studio-rental",
      title: "Secure studio rental in Midrand",
      description:
        "A furnished studio with fibre, backup water, and easy Gautrain access.",
      status: PropertyStatus.PUBLISHED,
      listingType: ListingType.RENT,
      propertyType: PropertyType.STUDIO,
      price: "7800.00",
      currency: "ZAR",
      priceFrequency: PriceFrequency.MONTHLY,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpaces: 1,
      builtUpArea: 49,
      furnishing: Furnishing.FURNISHED,
      occupancyStatus: OccupancyStatus.VACANT,
      availableFrom: date("2026-05-15T00:00:00.000Z"),
      agentId: users.agent.id,
      agencyId,
      views: 267,
      isFeatured: false,
      isVerified: true,
      permitNumber: "RENT-SEED-001",
      expiresAt: date("2026-10-31T00:00:00.000Z"),
    },
  });

  const sellProperty = await prisma.property.upsert({
    where: { slug: "seed-umhlanga-penthouse-sale" },
    update: {
      title: "Luxury penthouse in Umhlanga",
      description:
        "A premium penthouse listing with panoramic sea views and concierge access.",
      status: PropertyStatus.PUBLISHED,
      listingType: ListingType.SELL,
      propertyType: PropertyType.PENTHOUSE,
      price: "3200000.00",
      currency: "ZAR",
      priceFrequency: PriceFrequency.ONCE,
      bedrooms: 4,
      bathrooms: 3,
      parkingSpaces: 3,
      builtUpArea: 280,
      floorNumber: 12,
      totalFloors: 14,
      yearBuilt: 2021,
      furnishing: Furnishing.UNFURNISHED,
      occupancyStatus: OccupancyStatus.VACANT,
      availableFrom: date("2026-06-01T00:00:00.000Z"),
      agentId: users.agent.id,
      agencyId,
      views: 193,
      isFeatured: true,
      isVerified: true,
      permitNumber: "SELL-SEED-001",
      expiresAt: date("2026-11-30T00:00:00.000Z"),
    },
    create: {
      slug: "seed-umhlanga-penthouse-sale",
      title: "Luxury penthouse in Umhlanga",
      description:
        "A premium penthouse listing with panoramic sea views and concierge access.",
      status: PropertyStatus.PUBLISHED,
      listingType: ListingType.SELL,
      propertyType: PropertyType.PENTHOUSE,
      price: "3200000.00",
      currency: "ZAR",
      priceFrequency: PriceFrequency.ONCE,
      bedrooms: 4,
      bathrooms: 3,
      parkingSpaces: 3,
      builtUpArea: 280,
      floorNumber: 12,
      totalFloors: 14,
      yearBuilt: 2021,
      furnishing: Furnishing.UNFURNISHED,
      occupancyStatus: OccupancyStatus.VACANT,
      availableFrom: date("2026-06-01T00:00:00.000Z"),
      agentId: users.agent.id,
      agencyId,
      views: 193,
      isFeatured: true,
      isVerified: true,
      permitNumber: "SELL-SEED-001",
      expiresAt: date("2026-11-30T00:00:00.000Z"),
    },
  });

  await prisma.location.upsert({
    where: { propertyId: buyProperty.id },
    update: {
      address: "12 Khumalo Street",
      city: "Soweto",
      state: "Gauteng",
      country: "South Africa",
      postalCode: "1804",
      latitude: -26.2485,
      longitude: 27.854,
      neighborhood: "Orlando West",
    },
    create: {
      propertyId: buyProperty.id,
      address: "12 Khumalo Street",
      city: "Soweto",
      state: "Gauteng",
      country: "South Africa",
      postalCode: "1804",
      latitude: -26.2485,
      longitude: 27.854,
      neighborhood: "Orlando West",
    },
  });

  await prisma.location.upsert({
    where: { propertyId: rentProperty.id },
    update: {
      address: "18 Lever Road",
      city: "Midrand",
      state: "Gauteng",
      country: "South Africa",
      postalCode: "1685",
      latitude: -25.9992,
      longitude: 28.1263,
      neighborhood: "Halfway Gardens",
    },
    create: {
      propertyId: rentProperty.id,
      address: "18 Lever Road",
      city: "Midrand",
      state: "Gauteng",
      country: "South Africa",
      postalCode: "1685",
      latitude: -25.9992,
      longitude: 28.1263,
      neighborhood: "Halfway Gardens",
    },
  });

  await prisma.location.upsert({
    where: { propertyId: sellProperty.id },
    update: {
      address: "7 Lighthouse Road",
      city: "Umhlanga",
      state: "KwaZulu-Natal",
      country: "South Africa",
      postalCode: "4319",
      latitude: -29.7267,
      longitude: 31.085,
      neighborhood: "Umhlanga Rocks",
    },
    create: {
      propertyId: sellProperty.id,
      address: "7 Lighthouse Road",
      city: "Umhlanga",
      state: "KwaZulu-Natal",
      country: "South Africa",
      postalCode: "4319",
      latitude: -29.7267,
      longitude: 31.085,
      neighborhood: "Umhlanga Rocks",
    },
  });

  const mediaSeed = [
    {
      id: "seed-media-buy-primary",
      propertyId: buyProperty.id,
      url: "https://images.kasistay.local/properties/buy-1.jpg",
      type: PropertyMediaType.IMAGE,
      order: 0,
      isPrimary: true,
    },
    {
      id: "seed-media-rent-primary",
      propertyId: rentProperty.id,
      url: "https://images.kasistay.local/properties/rent-1.jpg",
      type: PropertyMediaType.IMAGE,
      order: 0,
      isPrimary: true,
    },
    {
      id: "seed-media-sell-primary",
      propertyId: sellProperty.id,
      url: "https://images.kasistay.local/properties/sell-1.jpg",
      type: PropertyMediaType.IMAGE,
      order: 0,
      isPrimary: true,
    },
  ];

  await Promise.all(
    mediaSeed.map((item) =>
      prisma.propertyMedia.upsert({
        where: { id: item.id },
        update: item,
        create: item,
      }),
    ),
  );

  const documentSeed = [
    {
      id: "seed-doc-buy-brochure",
      propertyId: buyProperty.id,
      url: "https://docs.kasistay.local/properties/buy-brochure.pdf",
      type: PropertyDocumentType.BROCHURE,
      label: "Sales brochure",
    },
    {
      id: "seed-doc-rent-brochure",
      propertyId: rentProperty.id,
      url: "https://docs.kasistay.local/properties/rent-brochure.pdf",
      type: PropertyDocumentType.BROCHURE,
      label: "Rental brochure",
    },
    {
      id: "seed-doc-sell-valuation",
      propertyId: sellProperty.id,
      url: "https://docs.kasistay.local/properties/sell-valuation.pdf",
      type: PropertyDocumentType.VALUATION,
      label: "Valuation report",
    },
  ];

  await Promise.all(
    documentSeed.map((item) =>
      prisma.propertyDocument.upsert({
        where: { id: item.id },
        update: item,
        create: item,
      }),
    ),
  );

  await Promise.all([
    prisma.propertyAmenity.upsert({
      where: {
        propertyId_amenityId: {
          propertyId: buyProperty.id,
          amenityId: amenities[0].id,
        },
      },
      update: {},
      create: { propertyId: buyProperty.id, amenityId: amenities[0].id },
    }),
    prisma.propertyAmenity.upsert({
      where: {
        propertyId_amenityId: {
          propertyId: buyProperty.id,
          amenityId: amenities[2].id,
        },
      },
      update: {},
      create: { propertyId: buyProperty.id, amenityId: amenities[2].id },
    }),
    prisma.propertyAmenity.upsert({
      where: {
        propertyId_amenityId: {
          propertyId: rentProperty.id,
          amenityId: amenities[1].id,
        },
      },
      update: {},
      create: { propertyId: rentProperty.id, amenityId: amenities[1].id },
    }),
    prisma.propertyAmenity.upsert({
      where: {
        propertyId_amenityId: {
          propertyId: rentProperty.id,
          amenityId: amenities[3].id,
        },
      },
      update: {},
      create: { propertyId: rentProperty.id, amenityId: amenities[3].id },
    }),
    prisma.propertyAmenity.upsert({
      where: {
        propertyId_amenityId: {
          propertyId: sellProperty.id,
          amenityId: amenities[0].id,
        },
      },
      update: {},
      create: { propertyId: sellProperty.id, amenityId: amenities[0].id },
    }),
    prisma.propertyAmenity.upsert({
      where: {
        propertyId_amenityId: {
          propertyId: sellProperty.id,
          amenityId: amenities[4].id,
        },
      },
      update: {},
      create: { propertyId: sellProperty.id, amenityId: amenities[4].id },
    }),
  ]);

  const buyDetail = await prisma.buyDetail.upsert({
    where: { propertyId: buyProperty.id },
    update: {
      ownership: OwnershipType.FREEHOLD,
      ownerType: BuyOwnerType.INDIVIDUAL,
      isDeveloper: false,
      registrationInfo: "Transfer ready",
      titleDeedVerified: true,
      roi: 8.1,
    },
    create: {
      propertyId: buyProperty.id,
      ownership: OwnershipType.FREEHOLD,
      ownerType: BuyOwnerType.INDIVIDUAL,
      isDeveloper: false,
      registrationInfo: "Transfer ready",
      titleDeedVerified: true,
      roi: 8.1,
    },
  });

  await prisma.paymentPlan.upsert({
    where: { buyDetailId: buyDetail.id },
    update: {},
    create: {
      id: "seed-buy-payment-plan",
      buyDetailId: buyDetail.id,
    },
  });

  const paymentPlan = await prisma.paymentPlan.findUniqueOrThrow({
    where: { buyDetailId: buyDetail.id },
  });

  await Promise.all([
    prisma.installment.upsert({
      where: { id: "seed-installment-deposit" },
      update: {
        paymentPlanId: paymentPlan.id,
        dueDate: date("2026-05-15T00:00:00.000Z"),
        amount: "125000.00",
        percentage: 10,
        label: "Deposit",
      },
      create: {
        id: "seed-installment-deposit",
        paymentPlanId: paymentPlan.id,
        dueDate: date("2026-05-15T00:00:00.000Z"),
        amount: "125000.00",
        percentage: 10,
        label: "Deposit",
      },
    }),
    prisma.installment.upsert({
      where: { id: "seed-installment-balance" },
      update: {
        paymentPlanId: paymentPlan.id,
        dueDate: date("2026-07-01T00:00:00.000Z"),
        amount: "1125000.00",
        percentage: 90,
        label: "Transfer balance",
      },
      create: {
        id: "seed-installment-balance",
        paymentPlanId: paymentPlan.id,
        dueDate: date("2026-07-01T00:00:00.000Z"),
        amount: "1125000.00",
        percentage: 90,
        label: "Transfer balance",
      },
    }),
  ]);

  await prisma.rentDetail.upsert({
    where: { propertyId: rentProperty.id },
    update: {
      depositAmount: "7800.00",
      minLeaseTerm: 12,
      tenantPreference: TenantPreference.ANY,
      petsAllowed: false,
      utilitiesIncluded: true,
      chillerIncluded: false,
      cheques: 0,
      maintenanceBy: MaintenanceBy.LANDLORD,
    },
    create: {
      propertyId: rentProperty.id,
      depositAmount: "7800.00",
      minLeaseTerm: 12,
      tenantPreference: TenantPreference.ANY,
      petsAllowed: false,
      utilitiesIncluded: true,
      chillerIncluded: false,
      cheques: 0,
      maintenanceBy: MaintenanceBy.LANDLORD,
    },
  });

  const sellDetail = await prisma.sellDetail.upsert({
    where: { propertyId: sellProperty.id },
    update: {
      sellerType: SellerType.AGENT,
      isOffMarket: false,
      commissionPaidBy: CommissionPaidBy.SELLER,
      inspectionStatus: "Inspected and market-ready",
    },
    create: {
      propertyId: sellProperty.id,
      sellerType: SellerType.AGENT,
      isOffMarket: false,
      commissionPaidBy: CommissionPaidBy.SELLER,
      inspectionStatus: "Inspected and market-ready",
    },
  });

  await Promise.all([
    prisma.priceHistory.upsert({
      where: { id: "seed-price-history-initial" },
      update: {
        propertyId: sellProperty.id,
        sellDetailId: sellDetail.id,
        price: "3350000.00",
        changedAt: date("2026-03-01T00:00:00.000Z"),
      },
      create: {
        id: "seed-price-history-initial",
        propertyId: sellProperty.id,
        sellDetailId: sellDetail.id,
        price: "3350000.00",
        changedAt: date("2026-03-01T00:00:00.000Z"),
      },
    }),
    prisma.priceHistory.upsert({
      where: { id: "seed-price-history-current" },
      update: {
        propertyId: sellProperty.id,
        sellDetailId: sellDetail.id,
        price: "3200000.00",
        changedAt: date("2026-04-10T00:00:00.000Z"),
      },
      create: {
        id: "seed-price-history-current",
        propertyId: sellProperty.id,
        sellDetailId: sellDetail.id,
        price: "3200000.00",
        changedAt: date("2026-04-10T00:00:00.000Z"),
      },
    }),
  ]);

  const inquiry = await prisma.inquiry.upsert({
    where: { id: "seed-inquiry-rent" },
    update: {
      propertyId: rentProperty.id,
      userId: users.renter.id,
      name: users.renter.name,
      email: users.renter.email,
      phone: users.renter.phone,
      message: "I would like to schedule a viewing this weekend.",
      source: InquirySource.ORGANIC,
      status: InquiryStatus.VIEWING,
    },
    create: {
      id: "seed-inquiry-rent",
      propertyId: rentProperty.id,
      userId: users.renter.id,
      name: users.renter.name,
      email: users.renter.email,
      phone: users.renter.phone,
      message: "I would like to schedule a viewing this weekend.",
      source: InquirySource.ORGANIC,
      status: InquiryStatus.VIEWING,
    },
  });

  await prisma.viewing.upsert({
    where: { id: "seed-viewing-rent" },
    update: {
      inquiryId: inquiry.id,
      propertyId: rentProperty.id,
      userId: users.renter.id,
      scheduledAt: date("2026-05-03T09:00:00.000Z"),
      status: ViewingStatus.CONFIRMED,
    },
    create: {
      id: "seed-viewing-rent",
      inquiryId: inquiry.id,
      propertyId: rentProperty.id,
      userId: users.renter.id,
      scheduledAt: date("2026-05-03T09:00:00.000Z"),
      status: ViewingStatus.CONFIRMED,
    },
  });

  await prisma.savedProperty.upsert({
    where: {
      userId_propertyId: {
        userId: users.buyer.id,
        propertyId: buyProperty.id,
      },
    },
    update: {},
    create: {
      userId: users.buyer.id,
      propertyId: buyProperty.id,
    },
  });

  await prisma.savedSearch.upsert({
    where: { id: "seed-saved-search-buyers" },
    update: {
      userId: users.buyer.id,
      filters: json({
        listingType: ListingType.BUY,
        city: "Soweto",
        minPrice: 900000,
        maxPrice: 1500000,
        bedrooms: 3,
      }),
      alertEnabled: true,
      lastNotifiedAt: date("2026-04-20T10:00:00.000Z"),
    },
    create: {
      id: "seed-saved-search-buyers",
      userId: users.buyer.id,
      filters: json({
        listingType: ListingType.BUY,
        city: "Soweto",
        minPrice: 900000,
        maxPrice: 1500000,
        bedrooms: 3,
      }),
      alertEnabled: true,
      lastNotifiedAt: date("2026-04-20T10:00:00.000Z"),
    },
  });

  await prisma.review.upsert({
    where: {
      propertyId_userId: {
        propertyId: rentProperty.id,
        userId: users.renter.id,
      },
    },
    update: {
      rating: 5,
      comment: "Responsive agent, clean unit, and smooth move-in process.",
    },
    create: {
      propertyId: rentProperty.id,
      userId: users.renter.id,
      rating: 5,
      comment: "Responsive agent, clean unit, and smooth move-in process.",
    },
  });

  await prisma.report.upsert({
    where: { id: "seed-report-sell" },
    update: {
      propertyId: sellProperty.id,
      userId: users.buyer.id,
      reason: ReportReason.INACCURATE,
      description: "Floor area was missing in the first version of the listing.",
      status: ReportStatus.REVIEWED,
    },
    create: {
      id: "seed-report-sell",
      propertyId: sellProperty.id,
      userId: users.buyer.id,
      reason: ReportReason.INACCURATE,
      description: "Floor area was missing in the first version of the listing.",
      status: ReportStatus.REVIEWED,
    },
  });

  return {
    buyProperty,
    rentProperty,
    sellProperty,
  };
};

const seedMarketplace = async (users: Awaited<ReturnType<typeof seedUsers>>) => {
  const couch = await prisma.marketplaceItem.upsert({
    where: { slug: "seed-marketplace-l-shaped-couch" },
    update: {
      ownerId: users.owner.id,
      title: "L-shaped couch for apartment living",
      description: "Well-kept couch ideal for a student flat or starter home.",
      category: MarketplaceCategory.FURNITURE,
      status: MarketplaceItemStatus.PUBLISHED,
      condition: MarketplaceItemCondition.GOOD,
      price: "4500.00",
      city: "Johannesburg",
      locationText: "Braamfontein",
      imageUrls: json([
        "https://images.kasistay.local/marketplace/couch-1.jpg",
        "https://images.kasistay.local/marketplace/couch-2.jpg",
      ]),
      isNegotiable: true,
      publishedAt: date("2026-04-12T00:00:00.000Z"),
      archivedAt: null,
    },
    create: {
      slug: "seed-marketplace-l-shaped-couch",
      ownerId: users.owner.id,
      title: "L-shaped couch for apartment living",
      description: "Well-kept couch ideal for a student flat or starter home.",
      category: MarketplaceCategory.FURNITURE,
      status: MarketplaceItemStatus.PUBLISHED,
      condition: MarketplaceItemCondition.GOOD,
      price: "4500.00",
      city: "Johannesburg",
      locationText: "Braamfontein",
      imageUrls: json([
        "https://images.kasistay.local/marketplace/couch-1.jpg",
        "https://images.kasistay.local/marketplace/couch-2.jpg",
      ]),
      isNegotiable: true,
      publishedAt: date("2026-04-12T00:00:00.000Z"),
    },
  });

  await prisma.marketplaceItem.upsert({
    where: { slug: "seed-marketplace-mini-fridge" },
    update: {
      ownerId: users.renter.id,
      title: "Compact mini fridge",
      description: "Great for student accommodation or room setups.",
      category: MarketplaceCategory.APPLIANCES,
      status: MarketplaceItemStatus.DRAFT,
      condition: MarketplaceItemCondition.LIKE_NEW,
      price: "2200.00",
      city: "Pretoria",
      locationText: "Hatfield",
      imageUrls: json([
        "https://images.kasistay.local/marketplace/fridge-1.jpg",
      ]),
      isNegotiable: false,
      publishedAt: null,
      archivedAt: null,
    },
    create: {
      slug: "seed-marketplace-mini-fridge",
      ownerId: users.renter.id,
      title: "Compact mini fridge",
      description: "Great for student accommodation or room setups.",
      category: MarketplaceCategory.APPLIANCES,
      status: MarketplaceItemStatus.DRAFT,
      condition: MarketplaceItemCondition.LIKE_NEW,
      price: "2200.00",
      city: "Pretoria",
      locationText: "Hatfield",
      imageUrls: json([
        "https://images.kasistay.local/marketplace/fridge-1.jpg",
      ]),
      isNegotiable: false,
    },
  });

  await prisma.marketplaceSavedItem.upsert({
    where: {
      userId_itemId: {
        userId: users.buyer.id,
        itemId: couch.id,
      },
    },
    update: {},
    create: {
      userId: users.buyer.id,
      itemId: couch.id,
    },
  });

  return { couch };
};

const seedRoommates = async (users: Awaited<ReturnType<typeof seedUsers>>) => {
  const roommateProfile = await prisma.roommateProfile.upsert({
    where: { userId: users.renter.id },
    update: {
      headline: "Young professional looking for a clean shared space",
      bio: "Working in Sandton and looking for a calm, respectful house-share.",
      age: 27,
      occupation: "Marketing coordinator",
      city: "Johannesburg",
      area: "Rosebank",
      budgetMin: "4500.00",
      budgetMax: "6500.00",
      currency: "ZAR",
      moveInDate: date("2026-06-01T00:00:00.000Z"),
      gender: GenderIdentity.FEMALE,
      preferredGender: GenderPreference.ANY,
      smokingFriendly: false,
      petsFriendly: true,
      photoUrl: "https://images.kasistay.local/roommates/nomsa.jpg",
      status: RoommateProfileStatus.PUBLISHED,
    },
    create: {
      userId: users.renter.id,
      headline: "Young professional looking for a clean shared space",
      bio: "Working in Sandton and looking for a calm, respectful house-share.",
      age: 27,
      occupation: "Marketing coordinator",
      city: "Johannesburg",
      area: "Rosebank",
      budgetMin: "4500.00",
      budgetMax: "6500.00",
      currency: "ZAR",
      moveInDate: date("2026-06-01T00:00:00.000Z"),
      gender: GenderIdentity.FEMALE,
      preferredGender: GenderPreference.ANY,
      smokingFriendly: false,
      petsFriendly: true,
      photoUrl: "https://images.kasistay.local/roommates/nomsa.jpg",
      status: RoommateProfileStatus.PUBLISHED,
    },
  });

  await prisma.roommateSavedProfile.upsert({
    where: {
      userId_profileId: {
        userId: users.buyer.id,
        profileId: roommateProfile.id,
      },
    },
    update: {},
    create: {
      userId: users.buyer.id,
      profileId: roommateProfile.id,
    },
  });

  return { roommateProfile };
};

const seedServices = async (users: Awaited<ReturnType<typeof seedUsers>>) => {
  const provider = await prisma.serviceProvider.upsert({
    where: { userId: users.provider.id },
    update: {
      businessName: "MoveFast Home Services",
      slug: "seed-movefast-home-services",
      description:
        "Trusted move-in cleaning and local transport support for tenants and homeowners.",
      email: users.provider.email,
      phone: users.provider.phone,
      city: "Johannesburg",
      serviceArea: "Johannesburg North and Sandton",
      logoUrl: "https://images.kasistay.local/services/movefast-logo.png",
      status: ServiceProviderStatus.ACTIVE,
      isVerified: true,
    },
    create: {
      userId: users.provider.id,
      businessName: "MoveFast Home Services",
      slug: "seed-movefast-home-services",
      description:
        "Trusted move-in cleaning and local transport support for tenants and homeowners.",
      email: users.provider.email,
      phone: users.provider.phone,
      city: "Johannesburg",
      serviceArea: "Johannesburg North and Sandton",
      logoUrl: "https://images.kasistay.local/services/movefast-logo.png",
      status: ServiceProviderStatus.ACTIVE,
      isVerified: true,
    },
  });

  const cleaning = await prisma.serviceListing.upsert({
    where: { slug: "seed-service-move-in-cleaning" },
    update: {
      providerId: provider.id,
      title: "Move-in cleaning package",
      description:
        "Deep clean for studios, apartments, and family homes before move-in day.",
      category: ServiceCategory.CLEANING,
      status: ServiceListingStatus.PUBLISHED,
      startingPrice: "950.00",
      city: "Johannesburg",
      serviceArea: "Sandton, Rosebank, Midrand",
      imageUrls: json([
        "https://images.kasistay.local/services/cleaning-1.jpg",
      ]),
      publishedAt: date("2026-04-01T00:00:00.000Z"),
    },
    create: {
      providerId: provider.id,
      slug: "seed-service-move-in-cleaning",
      title: "Move-in cleaning package",
      description:
        "Deep clean for studios, apartments, and family homes before move-in day.",
      category: ServiceCategory.CLEANING,
      status: ServiceListingStatus.PUBLISHED,
      startingPrice: "950.00",
      city: "Johannesburg",
      serviceArea: "Sandton, Rosebank, Midrand",
      imageUrls: json([
        "https://images.kasistay.local/services/cleaning-1.jpg",
      ]),
      publishedAt: date("2026-04-01T00:00:00.000Z"),
    },
  });

  await prisma.serviceListing.upsert({
    where: { slug: "seed-service-local-transport" },
    update: {
      providerId: provider.id,
      title: "Local transport for small moves",
      description:
        "Bakkie and driver for room-to-room and apartment-to-apartment moves.",
      category: ServiceCategory.TRANSPORT,
      status: ServiceListingStatus.PUBLISHED,
      startingPrice: "700.00",
      city: "Johannesburg",
      serviceArea: "Johannesburg and Pretoria",
      imageUrls: json([
        "https://images.kasistay.local/services/transport-1.jpg",
      ]),
      publishedAt: date("2026-04-01T00:00:00.000Z"),
    },
    create: {
      providerId: provider.id,
      slug: "seed-service-local-transport",
      title: "Local transport for small moves",
      description:
        "Bakkie and driver for room-to-room and apartment-to-apartment moves.",
      category: ServiceCategory.TRANSPORT,
      status: ServiceListingStatus.PUBLISHED,
      startingPrice: "700.00",
      city: "Johannesburg",
      serviceArea: "Johannesburg and Pretoria",
      imageUrls: json([
        "https://images.kasistay.local/services/transport-1.jpg",
      ]),
      publishedAt: date("2026-04-01T00:00:00.000Z"),
    },
  });

  const serviceRequest = await prisma.serviceRequest.upsert({
    where: { id: "seed-service-request-cleaning" },
    update: {
      listingId: cleaning.id,
      requesterId: users.renter.id,
      message: "I need the unit cleaned the day before move-in.",
      preferredDate: date("2026-05-10T08:00:00.000Z"),
      status: ServiceRequestStatus.ACCEPTED,
    },
    create: {
      id: "seed-service-request-cleaning",
      listingId: cleaning.id,
      requesterId: users.renter.id,
      message: "I need the unit cleaned the day before move-in.",
      preferredDate: date("2026-05-10T08:00:00.000Z"),
      status: ServiceRequestStatus.ACCEPTED,
    },
  });

  return { provider, cleaning, serviceRequest };
};

const seedMessaging = async (
  users: Awaited<ReturnType<typeof seedUsers>>,
  properties: Awaited<ReturnType<typeof seedProperties>>,
  roommateProfileId: string,
  marketplaceItemId: string,
  serviceRequestId: string,
) => {
  const propertyConversation = await prisma.conversation.upsert({
    where: { id: "seed-conversation-property" },
    update: {
      createdById: users.buyer.id,
      subject: "Offer details for Soweto townhouse",
      contextType: ConversationContextType.PROPERTY,
      contextId: properties.buyProperty.id,
      lastMessageAt: date("2026-04-20T09:05:00.000Z"),
    },
    create: {
      id: "seed-conversation-property",
      createdById: users.buyer.id,
      subject: "Offer details for Soweto townhouse",
      contextType: ConversationContextType.PROPERTY,
      contextId: properties.buyProperty.id,
      lastMessageAt: date("2026-04-20T09:05:00.000Z"),
    },
  });

  const roommateConversation = await prisma.conversation.upsert({
    where: { id: "seed-conversation-roommate" },
    update: {
      createdById: users.buyer.id,
      subject: "Room share in Rosebank",
      contextType: ConversationContextType.ROOMMATE,
      contextId: roommateProfileId,
      lastMessageAt: date("2026-04-18T14:05:00.000Z"),
    },
    create: {
      id: "seed-conversation-roommate",
      createdById: users.buyer.id,
      subject: "Room share in Rosebank",
      contextType: ConversationContextType.ROOMMATE,
      contextId: roommateProfileId,
      lastMessageAt: date("2026-04-18T14:05:00.000Z"),
    },
  });

  const marketplaceConversation = await prisma.conversation.upsert({
    where: { id: "seed-conversation-marketplace" },
    update: {
      createdById: users.buyer.id,
      subject: "Couch pickup details",
      contextType: ConversationContextType.MARKETPLACE_ITEM,
      contextId: marketplaceItemId,
      lastMessageAt: date("2026-04-22T16:10:00.000Z"),
    },
    create: {
      id: "seed-conversation-marketplace",
      createdById: users.buyer.id,
      subject: "Couch pickup details",
      contextType: ConversationContextType.MARKETPLACE_ITEM,
      contextId: marketplaceItemId,
      lastMessageAt: date("2026-04-22T16:10:00.000Z"),
    },
  });

  const serviceConversation = await prisma.conversation.upsert({
    where: { id: "seed-conversation-service" },
    update: {
      createdById: users.renter.id,
      subject: "Cleaning request follow-up",
      contextType: ConversationContextType.SERVICE,
      contextId: serviceRequestId,
      lastMessageAt: date("2026-04-24T07:35:00.000Z"),
    },
    create: {
      id: "seed-conversation-service",
      createdById: users.renter.id,
      subject: "Cleaning request follow-up",
      contextType: ConversationContextType.SERVICE,
      contextId: serviceRequestId,
      lastMessageAt: date("2026-04-24T07:35:00.000Z"),
    },
  });

  const participants = [
    {
      conversationId: propertyConversation.id,
      userId: users.buyer.id,
      lastReadAt: date("2026-04-20T09:05:00.000Z"),
    },
    {
      conversationId: propertyConversation.id,
      userId: users.agent.id,
      lastReadAt: date("2026-04-20T09:00:00.000Z"),
    },
    {
      conversationId: roommateConversation.id,
      userId: users.buyer.id,
      lastReadAt: date("2026-04-18T14:05:00.000Z"),
    },
    {
      conversationId: roommateConversation.id,
      userId: users.renter.id,
      lastReadAt: null,
    },
    {
      conversationId: marketplaceConversation.id,
      userId: users.buyer.id,
      lastReadAt: date("2026-04-22T16:10:00.000Z"),
    },
    {
      conversationId: marketplaceConversation.id,
      userId: users.owner.id,
      lastReadAt: null,
    },
    {
      conversationId: serviceConversation.id,
      userId: users.renter.id,
      lastReadAt: date("2026-04-24T07:35:00.000Z"),
    },
    {
      conversationId: serviceConversation.id,
      userId: users.provider.id,
      lastReadAt: null,
    },
  ];

  await Promise.all(
    participants.map((participant) =>
      prisma.conversationParticipant.upsert({
        where: {
          conversationId_userId: {
            conversationId: participant.conversationId,
            userId: participant.userId,
          },
        },
        update: {
          lastReadAt: participant.lastReadAt,
          archivedAt: null,
        },
        create: participant,
      }),
    ),
  );

  const messages = [
    {
      id: "seed-message-property-1",
      conversationId: propertyConversation.id,
      senderId: users.buyer.id,
      body: "Is the seller open to a transfer timeline under 45 days?",
      createdAt: date("2026-04-20T09:00:00.000Z"),
    },
    {
      id: "seed-message-property-2",
      conversationId: propertyConversation.id,
      senderId: users.agent.id,
      body: "Yes, they can accommodate a fast transfer for approved buyers.",
      createdAt: date("2026-04-20T09:05:00.000Z"),
    },
    {
      id: "seed-message-roommate-1",
      conversationId: roommateConversation.id,
      senderId: users.buyer.id,
      body: "Are you open to sharing with someone who works hybrid?",
      createdAt: date("2026-04-18T14:00:00.000Z"),
    },
    {
      id: "seed-message-roommate-2",
      conversationId: roommateConversation.id,
      senderId: users.renter.id,
      body: "Yes, hybrid work is fine as long as the space stays respectful.",
      createdAt: date("2026-04-18T14:05:00.000Z"),
    },
    {
      id: "seed-message-marketplace-1",
      conversationId: marketplaceConversation.id,
      senderId: users.buyer.id,
      body: "Can I collect the couch on Saturday afternoon?",
      createdAt: date("2026-04-22T16:00:00.000Z"),
    },
    {
      id: "seed-message-marketplace-2",
      conversationId: marketplaceConversation.id,
      senderId: users.owner.id,
      body: "Saturday works. I can share the exact pickup pin in the morning.",
      createdAt: date("2026-04-22T16:10:00.000Z"),
    },
    {
      id: "seed-message-service-1",
      conversationId: serviceConversation.id,
      senderId: users.renter.id,
      body: "Can the cleaning team arrive before 8am?",
      createdAt: date("2026-04-24T07:30:00.000Z"),
    },
    {
      id: "seed-message-service-2",
      conversationId: serviceConversation.id,
      senderId: users.provider.id,
      body: "Yes, we can be onsite by 7:30am.",
      createdAt: date("2026-04-24T07:35:00.000Z"),
    },
  ];

  await Promise.all(
    messages.map((message) =>
      prisma.message.upsert({
        where: { id: message.id },
        update: {
          conversationId: message.conversationId,
          senderId: message.senderId,
          body: message.body,
          createdAt: message.createdAt,
          type: "TEXT",
        },
        create: {
          ...message,
          type: "TEXT",
        },
      }),
    ),
  );
};

const seedArticleCategories = async () => {
  return Promise.all(
    articleCategories.map((category) =>
      prisma.articleCategory.upsert({
        where: { code: category.code },
        update: {
          name: category.name,
          slug: category.slug,
        },
        create: category,
      }),
    ),
  );
};

const seedEditorialContent = async (
  users: Awaited<ReturnType<typeof seedUsers>>,
) => {
  const categories = await seedArticleCategories();

  const categoryByCode = new Map(categories.map((category) => [category.code, category]));

  const propertyAdviceCategory = categoryByCode.get(
    ArticleCategoryCode.PROPERTY_ADVICE,
  );
  const rentingGuideCategory = categoryByCode.get(
    ArticleCategoryCode.RENTING_GUIDE,
  );
  const neighbourhoodCategory = categoryByCode.get(
    ArticleCategoryCode.NEIGHBOURHOOD,
  );

  if (!propertyAdviceCategory || !rentingGuideCategory || !neighbourhoodCategory) {
    throw new Error("[db seed] Expected article categories to exist");
  }

  const articles = [
    {
      slug: "seed-first-time-buyer-checklist",
      title: "First-time buyer checklist for township and city listings",
      summary: "A practical checklist for evaluating affordability, documents, and location.",
      content:
        "Use this guide to compare property finance readiness, supporting documents, legal checks, and neighbourhood fit before making an offer.",
      categoryId: propertyAdviceCategory.id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: date("2026-04-08T00:00:00.000Z"),
    },
    {
      slug: "seed-renting-before-move-in",
      title: "What to confirm before move-in day",
      summary: "A renter-focused guide to deposits, inspections, and service bookings.",
      content:
        "This guide covers lease review, snag lists, utilities, move-in cleaning, and transport planning so tenants can move with fewer surprises.",
      categoryId: rentingGuideCategory.id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: date("2026-04-14T00:00:00.000Z"),
    },
    {
      slug: "seed-neighbourhood-watchlist",
      title: "Neighbourhood signals worth checking before you commit",
      summary: "What transport, safety, and amenities data can tell you about an area.",
      content:
        "Compare commute routes, school access, service quality, and late-night activity levels when choosing where to live next.",
      categoryId: neighbourhoodCategory.id,
      status: ArticleStatus.DRAFT,
      publishedAt: null,
    },
  ];

  await Promise.all(
    articles.map((article) =>
      prisma.article.upsert({
        where: { slug: article.slug },
        update: {
          categoryId: article.categoryId,
          authorId: users.admin.id,
          title: article.title,
          summary: article.summary,
          content: article.content,
          coverImageUrl: `https://images.kasistay.local/articles/${article.slug}.jpg`,
          status: article.status,
          publishedAt: article.publishedAt,
        },
        create: {
          ...article,
          authorId: users.admin.id,
          coverImageUrl: `https://images.kasistay.local/articles/${article.slug}.jpg`,
        },
      }),
    ),
  );

  await Promise.all(
    staticPages.map((page) =>
      prisma.staticPage.upsert({
        where: { slug: page.slug },
        update: {
          type: page.type,
          title: page.title,
          summary: page.summary,
          content: page.content,
          status: StaticPageStatus.PUBLISHED,
          publishedAt: date("2026-04-01T00:00:00.000Z"),
          createdById: users.admin.id,
        },
        create: {
          ...page,
          status: StaticPageStatus.PUBLISHED,
          publishedAt: date("2026-04-01T00:00:00.000Z"),
          createdById: users.admin.id,
        },
      }),
    ),
  );

  await prisma.staticPage.upsert({
    where: { slug: "community-guidelines" },
    update: {
      type: StaticPageType.CUSTOM,
      title: "Community Guidelines",
      summary: "How users should engage across listings and messaging.",
      content:
        "Respectful communication, truthful listings, and timely responses help keep Kasi Stay useful for everyone.",
      status: StaticPageStatus.DRAFT,
      publishedAt: null,
      createdById: users.admin.id,
    },
    create: {
      slug: "community-guidelines",
      type: StaticPageType.CUSTOM,
      title: "Community Guidelines",
      summary: "How users should engage across listings and messaging.",
      content:
        "Respectful communication, truthful listings, and timely responses help keep Kasi Stay useful for everyone.",
      status: StaticPageStatus.DRAFT,
      createdById: users.admin.id,
    },
  });
};

const seedCareerAndProfessionalContent = async (
  users: Awaited<ReturnType<typeof seedUsers>>,
) => {
  const careerPost = await prisma.careerPost.upsert({
    where: { slug: "seed-community-field-agent" },
    update: {
      title: "Community Field Agent",
      summary: "Support onboarding, listing quality, and market coverage in growth areas.",
      description:
        "Kasi Stay is hiring a field agent to support partner onboarding, listing verification, and market feedback loops.",
      location: "Johannesburg",
      employmentType: "Full-time",
      status: CareerPostStatus.PUBLISHED,
      publishedAt: date("2026-04-07T00:00:00.000Z"),
      createdById: users.admin.id,
    },
    create: {
      slug: "seed-community-field-agent",
      title: "Community Field Agent",
      summary: "Support onboarding, listing quality, and market coverage in growth areas.",
      description:
        "Kasi Stay is hiring a field agent to support partner onboarding, listing verification, and market feedback loops.",
      location: "Johannesburg",
      employmentType: "Full-time",
      status: CareerPostStatus.PUBLISHED,
      publishedAt: date("2026-04-07T00:00:00.000Z"),
      createdById: users.admin.id,
    },
  });

  await prisma.careerPost.upsert({
    where: { slug: "seed-content-marketer" },
    update: {
      title: "Content Marketer",
      summary: "Own guides, neighbourhood content, and editorial campaigns.",
      description:
        "This role focuses on SEO, editorial planning, creator partnerships, and campaign measurement.",
      location: "Remote",
      employmentType: "Contract",
      status: CareerPostStatus.ARCHIVED,
      publishedAt: date("2026-03-01T00:00:00.000Z"),
      createdById: users.admin.id,
    },
    create: {
      slug: "seed-content-marketer",
      title: "Content Marketer",
      summary: "Own guides, neighbourhood content, and editorial campaigns.",
      description:
        "This role focuses on SEO, editorial planning, creator partnerships, and campaign measurement.",
      location: "Remote",
      employmentType: "Contract",
      status: CareerPostStatus.ARCHIVED,
      publishedAt: date("2026-03-01T00:00:00.000Z"),
      createdById: users.admin.id,
    },
  });

  await prisma.jobApplication.upsert({
    where: { id: "seed-job-application-field-agent" },
    update: {
      careerPostId: careerPost.id,
      userId: users.buyer.id,
      fullName: users.buyer.name,
      email: users.buyer.email,
      phone: users.buyer.phone,
      coverLetter:
        "I have five years of community sales experience and strong local market knowledge.",
      resumeUrl: "https://docs.kasistay.local/careers/sipho-buyer-cv.pdf",
    },
    create: {
      id: "seed-job-application-field-agent",
      careerPostId: careerPost.id,
      userId: users.buyer.id,
      fullName: users.buyer.name,
      email: users.buyer.email,
      phone: users.buyer.phone,
      coverLetter:
        "I have five years of community sales experience and strong local market knowledge.",
      resumeUrl: "https://docs.kasistay.local/careers/sipho-buyer-cv.pdf",
    },
  });

  await prisma.agentApplication.upsert({
    where: { id: "seed-agent-application" },
    update: {
      userId: users.renter.id,
      phone: users.renter.phone,
      city: "Johannesburg",
      experience: "2 years of leasing support and neighbourhood activations.",
      licenseNumber: "FFC-SEED-001",
      motivation:
        "I want to onboard local landlords and help improve tenant matching quality.",
      status: ApplicationReviewStatus.PENDING,
      rejectionReason: null,
      reviewedById: null,
      reviewedAt: null,
    },
    create: {
      id: "seed-agent-application",
      userId: users.renter.id,
      phone: users.renter.phone,
      city: "Johannesburg",
      experience: "2 years of leasing support and neighbourhood activations.",
      licenseNumber: "FFC-SEED-001",
      motivation:
        "I want to onboard local landlords and help improve tenant matching quality.",
      status: ApplicationReviewStatus.PENDING,
    },
  });

  await prisma.agencyAdvertisingRequest.upsert({
    where: { id: "seed-agency-ad-request" },
    update: {
      userId: users.owner.id,
      agencyName: "Kasi Stay Premier Realty",
      contactEmail: users.owner.email,
      contactPhone: users.owner.phone,
      websiteUrl: "https://premier-realty.kasistay.local",
      budget: "R15,000 monthly",
      message: "We want homepage exposure and more qualified buy leads.",
      status: ApplicationReviewStatus.PENDING,
      rejectionReason: null,
      reviewedById: null,
      reviewedAt: null,
    },
    create: {
      id: "seed-agency-ad-request",
      userId: users.owner.id,
      agencyName: "Kasi Stay Premier Realty",
      contactEmail: users.owner.email,
      contactPhone: users.owner.phone,
      websiteUrl: "https://premier-realty.kasistay.local",
      budget: "R15,000 monthly",
      message: "We want homepage exposure and more qualified buy leads.",
      status: ApplicationReviewStatus.PENDING,
    },
  });
};

const seedAttorneyProfiles = async (
  users: Awaited<ReturnType<typeof seedUsers>>,
) => {
  await prisma.attorneyProfile.upsert({
    where: { slug: "seed-khumalo-property-law" },
    update: {
      name: "Themba Khumalo",
      firmName: "Khumalo Property Law",
      description:
        "Conveyancing and transfer support for buyers, sellers, and developers.",
      city: "Johannesburg",
      email: "thembakhumalo@kasistay.local",
      phone: "+27 11 000 9000",
      websiteUrl: "https://khumalo-law.kasistay.local",
      imageUrl: "https://images.kasistay.local/attorneys/khumalo.jpg",
      status: AttorneyProfileStatus.PUBLISHED,
      publishedAt: date("2026-04-05T00:00:00.000Z"),
      createdById: users.admin.id,
    },
    create: {
      slug: "seed-khumalo-property-law",
      name: "Themba Khumalo",
      firmName: "Khumalo Property Law",
      description:
        "Conveyancing and transfer support for buyers, sellers, and developers.",
      city: "Johannesburg",
      email: "thembakhumalo@kasistay.local",
      phone: "+27 11 000 9000",
      websiteUrl: "https://khumalo-law.kasistay.local",
      imageUrl: "https://images.kasistay.local/attorneys/khumalo.jpg",
      status: AttorneyProfileStatus.PUBLISHED,
      publishedAt: date("2026-04-05T00:00:00.000Z"),
      createdById: users.admin.id,
    },
  });
};

const seedNotificationsAndContact = async (
  users: Awaited<ReturnType<typeof seedUsers>>,
  properties: Awaited<ReturnType<typeof seedProperties>>,
  roommateProfileId: string,
  marketplaceItemId: string,
) => {
  const notifications = [
    {
      id: "seed-notification-message-roommate",
      userId: users.renter.id,
      type: "NEW_MESSAGE",
      title: "New roommate message",
      body: "Sipho Buyer sent you a message about sharing in Rosebank.",
      metadata: json({
        contextType: ConversationContextType.ROOMMATE,
        entityId: roommateProfileId,
      }),
    },
    {
      id: "seed-notification-message-marketplace",
      userId: users.owner.id,
      type: "NEW_MESSAGE",
      title: "New marketplace enquiry",
      body: "Sipho Buyer asked about couch pickup timing.",
      metadata: json({
        contextType: ConversationContextType.MARKETPLACE_ITEM,
        entityId: marketplaceItemId,
      }),
    },
    {
      id: "seed-notification-service-update",
      userId: users.renter.id,
      type: "SERVICE_REQUEST_UPDATE",
      title: "Service request accepted",
      body: "MoveFast Home Services accepted your cleaning request.",
      metadata: json({
        requestId: "seed-service-request-cleaning",
        status: ServiceRequestStatus.ACCEPTED,
      }),
    },
    {
      id: "seed-notification-agent-application",
      userId: users.renter.id,
      type: "AGENT_APPLICATION_STATUS",
      title: "Agent application received",
      body: "Your professional application is pending review.",
      metadata: json({
        applicationId: "seed-agent-application",
        status: ApplicationReviewStatus.PENDING,
      }),
    },
    {
      id: "seed-notification-viewing",
      userId: users.renter.id,
      type: "VIEWING_CONFIRMED",
      title: "Viewing confirmed",
      body: "Your Midrand studio viewing is confirmed for Saturday at 11:00.",
      metadata: json({
        propertyId: properties.rentProperty.id,
        viewingId: "seed-viewing-rent",
      }),
    },
  ];

  await Promise.all(
    notifications.map((notification) =>
      prisma.notification.upsert({
        where: { id: notification.id },
        update: notification,
        create: notification,
      }),
    ),
  );

  await prisma.contactMessage.upsert({
    where: { id: "seed-contact-message" },
    update: {
      userId: users.buyer.id,
      name: users.buyer.name,
      email: users.buyer.email,
      phone: users.buyer.phone,
      subject: "Partnership enquiry",
      message:
        "I would like to know more about buying through listed partner agencies.",
      status: ContactMessageStatus.NEW,
    },
    create: {
      id: "seed-contact-message",
      userId: users.buyer.id,
      name: users.buyer.name,
      email: users.buyer.email,
      phone: users.buyer.phone,
      subject: "Partnership enquiry",
      message:
        "I would like to know more about buying through listed partner agencies.",
      status: ContactMessageStatus.NEW,
    },
  });
};

const seedAgentMonetisation = async (
  users: Awaited<ReturnType<typeof seedUsers>>,
  plans: Awaited<ReturnType<typeof seedSubscriptionPlans>>,
  properties: Awaited<ReturnType<typeof seedProperties>>,
) => {
  await prisma.agentSubscription.upsert({
    where: { id: "seed-agent-subscription" },
    update: {
      agentId: users.agent.id,
      planId: plans.growthPlan.id,
      startsAt: date("2026-04-01T00:00:00.000Z"),
      expiresAt: date("2026-05-01T00:00:00.000Z"),
      isActive: true,
    },
    create: {
      id: "seed-agent-subscription",
      agentId: users.agent.id,
      planId: plans.growthPlan.id,
      startsAt: date("2026-04-01T00:00:00.000Z"),
      expiresAt: date("2026-05-01T00:00:00.000Z"),
      isActive: true,
    },
  });

  await prisma.listingBoost.upsert({
    where: { id: "seed-listing-boost" },
    update: {
      propertyId: properties.buyProperty.id,
      agentId: users.agent.id,
      type: ListingBoostType.FEATURED,
      startsAt: date("2026-04-15T00:00:00.000Z"),
      expiresAt: date("2026-05-15T00:00:00.000Z"),
    },
    create: {
      id: "seed-listing-boost",
      propertyId: properties.buyProperty.id,
      agentId: users.agent.id,
      type: ListingBoostType.FEATURED,
      startsAt: date("2026-04-15T00:00:00.000Z"),
      expiresAt: date("2026-05-15T00:00:00.000Z"),
    },
  });
};

const main = async () => {
  const users = await seedUsers();
  const amenities = await seedAmenities();
  const agency = await seedAgency(users);
  const plans = await seedSubscriptionPlans();
  const properties = await seedProperties(users, agency.id, amenities);
  const { couch } = await seedMarketplace(users);
  const { roommateProfile } = await seedRoommates(users);
  const { serviceRequest } = await seedServices(users);

  await seedMessaging(
    users,
    properties,
    roommateProfile.id,
    couch.id,
    serviceRequest.id,
  );
  await seedAttorneyProfiles(users);
  await seedEditorialContent(users);
  await seedCareerAndProfessionalContent(users);
  await seedNotificationsAndContact(
    users,
    properties,
    roommateProfile.id,
    couch.id,
  );
  await seedAgentMonetisation(users, plans, properties);

  console.info("[db seed] Seeded demo data across core and Kasi Stay modules.");
};

await main()
  .catch((error) => {
    console.error("[db seed] Failed to seed database", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
