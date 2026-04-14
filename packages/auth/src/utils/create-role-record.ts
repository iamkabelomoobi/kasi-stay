import { prisma, UserRole } from "@kasistay/db";

export type AuthHookUser = {
  id: string;
  role?: unknown;
  name?: unknown;
  email?: unknown;
};

const asUserRole = (role: unknown): UserRole => {
  if (role === UserRole.ADMIN || role === UserRole.CUSTOMER) {
    return role;
  }
  return UserRole.CUSTOMER;
};

export const createRoleRecord = async (user: AuthHookUser): Promise<void> => {
  const role = asUserRole(user.role);

  if (role === UserRole.ADMIN) {
    await prisma.admin.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
      },
    });
    return;
  }

  if (role === UserRole.CUSTOMER) {
    await prisma.customer.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
      },
    });
    return;
  }
};
