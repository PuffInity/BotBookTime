/**
 * @file bot-master-panel.types.ts
 * @summary Callback-константи і тексти кнопок для панелі майстра.
 */

export const MASTER_PANEL_ACTION = {
  OPEN_PROFILE: 'master-panel:open-profile',
  OPEN_BOOKINGS: 'master-panel:open-bookings',
  OPEN_SCHEDULE: 'master-panel:open-schedule',
  OPEN_STATS: 'master-panel:open-stats',
  SCHEDULE_CONFIGURE_DAY: 'master-panel:schedule:configure-day',
  SCHEDULE_SET_DAY_OFF: 'master-panel:schedule:set-day-off',
  SCHEDULE_LIST_DAYS_OFF: 'master-panel:schedule:list-days-off',
  SCHEDULE_VACATIONS: 'master-panel:schedule:vacations',
  SCHEDULE_TEMPORARY_HOURS: 'master-panel:schedule:temporary-hours',
  SCHEDULE_BACK: 'master-panel:schedule:back',
  BOOKINGS_SHOW_PENDING: 'master-panel:bookings:show-pending',
  BOOKINGS_NEXT_PENDING: 'master-panel:bookings:next-pending',
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
  BACK_TO_PANEL: '⬅️ До панелі майстра',
  HOME: '🏠 Головне меню',
} as const;

export const MASTER_PANEL_BOOKING_CONFIRM_ACTION_REGEX = /^master-panel:booking:confirm:(\d+)$/;
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

export function makeMasterPanelBookingConfirmAction(appointmentId: string): string {
  return `${MASTER_PANEL_ACTION.BOOKING_CONFIRM_PREFIX}${appointmentId}`;
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
