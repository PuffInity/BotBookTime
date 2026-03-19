/**
 * @file bot-profile.types.ts
 * @summary Константи текстів і callback-дій для розділу профілю клієнта.
 */

export const PROFILE_ACTION = {
  OPEN: 'profile:open',
  EDIT_NAME: 'profile:edit-name',
  EDIT_NAME_CANCEL: 'profile:edit-name-cancel',
  EDIT_EMAIL: 'profile:edit-email',
  ADD_EMAIL_CANCEL: 'profile:add-email-cancel',
  VERIFY_EMAIL: 'profile:verify-email',
  EMAIL_OTP_RESEND: 'profile:email-otp-resend',
  EMAIL_OTP_CANCEL: 'profile:email-otp-cancel',
  EDIT_PHONE: 'profile:edit-phone',
  EDIT_LANGUAGE: 'profile:edit-language',
  BOOKING_STATUS: 'profile:booking-status',
  BOOKING_STATUS_VIEW_ALL: 'profile:booking-status:view-all',
  BOOKING_STATUS_RESCHEDULE: 'profile:booking-status:reschedule',
  BOOKING_STATUS_CANCEL: 'profile:booking-status:cancel',
  BOOKING_STATUS_CREATE: 'profile:booking-status:create',
  NOTIFICATION_SETTINGS: 'profile:notification-settings',
} as const;

export type ProfileAction = (typeof PROFILE_ACTION)[keyof typeof PROFILE_ACTION];

export const PROFILE_BUTTON_TEXT = {
  EDIT_NAME: '✏️ Змінити імʼя',
  EDIT_NAME_CANCEL: '❌ Скасувати',
  ADD_EMAIL_CANCEL: '❌ Скасувати',
  ADD_EMAIL: '➕ Додати email',
  EDIT_EMAIL: '✉️ Змінити email',
  VERIFY_EMAIL: '✅ Підтвердити email',
  EMAIL_OTP_RESEND: '🔄 Надіслати код повторно',
  EMAIL_OTP_CANCEL: '❌ Скасувати',
  ADD_PHONE: '➕ Додати телефон',
  EDIT_PHONE: '📱 Змінити телефон',
  EDIT_LANGUAGE: '🌐 Змінити мову',
  BOOKING_STATUS: '📅 Статус бронювання',
  BOOKING_STATUS_VIEW_ALL: '📖 Переглянути всі записи',
  BOOKING_STATUS_RESCHEDULE: '🔄 Перенести',
  BOOKING_STATUS_CANCEL: '❌ Скасувати бронювання',
  BOOKING_STATUS_CREATE: '📅 Створити запис',
  BOOKING_STATUS_CREATE_FIRST: '📅 Створити перший запис',
  NOTIFICATION_SETTINGS: '🔔 Налаштування сповіщень',
  BACK_TO_PROFILE: '⬅️ Повернутися до профілю',
} as const;
