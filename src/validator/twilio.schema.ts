import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * @file twilio.schema.ts
 * @summary Validates optional Twilio ENV config.
 */

/**
 * uk: Zod схема ENV для Twilio.
 * en: Zod ENV schema for Twilio.
 * cz: Zod ENV schéma pro Twilio.
 */
export const twilioEnvSchema = z.object({
  TWILIO_ACCOUNT_SID: z.string().trim().min(1).optional(),
  TWILIO_AUTH_TOKEN: z.string().trim().min(1).optional(),
  TWILIO_PHONE_NUMBER: z.string().trim().min(1).optional(),
});

/**
 * uk: Runtime-конфіг Twilio.
 * en: Twilio runtime config.
 * cz: Twilio runtime konfigurace.
 */
export type TwilioRuntimeConfig = {
  enabled: boolean;
  accountSid: string | null;
  authToken: string | null;
  phoneNumber: string | null;
  missingFields: string[];
};

/**
 * uk: Нормалізує optional ENV.
 * en: Normalizes optional ENV value.
 * cz: Normalizuje optional ENV hodnotu.
 * @param value uk/en/cz: Сире значення/Raw value/Surová hodnota.
 */
function normalizeOptional(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * uk: Формує runtime-конфіг Twilio.
 * en: Resolves Twilio runtime config.
 * cz: Sestaví Twilio runtime konfiguraci.
 */
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

/**
 * uk: Опціональний Twilio конфіг.
 * en: Optional Twilio config.
 * cz: Volitelná Twilio konfigurace.
 */
export const twilioConfig = resolveTwilioConfig();
