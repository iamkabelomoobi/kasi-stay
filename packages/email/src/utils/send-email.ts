import "dotenv/config";
import nodemailer, { type Transporter } from "nodemailer";
import { Resend } from "resend";
import { EmailPayload } from "../templates/auth/auth-types";
import { logger } from "@kasistay/logger";

let resendClient: Resend | null = null;
let nodemailerClient: Transporter | null = null;

const requiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not set`);
  return value;
};

const extractEmailAddress = (value: string): string | null => {
  const normalized = value.trim();
  if (!normalized) return null;

  const angleBracketMatch = normalized.match(/<\s*([^<>\s]+@[^<>\s]+)\s*>/);
  if (angleBracketMatch?.[1]) return angleBracketMatch[1];

  const plainEmailMatch = normalized.match(/^[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+$/);
  if (plainEmailMatch) return normalized;

  return null;
};

const normalizeEnvelopeSender = (
  value: string,
  fallbackDomain = "kasistay.local",
): string => {
  const extracted = extractEmailAddress(value);
  if (extracted) return extracted;

  const normalized = value.trim().toLowerCase();
  if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(normalized)) {
    return `no-reply@${normalized}`;
  }

  return `no-reply@${fallbackDomain}`;
};

const logContext = (message: string, meta: Record<string, unknown>): string =>
  `${message} ${JSON.stringify(meta)}`;

export const getResendClient = (): Resend => {
  if (resendClient) return resendClient;
  resendClient = new Resend(requiredEnv("RESEND_API_KEY"));
  return resendClient;
};

export const getNodemailerClient = (): Transporter => {
  if (nodemailerClient) return nodemailerClient;

  nodemailerClient = nodemailer.createTransport({
    host: process.env.MAILHOG_HOST?.trim() || "localhost",
    port: Number(process.env.MAILHOG_PORT || "1025"),
    secure: process.env.MAILHOG_SECURE === "true",
    auth:
      process.env.MAILHOG_USER && process.env.MAILHOG_PASS
        ? {
            user: process.env.MAILHOG_USER,
            pass: process.env.MAILHOG_PASS,
          }
        : undefined,
  });

  return nodemailerClient;
};

export const sendEmail = async (payload: EmailPayload): Promise<void> => {
  const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];
  const useMailhog = process.env.MAIL_PROVIDER === "mailhog";

  if (useMailhog) {
    const client = getNodemailerClient();
    const configuredFrom =
      process.env.MAILHOG_FROM?.trim() || "kasistay <no-reply@kasistay.local>";
    const envelopeFrom = normalizeEnvelopeSender(configuredFrom);

    if (!extractEmailAddress(configuredFrom)) {
      logger.warn(
        logContext(
          "[email] MAILHOG_FROM is not a valid mailbox/header value; using fallback envelope sender",
          { configuredFrom, envelopeFrom },
        ),
      );
    }

    try {
      const info = await client.sendMail({
        from: configuredFrom,
        envelope: {
          from: envelopeFrom,
          to: recipients,
        },
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      });

      logger.info(
        logContext("[email] Sent to MailHog", {
          messageId: info.messageId,
          to: recipients,
        }),
      );
      return;
    } catch (error) {
      logger.error(
        logContext("[email] Failed to send to MailHog", {
          err: error,
          to: recipients,
        }),
      );
      throw error;
    }
  }

  const client = getResendClient();
  const from = requiredEnv("RESEND_FROM");

  try {
    const result = await client.emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    logger.info(
      logContext("[email] Queued via Resend", {
        emailId: result.data?.id,
        to: recipients,
      }),
    );
  } catch (error) {
    logger.error(
      logContext("[email] Failed to send via Resend", {
        err: error,
        to: recipients,
      }),
    );
    throw error;
  }
};
