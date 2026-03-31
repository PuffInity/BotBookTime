import { expirePendingBookings } from '../../helpers/db/db-booking-expiration.helper.js';
import { sendClientBookingCancelledEmail } from '../../helpers/email/booking-email.helper.js';
import { dispatchNotification } from '../../helpers/notification/notification-dispatch.helper.js';
import { handleError } from '../../utils/error.utils.js';
import { loggerInitApp, loggerNotification } from '../../utils/logger/loggers-list.js';
import type { ExpiredPendingBookingItem } from '../../types/db-helpers/db-booking-expiration.types.js';

/**
 * @file booking-expiration.lifeCycle.ts
 * @summary Lifecycle worker для авто-скасування pending-бронювань, які не підтвердили до часу візиту.
 */

const EXPIRATION_CHECK_INTERVAL_MS = 30_000;
const EXPIRATION_BATCH_LIMIT = 50;
const EXPIRED_CANCEL_REASON = 'Скасовано автоматично (прострочений): запис не було підтверджено до часу візиту.';

let timer: NodeJS.Timeout | null = null;
let isRunningTick = false;

function isEmailSent(channels: { channel: string; status: string }[]): boolean {
  return channels.some((item) => item.channel === 'email' && item.status === 'sent');
}

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
 * @summary Запускає фоновий worker перевірки прострочених pending-бронювань.
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
 * @summary Зупиняє фоновий worker перевірки прострочених pending-бронювань.
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
