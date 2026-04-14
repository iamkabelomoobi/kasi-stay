import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma, Prisma } from "@kasistay/db";
import { sendEmail, authenticationTemplates } from "@kasistay/email";
import { logger } from "@kasistay/logger";
import { createRoleRecord } from "../utils/create-role-record";

const appName = process.env.APP_NAME || "kasistay";

if (!process.env.APP_NAME) {
  logger.warn("APP_NAME is not set, using default: kasistay");
}

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Prisma.Prisma.UserRole;
};

const sendWelcomeEmail = async (user: AuthUser): Promise<void> => {
  await sendEmail(
    authenticationTemplates.welcomeTemplate({
      email: user.email,
      name: user.name,
      appName,
    }),
  );
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      try {
        logger.debug(`Sending reset password email to ${user.email}`);
        await sendEmail(
          authenticationTemplates.passwordResetLinkTemplate({
            email: user.email,
            resetUrl: url,
            appName,
          }),
        );
      } catch (error) {
        logger.error("Failed to send reset password email", { error });
      }
    },
    onPasswordReset: async ({ user }) => {
      try {
        logger.debug(`Sending password update email to ${user.email}`);
        await sendEmail(
          authenticationTemplates.passwordUpdateTemplate({
            email: user.email,
            name: user.name,
            appName,
          }),
        );
      } catch (error) {
        logger.error("Failed to send password update email", { error });
      }
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: Prisma.UserRole.CUSTOMER,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const safeRole = Prisma.UserRole.CUSTOMER;

            if (user.role !== safeRole) {
              logger.warn(
                `Rejected privileged signup role "${user.role}" for ${user.email}. Downgrading to CUSTOMER.`,
              );
            }

            logger.info(
              `New user created: ${user.email} with role ${safeRole}`,
            );
            await prisma.user.update({
              where: { id: user.id },
              data: {
                emailVerified: true,
                role: safeRole,
              },
            });
            await createRoleRecord({
              ...user,
              role: safeRole,
            });
            await sendWelcomeEmail({
              id: user.id,
              name: user.name,
              email: user.email,
              role: safeRole,
            });
          } catch (error) {
            logger.error("Failed to post-process new user", { error });
          }
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  trustedOrigins: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://127.0.0.1:4000",
    "http://localhost:4000",
    ...(process.env.NODE_ENV === "development" ? ["*"] : []),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
