import { Markup } from 'telegraf';
import type { NotificationType } from '../../types/db/dbEnums.type.js';
import type { NotificationSettingsState } from '../../types/db-helpers/db-notification-settings.types.js';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import {
  NOTIFICATION_SETTINGS_ACTION,
  NOTIFICATION_SETTINGS_LABELS,
  NOTIFICATION_SETTINGS_TOGGLE_PREFIX,
} from '../../types/bot-notification-settings.types.js';

/**
 * @file profile-notification-view.bot.ts
 * @summary UI/helper-и для екрана налаштувань сповіщень у профілі.
 */

const NOTIFICATION_ORDER: NotificationType[] = [
  'booking_confirmation',
  'visit_reminder',
  'status_change',
  'promo_news',
];

function getStatusIcon(enabled: boolean): string {
  return enabled ? '✅' : '⚪';
}

/**
 * @summary Форматує текст екрана налаштувань сповіщень.
 */
export function formatNotificationSettingsText(state: NotificationSettingsState): string {
  const lines: string[] = [];

  lines.push('🔔 Налаштування сповіщень');
  lines.push('━━━━━━━━━━━━━━');
  lines.push('Оберіть тип сповіщень, які ви хочете отримувати:');
  lines.push('');

  for (const type of NOTIFICATION_ORDER) {
    lines.push(`${getStatusIcon(state[type])} ${NOTIFICATION_SETTINGS_LABELS[type]}`);
  }

  lines.push('');
  lines.push('Telegram-сповіщення надходять завжди, якщо тип увімкнений.');
  lines.push('Email/SMS надходять лише для підтверджених контактів.');

  return lines.join('\n');
}

/**
 * @summary Створює inline-клавіатуру для керування налаштуваннями сповіщень.
 */
export function createNotificationSettingsKeyboard(
  state: NotificationSettingsState,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        `${getStatusIcon(state.booking_confirmation)} Підтвердження запису`,
        `${NOTIFICATION_SETTINGS_TOGGLE_PREFIX}booking_confirmation`,
      ),
    ],
    [
      Markup.button.callback(
        `${getStatusIcon(state.visit_reminder)} Нагадування`,
        `${NOTIFICATION_SETTINGS_TOGGLE_PREFIX}visit_reminder`,
      ),
    ],
    [
      Markup.button.callback(
        `${getStatusIcon(state.status_change)} Зміни статусу`,
        `${NOTIFICATION_SETTINGS_TOGGLE_PREFIX}status_change`,
      ),
    ],
    [
      Markup.button.callback(
        `${getStatusIcon(state.promo_news)} Акції та новини`,
        `${NOTIFICATION_SETTINGS_TOGGLE_PREFIX}promo_news`,
      ),
    ],
    [
      Markup.button.callback('🔄 Увімкнути всі', NOTIFICATION_SETTINGS_ACTION.TOGGLE_ALL_ON),
      Markup.button.callback('🔕 Вимкнути всі', NOTIFICATION_SETTINGS_ACTION.TOGGLE_ALL_OFF),
    ],
    [
      Markup.button.callback('⬅️ Повернутися до профілю', NOTIFICATION_SETTINGS_ACTION.BACK_TO_PROFILE),
      Markup.button.callback('🏠 Головне меню', COMMON_NAV_ACTION.HOME),
    ],
  ]);
}

/**
 * @summary Текст успішного оновлення налаштувань.
 */
export function notificationSettingsUpdatedText(): string {
  return 'Налаштування оновлено ✅';
}
