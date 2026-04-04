import { Markup } from 'telegraf';
import type {
  MasterClientBookingsHistoryItem,
  MasterClientProfileItem,
} from '../../types/db-helpers/db-master-clients.types.js';
import {
  MASTER_PANEL_ACTION,
  makeMasterPanelBookingProfileAction,
  makeMasterPanelBookingClientHistoryAction,
} from '../../types/bot-master-panel.types.js';
import { tBot, type BotUiLanguage } from './i18n.bot.js';

/**
 * @file master-client-profile-view.bot.ts
 * @summary UI/helper-и для екрану "Профіль клієнта" в панелі майстра.
 */

function localeByLanguage(language: BotUiLanguage): string {
  if (language === 'en') return 'en-US';
  if (language === 'cs') return 'cs-CZ';
  return 'uk-UA';
}

function formatDate(date: Date, language: BotUiLanguage): string {
  return date.toLocaleDateString(localeByLanguage(language));
}

function languageLabel(
  language: MasterClientProfileItem['preferredLanguage'],
  uiLanguage: BotUiLanguage,
): string {
  switch (language) {
    case 'uk':
      return tBot(uiLanguage, 'MASTER_PANEL_CLIENT_PROFILE_LANG_UK');
    case 'en':
      return tBot(uiLanguage, 'MASTER_PANEL_CLIENT_PROFILE_LANG_EN');
    case 'cs':
      return tBot(uiLanguage, 'MASTER_PANEL_CLIENT_PROFILE_LANG_CS');
    default:
      return language;
  }
}

function fullName(profile: MasterClientProfileItem): string {
  return `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ''}`.trim();
}

function verificationLabel(value: string | null, verified: boolean, uiLanguage: BotUiLanguage): string {
  if (!value) return tBot(uiLanguage, 'MASTER_PANEL_CLIENT_PROFILE_PHONE_NOT_ADDED');
  return verified
    ? tBot(uiLanguage, 'MASTER_PANEL_CLIENT_PROFILE_PHONE_VERIFIED')
    : tBot(uiLanguage, 'MASTER_PANEL_CLIENT_PROFILE_PHONE_NOT_VERIFIED');
}

function telegramLabel(username: string | null, uiLanguage: BotUiLanguage): string {
  if (!username) return tBot(uiLanguage, 'PROFILE_NOT_SET');
  return username.startsWith('@') ? username : `@${username}`;
}

function statusLabel(status: MasterClientBookingsHistoryItem['status'], uiLanguage: BotUiLanguage): string {
  switch (status) {
    case 'pending':
      return tBot(uiLanguage, 'MASTER_PANEL_BOOKINGS_STATUS_PENDING');
    case 'confirmed':
      return tBot(uiLanguage, 'MASTER_PANEL_BOOKINGS_STATUS_CONFIRMED');
    case 'completed':
      return tBot(uiLanguage, 'MASTER_PANEL_BOOKINGS_STATUS_COMPLETED');
    case 'canceled':
      return tBot(uiLanguage, 'MASTER_PANEL_BOOKINGS_STATUS_CANCELED');
    case 'transferred':
      return tBot(uiLanguage, 'MASTER_PANEL_BOOKINGS_STATUS_TRANSFERRED');
    default:
      return status;
  }
}

function formatPrice(price: string, currencyCode: string): string {
  const normalized = price.replace(/[.,]00$/, '').replace(/([.,]\d)0$/, '$1');
  return `${normalized} ${currencyCode}`;
}

/**
 * @summary Формує текст профілю клієнта для перегляду майстром.
 */
