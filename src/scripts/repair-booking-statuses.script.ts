import dotenv from 'dotenv';

/**
 * @file repair-booking-statuses.script.ts
 * @summary Сервісний reconcile-скрипт:
 * - знаходить прострочені `pending` бронювання,
 * - переводить їх у `canceled` (через існуючий helper),
 * - опційно відправляє клієнту сповіщення (`--notify=true`).
 *
 * Приклади:
 * - npm run script:repair-bookings -- --limit=100
 * - npm run script:repair-bookings -- --limit=100 --notify=true
 */

dotenv.config();

type ScriptArgs = {
  limit?: number;
  cancelReason?: string;
  notify: boolean;
};

type DispatchChannel = { channel: string; status: string };

const DEFAULT_CANCEL_REASON =
  'Скасовано автоматично (прострочений): запис не було підтверджено до часу візиту.';
const HELP_TEXT = [
  'Usage:',
  '  npm run script:repair-bookings -- [--limit=<N>] [--cancel-reason="<TEXT>"] [--notify=true|false]',
  '',
  'Options:',
  '  --limit          Максимум записів для reconcile за один запуск (optional)',
  '  --cancel-reason  Причина скасування для status reconcile (optional)',
  '  --notify         Якщо true — відправити клієнтам сповіщення після reconcile (default: false)',
].join('\n');

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

function getArgValue(flag: string): string | undefined {
  const direct = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (direct) return direct.slice(flag.length + 1).trim();

  const index = process.argv.findIndex((arg) => arg === flag);
  if (index >= 0) return process.argv[index + 1]?.trim();

  return undefined;
}

function parseArgs(): ScriptArgs {
  const limitRaw = getArgValue('--limit');
  const cancelReason = getArgValue('--cancel-reason');
  const notifyRaw = getArgValue('--notify');

  const limit = limitRaw ? Number(limitRaw) : undefined;
  if (limitRaw && (!Number.isFinite(limit) || Number(limit) <= 0)) {
    throw new Error('Параметр --limit має бути додатнім числом');
  }

  return {
    limit: limit ? Math.trunc(limit) : undefined,
    cancelReason: cancelReason || undefined,
    notify: parseBoolean(notifyRaw, false),
  };
}

function hasHelpFlag(): boolean {
  return process.argv.includes('--help') || process.argv.includes('-h');
}

function isEmailSent(channels: DispatchChannel[]): boolean {
  return channels.some((item) => item.channel === 'email' && item.status === 'sent');
}

async function main(): Promise<void> {
  const [
    { expirePendingBookings },
    { dispatchNotification },
    { sendClientBookingCancelledEmail },
    { loggerScripts, loggerNotification },
    { handleError },
  ] = await Promise.all([
    import('../helpers/db/db-booking-expiration.helper.js'),
    import('../helpers/notification/notification-dispatch.helper.js'),
    import('../helpers/email/booking-email.helper.js'),
    import('../utils/logger/loggers-list.js'),
    import('../utils/error.utils.js'),
  ]);

  const logger = loggerScripts;
  if (hasHelpFlag()) {
    logger.info(HELP_TEXT);
    return;
  }
  let args: ScriptArgs;

  try {
    args = parseArgs();
  } catch (error) {
    logger.error('[repair-bookings-script] Невірні аргументи запуску', { error });
    process.exitCode = 1;
    return;
  }

  try {
    const expired = await expirePendingBookings({
      limit: args.limit,
      cancelReason: args.cancelReason ?? DEFAULT_CANCEL_REASON,
    });

    logger.info('[repair-bookings-script] Reconcile виконано', {
      limit: args.limit,
      notify: args.notify,
      changedCount: expired.length,
      appointmentIds: expired.map((item) => item.appointmentId),
    });

    if (!args.notify || expired.length === 0) {
      return;
    }

    for (const item of expired) {
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
              cancelReason: args.cancelReason ?? DEFAULT_CANCEL_REASON,
            },
          },
          metadata: { source: 'repair-booking-statuses-script' },
        });

        emailSentByDispatch = isEmailSent(dispatchResult.channels);
      } catch (error) {
        handleError({
          logger: loggerNotification,
          level: 'warn',
          scope: 'repair-bookings-script',
          action: 'Failed to dispatch cancellation notification',
          error,
          meta: { appointmentId: item.appointmentId, clientId: item.clientId },
        });
      }

      if (!item.recipientEmail || emailSentByDispatch) {
        continue;
      }

      try {
        await sendClientBookingCancelledEmail({
          to: item.recipientEmail,
          language: item.preferredLanguage,
          recipientName: item.recipientName,
          bookingId: item.appointmentId,
          studioName: item.studioName,
          serviceName: item.serviceName,
          masterName: item.masterName,
          startAt: item.startAt,
          cancelReason: args.cancelReason ?? DEFAULT_CANCEL_REASON,
        });
      } catch (error) {
        handleError({
          logger: loggerNotification,
          level: 'warn',
          scope: 'repair-bookings-script',
          action: 'Failed to send fallback canceled email',
          error,
          meta: {
            appointmentId: item.appointmentId,
            clientId: item.clientId,
            recipientEmail: item.recipientEmail,
          },
        });
      }
    }
  } catch (error) {
    logger.error('[repair-bookings-script] Помилка reconcile бронювань', { error });
    process.exitCode = 1;
  }
}

await main();
