import { getStudioReminderSettings, listUpcomingConfirmedAppointmentsForReminder, getAllActiveStudioIds, type ReminderAppointment } from '../../helpers/db/db-reminder.helper.js';
import { isReminderSent, markReminderSent } from '../../helpers/redis/redis-reminder.helper.js';
import { dispatchNotification } from '../../helpers/notification/notification-dispatch.helper.js';
import { handleError } from '../../utils/error.utils.js';
import { loggerInitApp, loggerNotification } from '../../utils/logger/loggers-list.js';
import { translateTextWithCache } from '../../helpers/translate/translate-provider.helper.js';
import { resolveBotUiLanguage } from '../../helpers/bot/i18n.bot.js';
import type { BotUiLanguage } from '../../helpers/bot/i18n.bot.js';
import { getUserDeliveryProfileById } from '../../helpers/db/db-notification-settings.helper.js';

/**
 * @file reminder.lifeCycle.ts
 * @summary Worker for automatic visit reminders.
 */

// uk: Інтервал тіка / en: Tick interval / cz: Interval ticku
const REMINDER_CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

// uk: Таймер воркера / en: Worker timer / cz: Timer workeru
let timer: NodeJS.Timeout | null = null;
// uk: Захист від overlap / en: Overlap guard / cz: Guard proti overlapu
let isRunningTick = false;

/**
 * uk: Локалізує SMS текст нагадування.
 * en: Localizes reminder SMS text.
 * cz: Lokalizuje text připomínkové SMS.
 */
async function getLocalizedSmsText(
  appointment: ReminderAppointment,
  hoursBefore: number,
  language: BotUiLanguage,
): Promise<string> {
  const baseText =
    `Нагадування: ваш візит до ${appointment.studioName} ` +
    `о ${appointment.appointment.startAt.toLocaleString('uk-UA')}. ` +
    `До початку приблизно ${hoursBefore} год.`;

  if (language === 'uk') return baseText;

  const translated = await translateTextWithCache({
    text: baseText,
    sourceLanguage: 'uk',
    targetLanguage: language,
    scope: 'reminder-sms',
  });

  return translated.text;
}

/**
 * uk: Надсилає нагадування по запису.
 * en: Sends reminder for appointment.
 * cz: Odešle připomínku pro rezervaci.
 */
async function sendReminderForAppointment(appointment: ReminderAppointment, hoursBefore: number): Promise<void> {
  const userId = appointment.appointment.clientId;

  try {
    const profile = await getUserDeliveryProfileById(userId);
    if (!profile) {
      loggerNotification.warn('[reminder] No delivery profile for user', { userId, appointmentId: appointment.appointment.id });
      return;
    }

    const language = resolveBotUiLanguage(profile.preferredLanguage);
    const smsText = await getLocalizedSmsText(appointment, hoursBefore, language);

    const dispatchResult = await dispatchNotification({
      userId,
      notificationType: 'visit_reminder',
      appointmentId: appointment.appointment.id,
      textPayload: {
        studioName: appointment.studioName,
        serviceName: appointment.serviceName,
        startAt: appointment.appointment.startAt,
        message: `Ваш візит розпочнеться приблизно через ${hoursBefore} год.`,
      },
      email: {
        template: 'reminder',
        data: {
          recipientName: appointment.attendeeName || undefined,
          bookingId: appointment.appointment.id,
          studioName: appointment.studioName,
          serviceName: appointment.serviceName,
          masterName: appointment.masterDisplayName,
          startAt: appointment.appointment.startAt,
          hoursBefore,
        },
      },
      smsText,
      metadata: { source: 'reminder-worker' },
    });

    loggerNotification.info('[reminder] Reminder sent', {
      appointmentId: appointment.appointment.id,
      userId,
      channels: dispatchResult.channels,
    });

    await markReminderSent({
      appointmentId: appointment.appointment.id,
      startAt: appointment.appointment.startAt,
    });
  } catch (error) {
    handleError({
      logger: loggerNotification,
      level: 'warn',
      scope: 'reminder.lifeCycle',
      action: 'Failed to send reminder for appointment',
      error,
      meta: { appointmentId: appointment.appointment.id, userId },
    });
  }
}

/**
 * uk: Один tick reminder воркера.
 * en: Single reminder worker tick.
 * cz: Jeden tick reminder workeru.
 */
async function runReminderTick(): Promise<void> {
  if (isRunningTick) {
    loggerInitApp.warn('[reminder] Previous tick still running, new one skipped');
    return;
  }

  isRunningTick = true;

  try {
    const studioIds = await getAllActiveStudioIds();

    for (const studioId of studioIds) {
      try {
        const settings = await getStudioReminderSettings(studioId);
        const appointments = await listUpcomingConfirmedAppointmentsForReminder(studioId, settings.reminderBeforeHours);

        if (appointments.length === 0) continue;

        loggerInitApp.info('[reminder] Found upcoming appointments for reminder', {
          studioId,
          count: appointments.length,
          reminderBeforeHours: settings.reminderBeforeHours,
        });

        for (const appointment of appointments) {
          const alreadySent = await isReminderSent(appointment.appointment.id);
          if (alreadySent) continue;

          await sendReminderForAppointment(appointment, settings.reminderBeforeHours);
        }
      } catch (error) {
        handleError({
          logger: loggerInitApp,
          scope: 'reminder.lifeCycle',
          action: 'Failed to process reminders for studio',
          error,
          meta: { studioId },
        });
      }
    }
  } finally {
    isRunningTick = false;
  }
}

/**
 * uk: Старт reminder воркера.
 * en: Starts reminder worker.
 * cz: Spustí reminder worker.
 */
export async function startReminderWorker(): Promise<void> {
  if (timer) {
    loggerInitApp.warn('[reminder] Worker already running, restart ignored');
    return;
  }

  loggerInitApp.info('[reminder] Starting reminder worker');

  await runReminderTick();

  timer = setInterval(async () => {
    try {
      await runReminderTick();
    } catch (error) {
      handleError({
        logger: loggerInitApp,
        scope: 'reminder.lifeCycle',
        action: 'Unhandled worker tick error',
        error,
      });
    }
  }, REMINDER_CHECK_INTERVAL_MS);

  timer.unref?.();
}

/**
 * uk: Зупинка reminder воркера.
 * en: Stops reminder worker.
 * cz: Zastaví reminder worker.
 */
export async function stopReminderWorker(): Promise<void> {
  if (!timer) {
    loggerInitApp.info('[reminder] Worker not running, stop ignored');
    return;
  }

  clearInterval(timer);
  timer = null;
  loggerInitApp.info('[reminder] Reminder worker stopped');
}
