import {
  AUTH_PASSWORD_RESET_JOB,
  AUTH_PASSWORD_RESET_OTP_JOB,
  AUTH_PASSWORD_UPDATED_JOB,
  AUTH_WELCOME_EMAIL_JOB,
  AuthPasswordResetOtpPayload,
  AuthPasswordResetPayload,
  AuthPasswordUpdatedPayload,
  AuthWelcomeEmailPayload,
} from "../../../modules/auth/jobs";
import { registerQueueProcessor } from "../../queue/registry";
import { sendEmail, authenticationTemplates } from "@kasistay/email";

const processPasswordResetOtp = async (
  payload: AuthPasswordResetOtpPayload,
): Promise<void> => {
  await sendEmail(authenticationTemplates.passwordResetOtpTemplate(payload));
};

const processPasswordReset = async (
  payload: AuthPasswordResetPayload,
): Promise<void> => {
  await sendEmail(authenticationTemplates.passwordResetTemplate(payload));
};

const processPasswordUpdated = async (
  payload: AuthPasswordUpdatedPayload,
): Promise<void> => {
  await sendEmail(authenticationTemplates.passwordUpdateTemplate(payload));
};

const processWelcomeEmail = async (
  payload: AuthWelcomeEmailPayload,
): Promise<void> => {
  await sendEmail(authenticationTemplates.welcomeTemplate(payload));
};

export const registerAuthProcessors = (): void => {
  registerQueueProcessor(AUTH_PASSWORD_RESET_OTP_JOB, processPasswordResetOtp);
  registerQueueProcessor(AUTH_PASSWORD_RESET_JOB, processPasswordReset);
  registerQueueProcessor(AUTH_PASSWORD_UPDATED_JOB, processPasswordUpdated);
  registerQueueProcessor(AUTH_WELCOME_EMAIL_JOB, processWelcomeEmail);
};
