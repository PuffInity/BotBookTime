import type { NotificationType } from '../../types/db/dbEnums.type.js';
import { NOTIFICATION_TYPES } from '../../types/db-helpers/db-notification-settings.types.js';
import { ValidationError } from '../error.utils.js';

/**
 * @file db-notification-settings.ts
 * @summary uk: Нормалізація та валідація payload для налаштувань сповіщень.
 * en: Module summary.
 * cz: Shrnutí modulu.
 */

const NOTIFICATION_TYPE_SET = new Set<NotificationType>(NOTIFICATION_TYPES);

/**
 * @summary uk: Нормалізує userId для SQL BIGINT-параметрів.
 * en: Normalizes userId for SQL BIGINT parameters.
 * cz: Normalizuje userId pro SQL BIGINT parametry.
 */
export function normalizeNotificationUserId(value: string | number): string {
  const normalized = String(value).trim();

  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError('Некоректний userId для налаштувань сповіщень', {
      userId: value,
    });
  }

  return normalized;
}

/**
 * @summary uk: Нормалізує notification_type до enum-підмножини, дозволеної в системі.
 * en: Normalizes notification_type to allowed enum subset.
 * cz: Normalizuje notification_type na povolenou enum podmnožinu.
 */
export function normalizeNotificationType(value: NotificationType | string): NotificationType {
  const normalized = String(value).trim() as NotificationType;

  if (!NOTIFICATION_TYPE_SET.has(normalized)) {
    throw new ValidationError('Некоректний notificationType', {
      notificationType: value,
    });
  }

  return normalized;
}

/**
 * @summary uk: Перевіряє тип enabled, щоб не пропустити не-булеві значення.
 * en: Validates enabled type to prevent non-boolean values.
 * cz: Validuje typ enabled, aby neprošly ne-boolean hodnoty.
 */
export function normalizeNotificationEnabled(value: boolean): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError('Поле enabled повинно бути boolean', {
      enabled: value,
    });
  }

  return value;
}
