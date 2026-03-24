/**
 * @file bot-master-panel.types.ts
 * @summary Callback-константи і тексти кнопок для панелі майстра.
 */

export const MASTER_PANEL_ACTION = {
  OPEN_PROFILE: 'master-panel:open-profile',
  OPEN_PROFILE_SERVICES: 'master-panel:open-profile:services',
  OPEN_PROFILE_PROFESSIONAL: 'master-panel:open-profile:professional',
  OPEN_PROFILE_ADDITIONAL: 'master-panel:open-profile:additional',
  OPEN_PROFILE_EDIT_BIO: 'master-panel:open-profile:edit:bio',
  OPEN_PROFILE_EDIT_MATERIALS: 'master-panel:open-profile:edit:materials',
  OPEN_PROFILE_EDIT_PHONE: 'master-panel:open-profile:edit:phone',
  OPEN_PROFILE_EDIT_EMAIL: 'master-panel:open-profile:edit:email',
  OPEN_PROFILE_EDIT_CONFIRM: 'master-panel:open-profile:edit:confirm',
  OPEN_PROFILE_EDIT_CANCEL: 'master-panel:open-profile:edit:cancel',
  OPEN_BOOKINGS: 'master-panel:open-bookings',
  OPEN_SCHEDULE: 'master-panel:open-schedule',
  OPEN_STATS: 'master-panel:open-stats',
  OPEN_STATS_FINANCE: 'master-panel:open-stats:finance',
  SCHEDULE_CONFIGURE_DAY: 'master-panel:schedule:configure-day',
  SCHEDULE_CONFIGURE_DAY_WEEKDAY_PREFIX: 'master-panel:schedule:configure-day:weekday:',
  SCHEDULE_CONFIGURE_DAY_OFF_PREFIX: 'master-panel:schedule:configure-day:off:',
  SCHEDULE_SET_DAY_OFF: 'master-panel:schedule:set-day-off',
  SCHEDULE_SET_DAY_OFF_CONFIRM: 'master-panel:schedule:set-day-off:confirm',
  SCHEDULE_SET_DAY_OFF_CANCEL: 'master-panel:schedule:set-day-off:cancel',
  SCHEDULE_LIST_DAYS_OFF: 'master-panel:schedule:list-days-off',
  SCHEDULE_DAY_OFF_DELETE_REQUEST_PREFIX: 'master-panel:schedule:day-off:delete:request:',
  SCHEDULE_DAY_OFF_DELETE_CONFIRM_PREFIX: 'master-panel:schedule:day-off:delete:confirm:',
  SCHEDULE_VACATIONS: 'master-panel:schedule:vacations',
  SCHEDULE_VACATIONS_CREATE: 'master-panel:schedule:vacations:create',
  SCHEDULE_VACATIONS_CONFIRM: 'master-panel:schedule:vacations:confirm',
  SCHEDULE_VACATIONS_CANCEL: 'master-panel:schedule:vacations:cancel',
  SCHEDULE_VACATION_DELETE_REQUEST_PREFIX: 'master-panel:schedule:vacation:delete:request:',
  SCHEDULE_VACATION_DELETE_CONFIRM_PREFIX: 'master-panel:schedule:vacation:delete:confirm:',
  SCHEDULE_TEMPORARY_HOURS: 'master-panel:schedule:temporary-hours',
  SCHEDULE_TEMPORARY_HOURS_CREATE: 'master-panel:schedule:temporary-hours:create',
  SCHEDULE_TEMPORARY_HOURS_CONFIRM: 'master-panel:schedule:temporary-hours:confirm',
  SCHEDULE_TEMPORARY_HOURS_CANCEL: 'master-panel:schedule:temporary-hours:cancel',
  SCHEDULE_TEMPORARY_HOURS_DAY_PREFIX: 'master-panel:schedule:temporary-hours:day:',
  SCHEDULE_TEMPORARY_HOURS_DAY_OFF_PREFIX: 'master-panel:schedule:temporary-hours:day-off:',
  SCHEDULE_TEMPORARY_DELETE_REQUEST_PREFIX: 'master-panel:schedule:temporary-hours:delete:request:',
  SCHEDULE_TEMPORARY_DELETE_CONFIRM_PREFIX: 'master-panel:schedule:temporary-hours:delete:confirm:',
  SCHEDULE_DELETE_CANCEL: 'master-panel:schedule:delete:cancel',
  SCHEDULE_BACK: 'master-panel:schedule:back',
  BOOKINGS_SHOW_PENDING: 'master-panel:bookings:show-pending',
  BOOKINGS_NEXT_PENDING: 'master-panel:bookings:next-pending',
  BOOKINGS_OPEN_MENU: 'master-panel:bookings:open-menu',
  BOOKINGS_MENU_TODAY: 'master-panel:bookings:menu:today',
  BOOKINGS_MENU_TOMORROW: 'master-panel:bookings:menu:tomorrow',
  BOOKINGS_MENU_ALL: 'master-panel:bookings:menu:all',
  BOOKINGS_MENU_CANCELED: 'master-panel:bookings:menu:canceled',
  BOOKINGS_LIST_PREV_PAGE: 'master-panel:bookings:list:prev',
  BOOKINGS_LIST_NEXT_PAGE: 'master-panel:bookings:list:next',
  BOOKINGS_BACK_TO_LIST: 'master-panel:bookings:list:back',
  BOOKING_OPEN_CARD_PREFIX: 'master-panel:booking:open-card:',
  BOOKING_CONFIRM_PREFIX: 'master-panel:booking:confirm:',
  BOOKING_CANCEL_REQUEST_PREFIX: 'master-panel:booking:cancel:request:',
  BOOKING_CANCEL_CONFIRM_PREFIX: 'master-panel:booking:cancel:confirm:',
  BOOKING_RESCHEDULE_PREFIX: 'master-panel:booking:reschedule:',
  BOOKING_RESCHEDULE_DATE_PREFIX: 'master-panel:booking:reschedule:date:',
  BOOKING_RESCHEDULE_TIME_PREFIX: 'master-panel:booking:reschedule:time:',
  BOOKINGS_RESCHEDULE_CONFIRM: 'master-panel:bookings:reschedule:confirm',
  BOOKINGS_RESCHEDULE_BACK_TO_DATE: 'master-panel:bookings:reschedule:back-to-date',
  BOOKINGS_RESCHEDULE_BACK_TO_TIME: 'master-panel:bookings:reschedule:back-to-time',
  BOOKINGS_RESCHEDULE_CANCEL: 'master-panel:bookings:reschedule:cancel',
  BOOKING_PROFILE_PREFIX: 'master-panel:booking:profile:',
  BOOKING_CLIENT_HISTORY_PREFIX: 'master-panel:booking:client-history:',
  BACK_TO_PANEL: 'master-panel:back-to-panel',
  HOME: 'master-panel:home',
} as const;

