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
  RECORDS_MENU_PENDING: 'admin-panel:records:menu:pending',
  RECORDS_MENU_TODAY: 'admin-panel:records:menu:today',
  RECORDS_MENU_TOMORROW: 'admin-panel:records:menu:tomorrow',
  RECORDS_MENU_ALL: 'admin-panel:records:menu:all',
  RECORDS_MENU_CANCELED: 'admin-panel:records:menu:canceled',
  RECORDS_LIST_PREV_PAGE: 'admin-panel:records:list:prev',
  RECORDS_LIST_NEXT_PAGE: 'admin-panel:records:list:next',
  RECORDS_OPEN_CARD_PREFIX: 'admin-panel:records:open-card:',
  RECORDS_BACK_TO_LIST: 'admin-panel:records:list:back',
  RECORDS_BACK: 'admin-panel:records:back',
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
  RECORDS_PENDING: '🆕 Нові записи (очікують підтвердження)',
  RECORDS_TODAY: '📍 Сьогодні',
  RECORDS_TOMORROW: '📆 Завтра',
  RECORDS_ALL: '🗂 Усі записи',
  RECORDS_CANCELED: '❌ Скасовані',
  RECORDS_PREV_PAGE: '⬅️ Попередня',
  RECORDS_NEXT_PAGE: '➡️ Наступна',
  RECORDS_BACK_TO_LIST: '⬅️ До списку',
  RECORDS_BACK_TO_MENU: '⬅️ До меню записів',
  RECORDS_BACK: '⬅️ До адмін-панелі',
  BACK_TO_ROOT: '⬅️ До адмін-панелі',
  EXIT: '⬅️ Вийти з адмін-панелі',
  HOME: '🏠 Головне меню',
} as const;

export const ADMIN_PANEL_RECORDS_OPEN_CARD_ACTION_REGEX = /^admin-panel:records:open-card:(\d+)$/;

export function makeAdminPanelRecordsOpenCardAction(appointmentId: string): string {
  return `${ADMIN_PANEL_ACTION.RECORDS_OPEN_CARD_PREFIX}${appointmentId}`;
}
