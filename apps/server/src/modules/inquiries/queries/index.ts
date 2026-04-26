import { InquiryStatus, Prisma } from "@kasistay/db";
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

export const inquiryInclude = {
  property: {
    include: propertyInclude,
  },
  user: true,
} satisfies Prisma.InquiryInclude;

const canManageInquiry = (
  ctx: Context,
  inquiry: {
    userId: string | null;
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
    inquiry.userId === userId ||
    inquiry.property.agentId === userId ||
    inquiry.property.agency?.ownerId === userId
  );
};

export const getInquiry = async (inquiryId: string, ctx: Context) => {
  const inquiry = await ctx.prisma.inquiry.findUnique({
    where: { id: inquiryId },
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
      user: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!inquiry) {
    notFound("Inquiry not found");
  }

  if (!canManageInquiry(ctx, inquiry!)) {
    unauthorized();
  }

  return ctx.prisma.inquiry.findUnique({
    where: { id: inquiryId },
    include: inquiryInclude,
  });
};

export const listInquiries = async (
  ctx: Context,
  filter?: {
    propertyId?: string | null;
    userId?: string | null;
    status?: string | null;
    limit?: number | null;
    offset?: number | null;
  },
) => {
  const status = parseEnum(
    InquiryStatus,
    filter?.status ?? undefined,
    "inquiry status",
  );
  const sessionUserId = ctx.assertAuth().id;

  const where: Prisma.InquiryWhereInput = {
    ...(filter?.propertyId && { propertyId: String(filter.propertyId) }),
    ...(status && { status }),
    ...(ctx.isAdmin
      ? {
          ...(filter?.userId && { userId: String(filter.userId) }),
        }
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

  return ctx.prisma.inquiry.findMany({
    where,
    include: inquiryInclude,
    orderBy: { createdAt: "desc" },
    take: filter?.limit ?? 20,
    skip: filter?.offset ?? 0,
  });
};
