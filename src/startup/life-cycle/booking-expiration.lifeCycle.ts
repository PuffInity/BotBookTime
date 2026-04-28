import { expirePendingBookings } from '../../helpers/db/db-booking-expiration.helper.js';
import { sendClientBookingCancelledEmail } from '../../helpers/email/booking-email.helper.js';
import { dispatchNotification } from '../../helpers/notification/notification-dispatch.helper.js';
import { handleError } from '../../utils/error.utils.js';
import { loggerInitApp, loggerNotification } from '../../utils/logger/loggers-list.js';
import type { ExpiredPendingBookingItem } from '../../types/db-helpers/db-booking-expiration.types.js';

/**
 * @file booking-expiration.lifeCycle.ts
 * @summary Worker for auto-cancel of expired pending bookings.
 */

// uk: Інтервал тіка / en: Tick interval / cz: Interval ticku
const EXPIRATION_CHECK_INTERVAL_MS = 30_000;
// uk: Batch ліміт / en: Batch limit / cz: Batch limit
const EXPIRATION_BATCH_LIMIT = 50;
// uk: Причина скасування / en: Cancel reason / cz: Důvod zrušení
const EXPIRED_CANCEL_REASON = 'Скасовано автоматично (прострочений): запис не було підтверджено до часу візиту.';

// uk: Таймер воркера / en: Worker timer / cz: Timer workeru
let timer: NodeJS.Timeout | null = null;
// uk: Захист від overlap / en: Overlap guard / cz: Guard proti overlapu
let isRunningTick = false;

/**
 * uk: Перевіряє факт email-відправки.
 * en: Checks email channel send status.
 * cz: Ověří stav odeslání email kanálu.
 */
function isEmailSent(channels: { channel: string; status: string }[]): boolean {
  return channels.some((item) => item.channel === 'email' && item.status === 'sent');
}

/**
 * uk: Надсилає нотифікації про прострочений pending.
 * en: Sends notifications for expired pending.
 * cz: Odesílá notifikace o expirovaném pending.
 */
async function notifyExpiredPendingBooking(item: ExpiredPendingBookingItem): Promise<void> {
  let emailSentByDispatch = false;

  try {
    const dispatchResult = await dispatchNotification({
      userId: item.clientId,
      notificationType: 'status_change',
      appointmentId: item.appointmentId,
      textPayload: {
        studioName: item.studioName,
        serviceName: item.serviceName,
        startAt: item.startAt,
        statusLabel: 'Скасовано (прострочений)',
        message: 'Запис не підтверджено до часу візиту, тому його скасовано автоматично.',
      },
      email: {
        template: 'bookingCancelled',
        data: {
          recipientName: item.recipientName,
          bookingId: item.appointmentId,
          studioName: item.studioName,
          serviceName: item.serviceName,
          masterName: item.masterName,
          startAt: item.startAt,
          cancelReason: EXPIRED_CANCEL_REASON,
        },
      },
      metadata: { source: 'booking-expiration-worker' },
    });
    emailSentByDispatch = isEmailSent(dispatchResult.channels);
  } catch (error) {
    handleError({
      logger: loggerNotification,
      level: 'warn',
      scope: 'booking-expiration.lifeCycle',
      action: 'Failed to notify client about expired pending booking',
      error,
      meta: { appointmentId: item.appointmentId, clientId: item.clientId },
    });
  }

  if (!item.recipientEmail || emailSentByDispatch) {
    return;
  }

  try {
    const fallbackSent = await sendClientBookingCancelledEmail({
      to: item.recipientEmail,
      language: item.preferredLanguage,
      recipientName: item.recipientName,
      bookingId: item.appointmentId,
      studioName: item.studioName,
      serviceName: item.serviceName,
      masterName: item.masterName,
      startAt: item.startAt,
      cancelReason: EXPIRED_CANCEL_REASON,
    });

    if (fallbackSent) {
      loggerNotification.info('[booking-expiration] Sent fallback cancellation email', {
        appointmentId: item.appointmentId,
        clientId: item.clientId,
        email: item.recipientEmail,
      });
    }
  } catch (error) {
    handleError({
      logger: loggerNotification,
      level: 'warn',
      scope: 'booking-expiration.lifeCycle',
      action: 'Failed to send fallback expired-booking email',
      error,
      meta: { appointmentId: item.appointmentId, clientId: item.clientId, email: item.recipientEmail },
    });
  }
}

/**
 * uk: Один tick воркера прострочення.
 * en: Single expiration worker tick.
 * cz: Jeden tick expiračního workeru.
 */
async function runExpirationTick(): Promise<void> {
  if (isRunningTick) {
    loggerInitApp.warn('[booking-expiration] Попередній tick ще виконується, новий пропущено');
    return;
  }

  isRunningTick = true;

  try {
    const expired = await expirePendingBookings({
      limit: EXPIRATION_BATCH_LIMIT,
      cancelReason: EXPIRED_CANCEL_REASON,
    });

    if (expired.length === 0) {
      return;
    }

    loggerInitApp.info('[booking-expiration] Виявлено прострочені pending-бронювання', {
      count: expired.length,
      appointmentIds: expired.map((item) => item.appointmentId),
    });

    for (const item of expired) {
      await notifyExpiredPendingBooking(item);
    }
  } finally {
    isRunningTick = false;
  }
}

/**
 * uk: Старт воркера прострочення.
 * en: Starts expiration worker.
 * cz: Spustí expirační worker.
 */
export async function startBookingExpirationWorker(): Promise<void> {
  if (timer) {
    loggerInitApp.warn('[booking-expiration] Worker уже запущено, повторний старт проігноровано');
    return;
  }

  loggerInitApp.info('[booking-expiration] Запускаємо worker авто-скасування pending-бронювань');

  await runExpirationTick();

  timer = setInterval(async () => {
    try {
      await runExpirationTick();
    } catch (error) {
      handleError({
        logger: loggerInitApp,
        scope: 'booking-expiration.lifeCycle',
        action: 'Unhandled worker tick error',
        error,
      });
    }
  }, EXPIRATION_CHECK_INTERVAL_MS);

  timer.unref?.();
}

/**
 * uk: Зупинка воркера прострочення.
 * en: Stops expiration worker.
 * cz: Zastaví expirační worker.
 */
export async function stopBookingExpirationWorker(): Promise<void> {
  if (!timer) {
    loggerInitApp.info('[booking-expiration] Worker не запущено, зупинка не потрібна');
    return;
  }

  clearInterval(timer);
  timer = null;
  loggerInitApp.info('[booking-expiration] Worker авто-скасування pending-бронювань зупинено');
}