export const MASTER_PANEL_BUTTON_TEXT = {
  PROFILE: '👤 Мій профіль',
  BOOKINGS: '📅 Мої записи',
  SCHEDULE: '🕒 Мій розклад',
  SCHEDULE_CONFIGURE_DAY: '👩‍🎨 Налаштування робочого дня',
  SCHEDULE_SET_DAY_OFF: '📅 Встановити вихідний день',
  SCHEDULE_LIST_DAYS_OFF: '📋 Переглянути вихідні дні',
  SCHEDULE_VACATIONS: '🏖 Відпустка',
  SCHEDULE_TEMPORARY_HOURS: '🕒 Тимчасова зміна графіку',
  SCHEDULE_BACK: '⬅️ До розкладу',
  STATS: '📊 Моя статистика',
  STATS_FINANCE: '💰 ФІНАНСИ',
  BACK_TO_PANEL: '⬅️ До панелі майстра',
  HOME: '🏠 Головне меню',
} as const;

export const MASTER_PANEL_BOOKING_CONFIRM_ACTION_REGEX = /^master-panel:booking:confirm:(\d+)$/;
export const MASTER_PANEL_BOOKING_OPEN_CARD_ACTION_REGEX =
  /^master-panel:booking:open-card:(\d+)$/;
export const MASTER_PANEL_BOOKING_CANCEL_REQUEST_ACTION_REGEX =
  /^master-panel:booking:cancel:request:(\d+)$/;
