import { Markup } from 'telegraf';
import { ADMIN_PANEL_ACTION, ADMIN_PANEL_BUTTON_TEXT } from '../../types/bot-admin-panel.types.js';

/**
 * @file admin-settings-view.bot.ts
 * @summary UI/helper-и для блоку "Налаштування" в адмін-панелі.
 */

/**
 * @summary Форматує меню налаштувань адмін-панелі.
 */
export function formatAdminSettingsMenuText(): string {
  return (
    '⚙️ Налаштування\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Оберіть розділ, який потрібно відкрити:'
  );
}

/**
 * @summary Клавіатура меню блоку "Налаштування".
 */
export function createAdminSettingsMenuKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SETTINGS_LANGUAGE, ADMIN_PANEL_ACTION.SETTINGS_OPEN_LANGUAGE)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SETTINGS_ADMINS, ADMIN_PANEL_ACTION.SETTINGS_OPEN_ADMINS)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SETTINGS_STUDIO, ADMIN_PANEL_ACTION.SETTINGS_OPEN_STUDIO)],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_NOTIFICATIONS,
        ADMIN_PANEL_ACTION.SETTINGS_OPEN_NOTIFICATIONS,
      ),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SETTINGS_BACK, ADMIN_PANEL_ACTION.SETTINGS_BACK)],
  ]);
}

/**
 * @summary Форматує заглушку підрозділу налаштувань.
 */
export function formatAdminSettingsSectionText(title: string, description: string): string {
  return (
    `${title}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${description}\n\n` +
    'Функціонал цього підрозділу буде доступний у наступному блоці.'
  );
}

/**
 * @summary Клавіатура підрозділу налаштувань.
 */
export function createAdminSettingsSectionKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_BACK_TO_MENU,
        ADMIN_PANEL_ACTION.SETTINGS_BACK_TO_MENU,
      ),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SETTINGS_BACK, ADMIN_PANEL_ACTION.SETTINGS_BACK)],
  ]);
}
