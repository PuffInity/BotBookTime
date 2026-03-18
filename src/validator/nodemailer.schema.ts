import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * @file nodemailer.schema.ts
 * @summary Валідація ENV-змінних для SMTP/Nodemailer.
 */
export const nodemailerEnvSchema = z.object({
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive().max(65535).default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  RATE_LIMIT: z.coerce.number().int().min(0).default(0),

  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),

  SMTP_POOL: z.coerce.boolean().default(true),
  SMTP_POOL_MAX_CONNECTIONS: z.coerce.number().int().positive().default(5),
  SMTP_POOL_MAX_MESSAGES: z.coerce.number().int().positive().default(100),
  SMTP_KEEP_ALIVE: z.coerce.boolean().default(true),

  SMTP_CONNECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  SMTP_GREETING_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  SMTP_SOCKET_TIMEOUT_MS: z.coerce.number().int().positive().default(20000),

  SMTP_TLS_REJECT_UNAUTHORIZED: z.coerce.boolean().default(true),
  MAIL_FROM: z.string().min(1),

  SMTP_DKIM_DOMAIN_NAME: z.string().min(1).optional(),
  SMTP_DKIM_SELECTOR: z.string().min(1).optional(),
  SMTP_DKIM_PRIVATE_KEY: z.string().min(1).optional(),
});

/** Провалідована конфігурація Nodemailer, зібрана з process.env. */
export const mailerConfig = nodemailerEnvSchema.parse(process.env);

