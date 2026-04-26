import { builder } from "../../app/builder";

export const PropertySearchInput = builder.inputType("PropertySearchInput", {
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
    latitude: t.float({ required: false }),
    longitude: t.float({ required: false }),
    radiusKm: t.float({ required: false }),
    sort: t.string({ required: false }),
    limit: t.int({ required: false }),
    offset: t.int({ required: false }),
  }),
});
