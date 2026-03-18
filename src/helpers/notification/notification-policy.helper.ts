import type {
  DispatchNotificationPolicy,
  DispatchNotificationPolicyInput,
} from '../../types/notification-dispatch.types.js';

/**
 * @file notification-policy.helper.ts
 * @summary Policy helper для рішення по каналах доставки сповіщення.
 */

/**
 * @summary Будує політику доставки: Telegram завжди обовʼязковий при enabled=true,
 * email/sms вмикаються тільки за наявності та верифікації контактів.
 */
export function buildNotificationDispatchPolicy(
  input: DispatchNotificationPolicyInput,
): DispatchNotificationPolicy {
  const enabled = input.settings[input.notificationType] ?? true;

  if (!enabled) {
    return {
      enabled: false,
      telegram: { allowed: false, reason: 'notification_disabled' },
      email: { allowed: false, reason: 'notification_disabled' },
      sms: { allowed: false, reason: 'notification_disabled' },
    };
  }

  const hasVerifiedEmail = Boolean(input.profile.email && input.profile.emailVerifiedAt);
  const hasVerifiedPhone = Boolean(input.profile.phoneE164 && input.profile.phoneVerifiedAt);

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
      ? hasVerifiedPhone
        ? { allowed: true }
        : {
            allowed: false,
            reason: input.profile.phoneE164 ? 'phone_not_verified' : 'phone_missing',
          }
      : { allowed: false, reason: 'sms_payload_missing' },
  };
}
