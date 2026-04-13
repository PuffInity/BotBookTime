import { Markup } from 'telegraf';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import { FAQ_ACTION, makeFaqItemAction } from '../../types/bot-faq.types.js';
import type { FaqCatalogItem } from '../../types/db-helpers/db-faq.types.js';
import { tBot } from './i18n.bot.js';
import type { BotUiLanguage } from './i18n.bot.js';

/**
 * @file faq-view.bot.ts
 * @summary UI/helper-и для розділу FAQ (тексти + inline-клавіатури).
 */

// uk: UI константа NUMBER_BADGES / en: UI constant NUMBER_BADGES / cz: UI konstanta NUMBER_BADGES
const NUMBER_BADGES = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

/**
 * uk: Внутрішня bot helper функція getNumberBadge.
 * en: Internal bot helper function getNumberBadge.
 * cz: Interní bot helper funkce getNumberBadge.
 */
function getNumberBadge(index: number): string {
  return NUMBER_BADGES[index] ?? `${index + 1}.`;
}

/**
 * @summary Форматує текст FAQ списку.
 */
export function formatFaqCatalogText(items: FaqCatalogItem[], language: BotUiLanguage): string {
  if (items.length === 0) {
    return (
      `${tBot(language, 'FAQ_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n' +
      `${tBot(language, 'FAQ_EMPTY')}\n` +
      tBot(language, 'FAQ_EMPTY_HINT')
    );
  }

  const lines = items.map((item, index) => `${getNumberBadge(index)} ${item.question}`);

  return (
    `${tBot(language, 'FAQ_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n' +
    `${lines.join('\n\n')}\n\n` +
    tBot(language, 'FAQ_SELECT_HINT')
  );
}

/**
 * @summary Форматує текст детальної відповіді FAQ.
 */
export function formatFaqItemText(
  item: FaqCatalogItem,
  index: number,
  language: BotUiLanguage,
): string {
  return (
    `${tBot(language, 'FAQ_QUESTION')} ${getNumberBadge(index)}\n` +
    '━━━━━━━━━━━━━━\n' +
    `${item.question}\n\n` +
    `${tBot(language, 'FAQ_ANSWER')}\n` +
    `${item.answer}`
  );
}

/**
 * @summary Створює inline-клавіатуру FAQ списку.
 */
export function createFaqCatalogKeyboard(
  items: FaqCatalogItem[],
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  const itemRows = items.map((item, index) => [
    Markup.button.callback(getNumberBadge(index), makeFaqItemAction(item.id)),
  ]);

  return Markup.inlineKeyboard([
    ...itemRows,
    [Markup.button.callback(tBot(language, 'HOME'), COMMON_NAV_ACTION.HOME)],
  ]);
}

/**
 * @summary Створює inline-клавіатуру для детальної FAQ відповіді.
 */
export function createFaqItemKeyboard(language: BotUiLanguage): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(tBot(language, 'COMMON_BACK'), FAQ_ACTION.BACK_TO_LIST),
      Markup.button.callback(tBot(language, 'HOME'), COMMON_NAV_ACTION.HOME),
    ],
  ]);
}
