/**
 * @file bot-profile.types.ts
 * @summary Константи текстів і callback-дій для розділу профілю клієнта.
 */

export const PROFILE_ACTION = {
  OPEN: 'profile:open',
  EDIT_NAME: 'profile:edit-name',
  EDIT_NAME_CANCEL: 'profile:edit-name-cancel',
  EDIT_EMAIL: 'profile:edit-email',
  EDIT_PHONE: 'profile:edit-phone',
  EDIT_LANGUAGE: 'profile:edit-language',
  BOOKING_STATUS: 'profile:booking-status',
  NOTIFICATION_SETTINGS: 'profile:notification-settings',
} as const;

export type ProfileAction = (typeof PROFILE_ACTION)[keyof typeof PROFILE_ACTION];

export const PROFILE_BUTTON_TEXT = {
  EDIT_NAME: '✏️ Змінити імʼя',
  EDIT_NAME_CANCEL: '❌ Скасувати',
  EDIT_EMAIL: '✉️ Змінити email',
  EDIT_PHONE: '📱 Змінити телефон',
  EDIT_LANGUAGE: '🌐 Змінити мову',
  BOOKING_STATUS: '📅 Статус бронювання',
  NOTIFICATION_SETTINGS: '🔔 Налаштування сповіщень',
  BACK_TO_PROFILE: '⬅️ Повернутися до профілю',
} as const;
