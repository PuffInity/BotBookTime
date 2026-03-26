import { Markup } from 'telegraf';
import { ADMIN_PANEL_ACTION, ADMIN_PANEL_BUTTON_TEXT } from '../../types/bot-admin-panel.types.js';
import type { AdminStudioAdminMember, AdminStudioUserLookup } from '../../types/db-helpers/db-admin-settings.types.js';

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

const NUMBER_BADGES = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

function getNumberBadge(index: number): string {
  return NUMBER_BADGES[index] ?? `${index + 1}.`;
}

function formatTelegramLogin(username: string | null): string {
  return username ? `@${username}` : '—';
}

/**
 * @summary Форматує екран списку адміністраторів.
 */
export function formatAdminSettingsAdminsText(admins: AdminStudioAdminMember[]): string {
  if (admins.length === 0) {
    return (
      '👑 Адміністратори\n' +
      '━━━━━━━━━━━━━━\n\n' +
      'У цьому салоні ще немає активних адміністраторів.\n\n' +
      'Щоб почати, додайте адміністратора через Telegram ID.'
    );
  }

  const lines = admins.map((admin, index) => {
    return (
      `${getNumberBadge(index)} ${admin.displayName}\n` +
      `🆔 Telegram ID: ${admin.telegramUserId}\n` +
      `🔹 Username: ${formatTelegramLogin(admin.telegramUsername)}`
    );
  });

  return (
    '👑 Адміністратори\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Список адміністраторів салону:\n\n' +
    lines.join('\n\n')
  );
}

/**
 * @summary Клавіатура меню адміністраторів.
 */
export function createAdminSettingsAdminsKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_ADMINS_GRANT,
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_GRANT_OPEN,
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_ADMINS_REVOKE,
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_REVOKE_OPEN,
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_BACK_TO_MENU,
        ADMIN_PANEL_ACTION.SETTINGS_BACK_TO_MENU,
      ),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SETTINGS_BACK, ADMIN_PANEL_ACTION.SETTINGS_BACK)],
  ]);
}

/**
 * @summary Текст кроку введення Telegram ID для надання ролі.
 */
export function formatAdminSettingsGrantInputText(): string {
  return (
    '👑 Надання ролі адміністратора\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Надішліть Telegram ID користувача одним повідомленням.\n\n' +
    'Формат: лише цифри\n' +
    'Приклад: 6712153038'
  );
}

/**
 * @summary Текст кроку введення Telegram ID для зняття ролі.
 */
export function formatAdminSettingsRevokeInputText(): string {
  return (
    '🚫 Видалення ролі адміністратора\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Надішліть Telegram ID адміністратора, у якого потрібно забрати роль.\n\n' +
    'Формат: лише цифри\n' +
    'Приклад: 6712153038'
  );
}

/**
 * @summary Клавіатура кроку введення ID для надання ролі.
 */
export function createAdminSettingsGrantInputKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_ADMINS_CANCEL,
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_GRANT_CANCEL,
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_BACK_TO_MENU,
        ADMIN_PANEL_ACTION.SETTINGS_BACK_TO_MENU,
      ),
    ],
  ]);
}

/**
 * @summary Клавіатура кроку введення ID для зняття ролі.
 */
export function createAdminSettingsRevokeInputKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_ADMINS_CANCEL,
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_REVOKE_CANCEL,
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_BACK_TO_MENU,
        ADMIN_PANEL_ACTION.SETTINGS_BACK_TO_MENU,
      ),
    ],
  ]);
}

/**
 * @summary Текст підтвердження надання ролі адміністратора.
 */
export function formatAdminSettingsGrantConfirmText(target: AdminStudioUserLookup): string {
  return (
    '⚠️ Підтвердження надання ролі\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👤 Користувач: ${target.displayName}\n` +
    `🆔 Telegram ID: ${target.telegramUserId}\n` +
    `🔹 Username: ${formatTelegramLogin(target.telegramUsername)}\n\n` +
    'Після підтвердження користувач отримає повний доступ до адмін-панелі.'
  );
}

/**
 * @summary Текст підтвердження зняття ролі адміністратора.
 */
export function formatAdminSettingsRevokeConfirmText(target: AdminStudioUserLookup): string {
  return (
    '⚠️ Підтвердження видалення ролі\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👤 Користувач: ${target.displayName}\n` +
    `🆔 Telegram ID: ${target.telegramUserId}\n` +
    `🔹 Username: ${formatTelegramLogin(target.telegramUsername)}\n\n` +
    'Після підтвердження користувач втратить доступ до адмін-панелі.'
  );
}

/**
 * @summary Клавіатура підтвердження надання ролі.
 */
export function createAdminSettingsGrantConfirmKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_ADMINS_CONFIRM_GRANT,
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_GRANT_CONFIRM,
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_ADMINS_CANCEL,
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_GRANT_CANCEL,
      ),
    ],
  ]);
}

/**
 * @summary Клавіатура підтвердження зняття ролі.
 */
export function createAdminSettingsRevokeConfirmKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_ADMINS_CONFIRM_REVOKE,
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_REVOKE_CONFIRM,
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_ADMINS_CANCEL,
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_REVOKE_CANCEL,
      ),
    ],
  ]);
}
