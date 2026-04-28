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
import { resolveBotUiLanguage } from '../bot/i18n.bot.js';
import { translateTextWithCache } from '../translate/translate-provider.helper.js';
import type { LanguageCode } from '../../types/db/dbEnums.type.js';
import type { NotificationEmailPayload } from '../../types/notification-dispatch.types.js';
import { isTwilioConfigured } from '../../config/twilio.config.js';

/**
 * @file notification-dispatch.helper.ts
 * @summary Unified dispatcher for Telegram/Email/SMS channels.
 */

/**
 * uk: Внутрішня helper функція pushSkipped.
 * en: Internal helper function pushSkipped.
 * cz: Interní helper funkce pushSkipped.
 */
function pushSkipped(
  channels: ChannelDispatchResult[],
  channel: ChannelDispatchResult['channel'],
  reason: string,
): void {
  channels.push({ channel, status: 'skipped', reason });
}

/**
 * uk: Внутрішня helper функція pushFailed.
 * en: Internal helper function pushFailed.
 * cz: Interní helper funkce pushFailed.
 */
function pushFailed(
  channels: ChannelDispatchResult[],
  channel: ChannelDispatchResult['channel'],
  reason: string,
  details?: Record<string, unknown>,
): void {
  channels.push({ channel, status: 'failed', reason, details });
}

/**
 * uk: Внутрішня helper функція translateNotificationTextIfNeeded.
 * en: Internal helper function translateNotificationTextIfNeeded.
 * cz: Interní helper funkce translateNotificationTextIfNeeded.
 */
async function translateNotificationTextIfNeeded(input: {
  text: string;
  targetLanguage: LanguageCode;
  scope: string;
}): Promise<string> {
  const text = input.text.trim();
  if (!text) return input.text;
  if (input.targetLanguage === 'uk') return input.text;

  const staticTranslations: Record<Exclude<LanguageCode, 'uk'>, Record<string, string>> = {
    en: {
      Підтверджено: 'Confirmed',
      Скасовано: 'Canceled',
      Перенесено: 'Rescheduled',
      'Скасовано (прострочений)': 'Canceled (expired)',
      'Ваш запис підтверджено майстром.': 'Your booking has been confirmed by the master.',
      'Ваш запис було скасовано майстром.': 'Your booking was canceled by the master.',
      'Ваш запис перенесено. Перевірте нову дату та час.':
        'Your booking has been rescheduled. Please check the new date and time.',
      'Запис не підтверджено до часу візиту, тому його скасовано автоматично.':
        'The booking was not confirmed before the appointment time, so it was canceled automatically.',
      'Скасовано майстром через Telegram-бота': 'Canceled by the master via Telegram bot',
      'Скасовано адміністратором через Telegram-бота': 'Canceled by administrator via Telegram bot',
      'Скасовано автоматично (прострочений): запис не було підтверджено до часу візиту.':
        'Canceled automatically (expired): the booking was not confirmed before the appointment time.',
    },
    cs: {
      Підтверджено: 'Potvrzeno',
      Скасовано: 'Zrušeno',
      Перенесено: 'Přesunuto',
      'Скасовано (прострочений)': 'Zrušeno (po termínu)',
      'Ваш запис підтверджено майстром.': 'Vaše rezervace byla potvrzena mistrem.',
      'Ваш запис було скасовано майстром.': 'Vaše rezervace byla zrušena mistrem.',
      'Ваш запис перенесено. Перевірте нову дату та час.':
        'Vaše rezervace byla přesunuta. Zkontrolujte nové datum a čas.',
      'Запис не підтверджено до часу візиту, тому його скасовано автоматично.':
        'Rezervace nebyla potvrzena do času návštěvy, proto byla automaticky zrušena.',
      'Скасовано майстром через Telegram-бота': 'Zrušeno mistrem přes Telegram bota',
      'Скасовано адміністратором через Telegram-бота': 'Zrušeno administrátorem přes Telegram bota',
      'Скасовано автоматично (прострочений): запис не було підтверджено до часу візиту.':
        'Automaticky zrušeno (po termínu): rezervace nebyla potvrzena do času návštěvy.',
    },
  };

  const staticTranslated = staticTranslations[input.targetLanguage as 'en' | 'cs']?.[text];
  if (staticTranslated) return staticTranslated;

  const translated = await translateTextWithCache({
    text,
    sourceLanguage: 'uk',
    targetLanguage: input.targetLanguage,
    scope: input.scope,
  });

  return translated.text;
}

