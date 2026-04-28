import type { NotificationType } from './db/dbEnums.type.js';

/**
 * @file bot-notification-settings.types.ts
 * @summary Callback-константи і текстові лейбли для сцени налаштувань сповіщень профілю.
 */

export const NOTIFICATION_SETTINGS_ACTION = {
  OPEN: 'profile:notification-settings',
  BACK_TO_PROFILE: 'profile:notification:back-profile',
  TOGGLE_ALL_ON: 'profile:notification:all-on',
  TOGGLE_ALL_OFF: 'profile:notification:all-off',
} as const;

export const NOTIFICATION_SETTINGS_TOGGLE_PREFIX = 'profile:notification:toggle:';

export const NOTIFICATION_SETTINGS_TOGGLE_ACTION_REGEX =
  /^profile:notification:toggle:(booking_confirmation|status_change|visit_reminder|promo_news)$/;

export const NOTIFICATION_SETTINGS_LABELS: Record<NotificationType, string> = {
  booking_confirmation: '📩 Підтвердження запису',
  visit_reminder: '🔔 Нагадування перед візитом',
  status_change: '🔄 Зміни статусу запису',
  promo_news: '📢 Акції та новини',
};
