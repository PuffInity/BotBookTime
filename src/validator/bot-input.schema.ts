import { z } from 'zod';

/**
 * @file bot-input.schema.ts
 * @summary Validation schemas for Telegram update input.
 */

/**
 * uk: Валідний Telegram user id.
 * en: Valid Telegram user id.
 * cz: Validní Telegram user id.
 */
export const telegramUserIdSchema = z.number().int().positive();

/**
 * uk: Валідний email профілю.
 * en: Valid profile email.
 * cz: Validní profilový email.
 */
export const profileEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(5, 'Email має містити мінімум 5 символів')
  .max(100, 'Email занадто довгий')
  .email('Некоректний формат email');
