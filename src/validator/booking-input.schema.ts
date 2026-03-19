import { z } from 'zod';

/**
 * @file booking-input.schema.ts
 * @summary Валідація полів сценарію бронювання (ім'я та телефон).
 */

/**
 * Ім'я клієнта:
 * - тільки текст (літери + пробіли + апостроф/дефіс),
 * - мінімум 2 символи.
 */
export const bookingClientNameSchema = z
  .string()
  .trim()
  .min(2, "Ім'я має містити мінімум 2 символи")
  .max(60, "Ім'я занадто довге")
  .regex(/^[\p{L}\s'’-]+$/u, "Ім'я повинно містити тільки літери");

/**
 * Телефон клієнта у форматі Чехії:
 * - обов'язково починається з +420,
 * - рівно 9 цифр після коду країни.
 * Приклад: +420123456789
 */
export const bookingClientPhoneSchema = z
  .string()
  .trim()
  .regex(/^\+420\d{9}$/, 'Телефон повинен бути у форматі +420123456789');

/**
 * Код дати з callback payload:
 * YYYYMMDD, приклад: 20260320
 */
export const bookingDateCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{8}$/, 'Некоректний код дати');

/**
 * Код часу з callback payload:
 * HHMM, приклад: 1430
 */
export const bookingTimeCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{4}$/, 'Некоректний код часу');
