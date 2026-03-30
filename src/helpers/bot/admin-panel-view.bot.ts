import { Markup } from 'telegraf';
import type { AdminPanelAccess } from '../../types/db-helpers/db-admin-panel.types.js';
import { ADMIN_PANEL_ACTION, ADMIN_PANEL_BUTTON_TEXT } from '../../types/bot-admin-panel.types.js';

/**
 * @file admin-panel-view.bot.ts
 * @summary UI/helper-и для адмін-панелі.
 */

function getAdminDisplayName(access: AdminPanelAccess): string {
  return `${access.firstName}${access.lastName ? ` ${access.lastName}` : ''}`.trim();
}

/**
 * @summary Форматує кореневий екран адмін-панелі.
 */
export function formatAdminPanelRootText(access: AdminPanelAccess): string {
  const adminName = getAdminDisplayName(access);

  return (
    '🛡 Адмін-панель\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `Вітаю, ${adminName}.\n\n` +
    'Керуйте записами, розкладом, майстрами та налаштуваннями салону в одному місці.\n\n' +
    'Оберіть розділ нижче.'
  );
}

/**
 * @summary Клавіатура головного меню адмін-панелі.
 */
export function createAdminPanelRootKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS, ADMIN_PANEL_ACTION.OPEN_RECORDS),
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE, ADMIN_PANEL_ACTION.OPEN_SCHEDULE),
    ],
    [
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.MASTERS, ADMIN_PANEL_ACTION.OPEN_MASTERS),
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES, ADMIN_PANEL_ACTION.OPEN_SERVICES),
    ],
    [
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS, ADMIN_PANEL_ACTION.OPEN_STATS),
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SETTINGS, ADMIN_PANEL_ACTION.OPEN_SETTINGS),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.EXIT, ADMIN_PANEL_ACTION.EXIT)],
  ]);
}

/**
 * @summary Текст меню блоку "Записи" в адмін-панелі.
 */
export function formatAdminRecordsMenuText(): string {
  return (
    '📅 Записи\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Оберіть категорію для перегляду записів:'
  );
}

/**
 * @summary Клавіатура меню блоку "Записи".
 */
export function createAdminRecordsMenuKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_PENDING, ADMIN_PANEL_ACTION.RECORDS_MENU_PENDING)],
    [
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_TODAY, ADMIN_PANEL_ACTION.RECORDS_MENU_TODAY),
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_TOMORROW, ADMIN_PANEL_ACTION.RECORDS_MENU_TOMORROW),
    ],
    [
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_ALL, ADMIN_PANEL_ACTION.RECORDS_MENU_ALL),
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_CANCELED, ADMIN_PANEL_ACTION.RECORDS_MENU_CANCELED),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK, ADMIN_PANEL_ACTION.RECORDS_BACK)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.HOME, ADMIN_PANEL_ACTION.HOME)],
  ]);
}