/**
 * uk: Внутрішня helper функція localizePayload.
 * en: Internal helper function localizePayload.
 * cz: Interní helper funkce localizePayload.
 */
async function localizePayload(
  payload: DispatchNotificationInput['textPayload'],
  targetLanguage: LanguageCode,
): Promise<DispatchNotificationInput['textPayload']> {
  if (!payload) return payload;
  if (targetLanguage === 'uk') return payload;

  const [studioName, serviceName, statusLabel, message] = await Promise.all([
    payload.studioName
      ? translateNotificationTextIfNeeded({
          text: payload.studioName,
          targetLanguage,
          scope: 'notification-payload:studio-name',
        })
      : Promise.resolve(undefined),
    payload.serviceName
      ? translateNotificationTextIfNeeded({
          text: payload.serviceName,
          targetLanguage,
          scope: 'notification-payload:service-name',
        })
      : Promise.resolve(undefined),
    payload.statusLabel
      ? translateNotificationTextIfNeeded({
          text: payload.statusLabel,
          targetLanguage,
          scope: 'notification-payload:status-label',
        })
      : Promise.resolve(undefined),
    payload.message
      ? translateNotificationTextIfNeeded({
          text: payload.message,
          targetLanguage,
          scope: 'notification-payload:message',
        })
      : Promise.resolve(undefined),
  ]);

  return {
    ...payload,
    studioName,
    serviceName,
    statusLabel,
    message,
  };
}

/**
 * uk: Внутрішня helper функція localizeEmailPayload.
 * en: Internal helper function localizeEmailPayload.
 * cz: Interní helper funkce localizeEmailPayload.
 */
async function localizeEmailPayload(
  email: NotificationEmailPayload,
  targetLanguage: LanguageCode,
): Promise<NotificationEmailPayload> {
  if (targetLanguage === 'uk') return email;

  if (email.template === 'bookingCancelled') {
    if (!email.data.cancelReason) return email;
    return {
      ...email,
      data: {
        ...email.data,
        cancelReason: await translateNotificationTextIfNeeded({
          text: email.data.cancelReason,
          targetLanguage,
          scope: 'notification-email:cancel-reason',
        }),
      },
    };
  }

  return email;
}

/**
 * uk: Диспетчер каналів сповіщень.
 * en: Notification channel dispatcher.
 * cz: Dispatcher notifikačních kanálů.
 * @param input uk/en/cz: Вхід dispatch / Dispatch input / Dispatch vstup.
 * @returns uk/en/cz: Результат каналів / Channel result / Výsledek kanálů.
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
  const recipientLanguage = resolveBotUiLanguage(profile.preferredLanguage);
  // uk: Policy каналів / en: Channel policy / cz: Policy kanálů
  const policy = buildNotificationDispatchPolicy({
    notificationType: input.notificationType,
    settings,
    profile,
    wantsEmail: Boolean(input.email),
    wantsSms: Boolean(input.smsText),
    smsChannelAvailable: isTwilioConfigured(),
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

  const localizedPayload = await localizePayload(input.textPayload, recipientLanguage);
  const localizedEmail = input.email
    ? await localizeEmailPayload(input.email, recipientLanguage)
    : undefined;

  const providedTelegramText = (input.telegramText ?? '').trim();
  const telegramText =
    (providedTelegramText
      ? await translateNotificationTextIfNeeded({
          text: providedTelegramText,
          targetLanguage: recipientLanguage,
          scope: 'notification-telegram:explicit-text',
        })
      : '') ||
    buildNotificationTelegramText(input.notificationType, localizedPayload, recipientLanguage);

  if (!telegramText) {
    throw new ValidationError('Порожній текст сповіщення для Telegram', {
      notificationType: input.notificationType,
      userId,
    });
  }

  // uk: Канал Telegram / en: Telegram channel / cz: Telegram kanál
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

  // uk: Канал Email / en: Email channel / cz: Email kanál
  if (policy.email.allowed) {
    try {
      await sendEmail({
        to: profile.email as string,
        template: localizedEmail!.template,
        data: localizedEmail!.data,
        language: recipientLanguage,
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

  // uk: Канал SMS / en: SMS channel / cz: SMS kanál
  if (policy.sms.allowed) {
    const smsText = await translateNotificationTextIfNeeded({
      text: input.smsText as string,
      targetLanguage: recipientLanguage,
      scope: 'notification-sms:text',
    });

    try {
      await sendSmsNotification({
        phoneE164: profile.phoneE164 as string,
        text: smsText,
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
