/**
 * @file bot-admin-panel.types.ts
 * @summary Callback-дії та тексти кнопок для адмін-панелі.
 */

export const ADMIN_PANEL_ACTION = {
  OPEN_RECORDS: 'admin-panel:open-records',
  OPEN_SCHEDULE: 'admin-panel:open-schedule',
  SCHEDULE_OPEN_OVERVIEW: 'admin-panel:schedule:open-overview',
  SCHEDULE_OPEN_DAYS_OFF: 'admin-panel:schedule:open-days-off',
  SCHEDULE_OPEN_HOLIDAYS: 'admin-panel:schedule:open-holidays',
  SCHEDULE_OPEN_TEMPORARY: 'admin-panel:schedule:open-temporary',
  SCHEDULE_CONFIGURE_DAY: 'admin-panel:schedule:configure-day',
  SCHEDULE_CONFIGURE_DAY_WEEKDAY_PREFIX: 'admin-panel:schedule:configure-day:weekday:',
  SCHEDULE_CONFIGURE_DAY_OFF_PREFIX: 'admin-panel:schedule:configure-day:off:',
  SCHEDULE_DAY_OFF_ADD_OPEN: 'admin-panel:schedule:day-off:add:open',
  SCHEDULE_DAY_OFF_ADD_CONFIRM: 'admin-panel:schedule:day-off:add:confirm',
  SCHEDULE_DAY_OFF_ADD_CANCEL: 'admin-panel:schedule:day-off:add:cancel',
  SCHEDULE_DAY_OFF_DELETE_REQUEST_PREFIX: 'admin-panel:schedule:day-off:delete:request:',
  SCHEDULE_DAY_OFF_DELETE_CONFIRM_PREFIX: 'admin-panel:schedule:day-off:delete:confirm:',
  SCHEDULE_HOLIDAY_ADD_OPEN: 'admin-panel:schedule:holiday:add:open',
  SCHEDULE_HOLIDAY_ADD_CONFIRM: 'admin-panel:schedule:holiday:add:confirm',
  SCHEDULE_HOLIDAY_ADD_CANCEL: 'admin-panel:schedule:holiday:add:cancel',
  SCHEDULE_HOLIDAY_DELETE_REQUEST_PREFIX: 'admin-panel:schedule:holiday:delete:request:',
  SCHEDULE_HOLIDAY_DELETE_CONFIRM_PREFIX: 'admin-panel:schedule:holiday:delete:confirm:',
  SCHEDULE_TEMPORARY_CREATE_OPEN: 'admin-panel:schedule:temporary:create:open',
  SCHEDULE_TEMPORARY_CREATE_CONFIRM: 'admin-panel:schedule:temporary:create:confirm',
  SCHEDULE_TEMPORARY_CREATE_CANCEL: 'admin-panel:schedule:temporary:create:cancel',
  SCHEDULE_TEMPORARY_DAY_PREFIX: 'admin-panel:schedule:temporary:day:',
  SCHEDULE_TEMPORARY_DAY_OFF_PREFIX: 'admin-panel:schedule:temporary:day-off:',
  SCHEDULE_TEMPORARY_DELETE_REQUEST_PREFIX: 'admin-panel:schedule:temporary:delete:request:',
  SCHEDULE_TEMPORARY_DELETE_CONFIRM_PREFIX: 'admin-panel:schedule:temporary:delete:confirm:',
  SCHEDULE_DELETE_CANCEL: 'admin-panel:schedule:delete:cancel',
  SCHEDULE_REFRESH: 'admin-panel:schedule:refresh',
  SCHEDULE_BACK_TO_MENU: 'admin-panel:schedule:back-to-menu',
  SCHEDULE_BACK: 'admin-panel:schedule:back',
  OPEN_MASTERS: 'admin-panel:open-masters',
  MASTERS_OPEN_PREFIX: 'admin-panel:masters:open:',
  MASTERS_OPEN_BOOKINGS_PREFIX: 'admin-panel:masters:open-bookings:',
  MASTERS_OPEN_STATS_PREFIX: 'admin-panel:masters:open-stats:',
  MASTERS_EDIT_OPEN_PREFIX: 'admin-panel:masters:edit:open:',
  MASTERS_EDIT_FIELD_PREFIX: 'admin-panel:masters:edit:field:',
  MASTERS_EDIT_CONFIRM: 'admin-panel:masters:edit:confirm',
  MASTERS_EDIT_CANCEL: 'admin-panel:masters:edit:cancel',
  MASTERS_EDIT_BACK: 'admin-panel:masters:edit:back',
  MASTERS_BOOKINGS_OPEN_CARD_PREFIX: 'admin-panel:masters:bookings:open-card:',
  MASTERS_BOOKINGS_PREV_PAGE: 'admin-panel:masters:bookings:prev-page',
  MASTERS_BOOKINGS_NEXT_PAGE: 'admin-panel:masters:bookings:next-page',
  MASTERS_BOOKINGS_BACK_TO_LIST: 'admin-panel:masters:bookings:back-to-list',
  MASTERS_BOOKINGS_BACK_TO_MASTER: 'admin-panel:masters:bookings:back-to-master',
  MASTERS_BACK_TO_LIST: 'admin-panel:masters:back-to-list',
  MASTERS_BACK: 'admin-panel:masters:back',
  OPEN_SERVICES: 'admin-panel:open-services',
  SERVICES_OPEN_PREFIX: 'admin-panel:services:open:',
  SERVICES_OPEN_STATS_PREFIX: 'admin-panel:services:open-stats:',
  SERVICES_EDIT_OPEN_PREFIX: 'admin-panel:services:edit:open:',
  SERVICES_EDIT_NAME_OPEN: 'admin-panel:services:edit:name:open',
  SERVICES_EDIT_PRICE_OPEN: 'admin-panel:services:edit:price:open',
  SERVICES_EDIT_DURATION_OPEN: 'admin-panel:services:edit:duration:open',
  SERVICES_EDIT_DESCRIPTION_OPEN: 'admin-panel:services:edit:description:open',
  SERVICES_EDIT_RESULT_OPEN: 'admin-panel:services:edit:result:open',
  SERVICES_EDIT_STEP_OPEN: 'admin-panel:services:edit:step:open',
  SERVICES_EDIT_STEP_PICK_PREFIX: 'admin-panel:services:edit:step:pick:',
  SERVICES_EDIT_GUARANTEE_OPEN: 'admin-panel:services:edit:guarantee:open',
  SERVICES_EDIT_GUARANTEE_PICK_PREFIX: 'admin-panel:services:edit:guarantee:pick:',
  SERVICES_EDIT_DELETE_OPEN: 'admin-panel:services:edit:delete:open',
  SERVICES_EDIT_CONFIRM: 'admin-panel:services:edit:confirm',
  SERVICES_EDIT_CANCEL: 'admin-panel:services:edit:cancel',
  SERVICES_EDIT_BACK: 'admin-panel:services:edit:back',
  SERVICES_BACK_TO_LIST: 'admin-panel:services:back-to-list',
  SERVICES_BACK: 'admin-panel:services:back',
  OPEN_STATS: 'admin-panel:open-stats',
  STATS_OPEN_MASTERS: 'admin-panel:stats:open-masters',
  STATS_MASTERS_OPEN_PREFIX: 'admin-panel:stats:masters:open:',
  STATS_MASTERS_PREV_PAGE: 'admin-panel:stats:masters:prev-page',
  STATS_MASTERS_NEXT_PAGE: 'admin-panel:stats:masters:next-page',
  STATS_MASTERS_BACK_TO_LIST: 'admin-panel:stats:masters:back-to-list',
  STATS_OPEN_SERVICES: 'admin-panel:stats:open-services',
  STATS_SERVICES_OPEN_PREFIX: 'admin-panel:stats:services:open:',
  STATS_SERVICES_PREV_PAGE: 'admin-panel:stats:services:prev-page',
  STATS_SERVICES_NEXT_PAGE: 'admin-panel:stats:services:next-page',
  STATS_SERVICES_BACK_TO_LIST: 'admin-panel:stats:services:back-to-list',
  STATS_OPEN_MONTHLY: 'admin-panel:stats:open-monthly',
  STATS_MONTHLY_OPEN_PREFIX: 'admin-panel:stats:monthly:open:',
  STATS_MONTHLY_PREV_PAGE: 'admin-panel:stats:monthly:prev-page',
  STATS_MONTHLY_NEXT_PAGE: 'admin-panel:stats:monthly:next-page',
  STATS_MONTHLY_BACK_TO_LIST: 'admin-panel:stats:monthly:back-to-list',
  STATS_OPEN_CLIENTS: 'admin-panel:stats:open-clients',
  STATS_CLIENTS_OPEN_PREFIX: 'admin-panel:stats:clients:open:',
  STATS_CLIENTS_PREV_PAGE: 'admin-panel:stats:clients:prev-page',
  STATS_CLIENTS_NEXT_PAGE: 'admin-panel:stats:clients:next-page',
  STATS_CLIENTS_BACK_TO_LIST: 'admin-panel:stats:clients:back-to-list',
  STATS_BACK_TO_OVERVIEW: 'admin-panel:stats:back-to-overview',
  STATS_BACK: 'admin-panel:stats:back',
  OPEN_SETTINGS: 'admin-panel:open-settings',
  SETTINGS_OPEN_LANGUAGE: 'admin-panel:settings:open-language',
  SETTINGS_OPEN_ADMINS: 'admin-panel:settings:open-admins',
  SETTINGS_OPEN_STUDIO: 'admin-panel:settings:open-studio',
  SETTINGS_OPEN_NOTIFICATIONS: 'admin-panel:settings:open-notifications',
  SETTINGS_NOTIFICATIONS_TOGGLE_PREFIX: 'admin-panel:settings:notifications:toggle:',
  SETTINGS_NOTIFICATIONS_ALL_ON: 'admin-panel:settings:notifications:all-on',
  SETTINGS_NOTIFICATIONS_ALL_OFF: 'admin-panel:settings:notifications:all-off',
  SETTINGS_LANGUAGE_SELECT_PREFIX: 'admin-panel:settings:language:select:',
  SETTINGS_LANGUAGE_CONFIRM: 'admin-panel:settings:language:confirm',
  SETTINGS_LANGUAGE_CANCEL: 'admin-panel:settings:language:cancel',
  SETTINGS_STUDIO_EDIT_BLOCK_OPEN_PREFIX: 'admin-panel:settings:studio:edit-block:open:',
  SETTINGS_STUDIO_EDIT_BLOCK_CONFIRM: 'admin-panel:settings:studio:edit-block:confirm',
  SETTINGS_STUDIO_EDIT_BLOCK_CANCEL: 'admin-panel:settings:studio:edit-block:cancel',
  SETTINGS_ADMINS_GRANT_OPEN: 'admin-panel:settings:admins:grant:open',
  SETTINGS_ADMINS_GRANT_CONFIRM: 'admin-panel:settings:admins:grant:confirm',
  SETTINGS_ADMINS_GRANT_CANCEL: 'admin-panel:settings:admins:grant:cancel',
  SETTINGS_ADMINS_REVOKE_OPEN: 'admin-panel:settings:admins:revoke:open',
  SETTINGS_ADMINS_REVOKE_CONFIRM: 'admin-panel:settings:admins:revoke:confirm',
  SETTINGS_ADMINS_REVOKE_CANCEL: 'admin-panel:settings:admins:revoke:cancel',
  SETTINGS_BACK_TO_MENU: 'admin-panel:settings:back-to-menu',
  SETTINGS_BACK: 'admin-panel:settings:back',
  RECORDS_MENU_PENDING: 'admin-panel:records:menu:pending',
  RECORDS_MENU_TODAY: 'admin-panel:records:menu:today',
  RECORDS_MENU_TOMORROW: 'admin-panel:records:menu:tomorrow',
  RECORDS_MENU_ALL: 'admin-panel:records:menu:all',
  RECORDS_MENU_CANCELED: 'admin-panel:records:menu:canceled',
  RECORDS_LIST_PREV_PAGE: 'admin-panel:records:list:prev',
  RECORDS_LIST_NEXT_PAGE: 'admin-panel:records:list:next',
  RECORDS_OPEN_CARD_PREFIX: 'admin-panel:records:open-card:',
  RECORDS_CONFIRM_PREFIX: 'admin-panel:records:confirm:',
  RECORDS_CANCEL_REQUEST_PREFIX: 'admin-panel:records:cancel:request:',
  RECORDS_CANCEL_CONFIRM_PREFIX: 'admin-panel:records:cancel:confirm:',
  RECORDS_RESCHEDULE_PREFIX: 'admin-panel:records:reschedule:',
  RECORDS_RESCHEDULE_DATE_PREFIX: 'admin-panel:records:reschedule:date:',
  RECORDS_RESCHEDULE_TIME_PREFIX: 'admin-panel:records:reschedule:time:',
  RECORDS_RESCHEDULE_CONFIRM: 'admin-panel:records:reschedule:confirm',
  RECORDS_RESCHEDULE_BACK_TO_DATE: 'admin-panel:records:reschedule:back-to-date',
  RECORDS_RESCHEDULE_BACK_TO_TIME: 'admin-panel:records:reschedule:back-to-time',
  RECORDS_RESCHEDULE_CANCEL: 'admin-panel:records:reschedule:cancel',
  RECORDS_CHANGE_MASTER_PREFIX: 'admin-panel:records:change-master:',
  RECORDS_CHANGE_MASTER_SELECT_PREFIX: 'admin-panel:records:change-master:select:',
  RECORDS_CHANGE_MASTER_CONFIRM: 'admin-panel:records:change-master:confirm',
  RECORDS_CHANGE_MASTER_BACK: 'admin-panel:records:change-master:back',
  RECORDS_CHANGE_MASTER_CANCEL: 'admin-panel:records:change-master:cancel',
  RECORDS_BACK_TO_LIST: 'admin-panel:records:list:back',
  RECORDS_BACK: 'admin-panel:records:back',
  BACK_TO_ROOT: 'admin-panel:back-to-root',
  EXIT: 'admin-panel:exit',
  HOME: 'admin-panel:home',
} as const;

