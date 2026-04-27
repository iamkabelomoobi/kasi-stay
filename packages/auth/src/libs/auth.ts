import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma, UserRole } from "@kasistay/db";
import { sendEmail, authenticationTemplates } from "@kasistay/email";
import { logger } from "@kasistay/logger";
import { createRoleRecord } from "../utils/create-role-record";

const appName = process.env.APP_NAME || "kasistay";
const defaultFrontendUrl = "http://localhost:3000";

const resolveFrontendUrl = (): string => {
  const configuredFrontendUrl = process.env.FRONTEND_URL?.trim();

  if (!configuredFrontendUrl) return defaultFrontendUrl;

  try {
    return new URL(configuredFrontendUrl).toString();
  } catch (error) {
    logger.warn("Invalid FRONTEND_URL configured for auth redirects", {
      error,
      frontendUrl: configuredFrontendUrl,
    });
    return defaultFrontendUrl;
  }
};

type AuthUser = {
  id?: string;
  name: string;
  email: string;
  role?: UserRole;
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = new URL(url);
        const callbackUrl = new URL(
          "/auth/verified",
          resolveFrontendUrl(),
        ).toString();

        verificationUrl.searchParams.set(
          "callbackURL",
          callbackUrl,
        );

        logger.debug(`Sending email verification to ${user.email}`);
        void sendEmail(
          authenticationTemplates.emailVerificationTemplate({
            email: user.email,
            verificationUrl: verificationUrl.toString(),
            appName,
          }),
        );
      } catch (error) {
        logger.error("Failed to send email verification", { error });
      }
    },
    afterEmailVerification: async (user, request) => {
      void sendEmail(
        authenticationTemplates.welcomeTemplate({
          email: user.email,
          name: user.name,
          appName,
        }),
      );
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    onExistingUserSignUp: async ({ user }, request) => {
      logger.warn(
        `User with email ${user.email} attempted to sign up but already exists. Consider implementing account recovery options.`,
      );
    },
    sendResetPassword: async ({ user, url }) => {
      try {
        logger.debug(`Sending reset password email to ${user.email}`);
        void sendEmail(
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
        void sendEmail(
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
        defaultValue: UserRole.RENTER,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const safeRole = UserRole.RENTER;

            if (user.role !== safeRole) {
              logger.warn(
                `Rejected privileged signup role "${user.role}" for ${user.email}. Downgrading to RENTER.`,
              );
            }

            logger.info(
              `New user created: ${user.email} with role ${safeRole}`,
            );
            await createRoleRecord({
              id: user.id,
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
    "http://localhost:3000",
    "http://127.0.0.1:4000",
    "http://localhost:4000",
    ...(process.env.NODE_ENV === "development" ? ["*"] : []),
  ],
  advanced: {
    ipAddress: {
      ipv6Subnet: 64,
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
