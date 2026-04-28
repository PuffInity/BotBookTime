import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * @file translate.schema.ts
 * @summary Validates ENV for translation feature gate.
 */

/**
 * uk: Парсер boolean з ENV.
 * en: Boolean parser for ENV.
 * cz: Boolean parser pro ENV.
 */
const envBoolean = z.preprocess((value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return value;

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off', ''].includes(normalized)) return false;

  return value;
}, z.boolean());

/**
 * uk: Zod схема ENV перекладу.
 * en: Zod ENV schema for translation.
 * cz: Zod ENV schéma pro překlad.
 */
export const translateEnvSchema = z.object({
  TRANSLATE_ENABLED: envBoolean.default(false),
  TRANSLATE_PROVIDER: z.enum(['google']).default('google'),
  GOOGLE_TRANSLATE_API_KEY: z.string().trim().min(1).optional(),
  TRANSLATE_CACHE_TTL_SEC: z.coerce.number().int().min(60).max(60 * 60 * 24 * 30).default(60 * 60 * 24 * 7),
  TRANSLATE_TIMEOUT_MS: z.coerce.number().int().min(500).max(30_000).default(5_000),
  TRANSLATE_MAX_TEXT_LENGTH: z.coerce.number().int().min(10).max(10_000).default(2_000),
  TRANSLATE_DEFAULT_SOURCE: z.enum(['uk', 'en', 'cs']).default('uk'),
});

/**
 * uk: Провалідований translate конфіг.
 * en: Parsed translate config.
 * cz: Validovaný translate config.
 */
export const translateSchemaConfig = translateEnvSchema.parse(process.env);
