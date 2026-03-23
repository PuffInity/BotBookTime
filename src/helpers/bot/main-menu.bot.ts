import { Markup } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import { CLIENT_MAIN_MENU_BUTTON, MAIN_MENU_ACTION } from '../../types/bot-menu.types.js';

/**
 * @file main-menu.bot.ts
 * @summary Helper-и для відображення головного меню клієнта.
 */

/**
 * Текст привітання/входу в головне меню.
 */
export const CLIENT_MAIN_MENU_TEXT =
  'Вітаю 👋\n\n' +
  'Я — бот салону Liora Beauty Studio, який допоможе вам швидко та зручно записатися на процедури ✨\n\n' +
  '━━━━━━━━━━━━━━\n\n' +
  'Оберіть потрібний розділ нижче:\n\n' +
  '👤 Профіль — ваші дані та налаштування\n' +
  '💼 Послуги — переглянути всі доступні процедури\n' +
  '👩‍🎨 Майстри — переглянути профілі спеціалістів\n' +
  '📅 Бронювання — створити новий запис\n' +
  '❓ FAQ — відповіді на часті запитання\n\n' +
  '━━━━━━━━━━━━━━\n\n' +
  '⬇️ Скористайтесь кнопками нижче для навігації';

/**
 * Повертає Inline-клавіатуру головного меню клієнта.
 */
export function createClientMainMenuKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(CLIENT_MAIN_MENU_BUTTON.PROFILE, MAIN_MENU_ACTION.PROFILE),
      Markup.button.callback(CLIENT_MAIN_MENU_BUTTON.SERVICES, MAIN_MENU_ACTION.SERVICES),
    ],
    [
      Markup.button.callback(CLIENT_MAIN_MENU_BUTTON.MASTERS, MAIN_MENU_ACTION.MASTERS),
      Markup.button.callback(CLIENT_MAIN_MENU_BUTTON.BOOKING, MAIN_MENU_ACTION.BOOKING),
    ],
    [
      Markup.button.callback(CLIENT_MAIN_MENU_BUTTON.FAQ, MAIN_MENU_ACTION.FAQ),
    ],
  ]);
}

/**
 * Надсилає головне меню клієнта в поточний чат.
 */
export async function sendClientMainMenu(ctx: MyContext): Promise<void> {
  await ctx.reply(CLIENT_MAIN_MENU_TEXT, createClientMainMenuKeyboard());
}
