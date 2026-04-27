import { builder } from "../../../app/builder";
import {
  deleteRoommateProfile,
  saveRoommateProfile,
  unsaveRoommateProfile,
  upsertRoommateProfile,
} from "../mutations";
import {
  getMyRoommateProfile,
  getRoommateProfile,
  listRoommateProfiles,
  listSavedRoommateProfiles,
  type RoommateProfileShape,
  type RoommateSavedProfileShape,
} from "../queries";
import {
  RoommateProfileFilterInput,
  RoommateProfileInput,
} from "../roommate.types";

const RoommateProfileRef =
  builder.objectRef<RoommateProfileShape>("RoommateProfile");
RoommateProfileRef.implement({
  fields: (t) => ({
    id: t.id({ resolve: (parent) => parent.id }),
    userId: t.id({ resolve: (parent) => parent.userId }),
    headline: t.string({
      nullable: true,
      resolve: (parent) => parent.headline ?? null,
    }),
    bio: t.string({
      nullable: true,
      resolve: (parent) => parent.bio ?? null,
    }),
    age: t.int({
      nullable: true,
      resolve: (parent) => parent.age ?? null,
    }),
    occupation: t.string({
      nullable: true,
      resolve: (parent) => parent.occupation ?? null,
    }),
    city: t.string({ resolve: (parent) => parent.city }),
    area: t.string({
      nullable: true,
      resolve: (parent) => parent.area ?? null,
    }),
    budgetMin: t.float({
      nullable: true,
      resolve: (parent) =>
        parent.budgetMin != null ? Number(parent.budgetMin) : null,
    }),
    budgetMax: t.float({
      nullable: true,
      resolve: (parent) =>
        parent.budgetMax != null ? Number(parent.budgetMax) : null,
    }),
    currency: t.string({ resolve: (parent) => parent.currency }),
    moveInDate: t.field({
      type: "Date",
      nullable: true,
      resolve: (parent) => parent.moveInDate ?? null,
    }),
    gender: t.string({
      nullable: true,
      resolve: (parent) => parent.gender ?? null,
    }),
    preferredGender: t.string({
      nullable: true,
      resolve: (parent) => parent.preferredGender ?? null,
    }),
    smokingFriendly: t.boolean({
      resolve: (parent) => parent.smokingFriendly,
    }),
    petsFriendly: t.boolean({
      resolve: (parent) => parent.petsFriendly,
    }),
    photoUrl: t.string({
      nullable: true,
      resolve: (parent) => parent.photoUrl ?? null,
    }),
    status: t.string({ resolve: (parent) => parent.status }),
    ownerName: t.string({ resolve: (parent) => parent.user.name }),
    createdAt: t.field({ type: "Date", resolve: (parent) => parent.createdAt }),
    updatedAt: t.field({ type: "Date", resolve: (parent) => parent.updatedAt }),
  }),
});

const RoommateSavedProfileRef =
  builder.objectRef<RoommateSavedProfileShape>("RoommateSavedProfile");
RoommateSavedProfileRef.implement({
  fields: (t) => ({
    userId: t.id({ resolve: (parent) => parent.userId }),
    profileId: t.id({ resolve: (parent) => parent.profileId }),
    savedAt: t.field({ type: "Date", resolve: (parent) => parent.savedAt }),
    profile: t.field({
      type: RoommateProfileRef,
      resolve: (parent) => parent.profile,
    }),
  }),
});

builder.queryField("roommateProfiles", (t) =>
  t.field({
    type: [RoommateProfileRef],
    args: {
      filter: t.arg({ type: RoommateProfileFilterInput, required: false }),
    },
    resolve: (_, args, ctx) => listRoommateProfiles(ctx, args.filter ?? undefined),
  }),
);

builder.queryField("roommateProfile", (t) =>
  t.field({
    type: RoommateProfileRef,
    nullable: true,
    args: {
      profileId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => getRoommateProfile(String(args.profileId), ctx),
  }),
);

builder.queryField("myRoommateProfile", (t) =>
  t.field({
    type: RoommateProfileRef,
    nullable: true,
    authScopes: { isAuthenticated: true },
    resolve: (_, __, ctx) => getMyRoommateProfile(ctx),
  }),
);

builder.queryField("savedRoommateProfiles", (t) =>
  t.field({
    type: [RoommateSavedProfileRef],
    authScopes: { isAuthenticated: true },
    resolve: (_, __, ctx) => listSavedRoommateProfiles(ctx),
  }),
);

builder.mutationField("upsertRoommateProfile", (t) =>
  t.field({
    type: RoommateProfileRef,
    authScopes: { isAuthenticated: true },
    args: {
      input: t.arg({ type: RoommateProfileInput, required: true }),
    },
    resolve: (_, args, ctx) => upsertRoommateProfile(args.input, ctx),
  }),
);

builder.mutationField("deleteRoommateProfile", (t) =>
  t.field({
    type: RoommateProfileRef,
    authScopes: { isAuthenticated: true },
    args: {
      profileId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      deleteRoommateProfile(String(args.profileId), ctx),
  }),
);

builder.mutationField("saveRoommateProfile", (t) =>
  t.field({
    type: RoommateSavedProfileRef,
    authScopes: { isAuthenticated: true },
    args: {
      profileId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => saveRoommateProfile(String(args.profileId), ctx),
  }),
);

builder.mutationField("unsaveRoommateProfile", (t) =>
  t.field({
    type: "Boolean",
    authScopes: { isAuthenticated: true },
    args: {
      profileId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      unsaveRoommateProfile(String(args.profileId), ctx),
  }),
);
