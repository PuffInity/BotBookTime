/**
 * @file bot-menu.types.ts
 * @summary Константи кнопок головного Reply-меню клієнта.
 */

/**
 * Тексти кнопок головного меню клієнта (Reply Keyboard).
 */
export const CLIENT_MAIN_MENU_BUTTON = {
  PROFILE: '👤 Профіль',
  SERVICES: '💼 Послуги',
  BOOKING: '📅 Бронювання',
  FAQ: '❓ FAQ',
} as const;

export type ClientMainMenuButton =
  (typeof CLIENT_MAIN_MENU_BUTTON)[keyof typeof CLIENT_MAIN_MENU_BUTTON];
