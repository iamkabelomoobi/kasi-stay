import { Prisma, ViewingStatus } from "@kasistay/db";
import { Context } from "../../../app/context";
import { badInput, notFound, unauthorized } from "../../../utils/errors";
import { propertyInclude } from "../../properties/queries";

const parseEnum = <T extends Record<string, string>>(
  enumObject: T,
  value: string | null | undefined,
  field: string,
): T[keyof T] | undefined => {
  if (value == null) return undefined;
  const normalized = value.toUpperCase().trim();
  const parsed = enumObject[normalized as keyof T];

  if (!parsed) {
    badInput(`Invalid ${field}: ${value}`);
  }

  return parsed;
};

export const viewingInclude = {
  property: {
    include: propertyInclude,
  },
  user: true,
} satisfies Prisma.ViewingInclude;

const canAccessViewing = (
  ctx: Context,
  viewing: {
    userId: string;
    property: {
      agentId: string | null;
      agency?: { ownerId: string } | null;
    };
  },
): boolean => {
  if (ctx.isAdmin) {
    return true;
  }

  const userId = ctx.session?.user.id;
  if (!userId) {
    return false;
  }

  return (
    viewing.userId === userId ||
    viewing.property.agentId === userId ||
    viewing.property.agency?.ownerId === userId
  );
};

export const getViewing = async (viewingId: string, ctx: Context) => {
  const viewing = await ctx.prisma.viewing.findUnique({
    where: { id: viewingId },
    include: {
      property: {
        select: {
          agentId: true,
          agency: {
            select: {
              ownerId: true,
            },
          },
        },
      },
    },
  });

  if (!viewing) {
    notFound("Viewing not found");
  }

  if (!canAccessViewing(ctx, viewing!)) {
    unauthorized();
  }

  return ctx.prisma.viewing.findUnique({
    where: { id: viewingId },
    include: viewingInclude,
  });
};

export const listViewings = async (
  ctx: Context,
  filter?: {
    propertyId?: string | null;
    inquiryId?: string | null;
    status?: string | null;
    limit?: number | null;
    offset?: number | null;
  },
) => {
  const status = parseEnum(
    ViewingStatus,
    filter?.status ?? undefined,
    "viewing status",
  );
  const sessionUserId = ctx.assertAuth().id;

  const where: Prisma.ViewingWhereInput = {
    ...(filter?.propertyId && { propertyId: String(filter.propertyId) }),
    ...(filter?.inquiryId && { inquiryId: String(filter.inquiryId) }),
    ...(status && { status }),
    ...(ctx.isAdmin
      ? {}
      : ctx.isAgent || ctx.isOwner
        ? {
            property: {
              agentId: ctx.isAgent ? sessionUserId : undefined,
              ...(ctx.isOwner
                ? {
                    agency: {
                      ownerId: sessionUserId,
                    },
                  }
                : {}),
            },
          }
        : {
            userId: sessionUserId,
          }),
  };

  return ctx.prisma.viewing.findMany({
    where,
    include: viewingInclude,
    orderBy: { scheduledAt: "asc" },
    take: filter?.limit ?? 20,
    skip: filter?.offset ?? 0,
  });
};
