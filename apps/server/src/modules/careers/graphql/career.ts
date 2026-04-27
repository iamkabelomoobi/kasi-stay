import { builder } from "../../../app/builder";
import {
  archiveCareerPost,
  createCareerPost,
  submitJobApplication,
  updateCareerPost,
} from "../mutations";
import {
  getCareerPost,
  listCareerPosts,
  type CareerPostShape,
  type JobApplicationShape,
} from "../queries";
import {
  CareerPostFilterInput,
  CareerPostInput,
  CareerPostUpdateInput,
  JobApplicationInput,
} from "../career.types";

const CareerPostRef = builder.objectRef<CareerPostShape>("CareerPost");
CareerPostRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    slug: t.string({ resolve: (parent) => parent.slug }),
    title: t.string({ resolve: (parent) => parent.title }),
    summary: t.string({
      nullable: true,
      resolve: (parent) => parent.summary ?? null,
    }),
    description: t.string({ resolve: (parent) => parent.description }),
    location: t.string({
      nullable: true,
      resolve: (parent) => parent.location ?? null,
    }),
    employmentType: t.string({
      nullable: true,
      resolve: (parent) => parent.employmentType ?? null,
    }),
    status: t.string({ resolve: (parent) => parent.status }),
    publishedAt: t.field({
      type: "Date",
      nullable: true,
      resolve: (parent) => parent.publishedAt ?? null,
    }),
    createdById: t.id({
      nullable: true,
      resolve: (parent) => parent.createdById ?? null,
    }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

const JobApplicationRef = builder.objectRef<JobApplicationShape>("JobApplication");
JobApplicationRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    careerPostId: t.id({ resolve: (parent) => parent.careerPostId }),
    userId: t.id({ resolve: (parent) => parent.userId }),
    fullName: t.string({ resolve: (parent) => parent.fullName }),
    email: t.string({ resolve: (parent) => parent.email }),
    phone: t.string({
      nullable: true,
      resolve: (parent) => parent.phone ?? null,
    }),
    coverLetter: t.string({
      nullable: true,
      resolve: (parent) => parent.coverLetter ?? null,
    }),
    resumeUrl: t.string({
      nullable: true,
      resolve: (parent) => parent.resumeUrl ?? null,
    }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

builder.queryField("careerPosts", (t) =>
  t.field({
    type: [CareerPostRef],
    args: {
      filter: t.arg({ type: CareerPostFilterInput, required: false }),
    },
    resolve: (_, args, ctx) => listCareerPosts(ctx, args.filter ?? undefined),
  }),
);

builder.queryField("careerPost", (t) =>
  t.field({
    type: CareerPostRef,
    nullable: true,
    args: {
      careerPostId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => getCareerPost(String(args.careerPostId), ctx),
  }),
);

builder.mutationField("createCareerPost", (t) =>
  t.field({
    type: CareerPostRef,
    authScopes: { isAdmin: true },
    args: {
      input: t.arg({ type: CareerPostInput, required: true }),
    },
    resolve: (_, args, ctx) => createCareerPost(args.input, ctx),
  }),
);

builder.mutationField("updateCareerPost", (t) =>
  t.field({
    type: CareerPostRef,
    authScopes: { isAdmin: true },
    args: {
      careerPostId: t.arg.id({ required: true }),
      input: t.arg({ type: CareerPostUpdateInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      updateCareerPost(String(args.careerPostId), args.input, ctx),
  }),
);

builder.mutationField("archiveCareerPost", (t) =>
  t.field({
    type: CareerPostRef,
    authScopes: { isAdmin: true },
    args: {
      careerPostId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => archiveCareerPost(String(args.careerPostId), ctx),
  }),
);

builder.mutationField("submitJobApplication", (t) =>
  t.field({
    type: JobApplicationRef,
    authScopes: { isAuthenticated: true },
    args: {
      careerPostId: t.arg.id({ required: true }),
      input: t.arg({ type: JobApplicationInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      submitJobApplication(String(args.careerPostId), args.input, ctx),
  }),
);
