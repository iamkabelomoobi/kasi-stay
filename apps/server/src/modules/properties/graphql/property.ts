import type {
  Amenity,
  BuyDetail,
  Installment,
  Location,
  PaymentPlan,
  PriceHistory,
  Property,
  PropertyAmenity,
  PropertyDocument,
  PropertyMedia,
  RentDetail,
  SellDetail,
} from "@kasistay/db";
import { builder } from "../../../app/builder";
import {
  archiveProperty,
  createProperty,
  deleteProperty,
  duplicateProperty,
  publishProperty,
  trackPropertyView,
  updateProperty,
  upsertBuyDetail,
  upsertPaymentPlan,
  upsertRentDetail,
  upsertSellDetail,
} from "../mutations";
import {
  BuyDetailInput,
  PaymentPlanInput,
  PropertyAnalyticsRef,
  PropertyFilterInput,
  PropertyInput,
  PropertyUpdateInput,
  RentDetailInput,
  SellDetailInput,
} from "../property.types";
import {
  getPropertyAnalytics,
  getPropertyBySlug,
  getPropertyPriceHistory,
  getSimilarProperties,
  listProperties,
} from "../queries";

type AmenityShape = Amenity;
type PropertyAmenityShape = PropertyAmenity & { amenity?: AmenityShape | null };
type InstallmentShape = Installment;
type PaymentPlanShape = PaymentPlan & { installments?: InstallmentShape[] };
type BuyDetailShape = BuyDetail & { paymentPlan?: PaymentPlanShape | null };
type RentDetailShape = RentDetail;
type PriceHistoryShape = PriceHistory;
type SellDetailShape = SellDetail & { priceHistory?: PriceHistoryShape[] };
type LocationShape = Location;
type PropertyMediaShape = PropertyMedia;
type PropertyDocumentShape = PropertyDocument;
type PropertyShape = Property & {
  agency?: unknown;
  location?: LocationShape | null;
  media?: PropertyMediaShape[];
  documents?: PropertyDocumentShape[];
  amenities?: PropertyAmenityShape[];
  buyDetail?: BuyDetailShape | null;
  rentDetail?: RentDetailShape | null;
  sellDetail?: SellDetailShape | null;
  priceHistory?: PriceHistoryShape[];
};

export const LocationRef = builder.objectRef<LocationShape>("Location");
LocationRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    address: t.string({ resolve: (parent) => parent.address }),
    city: t.string({ resolve: (parent) => parent.city }),
    state: t.string({ resolve: (parent) => parent.state ?? null, nullable: true }),
    country: t.string({ resolve: (parent) => parent.country }),
    postalCode: t.string({
      resolve: (parent) => parent.postalCode ?? null,
      nullable: true,
    }),
    latitude: t.float({
      resolve: (parent) => parent.latitude ?? null,
      nullable: true,
    }),
    longitude: t.float({
      resolve: (parent) => parent.longitude ?? null,
      nullable: true,
    }),
    neighborhood: t.string({
      resolve: (parent) => parent.neighborhood ?? null,
      nullable: true,
    }),
    createdAt: t.field({
      type: "Date",
      resolve: (parent) => parent.createdAt,
    }),
    updatedAt: t.field({
      type: "Date",
      resolve: (parent) => parent.updatedAt,
    }),
  }),
});

export const PropertyMediaRef =
  builder.objectRef<PropertyMediaShape>("PropertyMedia");
PropertyMediaRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    url: t.string({ resolve: (parent) => parent.url }),
    type: t.string({ resolve: (parent) => parent.type }),
    order: t.int({ resolve: (parent) => parent.order }),
    isPrimary: t.boolean({ resolve: (parent) => parent.isPrimary }),
    createdAt: t.field({
      type: "Date",
      resolve: (parent) => parent.createdAt,
    }),
    updatedAt: t.field({
      type: "Date",
      resolve: (parent) => parent.updatedAt,
    }),
  }),
});

export const PropertyDocumentRef =
  builder.objectRef<PropertyDocumentShape>("PropertyDocument");
PropertyDocumentRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    url: t.string({ resolve: (parent) => parent.url }),
    type: t.string({ resolve: (parent) => parent.type }),
    label: t.string({
      resolve: (parent) => parent.label ?? null,
      nullable: true,
    }),
  }),
});

export const AmenityRef = builder.objectRef<AmenityShape>("Amenity");
AmenityRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    name: t.string({ resolve: (parent) => parent.name }),
    category: t.string({ resolve: (parent) => parent.category }),
  }),
});

