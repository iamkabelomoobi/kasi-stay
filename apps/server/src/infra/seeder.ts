import { auth, createRoleRecord } from "@kasistay/auth";
import { prisma, UserRole } from "@kasistay/db";
import { pathToFileURL } from "node:url";

export const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminName = process.env.ADMIN_NAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      console.log(`[seeder] Admin user ${adminEmail} already exists.`);
      const existingAdmin = await prisma.admin.findUnique({
        where: { userId: existingUser.id },
      });
      if (!existingAdmin) {
        await prisma.admin.create({ data: { userId: existingUser.id } });
        console.log(
          `[seeder] Created missing admin profile for ${adminEmail}.`,
        );
      }
      return await prisma.admin.findUnique({
        where: { userId: existingUser.id },
      });
    }

    console.log(`[seeder] Creating admin user: ${adminEmail}`);

    await auth.api.signUpEmail({
      body: {
        email: adminEmail!,
        password: adminPassword!,
        name: adminName!,
      },
    });

    const user = await prisma.user.update({
      where: { email: adminEmail },
      data: { role: UserRole.ADMIN, emailVerified: true },
    });

    await createRoleRecord({ id: user.id, role: UserRole.ADMIN });

    const adminProfile = await prisma.admin.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    console.log(`[seeder] Admin user and profile created successfully.`);
    return adminProfile;
  } catch (error: any) {
    console.warn(`[seeder] Admin seeding information: ${error.message}`);
  }
};

export const seedCustomer = async () => {
  const customerEmail = process.env.CUSTOMER_EMAIL ?? "customer@example.com";
  const customerName = process.env.CUSTOMER_NAME ?? "Sample Customer";
  const customerPassword = process.env.CUSTOMER_PASSWORD ?? "customer123";

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (existingUser) {
      console.log(`[seeder] Customer user ${customerEmail} already exists.`);
      const existingCustomer = await prisma.customer.findUnique({
        where: { userId: existingUser.id },
      });
      if (!existingCustomer) {
        await prisma.customer.create({ data: { userId: existingUser.id } });
        console.log(
          `[seeder] Created missing customer profile for ${customerEmail}.`,
        );
      }
      return await prisma.customer.findUnique({
        where: { userId: existingUser.id },
      });
    }

    console.log(`[seeder] Creating customer user: ${customerEmail}`);

    await auth.api.signUpEmail({
      body: {
        email: customerEmail,
        password: customerPassword,
        name: customerName,
      },
    });

    const user = await prisma.user.update({
      where: { email: customerEmail },
      data: { role: UserRole.CUSTOMER, emailVerified: true },
    });

    await createRoleRecord({ id: user.id, role: UserRole.CUSTOMER });

    const customerProfile = await prisma.customer.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    console.log(`[seeder] Customer user and profile created successfully.`);
    return customerProfile;
  } catch (error: any) {
    console.warn(`[seeder] Customer seeding information: ${error.message}`);
  }
};


const main = async () => {
  const adminProfile = await seedAdmin();
  if (!adminProfile) throw new Error("[seeder] Failed to seed admin.");

  const customerProfile = await seedCustomer();
  if (!customerProfile) throw new Error("[seeder] Failed to seed customer.");

};

export const runSeeder = async () => {
  await main()
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
};

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  void runSeeder();
}
