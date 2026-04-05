import type { LanguageCode, NotificationType } from '../db/dbEnums.type.js';

/**
 * @file db-notification-settings.types.ts
 * @summary Типи для DB helper модуля налаштувань сповіщень.
 */

export const NOTIFICATION_TYPES: NotificationType[] = [
  'booking_confirmation',
  'status_change',
  'visit_reminder',
  'promo_news',
];

export type NotificationSettingsState = Record<NotificationType, boolean>;

export type UserDeliveryProfileRow = {
  id: string;
  telegram_user_id: string;
  first_name: string;
  preferred_language: LanguageCode;
  phone_e164: string | null;
  phone_verified_at: Date | null;
  email: string | null;
  email_verified_at: Date | null;
};

export type UserDeliveryProfile = {
  userId: string;
  telegramUserId: string;
  firstName: string;
  preferredLanguage: LanguageCode;
  phoneE164: string | null;
  phoneVerifiedAt: Date | null;
  email: string | null;
  emailVerifiedAt: Date | null;
};

export type SetNotificationSettingInput = {
  userId: string | number;
  notificationType: NotificationType | string;
  enabled: boolean;
};

export type SetAllNotificationSettingsInput = {
  userId: string | number;
  enabled: boolean;
};
