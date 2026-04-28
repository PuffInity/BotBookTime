import { z } from 'zod';

/**
 * @file booking-input.schema.ts
 * @summary Validation schemas for booking scenario fields.
 */

/**
 * uk: Ім'я клієнта (мін. 2, тільки текст).
 * en: Client name (min 2, text only).
 * cz: Jméno klienta (min 2, pouze text).
 */
export const bookingClientNameSchema = z
  .string()
  .trim()
  .min(2, "Ім'я має містити мінімум 2 символи")
  .max(60, "Ім'я занадто довге")
  .regex(/^[\p{L}\s'’-]+$/u, "Ім'я повинно містити тільки літери");

/**
 * uk: Телефон у форматі +420XXXXXXXXX.
 * en: Phone in +420XXXXXXXXX format.
 * cz: Telefon ve formátu +420XXXXXXXXX.
 */
export const bookingClientPhoneSchema = z
  .string()
  .trim()
  .regex(/^\+420\d{9}$/, 'Телефон повинен бути у форматі +420123456789');

/**
 * uk: Код дати YYYYMMDD.
 * en: Date code YYYYMMDD.
 * cz: Kód data YYYYMMDD.
 */
export const bookingDateCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{8}$/, 'Некоректний код дати');

/**
 * uk: Код часу HHMM.
 * en: Time code HHMM.
 * cz: Kód času HHMM.
 */
export const bookingTimeCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{4}$/, 'Некоректний код часу');
