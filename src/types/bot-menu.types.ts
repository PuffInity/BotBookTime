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
  MASTERS: '👩‍🎨 Майстри',
  BOOKING: '📅 Бронювання',
  FAQ: '❓ FAQ',
} as const;

export type ClientMainMenuButton =
  (typeof CLIENT_MAIN_MENU_BUTTON)[keyof typeof CLIENT_MAIN_MENU_BUTTON];

/**
 * Callback-дії головного меню клієнта.
 */
export const MAIN_MENU_ACTION = {
  PROFILE: 'menu:profile',
  SERVICES: 'menu:services',
  MASTERS: 'menu:masters',
  BOOKING: 'menu:booking',
  FAQ: 'menu:faq',
} as const;

export type MainMenuAction = (typeof MAIN_MENU_ACTION)[keyof typeof MAIN_MENU_ACTION];

/**
 * Callback-дії універсальної навігації поза сценами.
 */
export const COMMON_NAV_ACTION = {
  BACK: 'common:back',
  HOME: 'common:home',
} as const;

export type CommonNavAction =
  (typeof COMMON_NAV_ACTION)[keyof typeof COMMON_NAV_ACTION];
