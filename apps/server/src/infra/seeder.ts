import { auth, createRoleRecord } from "@kasistay/auth";
import { prisma, UserRole } from "@kasistay/db";
import { pathToFileURL } from "node:url";

export const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminName = process.env.ADMIN_NAME?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!adminEmail || !adminName || !adminPassword) {
    console.info(
      "[seeder] Skipping admin seed. Set ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD to enable it.",
    );
    return null;
  }

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
        email: adminEmail,
        password: adminPassword,
        name: adminName,
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

export const seedrenter = async () => {
  const renterEmail = process.env.renter_EMAIL ?? "renter@example.com";
  const renterName = process.env.renter_NAME ?? "Sample renter";
  const renterPassword = process.env.renter_PASSWORD ?? "renter123";

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: renterEmail },
    });

    if (existingUser) {
      console.log(`[seeder] renter user ${renterEmail} already exists.`);
      const existingrenter = await prisma.renter.findUnique({
        where: { userId: existingUser.id },
      });
      if (!existingrenter) {
        await prisma.renter.create({ data: { userId: existingUser.id } });
        console.log(
          `[seeder] Created missing renter profile for ${renterEmail}.`,
        );
      }
      return await prisma.renter.findUnique({
        where: { userId: existingUser.id },
      });
    }

    console.log(`[seeder] Creating renter user: ${renterEmail}`);

    await auth.api.signUpEmail({
      body: {
        email: renterEmail,
        password: renterPassword,
        name: renterName,
      },
    });

    const user = await prisma.user.update({
      where: { email: renterEmail },
      data: { role: UserRole.RENTER, emailVerified: true },
    });

    await createRoleRecord({ id: user.id, role: UserRole.RENTER });

    const renterProfile = await prisma.renter.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    console.log(`[seeder] renter user and profile created successfully.`);
    return renterProfile;
  } catch (error: any) {
    console.warn(`[seeder] renter seeding information: ${error.message}`);
  }
};


const main = async () => {
  const adminProfile = await seedAdmin();
  if (!adminProfile) throw new Error("[seeder] Failed to seed admin.");

  const renterProfile = await seedrenter();
  if (!renterProfile) throw new Error("[seeder] Failed to seed renter.");

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
