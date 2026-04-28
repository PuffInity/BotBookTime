/**
 * @file bot-masters.types.ts
 * @summary Callback-константи і тексти кнопок для розділу "Майстри".
 */

export const MASTERS_ACTION = {
  BACK_TO_LIST: 'masters:back-to-list',
} as const;

export const MASTERS_ITEM_ACTION_PREFIX = 'masters:item:';

export const MASTERS_ITEM_ACTION_REGEX = /^masters:item:(\d+)$/;

export const MASTERS_BUTTON_TEXT = {
  BACK: '⬅️ Назад',
  HOME: '🏠 Головне меню',
} as const;

export function makeMasterItemAction(masterId: string): string {
  return `${MASTERS_ITEM_ACTION_PREFIX}${masterId}`;
}
