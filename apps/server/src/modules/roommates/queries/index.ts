import {
  GenderPreference,
  Prisma,
  RoommateProfileStatus,
} from "@kasistay/db";
import { Context } from "../../../app/context";
import { notFound } from "../../../utils/errors";
import { parseEnum } from "../../../utils/parse-enum";

export type RoommateProfileFilter = {
  city?: string | null;
  minBudget?: number | null;
  maxBudget?: number | null;
  preferredGender?: string | null;
  moveInDate?: Date | null;
  smokingFriendly?: boolean | null;
  petsFriendly?: boolean | null;
  status?: string | null;
  limit?: number | null;
  offset?: number | null;
};

export const roommateProfileInclude = {
  user: true,
} satisfies Prisma.RoommateProfileInclude;

export const savedRoommateProfileInclude = {
  profile: {
    include: roommateProfileInclude,
  },
} satisfies Prisma.RoommateSavedProfileInclude;

export type RoommateProfileShape = Prisma.RoommateProfileGetPayload<{
  include: typeof roommateProfileInclude;
}>;

export type RoommateSavedProfileShape = Prisma.RoommateSavedProfileGetPayload<{
  include: typeof savedRoommateProfileInclude;
}>;

const canReadRoommateProfile = (
  profile: { userId: string; status: RoommateProfileStatus },
  ctx: Context,
): boolean =>
  ctx.isAdmin ||
  profile.status === RoommateProfileStatus.PUBLISHED ||
  ctx.session?.user.id === profile.userId;

const buildRoommateWhere = (
  ctx: Context,
  filter?: RoommateProfileFilter,
): Prisma.RoommateProfileWhereInput => {
  const status = parseEnum(
    RoommateProfileStatus,
    filter?.status ?? undefined,
    "roommate profile status",
  );
  const preferredGender = parseEnum(
    GenderPreference,
    filter?.preferredGender ?? undefined,
    "preferred gender",
  );

  return {
    ...(ctx.isAdmin
      ? status
        ? { status }
        : {}
      : { status: RoommateProfileStatus.PUBLISHED }),
    ...(filter?.city && {
      city: {
        contains: filter.city,
        mode: "insensitive",
      },
    }),
    ...(filter?.minBudget != null || filter?.maxBudget != null
      ? {
          budgetMax: {
            ...(filter?.minBudget != null && { gte: filter.minBudget }),
            ...(filter?.maxBudget != null && { lte: filter.maxBudget }),
          },
        }
      : {}),
    ...(preferredGender && { preferredGender }),
    ...(filter?.moveInDate && {
      moveInDate: {
        lte: filter.moveInDate,
      },
    }),
    ...(filter?.smokingFriendly != null && {
      smokingFriendly: filter.smokingFriendly,
    }),
    ...(filter?.petsFriendly != null && {
      petsFriendly: filter.petsFriendly,
    }),
  };
};

export const listRoommateProfiles = async (
  ctx: Context,
  filter?: RoommateProfileFilter,
) =>
  ctx.prisma.roommateProfile.findMany({
    where: buildRoommateWhere(ctx, filter),
    include: roommateProfileInclude,
    orderBy: [{ createdAt: "desc" }],
    take: filter?.limit ?? 20,
    skip: filter?.offset ?? 0,
  });

export const getRoommateProfile = async (
  profileId: string,
  ctx: Context,
) => {
  const profile = await ctx.prisma.roommateProfile.findUnique({
    where: { id: profileId },
    include: roommateProfileInclude,
  });

  if (!profile || !canReadRoommateProfile(profile, ctx)) {
    notFound("Roommate profile not found");
  }

  return profile;
};

export const getMyRoommateProfile = async (ctx: Context) => {
  const user = ctx.assertAuth();
  return ctx.prisma.roommateProfile.findUnique({
    where: { userId: user.id },
    include: roommateProfileInclude,
  });
};

export const listSavedRoommateProfiles = async (ctx: Context) => {
  const user = ctx.assertAuth();
  return ctx.prisma.roommateSavedProfile.findMany({
    where: {
      userId: user.id,
    },
    include: savedRoommateProfileInclude,
    orderBy: [{ savedAt: "desc" }],
  });
};