export const ADMIN_PANEL_BUTTON_TEXT = {
  RECORDS: '📅 Записи',
  SCHEDULE: '🕒 Розклад',
  SCHEDULE_OVERVIEW: '📋 Огляд розкладу',
  SCHEDULE_DAYS_OFF: '📅 Вихідні студії',
  SCHEDULE_HOLIDAYS: '🎉 Святкові дні',
  SCHEDULE_TEMPORARY: '🕒 Тимчасові зміни',
  SCHEDULE_CONFIGURE_DAY: '✏️ Налаштувати робочий день',
  SCHEDULE_ADD_DAY_OFF: '➕ Додати вихідний',
  SCHEDULE_ADD_HOLIDAY: '➕ Додати свято',
  SCHEDULE_ADD_TEMPORARY: '➕ Додати тимчасовий графік',
  SCHEDULE_CONFIRM: '✅ Підтвердити',
  SCHEDULE_CANCEL_ACTION: '❌ Скасувати дію',
  SCHEDULE_DELETE_CANCEL: '⬅️ Скасувати видалення',
  SCHEDULE_BACK_TO_SECTION: '⬅️ До розділу',
  SCHEDULE_REFRESH: '🔄 Оновити',
  SCHEDULE_BACK_TO_MENU: '⬅️ До меню розкладу',
  SCHEDULE_BACK: '⬅️ До адмін-панелі',
  MASTERS: '👩‍🎨 Майстри',
  MASTERS_OPEN_BOOKINGS: '📅 Записи майстра',
  MASTERS_OPEN_STATS: '📊 Статистика майстра',
  MASTERS_EDIT_OPEN: '✏️ Редагувати майстра',
  MASTERS_EDIT_DISPLAY_NAME: '✏️ Імʼя майстра',
  MASTERS_EDIT_BIO: '📝 Опис майстра',
  MASTERS_EDIT_PHONE: '📞 Телефон майстра',
  MASTERS_EDIT_EMAIL: '✉️ Email майстра',
  MASTERS_EDIT_MATERIALS: '🧴 Додаткова інформація',
  MASTERS_EDIT_STARTED_ON: '📅 Дата початку роботи',
  MASTERS_EDIT_PROCEDURES: '📊 Кількість процедур',
  MASTERS_EDIT_CONFIRM: '✅ Зберегти зміни',
  MASTERS_EDIT_CANCEL: '❌ Скасувати редагування',
  MASTERS_EDIT_BACK: '⬅️ До профілю майстра',
  MASTERS_BOOKINGS_BACK_TO_MASTER: '⬅️ До профілю майстра',
  MASTERS_BACK_TO_LIST: '⬅️ До списку майстрів',
  MASTERS_BACK: '⬅️ До адмін-панелі',
  SERVICES: '💼 Послуги',
  SERVICES_OPEN_STATS: '📊 Статистика послуги',
  SERVICES_EDIT_OPEN: '✏️ Редагувати послугу',
  SERVICES_EDIT_NAME: '🪪 Змінити назву',
  SERVICES_EDIT_PRICE: '💰 Змінити ціну',
  SERVICES_EDIT_DURATION: '⏱ Змінити тривалість',
  SERVICES_EDIT_DESCRIPTION: '📝 Змінити опис',
  SERVICES_EDIT_RESULT: '🎯 Змінити результат',
  SERVICES_EDIT_STEP: '🧩 Змінити назву етапу',
  SERVICES_EDIT_GUARANTEE: '🛡 Змінити гарантію',
  SERVICES_EDIT_DELETE: '🗑 Видалити послугу',
  SERVICES_EDIT_CONFIRM_DELETE: '🗑 Так, видалити',
  SERVICES_EDIT_CONFIRM: '✅ Зберегти',
  SERVICES_EDIT_CANCEL: '❌ Скасувати',
  SERVICES_EDIT_BACK: '⬅️ До картки послуги',
  SERVICES_BACK_TO_LIST: '⬅️ До списку послуг',
  SERVICES_BACK: '⬅️ До адмін-панелі',
  STATS: '📊 Статистика',
  STATS_MASTERS: '👩‍🎨 Майстри',
  STATS_MASTERS_BACK_TO_LIST: '⬅️ До списку майстрів',
  STATS_SERVICES_BACK_TO_LIST: '⬅️ До списку послуг',
  STATS_MONTHLY_BACK_TO_LIST: '⬅️ До списку звітів',
  STATS_CLIENTS_BACK_TO_LIST: '⬅️ До списку клієнтів',
  STATS_PREV_PAGE: '⬅️ Попередня',
  STATS_NEXT_PAGE: '➡️ Наступна',
  STATS_SERVICES: '💼 Послуги',
  STATS_MONTHLY: '📅 Місячні звіти',
  STATS_CLIENTS: '👥 Клієнти',
  STATS_BACK_TO_OVERVIEW: '⬅️ До статистики',
  STATS_BACK: '⬅️ До адмін-панелі',
  SETTINGS: '⚙️ Налаштування',
  SETTINGS_LANGUAGE: '🌐 Мова панелі',
  SETTINGS_LANGUAGE_UK: '🇺🇦 Українська',
  SETTINGS_LANGUAGE_EN: '🇬🇧 English',
  SETTINGS_LANGUAGE_CS: '🇨🇿 Čeština',
  SETTINGS_LANGUAGE_CONFIRM: '✅ Підтвердити',
  SETTINGS_LANGUAGE_CANCEL: '❌ Скасувати зміну',
  SETTINGS_ADMINS: '👑 Адміністратори',
  SETTINGS_STUDIO: '🏢 Параметри салону',
  SETTINGS_NOTIFICATIONS: '🔔 Системні сповіщення',
  SETTINGS_STUDIO_EDIT_ABOUT: 'ℹ️ Інформація про студію',
  SETTINGS_STUDIO_EDIT_CONTACTS: '📞 Контакти',
  SETTINGS_STUDIO_EDIT_BOOKING_RULES: '📅 Правила запису',
  SETTINGS_STUDIO_EDIT_CANCELLATION: '🔄 Скасування та перенесення',
  SETTINGS_STUDIO_EDIT_PREPARATION: '✨ Підготовка до процедури',
  SETTINGS_STUDIO_EDIT_COMFORT: '☕ Комфорт під час візиту',
  SETTINGS_STUDIO_EDIT_GUARANTEE: '🛠 Гарантія та сервіс',
  SETTINGS_STUDIO_CONFIRM: '✅ Зберегти зміни',
  SETTINGS_STUDIO_CANCEL: '❌ Скасувати редагування',
  SETTINGS_ADMINS_GRANT: '➕ Надати роль адміністратора',
  SETTINGS_ADMINS_REVOKE: '🚫 Видалити адміністратора',
  SETTINGS_ADMINS_CONFIRM_GRANT: '✅ Надати роль',
  SETTINGS_ADMINS_CONFIRM_REVOKE: '✅ Забрати роль',
  SETTINGS_ADMINS_CANCEL: '❌ Скасувати дію',
  SETTINGS_BACK_TO_MENU: '⬅️ До меню налаштувань',
  SETTINGS_BACK: '⬅️ До адмін-панелі',
  RECORDS_PENDING: '🆕 Нові записи (очікують підтвердження)',
  RECORDS_TODAY: '📍 Сьогодні',
  RECORDS_TOMORROW: '📆 Завтра',
  RECORDS_ALL: '🗂 Усі записи',
  RECORDS_CANCELED: '❌ Скасовані',
  RECORDS_CONFIRM: '✅ Підтвердити',
  RECORDS_CANCEL: '❌ Скасувати',
  RECORDS_RESCHEDULE: '🔄 Перенести',
  RECORDS_CHANGE_MASTER: '👩‍🎨 Змінити майстра',
  RECORDS_CONFIRM_CANCEL: '✅ Так, скасувати',
  RECORDS_CONFIRM_RESCHEDULE: '✅ Підтвердити перенесення',
  RECORDS_CONFIRM_CHANGE_MASTER: '✅ Підтвердити зміну майстра',
  RECORDS_BACK_TO_DATE: '⬅️ До вибору дати',
  RECORDS_BACK_TO_TIME: '⬅️ До вибору часу',
  RECORDS_CANCEL_ACTION: '❌ Скасувати дію',
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
export const ADMIN_PANEL_RECORDS_CONFIRM_ACTION_REGEX = /^admin-panel:records:confirm:(\d+)$/;
export const ADMIN_PANEL_RECORDS_CANCEL_REQUEST_ACTION_REGEX =
  /^admin-panel:records:cancel:request:(\d+)$/;
export const ADMIN_PANEL_RECORDS_CANCEL_CONFIRM_ACTION_REGEX =
  /^admin-panel:records:cancel:confirm:(\d+)$/;
export const ADMIN_PANEL_RECORDS_RESCHEDULE_ACTION_REGEX =
  /^admin-panel:records:reschedule:(\d+)$/;
export const ADMIN_PANEL_RECORDS_RESCHEDULE_DATE_ACTION_REGEX =
  /^admin-panel:records:reschedule:date:(\d{8})$/;
export const ADMIN_PANEL_RECORDS_RESCHEDULE_TIME_ACTION_REGEX =
  /^admin-panel:records:reschedule:time:(\d{4})$/;
export const ADMIN_PANEL_RECORDS_CHANGE_MASTER_ACTION_REGEX =
  /^admin-panel:records:change-master:(\d+)$/;
export const ADMIN_PANEL_RECORDS_CHANGE_MASTER_SELECT_ACTION_REGEX =
  /^admin-panel:records:change-master:select:(\d+):(\d+)$/;
export const ADMIN_PANEL_SCHEDULE_DAY_OFF_DELETE_REQUEST_ACTION_REGEX =
  /^admin-panel:schedule:day-off:delete:request:(\d+)$/;
export const ADMIN_PANEL_SCHEDULE_DAY_OFF_DELETE_CONFIRM_ACTION_REGEX =
  /^admin-panel:schedule:day-off:delete:confirm:(\d+)$/;
export const ADMIN_PANEL_SCHEDULE_HOLIDAY_DELETE_REQUEST_ACTION_REGEX =
  /^admin-panel:schedule:holiday:delete:request:(\d+)$/;
export const ADMIN_PANEL_SCHEDULE_HOLIDAY_DELETE_CONFIRM_ACTION_REGEX =
  /^admin-panel:schedule:holiday:delete:confirm:(\d+)$/;
export const ADMIN_PANEL_SCHEDULE_CONFIGURE_DAY_WEEKDAY_ACTION_REGEX =
  /^admin-panel:schedule:configure-day:weekday:([1-7])$/;
export const ADMIN_PANEL_SCHEDULE_CONFIGURE_DAY_OFF_ACTION_REGEX =
  /^admin-panel:schedule:configure-day:off:([1-7])$/;
export const ADMIN_PANEL_SCHEDULE_TEMPORARY_DAY_ACTION_REGEX =
  /^admin-panel:schedule:temporary:day:([1-7])$/;
export const ADMIN_PANEL_SCHEDULE_TEMPORARY_DAY_OFF_ACTION_REGEX =
  /^admin-panel:schedule:temporary:day-off:([1-7])$/;
export const ADMIN_PANEL_SCHEDULE_TEMPORARY_DELETE_REQUEST_ACTION_REGEX =
  /^admin-panel:schedule:temporary:delete:request:(\d{8}):(\d{8})$/;
export const ADMIN_PANEL_SCHEDULE_TEMPORARY_DELETE_CONFIRM_ACTION_REGEX =
  /^admin-panel:schedule:temporary:delete:confirm:(\d{8}):(\d{8})$/;
export const ADMIN_PANEL_MASTERS_OPEN_ACTION_REGEX = /^admin-panel:masters:open:(\d+)$/;
export const ADMIN_PANEL_MASTERS_OPEN_BOOKINGS_ACTION_REGEX =
  /^admin-panel:masters:open-bookings:(\d+)$/;
export const ADMIN_PANEL_MASTERS_OPEN_STATS_ACTION_REGEX = /^admin-panel:masters:open-stats:(\d+)$/;
export const ADMIN_PANEL_MASTERS_EDIT_OPEN_ACTION_REGEX =
  /^admin-panel:masters:edit:open:(\d+)$/;
export const ADMIN_PANEL_MASTERS_EDIT_FIELD_ACTION_REGEX =
  /^admin-panel:masters:edit:field:(\d+):(display_name|bio|materials|phone|email|started_on|procedures_done_total)$/;
export const ADMIN_PANEL_MASTERS_BOOKINGS_OPEN_CARD_ACTION_REGEX =
  /^admin-panel:masters:bookings:open-card:(\d+)$/;
export const ADMIN_PANEL_SERVICES_OPEN_ACTION_REGEX = /^admin-panel:services:open:(\d+)$/;
export const ADMIN_PANEL_SERVICES_OPEN_STATS_ACTION_REGEX = /^admin-panel:services:open-stats:(\d+)$/;
export const ADMIN_PANEL_SERVICES_EDIT_OPEN_ACTION_REGEX = /^admin-panel:services:edit:open:(\d+)$/;
export const ADMIN_PANEL_SERVICES_EDIT_STEP_PICK_ACTION_REGEX =
  /^admin-panel:services:edit:step:pick:(\d+)$/;
export const ADMIN_PANEL_SERVICES_EDIT_GUARANTEE_PICK_ACTION_REGEX =
  /^admin-panel:services:edit:guarantee:pick:(\d+)$/;
export const ADMIN_PANEL_STATS_MASTERS_OPEN_ACTION_REGEX = /^admin-panel:stats:masters:open:(\d+)$/;
export const ADMIN_PANEL_STATS_SERVICES_OPEN_ACTION_REGEX = /^admin-panel:stats:services:open:(\d+)$/;
export const ADMIN_PANEL_STATS_MONTHLY_OPEN_ACTION_REGEX = /^admin-panel:stats:monthly:open:(\d{6})$/;
export const ADMIN_PANEL_STATS_CLIENTS_OPEN_ACTION_REGEX = /^admin-panel:stats:clients:open:(\d+)$/;
export const ADMIN_PANEL_SETTINGS_STUDIO_EDIT_BLOCK_OPEN_ACTION_REGEX =
  /^admin-panel:settings:studio:edit-block:open:(about|contacts|booking_rules|cancellation_policy|preparation|comfort|guarantee_service)$/;
export const ADMIN_PANEL_SETTINGS_LANGUAGE_SELECT_ACTION_REGEX =
  /^admin-panel:settings:language:select:(uk|en|cs)$/;
export const ADMIN_PANEL_SETTINGS_NOTIFICATIONS_TOGGLE_ACTION_REGEX =
  /^admin-panel:settings:notifications:toggle:(booking_confirmation|status_change|visit_reminder|promo_news)$/;

export function makeAdminPanelRecordsOpenCardAction(appointmentId: string): string {
  return `${ADMIN_PANEL_ACTION.RECORDS_OPEN_CARD_PREFIX}${appointmentId}`;
}

export function makeAdminPanelRecordsConfirmAction(appointmentId: string): string {
  return `${ADMIN_PANEL_ACTION.RECORDS_CONFIRM_PREFIX}${appointmentId}`;
}

export function makeAdminPanelRecordsCancelRequestAction(appointmentId: string): string {
  return `${ADMIN_PANEL_ACTION.RECORDS_CANCEL_REQUEST_PREFIX}${appointmentId}`;
}

export function makeAdminPanelRecordsCancelConfirmAction(appointmentId: string): string {
  return `${ADMIN_PANEL_ACTION.RECORDS_CANCEL_CONFIRM_PREFIX}${appointmentId}`;
}

export function makeAdminPanelRecordsRescheduleAction(appointmentId: string): string {
  return `${ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_PREFIX}${appointmentId}`;
}

export function makeAdminPanelRecordsRescheduleDateAction(dateCode: string): string {
  return `${ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_DATE_PREFIX}${dateCode}`;
}

export function makeAdminPanelRecordsRescheduleTimeAction(timeCode: string): string {
  return `${ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_TIME_PREFIX}${timeCode}`;
}

export function makeAdminPanelRecordsChangeMasterAction(appointmentId: string): string {
  return `${ADMIN_PANEL_ACTION.RECORDS_CHANGE_MASTER_PREFIX}${appointmentId}`;
}

export function makeAdminPanelRecordsChangeMasterSelectAction(
  appointmentId: string,
  masterId: string,
): string {
  return `${ADMIN_PANEL_ACTION.RECORDS_CHANGE_MASTER_SELECT_PREFIX}${appointmentId}:${masterId}`;
}

export function makeAdminPanelScheduleDayOffDeleteRequestAction(dayOffId: string): string {
  return `${ADMIN_PANEL_ACTION.SCHEDULE_DAY_OFF_DELETE_REQUEST_PREFIX}${dayOffId}`;
}

export function makeAdminPanelScheduleDayOffDeleteConfirmAction(dayOffId: string): string {
  return `${ADMIN_PANEL_ACTION.SCHEDULE_DAY_OFF_DELETE_CONFIRM_PREFIX}${dayOffId}`;
}

export function makeAdminPanelScheduleHolidayDeleteRequestAction(holidayId: string): string {
  return `${ADMIN_PANEL_ACTION.SCHEDULE_HOLIDAY_DELETE_REQUEST_PREFIX}${holidayId}`;
}

export function makeAdminPanelScheduleHolidayDeleteConfirmAction(holidayId: string): string {
  return `${ADMIN_PANEL_ACTION.SCHEDULE_HOLIDAY_DELETE_CONFIRM_PREFIX}${holidayId}`;
}

export function makeAdminPanelScheduleConfigureDayWeekdayAction(weekday: number): string {
  return `${ADMIN_PANEL_ACTION.SCHEDULE_CONFIGURE_DAY_WEEKDAY_PREFIX}${weekday}`;
}

export function makeAdminPanelScheduleConfigureDayOffAction(weekday: number): string {
  return `${ADMIN_PANEL_ACTION.SCHEDULE_CONFIGURE_DAY_OFF_PREFIX}${weekday}`;
}

export function makeAdminPanelScheduleTemporaryDayAction(weekday: number): string {
  return `${ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_DAY_PREFIX}${weekday}`;
}

export function makeAdminPanelScheduleTemporaryDayOffAction(weekday: number): string {
  return `${ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_DAY_OFF_PREFIX}${weekday}`;
}

export function makeAdminPanelScheduleTemporaryDeleteRequestAction(
  dateFromCode: string,
  dateToCode: string,
): string {
  return `${ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_DELETE_REQUEST_PREFIX}${dateFromCode}:${dateToCode}`;
}

export function makeAdminPanelScheduleTemporaryDeleteConfirmAction(
  dateFromCode: string,
  dateToCode: string,
): string {
  return `${ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_DELETE_CONFIRM_PREFIX}${dateFromCode}:${dateToCode}`;
}

export function makeAdminPanelMastersOpenAction(masterId: string): string {
  return `${ADMIN_PANEL_ACTION.MASTERS_OPEN_PREFIX}${masterId}`;
}

export function makeAdminPanelMastersOpenBookingsAction(masterId: string): string {
  return `${ADMIN_PANEL_ACTION.MASTERS_OPEN_BOOKINGS_PREFIX}${masterId}`;
}

export function makeAdminPanelMastersOpenStatsAction(masterId: string): string {
  return `${ADMIN_PANEL_ACTION.MASTERS_OPEN_STATS_PREFIX}${masterId}`;
}

export function makeAdminPanelMastersEditOpenAction(masterId: string): string {
  return `${ADMIN_PANEL_ACTION.MASTERS_EDIT_OPEN_PREFIX}${masterId}`;
}

export function makeAdminPanelMastersEditFieldAction(
  masterId: string,
  field:
    | 'display_name'
    | 'bio'
    | 'materials'
    | 'phone'
    | 'email'
    | 'started_on'
    | 'procedures_done_total',
): string {
  return `${ADMIN_PANEL_ACTION.MASTERS_EDIT_FIELD_PREFIX}${masterId}:${field}`;
}

export function makeAdminPanelMastersBookingsOpenCardAction(appointmentId: string): string {
  return `${ADMIN_PANEL_ACTION.MASTERS_BOOKINGS_OPEN_CARD_PREFIX}${appointmentId}`;
}

export function makeAdminPanelServicesOpenAction(serviceId: string): string {
  return `${ADMIN_PANEL_ACTION.SERVICES_OPEN_PREFIX}${serviceId}`;
}

export function makeAdminPanelServicesOpenStatsAction(serviceId: string): string {
  return `${ADMIN_PANEL_ACTION.SERVICES_OPEN_STATS_PREFIX}${serviceId}`;
}

export function makeAdminPanelServicesEditOpenAction(serviceId: string): string {
  return `${ADMIN_PANEL_ACTION.SERVICES_EDIT_OPEN_PREFIX}${serviceId}`;
}

export function makeAdminPanelServicesEditStepPickAction(stepNo: number): string {
  return `${ADMIN_PANEL_ACTION.SERVICES_EDIT_STEP_PICK_PREFIX}${stepNo}`;
}

export function makeAdminPanelServicesEditGuaranteePickAction(guaranteeNo: number): string {
  return `${ADMIN_PANEL_ACTION.SERVICES_EDIT_GUARANTEE_PICK_PREFIX}${guaranteeNo}`;
}

export function makeAdminPanelStatsMastersOpenAction(masterId: string): string {
  return `${ADMIN_PANEL_ACTION.STATS_MASTERS_OPEN_PREFIX}${masterId}`;
}

export function makeAdminPanelStatsServicesOpenAction(serviceId: string): string {
  return `${ADMIN_PANEL_ACTION.STATS_SERVICES_OPEN_PREFIX}${serviceId}`;
}

export function makeAdminPanelStatsMonthlyOpenAction(monthCode: string): string {
  return `${ADMIN_PANEL_ACTION.STATS_MONTHLY_OPEN_PREFIX}${monthCode}`;
}

export function makeAdminPanelStatsClientsOpenAction(clientId: string): string {
  return `${ADMIN_PANEL_ACTION.STATS_CLIENTS_OPEN_PREFIX}${clientId}`;
}

export function makeAdminPanelSettingsStudioEditBlockOpenAction(blockKey: string): string {
  return `${ADMIN_PANEL_ACTION.SETTINGS_STUDIO_EDIT_BLOCK_OPEN_PREFIX}${blockKey}`;
}

export function makeAdminPanelSettingsLanguageSelectAction(languageCode: 'uk' | 'en' | 'cs'): string {
  return `${ADMIN_PANEL_ACTION.SETTINGS_LANGUAGE_SELECT_PREFIX}${languageCode}`;
}

export function makeAdminPanelSettingsNotificationsToggleAction(
  notificationType: 'booking_confirmation' | 'status_change' | 'visit_reminder' | 'promo_news',
): string {
  return `${ADMIN_PANEL_ACTION.SETTINGS_NOTIFICATIONS_TOGGLE_PREFIX}${notificationType}`;
}
