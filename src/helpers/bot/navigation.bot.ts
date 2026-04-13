import { Markup } from 'telegraf';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import { tBot } from './i18n.bot.js';
import type { BotUiLanguage } from './i18n.bot.js';

/**
 * @file navigation.bot.ts
 * @summary Універсальна inline-навігація для карток/екранів поза сценами.
 */

/**
 * uk: Публічна bot helper функція createBackHomeInlineKeyboard.
 * en: Public bot helper function createBackHomeInlineKeyboard.
 * cz: Veřejná bot helper funkce createBackHomeInlineKeyboard.
 */
export function createBackHomeInlineKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(tBot(language, 'COMMON_BACK'), COMMON_NAV_ACTION.BACK),
      Markup.button.callback(tBot(language, 'HOME'), COMMON_NAV_ACTION.HOME),
    ],
  ]);
}
