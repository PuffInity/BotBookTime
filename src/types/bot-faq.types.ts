/**
 * @file bot-faq.types.ts
 * @summary Константи callback-дій і кнопок для FAQ сцени.
 */

export const FAQ_ACTION = {
  BACK_TO_LIST: 'faq:back-to-list',
  OPEN_ITEM_PREFIX: 'faq:open-item:',
} as const;

export const FAQ_ITEM_ACTION_REGEX = /^faq:open-item:(\d+)$/;

export const FAQ_BUTTON_TEXT = {
  BACK: '⬅️ Назад',
  HOME: '🏠 Головне меню',
} as const;

export function makeFaqItemAction(faqId: string): string {
  return `${FAQ_ACTION.OPEN_ITEM_PREFIX}${faqId}`;
}

