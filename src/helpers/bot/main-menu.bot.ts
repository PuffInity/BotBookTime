import { Markup } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import { CLIENT_MAIN_MENU_BUTTON } from '../../types/bot-menu.types.js';

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
 * Повертає Reply-клавіатуру головного меню клієнта.
 */
export function createClientMainMenuKeyboard(): ReturnType<typeof Markup.keyboard> {
  return Markup.keyboard([
    [CLIENT_MAIN_MENU_BUTTON.PROFILE, CLIENT_MAIN_MENU_BUTTON.SERVICES],
    [CLIENT_MAIN_MENU_BUTTON.MASTERS, CLIENT_MAIN_MENU_BUTTON.BOOKING],
    [CLIENT_MAIN_MENU_BUTTON.FAQ],
  ]).resize();
}

/**
 * Надсилає головне меню клієнта в поточний чат.
 */
export async function sendClientMainMenu(ctx: MyContext): Promise<void> {
  await ctx.reply(CLIENT_MAIN_MENU_TEXT, createClientMainMenuKeyboard());
}
