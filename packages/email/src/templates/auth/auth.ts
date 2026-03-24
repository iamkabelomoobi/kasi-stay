import Mailgen from "mailgen";
import { getMailgenInstance } from "../../libs";
import {
  EmailPayload,
  EmailVerificationTemplateParams,
  PasswordResetLinkTemplateParams,
  PasswordResetOtpTemplateParams,
  PasswordResetTemplateParams,
  PasswordUpdateTemplateParams,
  WelcomeTemplateParams,
} from "./auth-types";

class AuthenticationTemplates {
  private static instance: AuthenticationTemplates;

  private getMailgen = (): Mailgen => getMailgenInstance("default");

  private buildPayload = (
    email: string,
    subject: string,
    template: Mailgen.Content,
    mailGenerator: Mailgen,
  ): EmailPayload => ({
    to: email,
    subject,
    html: mailGenerator.generate(template),
    text: mailGenerator.generatePlaintext(template),
  });

  private constructor() {}

  static getInstance(): AuthenticationTemplates {
    if (!AuthenticationTemplates.instance) {
      AuthenticationTemplates.instance = new AuthenticationTemplates();
    }
    return AuthenticationTemplates.instance;
  }

  passwordResetOtpTemplate = (
    params: PasswordResetOtpTemplateParams,
  ): EmailPayload => {
    const { email, otp, expiration, appName } = params;

    const template: Mailgen.Content = {
      body: {
        greeting: "Hello",
        intro: [
          "We received a request to reset your password.",
          "Use the verification code below to complete your password reset.",
        ],
        table: {
          data: [{ "Verification Code": otp }],
          columns: {
            customWidth: { "Verification Code": "100%" },
            customAlignment: { "Verification Code": "center" },
          },
        },
        outro: [
          `This code will expire in ${expiration}.`,
          "If you didn't request a password reset, please ignore this email or contact support.",
          "For security reasons, never share this code with anyone.",
        ],
        signature: "Best regards",
      },
    };

    return this.buildPayload(
      email,
      `Your ${appName} Password Reset Code: ${otp}`,
      template,
      this.getMailgen(),
    );
  };

  passwordResetTemplate = (
    params: PasswordResetTemplateParams,
  ): EmailPayload => {
    const { email, token, expiration, appName } = params;

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

    const template: Mailgen.Content = {
      body: {
        greeting: "Hello",
        intro: [
          "We received a request to reset your password.",
          "If this wasn't you, simply ignore this email.",
        ],
        action: {
          instructions:
            "Click the button below to securely reset your password.",
          button: {
            color: "#4F46E5",
            text: "Reset Password",
            link: resetUrl,
          },
        },
        outro: [
          `This link will expire in ${expiration}.`,
          "For security, do not share this link with anyone.",
        ],
        signature: "Regards",
      },
    };

    return this.buildPayload(
      email,
      `Reset your ${appName} password`,
      template,
      this.getMailgen(),
    );
  };

  passwordResetLinkTemplate = (
    params: PasswordResetLinkTemplateParams,
  ): EmailPayload => {
    const { email, resetUrl, appName } = params;

    const template: Mailgen.Content = {
      body: {
        greeting: "Hello",
        intro: [
          "We received a request to reset your password.",
          "If this wasn't you, simply ignore this email.",
        ],
        action: {
          instructions:
            "Click the button below to securely reset your password.",
          button: {
            color: "#4F46E5",
            text: "Reset Password",
            link: resetUrl,
          },
        },
        outro: ["For security, do not share this link with anyone."],
        signature: "Regards",
      },
    };

    return this.buildPayload(
      email,
      `Reset your ${appName} password`,
      template,
      this.getMailgen(),
    );
  };

  emailVerificationTemplate = (
    params: EmailVerificationTemplateParams,
  ): EmailPayload => {
    const { email, verificationUrl, appName } = params;

    const template: Mailgen.Content = {
      body: {
        greeting: "Hello",
        intro: [
          `Thanks for signing up for ${appName}.`,
          "Please verify your email to activate your account.",
        ],
        action: {
          instructions: "Click the button below to verify your email address.",
          button: {
            color: "#4F46E5",
            text: "Verify Email",
            link: verificationUrl,
          },
        },
        outro: [
          "If you did not create this account, you can safely ignore this message.",
        ],
        signature: "Regards",
      },
    };

    return this.buildPayload(
      email,
      `Verify your ${appName} account`,
      template,
      this.getMailgen(),
    );
  };

  passwordUpdateTemplate = (
    params: PasswordUpdateTemplateParams,
  ): EmailPayload => {
    const { email, name, appName } = params;

    const template: Mailgen.Content = {
      body: {
        greeting: `Hello ${name}`,
        intro: [
          "Your password has been successfully updated.",
          "If you made this change, no further action is required.",
        ],
        action: {
          instructions:
            "If you did not make this change, secure your account immediately.",
          button: {
            color: "#DC2626",
            text: "Reset My Password",
            link: `${process.env.FRONTEND_URL}/auth/forgot-password`,
          },
        },
        outro: ["If you have any questions, please contact our support team."],
        signature: "Best regards",
      },
    };

    return this.buildPayload(
      email,
      `Your ${appName} password has been updated`,
      template,
      this.getMailgen(),
    );
  };

  welcomeTemplate = (params: WelcomeTemplateParams): EmailPayload => {
    const { email, name, appName, loginUrl } = params;

    const template: Mailgen.Content = {
      body: {
        greeting: `Welcome, ${name}!`,
        intro: [
          `Thank you for joining ${appName}.`,
          "Your account has been successfully created and you're ready to get started.",
        ],
        action: {
          instructions: "Click the button below to log in to your account.",
          button: {
            color: "#4F46E5",
            text: "Get Started",
            link: loginUrl ?? `${process.env.FRONTEND_URL}/auth/sign-in`,
          },
        },
        outro: [
          "If you have any questions or need help, feel free to reach out to our support team.",
        ],
        signature: "Welcome aboard",
      },
    };

    return this.buildPayload(
      email,
      `Welcome to ${appName}!`,
      template,
      this.getMailgen(),
    );
  };
}

export const authenticationTemplates = AuthenticationTemplates.getInstance();
