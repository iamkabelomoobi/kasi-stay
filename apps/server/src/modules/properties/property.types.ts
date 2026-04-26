import { builder } from "../../app/builder";

export const PropertyLocationInput = builder.inputType("PropertyLocationInput", {
  fields: (t) => ({
    address: t.string({ required: true }),
    city: t.string({ required: true }),
    state: t.string({ required: false }),
    country: t.string({ required: true }),
    postalCode: t.string({ required: false }),
    latitude: t.float({ required: false }),
    longitude: t.float({ required: false }),
    neighborhood: t.string({ required: false }),
    geoJson: t.string({ required: false }),
  }),
});

export const PropertyMediaInput = builder.inputType("PropertyMediaInput", {
  fields: (t) => ({
    url: t.string({ required: true }),
    type: t.string({ required: false }),
    order: t.int({ required: false }),
    isPrimary: t.boolean({ required: false }),
  }),
});

export const PropertyDocumentInput = builder.inputType("PropertyDocumentInput", {
  fields: (t) => ({
    url: t.string({ required: true }),
    type: t.string({ required: false }),
    label: t.string({ required: false }),
  }),
});

export const PropertyInput = builder.inputType("PropertyInput", {
  fields: (t) => ({
    title: t.string({ required: true }),
    description: t.string({ required: false }),
    listingType: t.string({ required: true }),
    propertyType: t.string({ required: true }),
    price: t.float({ required: false }),
    currency: t.string({ required: false }),
    priceFrequency: t.string({ required: false }),
    bedrooms: t.int({ required: false }),
    bathrooms: t.int({ required: false }),
    parkingSpaces: t.int({ required: false }),
    builtUpArea: t.float({ required: false }),
    plotArea: t.float({ required: false }),
    floorNumber: t.int({ required: false }),
    totalFloors: t.int({ required: false }),
    yearBuilt: t.int({ required: false }),
    furnishing: t.string({ required: false }),
    occupancyStatus: t.string({ required: false }),
    availableFrom: t.field({ type: "Date", required: false }),
    agentId: t.id({ required: false }),
    agencyId: t.id({ required: false }),
    permitNumber: t.string({ required: false }),
    expiresAt: t.field({ type: "Date", required: false }),
    location: t.field({ type: PropertyLocationInput, required: false }),
    media: t.field({ type: [PropertyMediaInput], required: false }),
    documents: t.field({ type: [PropertyDocumentInput], required: false }),
    amenityIds: t.idList({ required: false }),
  }),
});

export const PropertyUpdateInput = builder.inputType("PropertyUpdateInput", {
  fields: (t) => ({
    title: t.string({ required: false }),
    description: t.string({ required: false }),
    propertyType: t.string({ required: false }),
    price: t.float({ required: false }),
    currency: t.string({ required: false }),
    priceFrequency: t.string({ required: false }),
    bedrooms: t.int({ required: false }),
    bathrooms: t.int({ required: false }),
    parkingSpaces: t.int({ required: false }),
    builtUpArea: t.float({ required: false }),
    plotArea: t.float({ required: false }),
    floorNumber: t.int({ required: false }),
    totalFloors: t.int({ required: false }),
    yearBuilt: t.int({ required: false }),
    furnishing: t.string({ required: false }),
    occupancyStatus: t.string({ required: false }),
    availableFrom: t.field({ type: "Date", required: false }),
    agentId: t.id({ required: false }),
    agencyId: t.id({ required: false }),
    permitNumber: t.string({ required: false }),
    expiresAt: t.field({ type: "Date", required: false }),
    location: t.field({ type: PropertyLocationInput, required: false }),
    media: t.field({ type: [PropertyMediaInput], required: false }),
    documents: t.field({ type: [PropertyDocumentInput], required: false }),
    amenityIds: t.idList({ required: false }),
  }),
});

export const PropertyFilterInput = builder.inputType("PropertyFilterInput", {
  fields: (t) => ({
    q: t.string({ required: false }),
    listingType: t.string({ required: false }),
    propertyType: t.string({ required: false }),
    city: t.string({ required: false }),
    minPrice: t.float({ required: false }),
    maxPrice: t.float({ required: false }),
    bedrooms: t.int({ required: false }),
    bathrooms: t.int({ required: false }),
    minArea: t.float({ required: false }),
    maxArea: t.float({ required: false }),
    status: t.string({ required: false }),
    agencyId: t.id({ required: false }),
    agentId: t.id({ required: false }),
    isFeatured: t.boolean({ required: false }),
    limit: t.int({ required: false }),
    offset: t.int({ required: false }),
  }),
});

export const BuyDetailInput = builder.inputType("BuyDetailInput", {
  fields: (t) => ({
    ownership: t.string({ required: false }),
    ownerType: t.string({ required: false }),
    isDeveloper: t.boolean({ required: false }),
    developerName: t.string({ required: false }),
    projectName: t.string({ required: false }),
    handoverDate: t.field({ type: "Date", required: false }),
    registrationInfo: t.string({ required: false }),
    titleDeedVerified: t.boolean({ required: false }),
    roi: t.float({ required: false }),
  }),
});

export const RentDetailInput = builder.inputType("RentDetailInput", {
  fields: (t) => ({
    depositAmount: t.float({ required: false }),
    minLeaseTerm: t.int({ required: false }),
    tenantPreference: t.string({ required: false }),
    petsAllowed: t.boolean({ required: false }),
    utilitiesIncluded: t.boolean({ required: false }),
    chillerIncluded: t.boolean({ required: false }),
    cheques: t.int({ required: false }),
    maintenanceBy: t.string({ required: false }),
  }),
});

export const SellDetailInput = builder.inputType("SellDetailInput", {
  fields: (t) => ({
    sellerType: t.string({ required: false }),
    isOffMarket: t.boolean({ required: false }),
    commissionPaidBy: t.string({ required: false }),
    inspectionStatus: t.string({ required: false }),
  }),
});

export const PaymentPlanInstallmentInput = builder.inputType(
  "PaymentPlanInstallmentInput",
  {
    fields: (t) => ({
      dueDate: t.field({ type: "Date", required: true }),
      amount: t.float({ required: true }),
      percentage: t.float({ required: false }),
      label: t.string({ required: false }),
    }),
  },
);

export const PaymentPlanInput = builder.inputType("PaymentPlanInput", {
  fields: (t) => ({
    installments: t.field({
      type: [PaymentPlanInstallmentInput],
      required: true,
    }),
  }),
});

export const PropertyAnalyticsRef = builder.simpleObject("PropertyAnalytics", {
  fields: (t) => ({
    views: t.int(),
    inquiries: t.int(),
    viewings: t.int(),
    reviews: t.int(),
  }),
});
