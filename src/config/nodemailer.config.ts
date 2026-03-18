import { mailerConfig } from "../validator/nodemailer.schema.js";

/**
 * @file nodemailer.config.ts
 * @summary Централізований SMTP-конфіг для Nodemailer.
 */

const dkim =
  mailerConfig.SMTP_DKIM_DOMAIN_NAME &&
  mailerConfig.SMTP_DKIM_SELECTOR &&
  mailerConfig.SMTP_DKIM_PRIVATE_KEY
    ? {
        domainName: mailerConfig.SMTP_DKIM_DOMAIN_NAME,
        keySelector: mailerConfig.SMTP_DKIM_SELECTOR,
        // Підтримка формату з "\n" у .env
        privateKey: mailerConfig.SMTP_DKIM_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }
    : undefined;

export const nodemailerConfig = {
  host: mailerConfig.SMTP_HOST,
  port: mailerConfig.SMTP_PORT,
  secure: mailerConfig.SMTP_SECURE,

  auth: {
    user: mailerConfig.SMTP_USER,
    pass: mailerConfig.SMTP_PASSWORD,
  },

  pool: mailerConfig.SMTP_POOL,
  maxConnections: mailerConfig.SMTP_POOL_MAX_CONNECTIONS,
  maxMessages: mailerConfig.SMTP_POOL_MAX_MESSAGES,

  connectionTimeout: mailerConfig.SMTP_CONNECTION_TIMEOUT_MS,
  greetingTimeout: mailerConfig.SMTP_GREETING_TIMEOUT_MS,
  socketTimeout: mailerConfig.SMTP_SOCKET_TIMEOUT_MS,

  tls: {
    rejectUnauthorized: mailerConfig.SMTP_TLS_REJECT_UNAUTHORIZED,
  },

  // Nodemailer використовує rateLimit тільки для pooled SMTP.
  rateLimit: mailerConfig.RATE_LIMIT > 0 ? mailerConfig.RATE_LIMIT : undefined,
  disableFileAccess: true,
  disableUrlAccess: true,
  dkim,
};

export const defaultMailFrom = mailerConfig.MAIL_FROM;

