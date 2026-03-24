import { Markup } from 'telegraf';
import type {
  MasterClientBookingsHistoryItem,
  MasterClientProfileItem,
} from '../../types/db-helpers/db-master-clients.types.js';
import {
  MASTER_PANEL_ACTION,
  MASTER_PANEL_BUTTON_TEXT,
  makeMasterPanelBookingProfileAction,
  makeMasterPanelBookingClientHistoryAction,
} from '../../types/bot-master-panel.types.js';

/**
 * @file master-client-profile-view.bot.ts
 * @summary UI/helper-и для екрану "Профіль клієнта" в панелі майстра.
 */

function formatDate(date: Date): string {
  return date.toLocaleDateString('uk-UA');
}

function languageLabel(language: MasterClientProfileItem['preferredLanguage']): string {
  switch (language) {
    case 'uk':
      return 'Українська';
    case 'en':
      return 'English';
    case 'cs':
      return 'Čeština';
    default:
      return language;
  }
}

function fullName(profile: MasterClientProfileItem): string {
  return `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ''}`.trim();
}

function verificationLabel(value: string | null, verified: boolean): string {
  if (!value) return '⚪ Не додано';
  return verified ? '🟢 Підтверджено' : '🟠 Не підтверджено';
}

function telegramLabel(username: string | null): string {
  if (!username) return 'Не вказано';
  return username.startsWith('@') ? username : `@${username}`;
}

function statusLabel(status: MasterClientBookingsHistoryItem['status']): string {
  switch (status) {
    case 'pending':
      return '🟡 Очікує підтвердження';
    case 'confirmed':
      return '🟢 Підтверджено';
    case 'completed':
      return '⚪ Завершено';
    case 'canceled':
      return '🔴 Скасовано';
    case 'transferred':
      return '🟣 Перенесено';
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
export function formatMasterClientProfileText(profile: MasterClientProfileItem): string {
  return (
    '👤 Профіль клієнта\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `🪪 ID профілю: ${profile.clientId}\n\n` +
    `👤 Ім’я: ${fullName(profile)}\n` +
    `💬 Telegram: ${telegramLabel(profile.telegramUsername)}\n\n` +
    `📱 Телефон: ${profile.phoneE164 ?? 'Не вказано'}\n` +
    `Статус телефону: ${verificationLabel(profile.phoneE164, profile.phoneVerified)}\n\n` +
    `✉️ Email: ${profile.email ?? 'Не вказано'}\n` +
    `Статус email: ${verificationLabel(profile.email, profile.emailVerified)}\n\n` +
    `🌐 Мова інтерфейсу: ${languageLabel(profile.preferredLanguage)}\n` +
    `🔔 Сповіщення: ${profile.notificationsEnabled ? 'Увімкнено' : 'Вимкнено'}\n\n` +
    '📊 Додаткова інформація\n' +
    `📅 Створено профіль: ${formatDate(profile.profileCreatedAt)}\n` +
    `📋 Записів до вас: ${profile.bookingsTotal}\n` +
    `🟢 Підтверджених: ${profile.bookingsConfirmed}\n` +
    `⚪ Завершених: ${profile.bookingsCompleted}\n` +
    `🔴 Скасованих: ${profile.bookingsCanceled}\n` +
    `🕒 Останній візит: ${profile.lastVisitAt ? formatDate(profile.lastVisitAt) : 'Ще не було'}`
  );
}

/**
 * @summary Клавіатура екрану "Профіль клієнта".
 */
export function createMasterClientProfileKeyboard(
  appointmentId: string,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        '📅 Переглянути всі записи клієнта',
        makeMasterPanelBookingClientHistoryAction(appointmentId),
      ),
    ],
    [Markup.button.callback('⬅️ До записів', MASTER_PANEL_ACTION.BOOKINGS_BACK_TO_LIST)],
    [Markup.button.callback('📅 До меню записів', MASTER_PANEL_ACTION.BOOKINGS_OPEN_MENU)],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.BACK_TO_PANEL, MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Формує текст списку всіх записів клієнта до майстра.
 */
export function formatMasterClientBookingsHistoryText(
  profile: MasterClientProfileItem,
  items: MasterClientBookingsHistoryItem[],
): string {
  if (items.length === 0) {
    return (
      '📅 Записи клієнта\n' +
      '━━━━━━━━━━━━━━\n\n' +
      `👤 Клієнт: ${fullName(profile)}\n\n` +
      '📭 Записів до цього майстра поки немає.'
    );
  }

  const lines = items.map((item, index) => {
    const startDate = item.startAt.toLocaleDateString('uk-UA');
    const startTime = item.startAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    const endTime = item.endAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

    return (
      `${index + 1}️⃣\n` +
      `💼 ${item.serviceName}\n` +
      `💰 ${formatPrice(item.priceAmount, item.currencyCode)}\n` +
      `📅 ${startDate}\n` +
      `⏰ ${startTime}–${endTime}\n` +
      `📌 ${statusLabel(item.status)}`
    );
  });

  return (
    '📅 Записи клієнта\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👤 Клієнт: ${fullName(profile)}\n` +
    `🪪 ID профілю: ${profile.clientId}\n\n` +
    `${lines.join('\n\n⸻\n\n')}`
  );
}

/**
 * @summary Клавіатура екрана "Всі записи клієнта".
 */
export function createMasterClientBookingsHistoryKeyboard(
  appointmentId: string,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback('👤 До профілю клієнта', makeMasterPanelBookingProfileAction(appointmentId))],
    [Markup.button.callback('⬅️ До записів', MASTER_PANEL_ACTION.BOOKINGS_BACK_TO_LIST)],
    [Markup.button.callback('📅 До меню записів', MASTER_PANEL_ACTION.BOOKINGS_OPEN_MENU)],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.BACK_TO_PANEL, MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}