export const PropertyAmenityRef = builder.objectRef<PropertyAmenityShape>(
  "PropertyAmenity",
);
PropertyAmenityRef.implement({
  fields: (t) => ({
    propertyId: t.id({ resolve: (parent) => parent.propertyId }),
    amenityId: t.id({ resolve: (parent) => parent.amenityId }),
    amenity: t.field({
      type: AmenityRef,
      nullable: true,
      resolve: (parent) => parent.amenity ?? null,
    }),
  }),
});

const InstallmentRef = builder.objectRef<InstallmentShape>("Installment");
InstallmentRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    dueDate: t.field({ type: "Date", resolve: (parent) => parent.dueDate }),
    amount: t.float({ resolve: (parent) => Number(parent.amount) }),
    percentage: t.float({
      resolve: (parent) => parent.percentage ?? null,
      nullable: true,
    }),
    label: t.string({
      resolve: (parent) => parent.label ?? null,
      nullable: true,
    }),
  }),
});

const PaymentPlanRef = builder.objectRef<PaymentPlanShape>("PaymentPlan");
PaymentPlanRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    installments: t.field({
      type: [InstallmentRef],
      resolve: (parent) => parent.installments ?? [],
    }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

const BuyDetailRef = builder.objectRef<BuyDetailShape>("BuyDetail");
BuyDetailRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    propertyId: t.id({ resolve: (parent) => parent.propertyId }),
    ownership: t.string({
      resolve: (parent) => parent.ownership ?? null,
      nullable: true,
    }),
    ownerType: t.string({
      resolve: (parent) => parent.ownerType ?? null,
      nullable: true,
    }),
    isDeveloper: t.boolean({ resolve: (parent) => parent.isDeveloper }),
    developerName: t.string({
      resolve: (parent) => parent.developerName ?? null,
      nullable: true,
    }),
    projectName: t.string({
      resolve: (parent) => parent.projectName ?? null,
      nullable: true,
    }),
    handoverDate: t.field({
      type: "Date",
      nullable: true,
      resolve: (parent) => parent.handoverDate ?? null,
    }),
    registrationInfo: t.string({
      resolve: (parent) => parent.registrationInfo ?? null,
      nullable: true,
    }),
    titleDeedVerified: t.boolean({
      resolve: (parent) => parent.titleDeedVerified,
    }),
    roi: t.float({ resolve: (parent) => parent.roi ?? null, nullable: true }),
    paymentPlan: t.field({
      type: PaymentPlanRef,
      nullable: true,
      resolve: (parent) => parent.paymentPlan ?? null,
    }),
  }),
});

export const RentDetailRef = builder.objectRef<RentDetailShape>("RentDetail");
RentDetailRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    propertyId: t.id({ resolve: (parent) => parent.propertyId }),
    depositAmount: t.float({
      resolve: (parent) =>
        parent.depositAmount != null ? Number(parent.depositAmount) : null,
      nullable: true,
    }),
    minLeaseTerm: t.int({
      resolve: (parent) => parent.minLeaseTerm ?? null,
      nullable: true,
    }),
    tenantPreference: t.string({
      resolve: (parent) => parent.tenantPreference ?? null,
      nullable: true,
    }),
    petsAllowed: t.boolean({ resolve: (parent) => parent.petsAllowed }),
    utilitiesIncluded: t.boolean({
      resolve: (parent) => parent.utilitiesIncluded,
    }),
    chillerIncluded: t.boolean({
      resolve: (parent) => parent.chillerIncluded,
    }),
    cheques: t.int({ resolve: (parent) => parent.cheques ?? null, nullable: true }),
    maintenanceBy: t.string({
      resolve: (parent) => parent.maintenanceBy ?? null,
      nullable: true,
    }),
  }),
});

const PriceHistoryRef = builder.objectRef<PriceHistoryShape>("PriceHistory");
PriceHistoryRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    propertyId: t.id({ resolve: (parent) => parent.propertyId }),
    price: t.float({ resolve: (parent) => Number(parent.price) }),
    changedAt: t.field({ type: "Date", resolve: (parent) => parent.changedAt }),
  }),
});

const SellDetailRef = builder.objectRef<SellDetailShape>("SellDetail");
SellDetailRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    propertyId: t.id({ resolve: (parent) => parent.propertyId }),
    sellerType: t.string({
      resolve: (parent) => parent.sellerType ?? null,
      nullable: true,
    }),
    isOffMarket: t.boolean({ resolve: (parent) => parent.isOffMarket }),
    commissionPaidBy: t.string({
      resolve: (parent) => parent.commissionPaidBy ?? null,
      nullable: true,
    }),
    inspectionStatus: t.string({
      resolve: (parent) => parent.inspectionStatus ?? null,
      nullable: true,
    }),
    priceHistory: t.field({
      type: [PriceHistoryRef],
      resolve: (parent) => parent.priceHistory ?? [],
    }),
  }),
});

