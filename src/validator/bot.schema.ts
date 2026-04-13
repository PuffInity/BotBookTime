import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * @file bot.schema.ts
 * @summary Validates Telegram bot ENV config.
 */

/**
 * uk: Zod схема ENV для бота.
 * en: Zod ENV schema for bot.
 * cz: Zod ENV schéma pro bota.
 */
export const botEnvSchema = z.object({
  // uk: Telegram токен / en: Telegram token / cz: Telegram token
  BOT_TOKEN: z.string().min(1, 'BOT_TOKEN обовʼязковий'),
  // uk: Середовище / en: Environment / cz: Prostředí
  NODE_ENV: z.string().optional(),
  // uk: Рівень логів / en: Log level / cz: Úroveň logů
  LOG_LEVEL: z.string().optional(),
});

/**
 * uk: Провалідований bot конфіг.
 * en: Parsed bot config.
 * cz: Validovaný bot config.
 */
export const botConfig = botEnvSchema.parse(process.env);
