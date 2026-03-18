import { Markup } from 'telegraf';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import { FAQ_ACTION, FAQ_BUTTON_TEXT, makeFaqItemAction } from '../../types/bot-faq.types.js';
import type { FaqCatalogItem } from '../../types/db-helpers/db-faq.types.js';

/**
 * @file faq-view.bot.ts
 * @summary UI/helper-и для розділу FAQ (тексти + inline-клавіатури).
 */

const NUMBER_BADGES = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

function getNumberBadge(index: number): string {
  return NUMBER_BADGES[index] ?? `${index + 1}.`;
}

/**
 * @summary Форматує текст FAQ списку.
 */
export function formatFaqCatalogText(items: FaqCatalogItem[]): string {
  if (items.length === 0) {
    return (
      '❓ FAQ — Часті запитання\n' +
      '━━━━━━━━━━━━━━\n' +
      'Наразі розділ FAQ порожній.\n' +
      'Спробуйте пізніше або зверніться до адміністратора.'
    );
  }

  const lines = items.map((item, index) => `${getNumberBadge(index)} ${item.question}`);

  return (
    '❓ FAQ — Часті запитання\n' +
    '━━━━━━━━━━━━━━\n' +
    `${lines.join('\n\n')}\n\n` +
    'Для детальної інформації виберіть номер питання.'
  );
}

/**
 * @summary Форматує текст детальної відповіді FAQ.
 */
export function formatFaqItemText(item: FaqCatalogItem, index: number): string {
  return (
    `❓ Питання ${getNumberBadge(index)}\n` +
    '━━━━━━━━━━━━━━\n' +
    `${item.question}\n\n` +
    '✅ Відповідь\n' +
    `${item.answer}`
  );
}

/**
 * @summary Створює inline-клавіатуру FAQ списку.
 */
export function createFaqCatalogKeyboard(
  items: FaqCatalogItem[],
): ReturnType<typeof Markup.inlineKeyboard> {
  const itemRows = items.map((item, index) => [
    Markup.button.callback(getNumberBadge(index), makeFaqItemAction(item.id)),
  ]);

  return Markup.inlineKeyboard([
    ...itemRows,
    [Markup.button.callback(FAQ_BUTTON_TEXT.HOME, COMMON_NAV_ACTION.HOME)],
  ]);
}

/**
 * @summary Створює inline-клавіатуру для детальної FAQ відповіді.
 */
export function createFaqItemKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(FAQ_BUTTON_TEXT.BACK, FAQ_ACTION.BACK_TO_LIST),
      Markup.button.callback(FAQ_BUTTON_TEXT.HOME, COMMON_NAV_ACTION.HOME),
    ],
  ]);
}