export const PropertyRef = builder.objectRef<PropertyShape>("Property");
PropertyRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    title: t.string({ resolve: (parent) => parent.title }),
    slug: t.string({ resolve: (parent) => parent.slug }),
    description: t.string({
      resolve: (parent) => parent.description ?? null,
      nullable: true,
    }),
    status: t.string({ resolve: (parent) => parent.status }),
    listingType: t.string({ resolve: (parent) => parent.listingType }),
    propertyType: t.string({ resolve: (parent) => parent.propertyType }),
    price: t.float({
      resolve: (parent) => (parent.price != null ? Number(parent.price) : null),
      nullable: true,
    }),
    currency: t.string({ resolve: (parent) => parent.currency }),
    priceFrequency: t.string({ resolve: (parent) => parent.priceFrequency }),
    bedrooms: t.int({ resolve: (parent) => parent.bedrooms ?? null, nullable: true }),
    bathrooms: t.int({
      resolve: (parent) => parent.bathrooms ?? null,
      nullable: true,
    }),
    parkingSpaces: t.int({
      resolve: (parent) => parent.parkingSpaces ?? null,
      nullable: true,
    }),
    builtUpArea: t.float({
      resolve: (parent) => parent.builtUpArea ?? null,
      nullable: true,
    }),
    plotArea: t.float({
      resolve: (parent) => parent.plotArea ?? null,
      nullable: true,
    }),
    floorNumber: t.int({
      resolve: (parent) => parent.floorNumber ?? null,
      nullable: true,
    }),
    totalFloors: t.int({
      resolve: (parent) => parent.totalFloors ?? null,
      nullable: true,
    }),
    yearBuilt: t.int({
      resolve: (parent) => parent.yearBuilt ?? null,
      nullable: true,
    }),
    furnishing: t.string({
      resolve: (parent) => parent.furnishing ?? null,
      nullable: true,
    }),
    occupancyStatus: t.string({
      resolve: (parent) => parent.occupancyStatus ?? null,
      nullable: true,
    }),
    availableFrom: t.field({
      type: "Date",
      nullable: true,
      resolve: (parent) => parent.availableFrom ?? null,
    }),
    views: t.int({ resolve: (parent) => parent.views }),
    isFeatured: t.boolean({ resolve: (parent) => parent.isFeatured }),
    isVerified: t.boolean({ resolve: (parent) => parent.isVerified }),
    permitNumber: t.string({
      resolve: (parent) => parent.permitNumber ?? null,
      nullable: true,
    }),
    expiresAt: t.field({
      type: "Date",
      nullable: true,
      resolve: (parent) => parent.expiresAt ?? null,
    }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
    location: t.field({
      type: LocationRef,
      nullable: true,
      resolve: (parent) => parent.location ?? null,
    }),
    media: t.field({
      type: [PropertyMediaRef],
      resolve: (parent) => parent.media ?? [],
    }),
    documents: t.field({
      type: [PropertyDocumentRef],
      resolve: (parent) => parent.documents ?? [],
    }),
    amenities: t.field({
      type: [PropertyAmenityRef],
      resolve: (parent) => parent.amenities ?? [],
    }),
    buyDetail: t.field({
      type: BuyDetailRef,
      nullable: true,
      resolve: (parent) => parent.buyDetail ?? null,
    }),
    rentDetail: t.field({
      type: RentDetailRef,
      nullable: true,
      resolve: (parent) => parent.rentDetail ?? null,
    }),
    sellDetail: t.field({
      type: SellDetailRef,
      nullable: true,
      resolve: (parent) => parent.sellDetail ?? null,
    }),
    priceHistory: t.field({
      type: [PriceHistoryRef],
      resolve: (parent) => parent.priceHistory ?? [],
    }),
  }),
});

builder.queryField("property", (t) =>
  t.field({
    type: PropertyRef,
    nullable: true,
    description: "Fetch a property by slug",
    args: {
      slug: t.arg.string({ required: true }),
    },
    resolve: (_, args, ctx) => getPropertyBySlug(args.slug, ctx),
  }),
);

builder.queryField("properties", (t) =>
  t.field({
    type: [PropertyRef],
    description: "List properties with filtering",
    args: {
      filter: t.arg({ type: PropertyFilterInput, required: false }),
    },
    resolve: (_, args, ctx) => listProperties(ctx, args.filter ?? undefined),
  }),
);

