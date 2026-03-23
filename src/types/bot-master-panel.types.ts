/**
 * @file bot-master-panel.types.ts
 * @summary Callback-константи і тексти кнопок для панелі майстра.
 */

export const MASTER_PANEL_ACTION = {
  OPEN_PROFILE: 'master-panel:open-profile',
  OPEN_BOOKINGS: 'master-panel:open-bookings',
  OPEN_SCHEDULE: 'master-panel:open-schedule',
  OPEN_STATS: 'master-panel:open-stats',
  BACK_TO_PANEL: 'master-panel:back-to-panel',
  HOME: 'master-panel:home',
} as const;

export const MASTER_PANEL_BUTTON_TEXT = {
  PROFILE: '👤 Мій профіль',
  BOOKINGS: '📅 Мої записи',
  SCHEDULE: '🕒 Мій розклад',
  STATS: '📊 Моя статистика',
  BACK_TO_PANEL: '⬅️ До панелі майстра',
  HOME: '🏠 Головне меню',
} as const;

