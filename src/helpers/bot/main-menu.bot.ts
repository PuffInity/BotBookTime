import { Markup } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import { MAIN_MENU_ACTION } from '../../types/bot-menu.types.js';
import { getMasterPanelAccessByTelegramId } from '../db/db-master-panel.helper.js';
import { getAdminPanelAccessByTelegramId } from '../db/db-admin-panel.helper.js';
import { getOrCreateUser } from '../db/db-profile.helper.js';
import { resolveBotUiLanguage, tBot } from './i18n.bot.js';
import type { BotUiLanguage } from './i18n.bot.js';

/**
 * @file main-menu.bot.ts
 * @summary Helper-и для відображення головного меню клієнта.
 */

/**
 * Повертає Inline-клавіатуру головного меню клієнта.
 */
export function createClientMainMenuKeyboard(
  hasMasterPanelAccess: boolean,
  hasAdminPanelAccess: boolean,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = [
    [
      Markup.button.callback(tBot(language, 'MENU_PROFILE'), MAIN_MENU_ACTION.PROFILE),
      Markup.button.callback(tBot(language, 'MENU_SERVICES'), MAIN_MENU_ACTION.SERVICES),
    ],
    [
      Markup.button.callback(tBot(language, 'MENU_MASTERS'), MAIN_MENU_ACTION.MASTERS),
      Markup.button.callback(tBot(language, 'MENU_BOOKING'), MAIN_MENU_ACTION.BOOKING),
    ],
    [
      Markup.button.callback(tBot(language, 'MENU_FAQ'), MAIN_MENU_ACTION.FAQ),
    ],
  ];

  if (hasMasterPanelAccess) {
    rows.push([
      Markup.button.callback(tBot(language, 'MENU_MASTER_PANEL'), MAIN_MENU_ACTION.MASTER_PANEL),
    ]);
  }

  if (hasAdminPanelAccess) {
    rows.push([
      Markup.button.callback(tBot(language, 'MENU_ADMIN_PANEL'), MAIN_MENU_ACTION.ADMIN_PANEL),
    ]);
  }

  return Markup.inlineKeyboard(rows);
}

/**
 * Надсилає головне меню клієнта в поточний чат.
 */
export async function sendClientMainMenu(ctx: MyContext): Promise<void> {
  const telegramId = ctx.from?.id;
  const user = telegramId ? await getOrCreateUser(ctx) : null;
  const language = resolveBotUiLanguage(user?.preferredLanguage);

  const [hasMasterPanelAccess, hasAdminPanelAccess] = user
    ? await Promise.all([
        getMasterPanelAccessByTelegramId(user.telegramUserId).then(Boolean),
        getAdminPanelAccessByTelegramId(user.telegramUserId).then(Boolean),
      ])
    : [false, false];

  await ctx.reply(
    tBot(language, 'MAIN_MENU_TEXT'),
    createClientMainMenuKeyboard(hasMasterPanelAccess, hasAdminPanelAccess, language),
  );
}
