import { Markup } from 'telegraf';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';

/**
 * @file navigation.bot.ts
 * @summary Універсальна inline-навігація для карток/екранів поза сценами.
 */

export function createBackHomeInlineKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('⬅️ Назад', COMMON_NAV_ACTION.BACK),
      Markup.button.callback('🏠 Головне меню', COMMON_NAV_ACTION.HOME),
    ],
  ]);
}