export const MASTER_PANEL_BOOKING_CANCEL_CONFIRM_ACTION_REGEX =
  /^master-panel:booking:cancel:confirm:(\d+)$/;
export const MASTER_PANEL_BOOKING_RESCHEDULE_ACTION_REGEX =
  /^master-panel:booking:reschedule:(\d+)$/;
export const MASTER_PANEL_BOOKING_RESCHEDULE_DATE_ACTION_REGEX =
  /^master-panel:booking:reschedule:date:(\d{8})$/;
export const MASTER_PANEL_BOOKING_RESCHEDULE_TIME_ACTION_REGEX =
  /^master-panel:booking:reschedule:time:(\d{4})$/;
export const MASTER_PANEL_BOOKING_PROFILE_ACTION_REGEX =
  /^master-panel:booking:profile:(\d+)$/;
export const MASTER_PANEL_BOOKING_CLIENT_HISTORY_ACTION_REGEX =
  /^master-panel:booking:client-history:(\d+)$/;
export const MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_WEEKDAY_ACTION_REGEX =
  /^master-panel:schedule:configure-day:weekday:([1-7])$/;
export const MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_OFF_ACTION_REGEX =
  /^master-panel:schedule:configure-day:off:([1-7])$/;
export const MASTER_PANEL_TEMPORARY_HOURS_DAY_ACTION_REGEX =
  /^master-panel:schedule:temporary-hours:day:([1-7])$/;
export const MASTER_PANEL_TEMPORARY_HOURS_DAY_OFF_ACTION_REGEX =
  /^master-panel:schedule:temporary-hours:day-off:([1-7])$/;
export const MASTER_PANEL_SCHEDULE_DAY_OFF_DELETE_REQUEST_ACTION_REGEX =
  /^master-panel:schedule:day-off:delete:request:(\d+)$/;
export const MASTER_PANEL_SCHEDULE_DAY_OFF_DELETE_CONFIRM_ACTION_REGEX =
  /^master-panel:schedule:day-off:delete:confirm:(\d+)$/;
export const MASTER_PANEL_SCHEDULE_VACATION_DELETE_REQUEST_ACTION_REGEX =
  /^master-panel:schedule:vacation:delete:request:(\d+)$/;
export const MASTER_PANEL_SCHEDULE_VACATION_DELETE_CONFIRM_ACTION_REGEX =
  /^master-panel:schedule:vacation:delete:confirm:(\d+)$/;
export const MASTER_PANEL_SCHEDULE_TEMPORARY_DELETE_REQUEST_ACTION_REGEX =
  /^master-panel:schedule:temporary-hours:delete:request:(\d{8}):(\d{8})$/;
export const MASTER_PANEL_SCHEDULE_TEMPORARY_DELETE_CONFIRM_ACTION_REGEX =
  /^master-panel:schedule:temporary-hours:delete:confirm:(\d{8}):(\d{8})$/;

export function makeMasterPanelBookingConfirmAction(appointmentId: string): string {
  return `${MASTER_PANEL_ACTION.BOOKING_CONFIRM_PREFIX}${appointmentId}`;
}

export function makeMasterPanelBookingOpenCardAction(appointmentId: string): string {
  return `${MASTER_PANEL_ACTION.BOOKING_OPEN_CARD_PREFIX}${appointmentId}`;
}

