import { z } from 'zod';

/**
 * @file bot-input.schema.ts
 * @summary Валідація вхідних даних update-потоку Telegram-бота.
 */

/**
 * Валідний telegram user id для профільних операцій.
 */
export const telegramUserIdSchema = z.number().int().positive();

/**
 * Валідний email для профільних операцій.
 */
export const profileEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(5, 'Email має містити мінімум 5 символів')
  .max(100, 'Email занадто довгий')
  .email('Некоректний формат email');
