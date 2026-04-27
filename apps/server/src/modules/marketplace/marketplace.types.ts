import { builder } from "../../app/builder";

export const MarketplaceItemFilterInput = builder.inputType(
  "MarketplaceItemFilterInput",
  {
    fields: (t) => ({
      category: t.string({ required: false }),
      city: t.string({ required: false }),
      minPrice: t.float({ required: false }),
      maxPrice: t.float({ required: false }),
      condition: t.string({ required: false }),
      status: t.string({ required: false }),
      limit: t.int({ required: false }),
      offset: t.int({ required: false }),
    }),
  },
);

export const MarketplaceItemInput = builder.inputType("MarketplaceItemInput", {
  fields: (t) => ({
    title: t.string({ required: true }),
    slug: t.string({ required: false }),
    description: t.string({ required: false }),
    category: t.string({ required: true }),
    condition: t.string({ required: false }),
    price: t.float({ required: false }),
    currency: t.string({ required: false }),
    city: t.string({ required: true }),
    locationText: t.string({ required: false }),
    imageUrlsJson: t.string({ required: false }),
    isNegotiable: t.boolean({ required: false }),
  }),
});

export const MarketplaceItemUpdateInput = builder.inputType(
  "MarketplaceItemUpdateInput",
  {
    fields: (t) => ({
      title: t.string({ required: false }),
      slug: t.string({ required: false }),
      description: t.string({ required: false }),
      category: t.string({ required: false }),
      condition: t.string({ required: false }),
      price: t.float({ required: false }),
      currency: t.string({ required: false }),
      city: t.string({ required: false }),
      locationText: t.string({ required: false }),
      imageUrlsJson: t.string({ required: false }),
      isNegotiable: t.boolean({ required: false }),
      status: t.string({ required: false }),
    }),
  },
);
