import { builder } from "../../app/builder";

export const CareerPostFilterInput = builder.inputType("CareerPostFilterInput", {
  fields: (t) => ({
    q: t.string({ required: false }),
    status: t.string({ required: false }),
    location: t.string({ required: false }),
    limit: t.int({ required: false }),
    offset: t.int({ required: false }),
  }),
});

export const CareerPostInput = builder.inputType("CareerPostInput", {
  fields: (t) => ({
    title: t.string({ required: true }),
    slug: t.string({ required: false }),
    summary: t.string({ required: false }),
    description: t.string({ required: true }),
    location: t.string({ required: false }),
    employmentType: t.string({ required: false }),
    status: t.string({ required: false }),
  }),
});

export const CareerPostUpdateInput = builder.inputType(
  "CareerPostUpdateInput",
  {
    fields: (t) => ({
      title: t.string({ required: false }),
      slug: t.string({ required: false }),
      summary: t.string({ required: false }),
      description: t.string({ required: false }),
      location: t.string({ required: false }),
      employmentType: t.string({ required: false }),
      status: t.string({ required: false }),
    }),
  },
);

export const JobApplicationInput = builder.inputType("JobApplicationInput", {
  fields: (t) => ({
    fullName: t.string({ required: true }),
    email: t.string({ required: true }),
    phone: t.string({ required: false }),
    coverLetter: t.string({ required: false }),
    resumeUrl: t.string({ required: false }),
  }),
});
