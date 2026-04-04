import { Markup } from 'telegraf';
import type { AdminPanelAccess } from '../../types/db-helpers/db-admin-panel.types.js';
import { ADMIN_PANEL_ACTION } from '../../types/bot-admin-panel.types.js';
import { tBot, tBotTemplate } from './i18n.bot.js';
import type { BotUiLanguage } from './i18n.bot.js';

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
export function formatAdminPanelRootText(
  access: AdminPanelAccess,
  language: BotUiLanguage = 'uk',
): string {
  const adminName = getAdminDisplayName(access);

  return (
    `${tBot(language, 'ADMIN_PANEL_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBotTemplate(language, 'ADMIN_PANEL_GREETING', { name: adminName })}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_ROOT_DESCRIPTION')}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_ROOT_PICK_SECTION')}`
  );
}

/**
 * @summary Клавіатура головного меню адмін-панелі.
 */
export function createAdminPanelRootKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_BTN_RECORDS'), ADMIN_PANEL_ACTION.OPEN_RECORDS),
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_BTN_SCHEDULE'), ADMIN_PANEL_ACTION.OPEN_SCHEDULE),
    ],
    [
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_BTN_MASTERS'), ADMIN_PANEL_ACTION.OPEN_MASTERS),
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_BTN_SERVICES'), ADMIN_PANEL_ACTION.OPEN_SERVICES),
    ],
    [
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_BTN_STATS'), ADMIN_PANEL_ACTION.OPEN_STATS),
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_BTN_SETTINGS'), ADMIN_PANEL_ACTION.OPEN_SETTINGS),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_BTN_EXIT'), ADMIN_PANEL_ACTION.EXIT)],
  ]);
}

/**
 * @summary Текст меню блоку "Записи" в адмін-панелі.
 */
export function formatAdminRecordsMenuText(language: BotUiLanguage = 'uk'): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_RECORDS_MENU_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'ADMIN_PANEL_RECORDS_MENU_SUBTITLE')}`
  );
}

/**
 * @summary Клавіатура меню блоку "Записи".
 */
export function createAdminRecordsMenuKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_CATEGORY_PENDING'), ADMIN_PANEL_ACTION.RECORDS_MENU_PENDING)],
    [
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_CATEGORY_TODAY'), ADMIN_PANEL_ACTION.RECORDS_MENU_TODAY),
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_CATEGORY_TOMORROW'), ADMIN_PANEL_ACTION.RECORDS_MENU_TOMORROW),
    ],
    [
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_CATEGORY_ALL'), ADMIN_PANEL_ACTION.RECORDS_MENU_ALL),
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_CATEGORY_CANCELED'), ADMIN_PANEL_ACTION.RECORDS_MENU_CANCELED),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK'), ADMIN_PANEL_ACTION.RECORDS_BACK)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_HOME'), ADMIN_PANEL_ACTION.HOME)],
  ]);
}
