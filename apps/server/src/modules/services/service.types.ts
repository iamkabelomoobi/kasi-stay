import { builder } from "../../app/builder";

export const ServiceProviderFilterInput = builder.inputType(
  "ServiceProviderFilterInput",
  {
    fields: (t) => ({
      q: t.string({ required: false }),
      city: t.string({ required: false }),
      status: t.string({ required: false }),
      limit: t.int({ required: false }),
      offset: t.int({ required: false }),
    }),
  },
);

export const ServiceListingFilterInput = builder.inputType(
  "ServiceListingFilterInput",
  {
    fields: (t) => ({
      category: t.string({ required: false }),
      city: t.string({ required: false }),
      providerId: t.id({ required: false }),
      status: t.string({ required: false }),
      limit: t.int({ required: false }),
      offset: t.int({ required: false }),
    }),
  },
);

export const ServiceProviderInput = builder.inputType("ServiceProviderInput", {
  fields: (t) => ({
    businessName: t.string({ required: true }),
    slug: t.string({ required: false }),
    description: t.string({ required: false }),
    email: t.string({ required: false }),
    phone: t.string({ required: false }),
    city: t.string({ required: true }),
    serviceArea: t.string({ required: false }),
    logoUrl: t.string({ required: false }),
    status: t.string({ required: false }),
  }),
});

export const ServiceProviderUpdateInput = builder.inputType(
  "ServiceProviderUpdateInput",
  {
    fields: (t) => ({
      businessName: t.string({ required: false }),
      slug: t.string({ required: false }),
      description: t.string({ required: false }),
      email: t.string({ required: false }),
      phone: t.string({ required: false }),
      city: t.string({ required: false }),
      serviceArea: t.string({ required: false }),
      logoUrl: t.string({ required: false }),
      status: t.string({ required: false }),
    }),
  },
);

export const ServiceListingInput = builder.inputType("ServiceListingInput", {
  fields: (t) => ({
    providerId: t.id({ required: false }),
    title: t.string({ required: true }),
    slug: t.string({ required: false }),
    description: t.string({ required: false }),
    category: t.string({ required: true }),
    status: t.string({ required: false }),
    startingPrice: t.float({ required: false }),
    currency: t.string({ required: false }),
    city: t.string({ required: true }),
    serviceArea: t.string({ required: false }),
    imageUrlsJson: t.string({ required: false }),
  }),
});

export const ServiceListingUpdateInput = builder.inputType(
  "ServiceListingUpdateInput",
  {
    fields: (t) => ({
      title: t.string({ required: false }),
      slug: t.string({ required: false }),
      description: t.string({ required: false }),
      category: t.string({ required: false }),
      status: t.string({ required: false }),
      startingPrice: t.float({ required: false }),
      currency: t.string({ required: false }),
      city: t.string({ required: false }),
      serviceArea: t.string({ required: false }),
      imageUrlsJson: t.string({ required: false }),
    }),
  },
);

export const ServiceRequestInput = builder.inputType("ServiceRequestInput", {
  fields: (t) => ({
    message: t.string({ required: false }),
    preferredDate: t.field({ type: "Date", required: false }),
  }),
});

export const ServiceRequestStatusInput = builder.inputType(
  "ServiceRequestStatusInput",
  {
    fields: (t) => ({
      status: t.string({ required: true }),
    }),
  },
);
