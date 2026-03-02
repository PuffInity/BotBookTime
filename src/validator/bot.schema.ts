import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * @file bot.schema.ts
 * @summary Валідація ENV для запуску Telegram-бота.
 */

export const botEnvSchema = z.object({
  /** Токен Telegram-бота від BotFather */
  BOT_TOKEN: z.string().min(1, 'BOT_TOKEN обовʼязковий'),
  /** Не обовʼязкові параметри логування/оточення */
  NODE_ENV: z.string().optional(),
  LOG_LEVEL: z.string().optional(),
});

export const botConfig = botEnvSchema.parse(process.env);
