/**
 * @file bot-booking.types.ts
 * @summary Константи callback-дій і кнопок для сцени "Бронювання".
 */

export const BOOKING_ACTION = {
  OPEN_SERVICE_PREFIX: 'booking:service:',
  SELECT_DATE_PREFIX: 'booking:date:',
  SELECT_TIME_PREFIX: 'booking:time:',
  OPEN_MASTER_PREFIX: 'booking:master:',
  PHONE_GO_PROFILE: 'booking:phone:go-profile',
  PHONE_USE_UNVERIFIED: 'booking:phone:use-unverified',
  BACK: 'booking:back',
  HOME: 'booking:home',
  CONFIRM: 'booking:confirm',
  CHANGE: 'booking:change',
  CANCEL: 'booking:cancel',
} as const;

export const BOOKING_SERVICE_ACTION_REGEX = /^booking:service:(\d+)$/;
export const BOOKING_DATE_ACTION_REGEX = /^booking:date:(\d{8})$/;
export const BOOKING_TIME_ACTION_REGEX = /^booking:time:(\d{4})$/;
export const BOOKING_MASTER_ACTION_REGEX = /^booking:master:(\d+)$/;

export const BOOKING_BUTTON_TEXT = {
  BACK: '⬅️ Назад',
  CANCEL_BOOKING: '❌ Скасувати бронювання',
  GO_PROFILE: '👤 Перейти в профіль',
  USE_UNVERIFIED_PHONE: '📱 Використати непідтверджений номер',
  CONFIRM: '✅ Підтвердити',
  CHANGE: '✏️ Змінити',
  CANCEL: '❌ Скасувати бронювання',
} as const;

export function makeBookingServiceAction(serviceId: string): string {
  return `${BOOKING_ACTION.OPEN_SERVICE_PREFIX}${serviceId}`;
}

export function makeBookingDateAction(dateCode: string): string {
  return `${BOOKING_ACTION.SELECT_DATE_PREFIX}${dateCode}`;
}

export function makeBookingTimeAction(timeCode: string): string {
  return `${BOOKING_ACTION.SELECT_TIME_PREFIX}${timeCode}`;
}

export function makeBookingMasterAction(masterId: string): string {
  return `${BOOKING_ACTION.OPEN_MASTER_PREFIX}${masterId}`;
}

export const BOOKING_ERROR_CODE = {
  SERVICE_UNAVAILABLE: 'BOOKING_SERVICE_UNAVAILABLE',
  TIME_UNAVAILABLE: 'BOOKING_TIME_UNAVAILABLE',
  MASTER_UNAVAILABLE: 'BOOKING_MASTER_UNAVAILABLE',
  SLOT_CONFLICT: 'BOOKING_SLOT_CONFLICT',
} as const;
