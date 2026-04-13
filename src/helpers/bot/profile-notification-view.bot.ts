import { Markup } from 'telegraf';
import type { NotificationType } from '../../types/db/dbEnums.type.js';
import type { NotificationSettingsState } from '../../types/db-helpers/db-notification-settings.types.js';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import {
  NOTIFICATION_SETTINGS_ACTION,
  NOTIFICATION_SETTINGS_TOGGLE_PREFIX,
} from '../../types/bot-notification-settings.types.js';
import { tBot } from './i18n.bot.js';
import type { BotUiLanguage } from './i18n.bot.js';
import type { BotDictionaryKey } from './i18n.bot.js';

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

/**
 * uk: Внутрішня bot helper функція getStatusIcon.
 * en: Internal bot helper function getStatusIcon.
 * cz: Interní bot helper funkce getStatusIcon.
 */
function getStatusIcon(enabled: boolean): string {
  return enabled ? '✅' : '⚪';
}

/**
 * @summary Форматує текст екрана налаштувань сповіщень.
 */
export function formatNotificationSettingsText(
  state: NotificationSettingsState,
  language: BotUiLanguage,
): string {
  const lines: string[] = [];

  lines.push(tBot(language, 'PROFILE_NOTIFICATION_TITLE'));
  lines.push('━━━━━━━━━━━━━━');
  lines.push(tBot(language, 'PROFILE_NOTIFICATION_CHOOSE'));
  lines.push('');

  const labelKeyByType: Record<NotificationType, BotDictionaryKey> = {
    booking_confirmation: 'PROFILE_NOTIFICATION_BOOKING_CONFIRMATION',
    visit_reminder: 'PROFILE_NOTIFICATION_VISIT_REMINDER',
    status_change: 'PROFILE_NOTIFICATION_STATUS_CHANGE',
    promo_news: 'PROFILE_NOTIFICATION_PROMO',
  };

  for (const type of NOTIFICATION_ORDER) {
    lines.push(`${getStatusIcon(state[type])} ${tBot(language, labelKeyByType[type])}`);
  }

  lines.push('');
  lines.push(tBot(language, 'PROFILE_NOTIFICATION_DELIVERY'));

  return lines.join('\n');
}

/**
 * @summary Створює inline-клавіатуру для керування налаштуваннями сповіщень.
 */
export function createNotificationSettingsKeyboard(
  state: NotificationSettingsState,
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        `${getStatusIcon(state.booking_confirmation)} ${tBot(language, 'PROFILE_NOTIFICATION_BOOKING_CONFIRMATION')}`,
        `${NOTIFICATION_SETTINGS_TOGGLE_PREFIX}booking_confirmation`,
      ),
    ],
    [
      Markup.button.callback(
        `${getStatusIcon(state.visit_reminder)} ${tBot(language, 'PROFILE_NOTIFICATION_VISIT_REMINDER')}`,
        `${NOTIFICATION_SETTINGS_TOGGLE_PREFIX}visit_reminder`,
      ),
    ],
    [
      Markup.button.callback(
        `${getStatusIcon(state.status_change)} ${tBot(language, 'PROFILE_NOTIFICATION_STATUS_CHANGE')}`,
        `${NOTIFICATION_SETTINGS_TOGGLE_PREFIX}status_change`,
      ),
    ],
    [
      Markup.button.callback(
        `${getStatusIcon(state.promo_news)} ${tBot(language, 'PROFILE_NOTIFICATION_PROMO')}`,
        `${NOTIFICATION_SETTINGS_TOGGLE_PREFIX}promo_news`,
      ),
    ],
    [
      Markup.button.callback(tBot(language, 'PROFILE_NOTIFICATION_ALL_ON'), NOTIFICATION_SETTINGS_ACTION.TOGGLE_ALL_ON),
      Markup.button.callback(tBot(language, 'PROFILE_NOTIFICATION_ALL_OFF'), NOTIFICATION_SETTINGS_ACTION.TOGGLE_ALL_OFF),
    ],
    [
      Markup.button.callback(tBot(language, 'BACK_TO_PROFILE'), NOTIFICATION_SETTINGS_ACTION.BACK_TO_PROFILE),
      Markup.button.callback(tBot(language, 'HOME'), COMMON_NAV_ACTION.HOME),
    ],
  ]);
}

/**
 * @summary Текст успішного оновлення налаштувань.
 */
export function notificationSettingsUpdatedText(language: BotUiLanguage): string {
  return tBot(language, 'PROFILE_NOTIFICATION_UPDATED');
}
