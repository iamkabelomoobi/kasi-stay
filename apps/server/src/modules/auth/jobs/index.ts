import { createJobEnqueuer } from "../../../infra/queue";
import {
  PasswordResetOtpTemplateParams,
  PasswordResetTemplateParams,
  PasswordUpdateTemplateParams,
  WelcomeTemplateParams,
} from "@kasistay/email";

export const AUTH_PASSWORD_RESET_OTP_JOB =
  "auth.passwordResetOtpEmail" as const;
export const AUTH_PASSWORD_RESET_JOB = "auth.passwordResetEmail" as const;
export const AUTH_PASSWORD_UPDATED_JOB = "auth.passwordUpdatedEmail" as const;
export const AUTH_WELCOME_EMAIL_JOB = "auth.welcomeEmail" as const;

export type AuthPasswordResetOtpPayload = PasswordResetOtpTemplateParams;
export type AuthPasswordResetPayload = PasswordResetTemplateParams;
export type AuthPasswordUpdatedPayload = PasswordUpdateTemplateParams;
export type AuthWelcomeEmailPayload = WelcomeTemplateParams;

export const enqueuePasswordResetOtp =
  createJobEnqueuer<AuthPasswordResetOtpPayload>(AUTH_PASSWORD_RESET_OTP_JOB);

export const enqueuePasswordReset = createJobEnqueuer<AuthPasswordResetPayload>(
  AUTH_PASSWORD_RESET_JOB,
);

export const enqueuePasswordUpdated =
  createJobEnqueuer<AuthPasswordUpdatedPayload>(AUTH_PASSWORD_UPDATED_JOB);

export const enqueueWelcomeEmail = createJobEnqueuer<AuthWelcomeEmailPayload>(
  AUTH_WELCOME_EMAIL_JOB,
);
