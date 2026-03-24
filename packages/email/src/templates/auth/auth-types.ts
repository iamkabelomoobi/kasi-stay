export interface BaseTemplateParams {
  email: string;
  appName: string;
}

export interface PasswordResetOtpTemplateParams extends BaseTemplateParams {
  otp: string;
  expiration: string;
}

export interface PasswordResetTemplateParams extends BaseTemplateParams {
  token: string;
  expiration: string;
}

export interface PasswordResetLinkTemplateParams extends BaseTemplateParams {
  resetUrl: string;
}

export interface EmailVerificationTemplateParams extends BaseTemplateParams {
  verificationUrl: string;
}

export interface PasswordUpdateTemplateParams extends BaseTemplateParams {
  name: string;
}

export interface WelcomeTemplateParams extends BaseTemplateParams {
  name: string;
  loginUrl?: string;
}

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};
