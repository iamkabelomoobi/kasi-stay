import {
  GenderIdentity,
  GenderPreference,
  RoommateProfileStatus,
} from "@kasistay/db";
import { Context } from "../../../app/context";
import { notFound, unauthorized } from "../../../utils/errors";
import { parseEnum } from "../../../utils/parse-enum";
import {
  roommateProfileInclude,
  savedRoommateProfileInclude,
} from "../queries";

const assertCanManageRoommateProfile = async (
  profileId: string,
  ctx: Context,
) => {
  const profile = await ctx.prisma.roommateProfile.findUnique({
    where: { id: profileId },
  });

  if (!profile) {
    notFound("Roommate profile not found");
  }
  const current = profile!;

  if (!ctx.isAdmin && current.userId !== ctx.assertAuth().id) {
    unauthorized();
  }

  return current;
};

export const upsertRoommateProfile = async (
  input: {
    headline?: string | null;
    bio?: string | null;
    age?: number | null;
    occupation?: string | null;
    city: string;
    area?: string | null;
    budgetMin?: number | null;
    budgetMax?: number | null;
    currency?: string | null;
    moveInDate?: Date | null;
    gender?: string | null;
    preferredGender?: string | null;
    smokingFriendly?: boolean | null;
    petsFriendly?: boolean | null;
    photoUrl?: string | null;
    status?: string | null;
  },
  ctx: Context,
) => {
  const user = ctx.assertAuth();
  const gender = parseEnum(GenderIdentity, input.gender ?? undefined, "gender");
  const preferredGender = parseEnum(
    GenderPreference,
    input.preferredGender ?? undefined,
    "preferred gender",
  );
  const status =
    parseEnum(
      RoommateProfileStatus,
      input.status ?? undefined,
      "roommate profile status",
    ) ?? RoommateProfileStatus.PUBLISHED;

  return ctx.prisma.roommateProfile.upsert({
    where: {
      userId: user.id,
    },
    update: {
      headline: input.headline ?? null,
      bio: input.bio ?? null,
      age: input.age ?? null,
      occupation: input.occupation ?? null,
      city: input.city,
      area: input.area ?? null,
      budgetMin: input.budgetMin ?? null,
      budgetMax: input.budgetMax ?? null,
      currency: input.currency ?? "ZAR",
      moveInDate: input.moveInDate ?? null,
      gender: gender ?? null,
      preferredGender: preferredGender ?? null,
      smokingFriendly: input.smokingFriendly ?? false,
      petsFriendly: input.petsFriendly ?? false,
      photoUrl: input.photoUrl ?? null,
      status,
    },
    create: {
      userId: user.id,
      headline: input.headline ?? null,
      bio: input.bio ?? null,
      age: input.age ?? null,
      occupation: input.occupation ?? null,
      city: input.city,
      area: input.area ?? null,
      budgetMin: input.budgetMin ?? null,
      budgetMax: input.budgetMax ?? null,
      currency: input.currency ?? "ZAR",
      moveInDate: input.moveInDate ?? null,
      gender: gender ?? null,
      preferredGender: preferredGender ?? null,
      smokingFriendly: input.smokingFriendly ?? false,
      petsFriendly: input.petsFriendly ?? false,
      photoUrl: input.photoUrl ?? null,
      status,
    },
    include: roommateProfileInclude,
  });
};

export const deleteRoommateProfile = async (
  profileId: string,
  ctx: Context,
) => {
  await assertCanManageRoommateProfile(profileId, ctx);

  return ctx.prisma.roommateProfile.delete({
    where: { id: profileId },
    include: roommateProfileInclude,
  });
};

export const saveRoommateProfile = async (
  profileId: string,
  ctx: Context,
) => {
  const user = ctx.assertAuth();
  const profile = await ctx.prisma.roommateProfile.findUnique({
    where: { id: profileId },
  });

  if (!profile || profile.status !== RoommateProfileStatus.PUBLISHED) {
    notFound("Roommate profile not found");
  }

  return ctx.prisma.roommateSavedProfile.upsert({
    where: {
      userId_profileId: {
        userId: user.id,
        profileId,
      },
    },
    update: {
      savedAt: new Date(),
    },
    create: {
      userId: user.id,
      profileId,
    },
    include: savedRoommateProfileInclude,
  });
};

export const unsaveRoommateProfile = async (
  profileId: string,
  ctx: Context,
) => {
  const user = ctx.assertAuth();
  await ctx.prisma.roommateSavedProfile.delete({
    where: {
      userId_profileId: {
        userId: user.id,
        profileId,
      },
    },
  });

  return true;
};
