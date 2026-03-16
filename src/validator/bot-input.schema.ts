import { z } from 'zod';

/**
 * @file bot-input.schema.ts
 * @summary Валідація вхідних даних update-потоку Telegram-бота.
 */

/**
 * Валідний telegram user id для профільних операцій.
 */
export const telegramUserIdSchema = z.number().int().positive();

