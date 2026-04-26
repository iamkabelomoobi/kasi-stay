import { PropertyStatus } from "@kasistay/db";
import { Context } from "../../../app/context";
import { propertyInclude } from "../../properties/queries";

export const listPendingProperties = async (ctx: Context) => {
  ctx.assertAdmin();
  return ctx.prisma.property.findMany({
    where: {
      status: PropertyStatus.PUBLISHED,
      isVerified: false,
    },
    include: propertyInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const getAdminAnalyticsOverview = async (ctx: Context) => {
  ctx.assertAdmin();

  const [
    totalProperties,
    pendingProperties,
    totalInquiries,
    openReports,
    activeSubscriptions,
  ] = await Promise.all([
    ctx.prisma.property.count(),
    ctx.prisma.property.count({
      where: {
        status: PropertyStatus.PUBLISHED,
        isVerified: false,
      },
    }),
    ctx.prisma.inquiry.count(),
    ctx.prisma.report.count({
      where: {
        status: {
          in: ["PENDING", "REVIEWED"],
        },
      },
    }),
    ctx.prisma.agentSubscription.count({
      where: {
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    }),
  ]);

  return {
    totalProperties,
    pendingProperties,
    totalInquiries,
    openReports,
    activeSubscriptions,
  };
};
