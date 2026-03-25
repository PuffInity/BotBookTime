/**
 * @file bot-admin-panel.types.ts
 * @summary Callback-дії та тексти кнопок для адмін-панелі.
 */

export const ADMIN_PANEL_ACTION = {
  OPEN_RECORDS: 'admin-panel:open-records',
  OPEN_SCHEDULE: 'admin-panel:open-schedule',
  OPEN_MASTERS: 'admin-panel:open-masters',
  OPEN_SERVICES: 'admin-panel:open-services',
  OPEN_STATS: 'admin-panel:open-stats',
  OPEN_SETTINGS: 'admin-panel:open-settings',
  BACK_TO_ROOT: 'admin-panel:back-to-root',
  EXIT: 'admin-panel:exit',
  HOME: 'admin-panel:home',
} as const;

export const ADMIN_PANEL_BUTTON_TEXT = {
  RECORDS: '📅 Записи',
  SCHEDULE: '🕒 Розклад',
  MASTERS: '👩‍🎨 Майстри',
  SERVICES: '💼 Послуги',
  STATS: '📊 Статистика',
  SETTINGS: '⚙️ Налаштування',
  BACK_TO_ROOT: '⬅️ До адмін-панелі',
  EXIT: '⬅️ Вийти з адмін-панелі',
  HOME: '🏠 Головне меню',
} as const;