export function makeMasterPanelBookingCancelRequestAction(appointmentId: string): string {
  return `${MASTER_PANEL_ACTION.BOOKING_CANCEL_REQUEST_PREFIX}${appointmentId}`;
}

export function makeMasterPanelBookingCancelConfirmAction(appointmentId: string): string {
  return `${MASTER_PANEL_ACTION.BOOKING_CANCEL_CONFIRM_PREFIX}${appointmentId}`;
}

export function makeMasterPanelBookingRescheduleAction(appointmentId: string): string {
  return `${MASTER_PANEL_ACTION.BOOKING_RESCHEDULE_PREFIX}${appointmentId}`;
}

export function makeMasterPanelBookingRescheduleDateAction(dateCode: string): string {
  return `${MASTER_PANEL_ACTION.BOOKING_RESCHEDULE_DATE_PREFIX}${dateCode}`;
}

export function makeMasterPanelBookingRescheduleTimeAction(timeCode: string): string {
  return `${MASTER_PANEL_ACTION.BOOKING_RESCHEDULE_TIME_PREFIX}${timeCode}`;
}

export function makeMasterPanelBookingProfileAction(appointmentId: string): string {
  return `${MASTER_PANEL_ACTION.BOOKING_PROFILE_PREFIX}${appointmentId}`;
}

export function makeMasterPanelBookingClientHistoryAction(appointmentId: string): string {
  return `${MASTER_PANEL_ACTION.BOOKING_CLIENT_HISTORY_PREFIX}${appointmentId}`;
}

export function makeMasterPanelTemporaryHoursDayAction(weekday: number): string {
  return `${MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS_DAY_PREFIX}${weekday}`;
}

export function makeMasterPanelTemporaryHoursDayOffAction(weekday: number): string {
  return `${MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS_DAY_OFF_PREFIX}${weekday}`;
}

export function makeMasterPanelScheduleConfigureDayWeekdayAction(weekday: number): string {
  return `${MASTER_PANEL_ACTION.SCHEDULE_CONFIGURE_DAY_WEEKDAY_PREFIX}${weekday}`;
}

export function makeMasterPanelScheduleConfigureDayOffAction(weekday: number): string {
  return `${MASTER_PANEL_ACTION.SCHEDULE_CONFIGURE_DAY_OFF_PREFIX}${weekday}`;
}

export function makeMasterPanelScheduleDayOffDeleteRequestAction(dayOffId: string): string {
  return `${MASTER_PANEL_ACTION.SCHEDULE_DAY_OFF_DELETE_REQUEST_PREFIX}${dayOffId}`;
}

export function makeMasterPanelScheduleDayOffDeleteConfirmAction(dayOffId: string): string {
  return `${MASTER_PANEL_ACTION.SCHEDULE_DAY_OFF_DELETE_CONFIRM_PREFIX}${dayOffId}`;
}

export function makeMasterPanelScheduleVacationDeleteRequestAction(vacationId: string): string {
  return `${MASTER_PANEL_ACTION.SCHEDULE_VACATION_DELETE_REQUEST_PREFIX}${vacationId}`;
}

export function makeMasterPanelScheduleVacationDeleteConfirmAction(vacationId: string): string {
  return `${MASTER_PANEL_ACTION.SCHEDULE_VACATION_DELETE_CONFIRM_PREFIX}${vacationId}`;
}

export function makeMasterPanelScheduleTemporaryDeleteRequestAction(
  dateFromCode: string,
  dateToCode: string,
): string {
  return `${MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_DELETE_REQUEST_PREFIX}${dateFromCode}:${dateToCode}`;
}

export function makeMasterPanelScheduleTemporaryDeleteConfirmAction(
  dateFromCode: string,
  dateToCode: string,
): string {
  return `${MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_DELETE_CONFIRM_PREFIX}${dateFromCode}:${dateToCode}`;
}
