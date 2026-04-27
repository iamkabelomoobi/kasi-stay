import { builder } from "../../app/builder";

export const StaticPageFilterInput = builder.inputType("StaticPageFilterInput", {
  fields: (t) => ({
    q: t.string({ required: false }),
    slug: t.string({ required: false }),
    type: t.string({ required: false }),
    status: t.string({ required: false }),
    limit: t.int({ required: false }),
    offset: t.int({ required: false }),
  }),
});

export const StaticPageInput = builder.inputType("StaticPageInput", {
  fields: (t) => ({
    slug: t.string({ required: true }),
    title: t.string({ required: true }),
    summary: t.string({ required: false }),
    content: t.string({ required: true }),
    type: t.string({ required: false }),
    status: t.string({ required: false }),
  }),
});

export const StaticPageUpdateInput = builder.inputType("StaticPageUpdateInput", {
  fields: (t) => ({
    slug: t.string({ required: false }),
    title: t.string({ required: false }),
    summary: t.string({ required: false }),
    content: t.string({ required: false }),
    type: t.string({ required: false }),
    status: t.string({ required: false }),
  }),
});
