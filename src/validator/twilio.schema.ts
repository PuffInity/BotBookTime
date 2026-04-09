import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * @file twilio.schema.ts
 * @summary Валідація ENV-змінних для Twilio SMS.
 */
export const twilioEnvSchema = z.object({
  TWILIO_ACCOUNT_SID: z.string().trim().min(1).optional(),
  TWILIO_AUTH_TOKEN: z.string().trim().min(1).optional(),
  TWILIO_PHONE_NUMBER: z.string().trim().min(1).optional(),
});

export type TwilioRuntimeConfig = {
  enabled: boolean;
  accountSid: string | null;
  authToken: string | null;
  phoneNumber: string | null;
  missingFields: string[];
};

function normalizeOptional(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function resolveTwilioConfig(): TwilioRuntimeConfig {
  const parsed = twilioEnvSchema.parse(process.env);
  const accountSid = normalizeOptional(parsed.TWILIO_ACCOUNT_SID);
  const authToken = normalizeOptional(parsed.TWILIO_AUTH_TOKEN);
  const phoneNumber = normalizeOptional(parsed.TWILIO_PHONE_NUMBER);

  const missingFields: string[] = [];
  if (!accountSid) missingFields.push('TWILIO_ACCOUNT_SID');
  if (!authToken) missingFields.push('TWILIO_AUTH_TOKEN');
  if (!phoneNumber) missingFields.push('TWILIO_PHONE_NUMBER');

  return {
    enabled: missingFields.length === 0,
    accountSid,
    authToken,
    phoneNumber,
    missingFields,
  };
}

/** Опціональна конфігурація Twilio: якщо ENV неповний — SMS канал відключено без падіння застосунку. */
export const twilioConfig = resolveTwilioConfig();
