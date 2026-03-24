import { Markup } from 'telegraf';
import type { MasterClientProfileItem } from '../../types/db-helpers/db-master-clients.types.js';
import {
  MASTER_PANEL_ACTION,
  MASTER_PANEL_BUTTON_TEXT,
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
export function createMasterClientProfileKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback('⬅️ До черги записів', MASTER_PANEL_ACTION.BOOKINGS_SHOW_PENDING)],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.BACK_TO_PANEL, MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}
