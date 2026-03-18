import { sendEmail } from '../email/mailer.helper.js';
import {
  getUserDeliveryProfileById,
  getUserNotificationSettingsState,
} from '../db/db-notification-settings.helper.js';
import {
  NotFoundError,
  ValidationError,
  handleError,
} from '../../utils/error.utils.js';
import {
  type ChannelDispatchResult,
  type DispatchNotificationInput,
  type DispatchNotificationResult,
} from '../../types/notification-dispatch.types.js';
import { loggerNotification } from '../../utils/logger/loggers-list.js';
import { normalizeNotificationUserId } from '../../utils/db/db-notification-settings.js';
import { buildNotificationDispatchPolicy } from './notification-policy.helper.js';
import { buildNotificationTelegramText } from './notification-text.helper.js';
import { sendTelegramNotification } from './notification-telegram.helper.js';
import { sendSmsNotification } from './notification-sms.helper.js';

/**
 * @file notification-dispatch.helper.ts
 * @summary Єдиний helper маршрутизації сповіщень по каналах Telegram/Email/SMS.
 */

function pushSkipped(
  channels: ChannelDispatchResult[],
  channel: ChannelDispatchResult['channel'],
  reason: string,
): void {
  channels.push({ channel, status: 'skipped', reason });
}

function pushFailed(
  channels: ChannelDispatchResult[],
  channel: ChannelDispatchResult['channel'],
  reason: string,
  details?: Record<string, unknown>,
): void {
  channels.push({ channel, status: 'failed', reason, details });
}

/**
 * @summary Відправляє бізнес-сповіщення по доступних каналах доставки.
 */
export async function dispatchNotification(
  input: DispatchNotificationInput,
): Promise<DispatchNotificationResult> {
  const userId = normalizeNotificationUserId(input.userId);

  const settings = await getUserNotificationSettingsState(userId);
  const profile = await getUserDeliveryProfileById(userId);

  if (!profile) {
    throw new NotFoundError('Користувача для доставки сповіщення не знайдено', { userId });
  }

  const channels: ChannelDispatchResult[] = [];
  const policy = buildNotificationDispatchPolicy({
    notificationType: input.notificationType,
    settings,
    profile,
    wantsEmail: Boolean(input.email),
    wantsSms: Boolean(input.smsText),
  });

  if (!policy.enabled) {
    pushSkipped(channels, 'telegram', policy.telegram.reason ?? 'notification_disabled');
    pushSkipped(channels, 'email', policy.email.reason ?? 'notification_disabled');
    pushSkipped(channels, 'sms', policy.sms.reason ?? 'notification_disabled');

    return {
      notificationType: input.notificationType,
      enabled: false,
      channels,
    };
  }

  const telegramText = (input.telegramText ?? '').trim() ||
    buildNotificationTelegramText(input.notificationType, input.textPayload);

  if (!telegramText) {
    throw new ValidationError('Порожній текст сповіщення для Telegram', {
      notificationType: input.notificationType,
      userId,
    });
  }

  if (policy.telegram.allowed) {
    try {
      await sendTelegramNotification({
        telegramUserId: profile.telegramUserId,
        text: telegramText,
      });
      channels.push({ channel: 'telegram', status: 'sent' });
    } catch (error) {
      const err = handleError({
        logger: loggerNotification,
        scope: 'notification-dispatch',
        action: 'Failed to dispatch telegram notification',
        error,
        meta: {
          userId,
          notificationType: input.notificationType,
          telegramUserId: profile.telegramUserId,
        },
      });
      pushFailed(channels, 'telegram', 'send_failed', { message: err.message });
    }
  } else {
    pushSkipped(channels, 'telegram', policy.telegram.reason ?? 'not_allowed');
  }

  if (policy.email.allowed) {
    try {
      await sendEmail({
        to: profile.email as string,
        template: input.email!.template,
        data: input.email!.data,
      });
      channels.push({ channel: 'email', status: 'sent' });
    } catch (error) {
      const err = handleError({
        logger: loggerNotification,
        scope: 'notification-dispatch',
        action: 'Failed to dispatch email notification',
        error,
        meta: {
          userId,
          notificationType: input.notificationType,
          email: profile.email,
        },
      });
      pushFailed(channels, 'email', 'send_failed', { message: err.message });
    }
  } else {
    pushSkipped(channels, 'email', policy.email.reason ?? 'not_allowed');
  }

  if (policy.sms.allowed) {
    try {
      await sendSmsNotification({
        phoneE164: profile.phoneE164 as string,
        text: input.smsText as string,
      });
      channels.push({ channel: 'sms', status: 'sent' });
    } catch (error) {
      const err = handleError({
        logger: loggerNotification,
        scope: 'notification-dispatch',
        action: 'Failed to dispatch sms notification',
        error,
        meta: {
          userId,
          notificationType: input.notificationType,
          phoneE164: profile.phoneE164,
        },
      });
      pushFailed(channels, 'sms', 'send_failed', { message: err.message });
    }
  } else {
    pushSkipped(channels, 'sms', policy.sms.reason ?? 'not_allowed');
  }

  loggerNotification.info('[notification-dispatch] Notification dispatch completed', {
    userId,
    notificationType: input.notificationType,
    channels,
    appointmentId: input.appointmentId ?? null,
    metadata: input.metadata,
  });

  return {
    notificationType: input.notificationType,
    enabled: true,
    channels,
  };
}
