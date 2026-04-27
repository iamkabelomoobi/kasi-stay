import { builder } from "../../app/builder";

export const ArticleFilterInput = builder.inputType("ArticleFilterInput", {
  fields: (t) => ({
    q: t.string({ required: false }),
    categorySlug: t.string({ required: false }),
    slug: t.string({ required: false }),
    status: t.string({ required: false }),
    limit: t.int({ required: false }),
    offset: t.int({ required: false }),
  }),
});

export const ArticleInput = builder.inputType("ArticleInput", {
  fields: (t) => ({
    categoryId: t.id({ required: true }),
    title: t.string({ required: true }),
    slug: t.string({ required: false }),
    summary: t.string({ required: false }),
    content: t.string({ required: true }),
    coverImageUrl: t.string({ required: false }),
    status: t.string({ required: false }),
  }),
});

export const ArticleUpdateInput = builder.inputType("ArticleUpdateInput", {
  fields: (t) => ({
    categoryId: t.id({ required: false }),
    title: t.string({ required: false }),
    slug: t.string({ required: false }),
    summary: t.string({ required: false }),
    content: t.string({ required: false }),
    coverImageUrl: t.string({ required: false }),
    status: t.string({ required: false }),
  }),
});