builder.queryField("similarProperties", (t) =>
  t.field({
    type: [PropertyRef],
    description: "Find similar published properties",
    args: {
      propertyId: t.arg.id({ required: true }),
      limit: t.arg.int({ required: false }),
    },
    resolve: (_, args, ctx) =>
      getSimilarProperties(String(args.propertyId), ctx, args.limit ?? 5),
  }),
);

builder.queryField("propertyPriceHistory", (t) =>
  t.field({
    type: [PriceHistoryRef],
    description: "List property price history entries",
    args: {
      propertyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      getPropertyPriceHistory(String(args.propertyId), ctx),
  }),
);

builder.queryField("propertyAnalytics", (t) =>
  t.field({
    type: PropertyAnalyticsRef,
    description: "Return aggregate property analytics",
    authScopes: { isAuthenticated: true },
    args: {
      propertyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => getPropertyAnalytics(String(args.propertyId), ctx),
  }),
);

builder.mutationField("createProperty", (t) =>
  t.field({
    type: PropertyRef,
    authScopes: { isAuthenticated: true },
    description: "Create a property listing",
    args: {
      input: t.arg({ type: PropertyInput, required: true }),
    },
    resolve: (_, args, ctx) => createProperty(args.input, ctx),
  }),
);

builder.mutationField("updateProperty", (t) =>
  t.field({
    type: PropertyRef,
    authScopes: { isAuthenticated: true },
    description: "Update an existing property",
    args: {
      propertyId: t.arg.id({ required: true }),
      input: t.arg({ type: PropertyUpdateInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      updateProperty(String(args.propertyId), args.input, ctx),
  }),
);

builder.mutationField("deleteProperty", (t) =>
  t.field({
    type: PropertyRef,
    authScopes: { isAuthenticated: true },
    description: "Delete a property",
    args: {
      propertyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => deleteProperty(String(args.propertyId), ctx),
  }),
);

builder.mutationField("publishProperty", (t) =>
  t.field({
    type: PropertyRef,
    authScopes: { isAuthenticated: true },
    description: "Publish a property after validation",
    args: {
      propertyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => publishProperty(String(args.propertyId), ctx),
  }),
);

builder.mutationField("archiveProperty", (t) =>
  t.field({
    type: PropertyRef,
    authScopes: { isAuthenticated: true },
    description: "Archive a property listing",
    args: {
      propertyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => archiveProperty(String(args.propertyId), ctx),
  }),
);

builder.mutationField("duplicateProperty", (t) =>
  t.field({
    type: PropertyRef,
    authScopes: { isAuthenticated: true },
    description: "Duplicate a property listing into a draft",
    args: {
      propertyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => duplicateProperty(String(args.propertyId), ctx),
  }),
);

builder.mutationField("trackPropertyView", (t) =>
  t.field({
    type: PropertyRef,
    description: "Increment a property view counter",
    args: {
      propertyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => trackPropertyView(String(args.propertyId), ctx),
  }),
);

builder.mutationField("upsertBuyDetail", (t) =>
  t.field({
    type: BuyDetailRef,
    authScopes: { isAuthenticated: true },
    description: "Create or update a property's buy detail",
    args: {
      propertyId: t.arg.id({ required: true }),
      input: t.arg({ type: BuyDetailInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      upsertBuyDetail(String(args.propertyId), args.input, ctx),
  }),
);

builder.mutationField("upsertPropertyPaymentPlan", (t) =>
  t.field({
    type: PaymentPlanRef,
    authScopes: { isAuthenticated: true },
    description: "Create or replace a property's buy payment plan",
    args: {
      propertyId: t.arg.id({ required: true }),
      input: t.arg({ type: PaymentPlanInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      upsertPaymentPlan(String(args.propertyId), args.input, ctx),
  }),
);

builder.mutationField("upsertRentDetail", (t) =>
  t.field({
    type: RentDetailRef,
    authScopes: { isAuthenticated: true },
    description: "Create or update a property's rent detail",
    args: {
      propertyId: t.arg.id({ required: true }),
      input: t.arg({ type: RentDetailInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      upsertRentDetail(String(args.propertyId), args.input, ctx),
  }),
);

builder.mutationField("upsertSellDetail", (t) =>
  t.field({
    type: SellDetailRef,
    authScopes: { isAuthenticated: true },
    description: "Create or update a property's sell detail",
    args: {
      propertyId: t.arg.id({ required: true }),
      input: t.arg({ type: SellDetailInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      upsertSellDetail(String(args.propertyId), args.input, ctx),
  }),
);
