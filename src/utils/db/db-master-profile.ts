import { ValidationError } from '../error.utils.js';
import { profileEmailSchema } from '../../validator/bot-input.schema.js';
import { bookingClientPhoneSchema } from '../../validator/booking-input.schema.js';

/**
 * @file db-master-profile.ts
 * @summary Нормалізація/валідація вхідних полів редагування профілю майстра.
 */

export function normalizeMasterBio(value: string): string {
  const normalized = value.trim();
  if (normalized.length < 10) {
    throw new ValidationError('Опис профілю має містити мінімум 10 символів', { value });
  }
  if (normalized.length > 1000) {
    throw new ValidationError('Опис профілю занадто довгий (максимум 1000 символів)', { value });
  }
  return normalized;
}

export function normalizeMasterMaterialsInfo(value: string): string {
  const normalized = value.trim();
  if (normalized.length < 2) {
    throw new ValidationError('Матеріали мають містити мінімум 2 символи', { value });
  }
  if (normalized.length > 500) {
    throw new ValidationError('Опис матеріалів занадто довгий (максимум 500 символів)', { value });
  }
  return normalized;
}

export function normalizeMasterContactPhone(value: string): string {
  const parsed = bookingClientPhoneSchema.safeParse(value);
  if (!parsed.success) {
    throw new ValidationError('Телефон має бути у форматі +420123456789', {
      value,
      issues: parsed.error.issues,
    });
  }
  return parsed.data;
}

export function normalizeMasterContactEmail(value: string): string {
  const parsed = profileEmailSchema.safeParse(value);
  if (!parsed.success) {
    throw new ValidationError('Некоректний формат email', {
      value,
      issues: parsed.error.issues,
    });
  }
  return parsed.data;
}