export function formatMasterClientProfileText(
  profile: MasterClientProfileItem,
  language: BotUiLanguage,
): string {
  return (
    `${tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_LABEL_ID')}: ${profile.clientId}\n\n` +
    `${tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_LABEL_NAME')}: ${fullName(profile)}\n` +
    `${tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_LABEL_TELEGRAM')}: ${telegramLabel(profile.telegramUsername, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_LABEL_PHONE')}: ${profile.phoneE164 ?? tBot(language, 'PROFILE_NOT_SET')}\n` +
    `${tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_PHONE_STATUS')}: ${verificationLabel(profile.phoneE164, profile.phoneVerified, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_LABEL_EMAIL')}: ${profile.email ?? tBot(language, 'PROFILE_NOT_SET')}\n` +
    `${tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_EMAIL_STATUS')}: ${verificationLabel(profile.email, profile.emailVerified, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_LABEL_LANGUAGE')}: ${languageLabel(profile.preferredLanguage, language)}\n` +
    `${tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_LABEL_NOTIFICATIONS')}: ${
      profile.notificationsEnabled
        ? tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_NOTIFICATION_ON')
        : tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_NOTIFICATION_OFF')
    }\n\n` +
    `${tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_ADDITIONAL_INFO')}\n` +
    `${tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_LABEL_CREATED_AT')}: ${formatDate(profile.profileCreatedAt, language)}\n` +
    `${tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_LABEL_BOOKINGS_TOTAL')}: ${profile.bookingsTotal}\n` +
    `${tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_LABEL_BOOKINGS_CONFIRMED')}: ${profile.bookingsConfirmed}\n` +
    `${tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_LABEL_BOOKINGS_COMPLETED')}: ${profile.bookingsCompleted}\n` +
    `${tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_LABEL_BOOKINGS_CANCELED')}: ${profile.bookingsCanceled}\n` +
    `${tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_LABEL_LAST_VISIT')}: ${
      profile.lastVisitAt
        ? formatDate(profile.lastVisitAt, language)
        : tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_LAST_VISIT_EMPTY')
    }`
  );
}

/**
 * @summary Клавіатура екрану "Профіль клієнта".
 */
export function createMasterClientProfileKeyboard(
  appointmentId: string,
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_OPEN_CLIENT_HISTORY'),
        makeMasterPanelBookingClientHistoryAction(appointmentId),
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_BACK_TO_LIST'),
        MASTER_PANEL_ACTION.BOOKINGS_BACK_TO_LIST,
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_BACK_TO_BOOKINGS_MENU_ALT'),
        MASTER_PANEL_ACTION.BOOKINGS_OPEN_MENU,
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_BTN_BACK_TO_PANEL'),
        MASTER_PANEL_ACTION.BACK_TO_PANEL,
      ),
    ],
  ]);
}

/**
 * @summary Формує текст списку всіх записів клієнта до майстра.
 */
export function formatMasterClientBookingsHistoryText(
  profile: MasterClientProfileItem,
  items: MasterClientBookingsHistoryItem[],
  language: BotUiLanguage,
): string {
  if (items.length === 0) {
    return (
      `${tBot(language, 'MASTER_PANEL_CLIENT_HISTORY_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      `${tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_LABEL_NAME')}: ${fullName(profile)}\n\n` +
      `${tBot(language, 'MASTER_PANEL_CLIENT_HISTORY_EMPTY')}`
    );
  }

  const lines = items.map((item, index) => {
    const startDate = item.startAt.toLocaleDateString(localeByLanguage(language));
    const startTime = item.startAt.toLocaleTimeString(localeByLanguage(language), {
      hour: '2-digit',
      minute: '2-digit',
    });
    const endTime = item.endAt.toLocaleTimeString(localeByLanguage(language), {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      `${index + 1}️⃣\n` +
      `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_SERVICE')}: ${item.serviceName}\n` +
      `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_PRICE')}: ${formatPrice(item.priceAmount, item.currencyCode)}\n` +
      `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_TIME')}: ${startDate}, ${startTime}-${endTime}\n` +
      `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_STATUS')}: ${statusLabel(item.status, language)}`
    );
  });

  return (
    `${tBot(language, 'MASTER_PANEL_CLIENT_HISTORY_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_LABEL_NAME')}: ${fullName(profile)}\n` +
    `${tBot(language, 'MASTER_PANEL_CLIENT_PROFILE_LABEL_ID')}: ${profile.clientId}\n\n` +
    `${lines.join('\n\n⸻\n\n')}`
  );
}

/**
 * @summary Клавіатура екрана "Всі записи клієнта".
 */
export function createMasterClientBookingsHistoryKeyboard(
  appointmentId: string,
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_TO_CLIENT_PROFILE'),
        makeMasterPanelBookingProfileAction(appointmentId),
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_BACK_TO_LIST'),
        MASTER_PANEL_ACTION.BOOKINGS_BACK_TO_LIST,
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_BACK_TO_BOOKINGS_MENU_ALT'),
        MASTER_PANEL_ACTION.BOOKINGS_OPEN_MENU,
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_BTN_BACK_TO_PANEL'),
        MASTER_PANEL_ACTION.BACK_TO_PANEL,
      ),
    ],
  ]);
}
