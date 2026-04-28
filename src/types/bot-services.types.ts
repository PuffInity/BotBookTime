/**
 * @file bot-services.types.ts
 * @summary Константи callback-дій і кнопок для сцени "Послуги".
 */

export const SERVICES_ACTION = {
  BACK_TO_LIST: 'services:back-to-list',
  OPEN_ITEM_PREFIX: 'services:open-item:',
} as const;

export const SERVICES_ITEM_ACTION_REGEX = /^services:open-item:(\d+)$/;

export const SERVICES_BUTTON_TEXT = {
  BACK: '⬅️ Назад',
  HOME: '🏠 Головне меню',
} as const;

export function makeServiceItemAction(serviceId: string): string {
  return `${SERVICES_ACTION.OPEN_ITEM_PREFIX}${serviceId}`;
}

