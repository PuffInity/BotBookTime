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

export function normalizeMasterDisplayName(value: string): string {
  const normalized = value.trim();
  if (normalized.length < 2 || normalized.length > 30) {
    throw new ValidationError("Ім'я майстра має бути від 2 до 30 символів", { value });
  }

  const parsed = /^[\p{L}\s.'’-]+$/u.test(normalized);
  if (!parsed) {
    throw new ValidationError("Ім'я майстра повинно містити тільки літери", { value });
  }

  return normalized;
}

export function normalizeMasterProceduresDoneTotal(value: string | number): number {
  const raw = typeof value === 'number' ? String(value) : value.trim();
  if (!/^\d+$/.test(raw)) {
    throw new ValidationError('Кількість процедур має бути числом', { value });
  }

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100000) {
    throw new ValidationError('Кількість процедур має бути від 0 до 100000', { value });
  }

  return parsed;
}

export function normalizeMasterStartedOn(value: string): string {
  const normalized = value.trim();
  const match = normalized.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) {
    throw new ValidationError('Дата має бути у форматі ДД.ММ.РРРР', { value });
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    throw new ValidationError('Некоректна дата початку роботи', { value });
  }

  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const parsedOnly = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  if (parsedOnly.getTime() > todayOnly.getTime()) {
    throw new ValidationError('Дата початку роботи не може бути в майбутньому', { value });
  }

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}
