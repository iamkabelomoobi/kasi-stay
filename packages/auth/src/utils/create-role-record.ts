import { prisma, UserRole, VerificationStatus } from "@kasistay/db";

export type AuthHookUser = {
  id: string;
  role?: unknown;
};

const asUserRole = (role: unknown): UserRole => {
  return Object.values(UserRole).includes(role as UserRole)
    ? (role as UserRole)
    : UserRole.RENTER;
};

export const createRoleRecord = async (user: AuthHookUser): Promise<void> => {
  const role = asUserRole(user.role);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { role },
    });

    await tx.admin.deleteMany({ where: { userId: user.id } });
    await tx.landlord.deleteMany({ where: { userId: user.id } });
    await tx.renter.deleteMany({ where: { userId: user.id } });

    switch (role) {
      case UserRole.ADMIN:
        await tx.admin.create({
          data: { userId: user.id },
        });
        break;

      case UserRole.LANDLORD:
        await tx.landlord.create({
          data: {
            userId: user.id,
            verificationStatus: VerificationStatus.PENDING,
          },
        });
        break;

      case UserRole.RENTER:
      default:
        await tx.renter.create({
          data: { userId: user.id },
        });
        break;
    }
  });
};
