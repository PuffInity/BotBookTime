import type {
  DispatchNotificationPolicy,
  DispatchNotificationPolicyInput,
} from '../../types/notification-dispatch.types.js';

/**
 * @file notification-policy.helper.ts
 * @summary Delivery policy helper for notification channels.
 */

/**
 * uk: Будує channel policy доставки.
 * en: Builds channel delivery policy.
 * cz: Sestaví channel delivery policy.
 * @param input uk/en/cz: Вхід policy / Policy input / Policy vstup.
 * @returns uk/en/cz: Політика каналів / Channel policy / Politika kanálů.
 */
export function buildNotificationDispatchPolicy(
  input: DispatchNotificationPolicyInput,
): DispatchNotificationPolicy {
  // uk: Глобальний enable / en: Global enable / cz: Globální enable
  const enabled = input.settings[input.notificationType] ?? true;

  if (!enabled) {
    return {
      enabled: false,
      telegram: { allowed: false, reason: 'notification_disabled' },
      email: { allowed: false, reason: 'notification_disabled' },
      sms: { allowed: false, reason: 'notification_disabled' },
    };
  }

  // uk: Policy email / en: Email policy / cz: Email policy
  const hasVerifiedEmail = Boolean(input.profile.email && input.profile.emailVerifiedAt);
  // uk: Policy sms / en: SMS policy / cz: SMS policy
  const hasVerifiedPhone = Boolean(input.profile.phoneE164 && input.profile.phoneVerifiedAt);
  // uk: Доступність SMS каналу / en: SMS channel availability / cz: Dostupnost SMS kanálu
  const smsChannelAvailable = input.smsChannelAvailable ?? true;

  // uk: Правило policy / en: Policy rule / cz: Policy pravidlo
  // uk: Telegram — базовий канал; Email/SMS тільки при верифікованих контактах.
  // en: Telegram is baseline channel; Email/SMS require verified contacts.
  // cz: Telegram je základní kanál; Email/SMS vyžadují ověřené kontakty.
  return {
    enabled: true,
    telegram: { allowed: true },
    email: input.wantsEmail
      ? hasVerifiedEmail
        ? { allowed: true }
        : {
            allowed: false,
            reason: input.profile.email ? 'email_not_verified' : 'email_missing',
          }
      : { allowed: false, reason: 'email_payload_missing' },
    sms: input.wantsSms
      ? !smsChannelAvailable
        ? { allowed: false, reason: 'sms_channel_unavailable' }
        : hasVerifiedPhone
        ? { allowed: true }
        : {
            allowed: false,
            reason: input.profile.phoneE164 ? 'phone_not_verified' : 'phone_missing',
          }
      : { allowed: false, reason: 'sms_payload_missing' },
  };
}
