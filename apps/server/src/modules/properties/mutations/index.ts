import {
  BuyOwnerType,
  CommissionPaidBy,
  Furnishing,
  ListingType,
  MaintenanceBy,
  OccupancyStatus,
  OwnershipType,
  PriceFrequency,
  PropertyDocumentType,
  PropertyMediaType,
  PropertyStatus,
  PropertyType,
  SellerType,
  TenantPreference,
} from "@kasistay/db";
import type { Prisma } from "@kasistay/db";
import { Context } from "../../../app/context";
import { slugify } from "../../../utils/slugify";
import { badInput, notFound, unauthorized } from "../../../utils/errors";
import { getPropertyDefaultPriceFrequency, propertyInclude } from "../queries";

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

const requireManagerRole = (ctx: Context): void => {
  if (!(ctx.isAdmin || ctx.isAgent || ctx.isOwner)) {
    unauthorized();
  }
};

const generateUniqueSlug = async (
  title: string,
  ctx: Context,
  transaction?: Prisma.TransactionClient,
) => {
  const db = transaction ?? ctx.prisma;
  const base = slugify(title);
  let candidate = `${base}-${Math.random().toString(36).slice(2, 8)}`;

  while (await db.property.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${Math.random().toString(36).slice(2, 8)}`;
  }

  return candidate;
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

  const managedProperty = property!;

  if (ctx.isAdmin) {
    return managedProperty;
  }

  const userId = ctx.assertAuth().id;
  if (
    managedProperty.agentId !== userId &&
    managedProperty.agency?.ownerId !== userId
  ) {
    unauthorized();
  }

  return managedProperty;
};

const mapLocationInput = (
  location:
    | {
        address: string;
        city: string;
        state?: string | null;
        country: string;
        postalCode?: string | null;
        latitude?: number | null;
        longitude?: number | null;
        neighborhood?: string | null;
        geoJson?: string | null;
      }
    | null
    | undefined,
) => {
  if (!location) return undefined;

  return {
    address: location.address,
    city: location.city,
    state: location.state ?? null,
    country: location.country,
    postalCode: location.postalCode ?? null,
    latitude: location.latitude ?? null,
    longitude: location.longitude ?? null,
    neighborhood: location.neighborhood ?? null,
    ...(location.geoJson
      ? { geoJson: JSON.parse(location.geoJson) as Prisma.InputJsonValue }
      : {}),
  };
};

const mapMediaInputs = (
  media:
    | Array<{
        url: string;
        type?: string | null;
        order?: number | null;
        isPrimary?: boolean | null;
      }>
    | null
    | undefined,
) => {
  if (!media?.length) return undefined;

  return media.map((item, index) => ({
    url: item.url,
    type: parseEnum(PropertyMediaType, item.type ?? undefined, "media type") ??
      PropertyMediaType.IMAGE,
    order: item.order ?? index,
    isPrimary: item.isPrimary ?? index === 0,
  }));
};

const mapDocumentInputs = (
  documents:
    | Array<{
        url: string;
        type?: string | null;
        label?: string | null;
      }>
    | null
    | undefined,
) => {
  if (!documents?.length) return undefined;

  return documents.map((item) => ({
    url: item.url,
    type:
      parseEnum(
        PropertyDocumentType,
        item.type ?? undefined,
        "document type",
      ) ?? PropertyDocumentType.OTHER,
    label: item.label ?? null,
  }));
};

export const createProperty = async (
  input: {
    title: string;
    description?: string | null;
    listingType: string;
    propertyType: string;
    price?: number | null;
    currency?: string | null;
    priceFrequency?: string | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    parkingSpaces?: number | null;
    builtUpArea?: number | null;
    plotArea?: number | null;
    floorNumber?: number | null;
    totalFloors?: number | null;
    yearBuilt?: number | null;
    furnishing?: string | null;
    occupancyStatus?: string | null;
    availableFrom?: Date | null;
    agentId?: string | null;
    agencyId?: string | null;
    permitNumber?: string | null;
    expiresAt?: Date | null;
    location?: Parameters<typeof mapLocationInput>[0];
    media?: Parameters<typeof mapMediaInputs>[0];
    documents?: Parameters<typeof mapDocumentInputs>[0];
    amenityIds?: Array<string> | null;
  },
  ctx: Context,
) => {
  requireManagerRole(ctx);
  const sessionUser = ctx.assertAuth();
  const listingType = parseEnum(ListingType, input.listingType, "listing type");
  const propertyType = parseEnum(
    PropertyType,
    input.propertyType,
    "property type",
  );

  if (!listingType || !propertyType) {
    badInput("Property listing type and property type are required");
  }

  const resolvedListingType = listingType!;
  const resolvedPropertyType = propertyType!;

  return ctx.prisma.$transaction(async (tx) => {
    const slug = await generateUniqueSlug(input.title, ctx, tx);
    const media = mapMediaInputs(input.media);
    const documents = mapDocumentInputs(input.documents);
    const location = mapLocationInput(input.location);

    const property = await tx.property.create({
      data: {
        title: input.title,
        slug,
        description: input.description ?? null,
        listingType: resolvedListingType,
        propertyType: resolvedPropertyType,
        price: input.price ?? null,
        currency: input.currency ?? "ZAR",
        priceFrequency:
          parseEnum(
            PriceFrequency,
            input.priceFrequency ?? undefined,
            "price frequency",
          ) ?? getPropertyDefaultPriceFrequency(resolvedListingType),
        bedrooms: input.bedrooms ?? null,
        bathrooms: input.bathrooms ?? null,
        parkingSpaces: input.parkingSpaces ?? null,
        builtUpArea: input.builtUpArea ?? null,
        plotArea: input.plotArea ?? null,
        floorNumber: input.floorNumber ?? null,
        totalFloors: input.totalFloors ?? null,
        yearBuilt: input.yearBuilt ?? null,
        furnishing: input.furnishing
          ? parseEnum(Furnishing, input.furnishing, "furnishing")
          : null,
        occupancyStatus: input.occupancyStatus
          ? parseEnum(
              OccupancyStatus,
              input.occupancyStatus,
              "occupancy status",
            )
          : null,
        availableFrom: input.availableFrom ?? null,
        permitNumber: input.permitNumber ?? null,
        expiresAt: input.expiresAt ?? null,
        ...((ctx.isAgent && !input.agentId) || input.agentId
          ? {
              agent: {
                connect: {
                  id:
                    (ctx.isAgent && !input.agentId
                      ? sessionUser.id
                      : input.agentId)!,
                },
              },
            }
          : {}),
        ...(input.agencyId
          ? {
              agency: {
                connect: { id: input.agencyId },
              },
            }
          : {}),
        ...(location && {
          location: {
            create: location,
          },
        }),
        ...(media && {
          media: {
            create: media,
          },
        }),
        ...(documents && {
          documents: {
            create: documents,
          },
        }),
        ...(input.amenityIds?.length && {
          amenities: {
            create: input.amenityIds.map((amenityId) => ({
              amenity: {
                connect: { id: String(amenityId) },
              },
            })),
          },
        }),
      },
    });

    if (resolvedListingType === ListingType.BUY) {
      await tx.buyDetail.create({
        data: { propertyId: property.id },
      });
    }

    if (resolvedListingType === ListingType.RENT) {
      await tx.rentDetail.create({
        data: { propertyId: property.id },
      });
    }

    if (resolvedListingType === ListingType.SELL) {
      const sellDetail = await tx.sellDetail.create({
        data: { propertyId: property.id },
      });

      if (input.price != null) {
        await tx.priceHistory.create({
          data: {
            propertyId: property.id,
            sellDetailId: sellDetail.id,
            price: input.price,
          },
        });
      }
    }

    return tx.property.findUnique({
      where: { id: property.id },
      include: propertyInclude,
    });
  });
};

export const updateProperty = async (
  propertyId: string,
  input: {
    title?: string | null;
    description?: string | null;
    propertyType?: string | null;
    price?: number | null;
    currency?: string | null;
    priceFrequency?: string | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    parkingSpaces?: number | null;
    builtUpArea?: number | null;
    plotArea?: number | null;
    floorNumber?: number | null;
    totalFloors?: number | null;
    yearBuilt?: number | null;
    furnishing?: string | null;
    occupancyStatus?: string | null;
    availableFrom?: Date | null;
    agentId?: string | null;
    agencyId?: string | null;
    permitNumber?: string | null;
    expiresAt?: Date | null;
    location?: Parameters<typeof mapLocationInput>[0];
    media?: Parameters<typeof mapMediaInputs>[0];
    documents?: Parameters<typeof mapDocumentInputs>[0];
    amenityIds?: Array<string> | null;
  },
  ctx: Context,
) => {
  return ctx.prisma.$transaction(async (tx) => {
    const current = await assertCanManageProperty(propertyId, ctx, tx);
    const existingProperty = current!;
    const nextSlug =
      input.title && input.title !== existingProperty.title
        ? await generateUniqueSlug(input.title, ctx, tx)
        : undefined;

    const media = mapMediaInputs(input.media);
    const documents = mapDocumentInputs(input.documents);
    const location = mapLocationInput(input.location);

    const property = await tx.property.update({
      where: { id: propertyId },
      data: {
        ...(input.title != null && { title: input.title, slug: nextSlug }),
        ...(input.description != null && { description: input.description }),
        ...(input.propertyType && {
          propertyType: parseEnum(
            PropertyType,
            input.propertyType,
            "property type",
          ),
        }),
        ...(input.price != null && { price: input.price }),
        ...(input.currency != null && { currency: input.currency }),
        ...(input.priceFrequency && {
          priceFrequency: parseEnum(
            PriceFrequency,
            input.priceFrequency,
            "price frequency",
          ),
        }),
        ...(input.bedrooms != null && { bedrooms: input.bedrooms }),
        ...(input.bathrooms != null && { bathrooms: input.bathrooms }),
        ...(input.parkingSpaces != null && {
          parkingSpaces: input.parkingSpaces,
        }),
        ...(input.builtUpArea != null && { builtUpArea: input.builtUpArea }),
        ...(input.plotArea != null && { plotArea: input.plotArea }),
        ...(input.floorNumber != null && { floorNumber: input.floorNumber }),
        ...(input.totalFloors != null && { totalFloors: input.totalFloors }),
        ...(input.yearBuilt != null && { yearBuilt: input.yearBuilt }),
        ...(input.availableFrom != null && {
          availableFrom: input.availableFrom,
        }),
        ...(input.permitNumber != null && { permitNumber: input.permitNumber }),
        ...(input.expiresAt != null && { expiresAt: input.expiresAt }),
        ...(input.furnishing && {
          furnishing: parseEnum(Furnishing, input.furnishing, "furnishing"),
        }),
        ...(input.occupancyStatus && {
          occupancyStatus: parseEnum(
            OccupancyStatus,
            input.occupancyStatus,
            "occupancy status",
          ),
        }),
        ...(input.agentId != null && {
          agent: input.agentId
            ? { connect: { id: input.agentId } }
            : { disconnect: true },
        }),
        ...(input.agencyId != null && {
          agency: input.agencyId
            ? { connect: { id: input.agencyId } }
            : { disconnect: true },
        }),
        ...(location && {
          location: {
            upsert: {
              create: location,
              update: location,
            },
          },
        }),
        ...(media && {
          media: {
            deleteMany: {},
            create: media,
          },
        }),
        ...(documents && {
          documents: {
            deleteMany: {},
            create: documents,
          },
        }),
        ...(input.amenityIds && {
          amenities: {
            deleteMany: {},
            create: input.amenityIds.map((amenityId) => ({
              amenity: {
                connect: { id: String(amenityId) },
              },
            })),
          },
        }),
      },
    });

    if (
      input.price != null &&
      existingProperty.price?.toString() !== input.price.toString() &&
      existingProperty.listingType === ListingType.SELL
    ) {
      const sellDetail = await tx.sellDetail.findUnique({
        where: { propertyId },
      });

      await tx.priceHistory.create({
        data: {
          propertyId,
          sellDetailId: sellDetail?.id ?? null,
          price: input.price,
        },
      });
    }

    return tx.property.findUnique({
      where: { id: property.id },
      include: propertyInclude,
    });
  });
};

export const deleteProperty = async (
  propertyId: string,
  ctx: Context,
) => {
  await assertCanManageProperty(propertyId, ctx);
  return ctx.prisma.property.delete({
    where: { id: propertyId },
    include: propertyInclude,
  });
};

export const publishProperty = async (
  propertyId: string,
  ctx: Context,
) => {
  const property = await assertCanManageProperty(propertyId, ctx);
  const managedProperty = property!;
  const [location, imageCount] = await Promise.all([
    ctx.prisma.location.findUnique({ where: { propertyId } }),
    ctx.prisma.propertyMedia.count({
      where: { propertyId, type: PropertyMediaType.IMAGE },
    }),
  ]);

  if (managedProperty.price == null) {
    badInput("A price is required before publishing");
  }

  if (!location) {
    badInput("A property location is required before publishing");
  }

  if (imageCount < 1) {
    badInput("At least one image is required before publishing");
  }

  return ctx.prisma.property.update({
    where: { id: propertyId },
    include: propertyInclude,
    data: {
      status: PropertyStatus.PUBLISHED,
    },
  });
};

export const archiveProperty = async (
  propertyId: string,
  ctx: Context,
) => {
  await assertCanManageProperty(propertyId, ctx);
  return ctx.prisma.property.update({
    where: { id: propertyId },
    include: propertyInclude,
    data: {
      status: PropertyStatus.ARCHIVED,
    },
  });
};

export const duplicateProperty = async (
  propertyId: string,
  ctx: Context,
) => {
  return ctx.prisma.$transaction(async (tx) => {
    const property = await assertCanManageProperty(propertyId, ctx, tx);
    const full = await tx.property.findUnique({
      where: { id: property.id },
      include: {
        location: true,
        media: true,
        documents: true,
        amenities: true,
        buyDetail: true,
        rentDetail: true,
        sellDetail: true,
      },
    });

    if (!full) {
      notFound("Property not found");
    }

    const source = full!;

    const duplicate = await tx.property.create({
      data: {
        title: `${source.title} Copy`,
        slug: await generateUniqueSlug(`${source.title} copy`, ctx, tx),
        description: source.description,
        status: PropertyStatus.DRAFT,
        listingType: source.listingType,
        propertyType: source.propertyType,
        price: source.price,
        currency: source.currency,
        priceFrequency: source.priceFrequency,
        bedrooms: source.bedrooms,
        bathrooms: source.bathrooms,
        parkingSpaces: source.parkingSpaces,
        builtUpArea: source.builtUpArea,
        plotArea: source.plotArea,
        floorNumber: source.floorNumber,
        totalFloors: source.totalFloors,
        yearBuilt: source.yearBuilt,
        furnishing: source.furnishing,
        occupancyStatus: source.occupancyStatus,
        availableFrom: source.availableFrom,
        permitNumber: source.permitNumber,
        expiresAt: source.expiresAt,
        ...(source.agentId
          ? {
              agent: {
                connect: { id: source.agentId },
              },
            }
          : {}),
        ...(source.agencyId
          ? {
              agency: {
                connect: { id: source.agencyId },
              },
            }
          : {}),
        ...(source.location && {
          location: {
            create: {
              address: source.location.address,
              city: source.location.city,
              state: source.location.state,
              country: source.location.country,
              postalCode: source.location.postalCode,
              latitude: source.location.latitude,
              longitude: source.location.longitude,
              neighborhood: source.location.neighborhood,
              ...(source.location.geoJson != null
                ? { geoJson: source.location.geoJson as Prisma.InputJsonValue }
                : {}),
            },
          },
        }),
        ...(source.media.length > 0 && {
          media: {
            create: source.media.map((item) => ({
              url: item.url,
              type: item.type,
              order: item.order,
              isPrimary: item.isPrimary,
            })),
          },
        }),
        ...(source.documents.length > 0 && {
          documents: {
            create: source.documents.map((item) => ({
              url: item.url,
              type: item.type,
              label: item.label,
            })),
          },
        }),
        ...(source.amenities.length > 0 && {
          amenities: {
            create: source.amenities.map((item) => ({
              amenity: {
                connect: { id: item.amenityId },
              },
            })),
          },
        }),
      },
    });

    if (source.buyDetail) {
      await tx.buyDetail.create({
        data: {
          propertyId: duplicate.id,
          ownership: source.buyDetail.ownership,
          ownerType: source.buyDetail.ownerType,
          isDeveloper: source.buyDetail.isDeveloper,
          developerName: source.buyDetail.developerName,
          projectName: source.buyDetail.projectName,
          handoverDate: source.buyDetail.handoverDate,
          registrationInfo: source.buyDetail.registrationInfo,
          titleDeedVerified: source.buyDetail.titleDeedVerified,
          roi: source.buyDetail.roi,
        },
      });
    }

    if (source.rentDetail) {
      await tx.rentDetail.create({
        data: {
          propertyId: duplicate.id,
          depositAmount: source.rentDetail.depositAmount,
          minLeaseTerm: source.rentDetail.minLeaseTerm,
          tenantPreference: source.rentDetail.tenantPreference,
          petsAllowed: source.rentDetail.petsAllowed,
          utilitiesIncluded: source.rentDetail.utilitiesIncluded,
          chillerIncluded: source.rentDetail.chillerIncluded,
          cheques: source.rentDetail.cheques,
          maintenanceBy: source.rentDetail.maintenanceBy,
        },
      });
    }

    if (source.sellDetail) {
      await tx.sellDetail.create({
        data: {
          propertyId: duplicate.id,
          sellerType: source.sellDetail.sellerType,
          isOffMarket: source.sellDetail.isOffMarket,
          commissionPaidBy: source.sellDetail.commissionPaidBy,
          inspectionStatus: source.sellDetail.inspectionStatus,
        },
      });
    }

    return tx.property.findUnique({
      where: { id: duplicate.id },
      include: propertyInclude,
    });
  });
};

export const trackPropertyView = async (
  propertyId: string,
  ctx: Context,
) => {
  const existing = await ctx.prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });

  if (!existing) {
    notFound("Property not found");
  }

  return ctx.prisma.property.update({
    where: { id: propertyId },
    include: propertyInclude,
    data: {
      views: {
        increment: 1,
      },
    },
  });
};

export const upsertBuyDetail = async (
  propertyId: string,
  input: {
    ownership?: string | null;
    ownerType?: string | null;
    isDeveloper?: boolean | null;
    developerName?: string | null;
    projectName?: string | null;
    handoverDate?: Date | null;
    registrationInfo?: string | null;
    titleDeedVerified?: boolean | null;
    roi?: number | null;
  },
  ctx: Context,
) => {
  await assertCanManageProperty(propertyId, ctx);
  return ctx.prisma.buyDetail.upsert({
    where: { propertyId },
    include: {
      paymentPlan: {
        include: {
          installments: true,
        },
      },
    },
    create: {
      propertyId,
      ownership: parseEnum(OwnershipType, input.ownership ?? undefined, "ownership"),
      ownerType: parseEnum(BuyOwnerType, input.ownerType ?? undefined, "owner type"),
      isDeveloper: input.isDeveloper ?? false,
      developerName: input.developerName ?? null,
      projectName: input.projectName ?? null,
      handoverDate: input.handoverDate ?? null,
      registrationInfo: input.registrationInfo ?? null,
      titleDeedVerified: input.titleDeedVerified ?? false,
      roi: input.roi ?? null,
    },
    update: {
      ...(input.ownership != null && {
        ownership: parseEnum(OwnershipType, input.ownership, "ownership"),
      }),
      ...(input.ownerType != null && {
        ownerType: parseEnum(BuyOwnerType, input.ownerType, "owner type"),
      }),
      ...(input.isDeveloper != null && { isDeveloper: input.isDeveloper }),
      ...(input.developerName != null && { developerName: input.developerName }),
      ...(input.projectName != null && { projectName: input.projectName }),
      ...(input.handoverDate != null && { handoverDate: input.handoverDate }),
      ...(input.registrationInfo != null && {
        registrationInfo: input.registrationInfo,
      }),
      ...(input.titleDeedVerified != null && {
        titleDeedVerified: input.titleDeedVerified,
      }),
      ...(input.roi != null && { roi: input.roi }),
    },
  });
};

export const upsertPaymentPlan = async (
  propertyId: string,
  input: {
    installments: Array<{
      dueDate: Date;
      amount: number;
      percentage?: number | null;
      label?: string | null;
    }>;
  },
  ctx: Context,
) => {
  await assertCanManageProperty(propertyId, ctx);
  const buyDetail = await ctx.prisma.buyDetail.findUnique({
    where: { propertyId },
  });

  if (!buyDetail) {
    badInput("Buy detail does not exist for this property");
  }

  const existingBuyDetail = buyDetail!;

  return ctx.prisma.paymentPlan.upsert({
    where: { buyDetailId: existingBuyDetail.id },
    include: {
      installments: true,
    },
    create: {
      buyDetailId: existingBuyDetail.id,
      installments: {
        create: input.installments.map((item) => ({
          dueDate: item.dueDate,
          amount: item.amount,
          percentage: item.percentage ?? null,
          label: item.label ?? null,
        })),
      },
    },
    update: {
      installments: {
        deleteMany: {},
        create: input.installments.map((item) => ({
          dueDate: item.dueDate,
          amount: item.amount,
          percentage: item.percentage ?? null,
          label: item.label ?? null,
        })),
      },
    },
  });
};

export const upsertRentDetail = async (
  propertyId: string,
  input: {
    depositAmount?: number | null;
    minLeaseTerm?: number | null;
    tenantPreference?: string | null;
    petsAllowed?: boolean | null;
    utilitiesIncluded?: boolean | null;
    chillerIncluded?: boolean | null;
    cheques?: number | null;
    maintenanceBy?: string | null;
  },
  ctx: Context,
) => {
  await assertCanManageProperty(propertyId, ctx);
  return ctx.prisma.rentDetail.upsert({
    where: { propertyId },
    create: {
      propertyId,
      depositAmount: input.depositAmount ?? null,
      minLeaseTerm: input.minLeaseTerm ?? null,
      tenantPreference: parseEnum(
        TenantPreference,
        input.tenantPreference ?? undefined,
        "tenant preference",
      ),
      petsAllowed: input.petsAllowed ?? false,
      utilitiesIncluded: input.utilitiesIncluded ?? false,
      chillerIncluded: input.chillerIncluded ?? false,
      cheques: input.cheques ?? null,
      maintenanceBy: parseEnum(
        MaintenanceBy,
        input.maintenanceBy ?? undefined,
        "maintenance owner",
      ),
    },
    update: {
      ...(input.depositAmount != null && { depositAmount: input.depositAmount }),
      ...(input.minLeaseTerm != null && { minLeaseTerm: input.minLeaseTerm }),
      ...(input.tenantPreference != null && {
        tenantPreference: parseEnum(
          TenantPreference,
          input.tenantPreference,
          "tenant preference",
        ),
      }),
      ...(input.petsAllowed != null && { petsAllowed: input.petsAllowed }),
      ...(input.utilitiesIncluded != null && {
        utilitiesIncluded: input.utilitiesIncluded,
      }),
      ...(input.chillerIncluded != null && {
        chillerIncluded: input.chillerIncluded,
      }),
      ...(input.cheques != null && { cheques: input.cheques }),
      ...(input.maintenanceBy != null && {
        maintenanceBy: parseEnum(
          MaintenanceBy,
          input.maintenanceBy,
          "maintenance owner",
        ),
      }),
    },
  });
};

export const upsertSellDetail = async (
  propertyId: string,
  input: {
    sellerType?: string | null;
    isOffMarket?: boolean | null;
    commissionPaidBy?: string | null;
    inspectionStatus?: string | null;
  },
  ctx: Context,
) => {
  await assertCanManageProperty(propertyId, ctx);
  return ctx.prisma.sellDetail.upsert({
    where: { propertyId },
    include: {
      priceHistory: true,
    },
    create: {
      propertyId,
      sellerType: parseEnum(SellerType, input.sellerType ?? undefined, "seller type"),
      isOffMarket: input.isOffMarket ?? false,
      commissionPaidBy: parseEnum(
        CommissionPaidBy,
        input.commissionPaidBy ?? undefined,
        "commission paid by",
      ),
      inspectionStatus: input.inspectionStatus ?? null,
    },
    update: {
      ...(input.sellerType != null && {
        sellerType: parseEnum(SellerType, input.sellerType, "seller type"),
      }),
      ...(input.isOffMarket != null && { isOffMarket: input.isOffMarket }),
      ...(input.commissionPaidBy != null && {
        commissionPaidBy: parseEnum(
          CommissionPaidBy,
          input.commissionPaidBy,
          "commission paid by",
        ),
      }),
      ...(input.inspectionStatus != null && {
        inspectionStatus: input.inspectionStatus,
      }),
    },
  });
};
