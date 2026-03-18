import { ExternalServiceError, ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerNotification } from '../../utils/logger/loggers-list.js';

/**
 * @file notification-telegram.helper.ts
 * @summary Канал відправки Telegram-сповіщень через інʼєкцію sender-функції.
 */

export type SendTelegramNotificationInput = {
  telegramUserId: string;
  text: string;
};

export type TelegramNotificationSender = (input: SendTelegramNotificationInput) => Promise<void>;

let telegramNotificationSender: TelegramNotificationSender | null = null;

/**
 * @summary Реєструє transport-функцію Telegram-відправки.
 */
export function setTelegramNotificationSender(sender: TelegramNotificationSender): void {
  telegramNotificationSender = sender;
}

/**
 * @summary Надсилає Telegram-сповіщення користувачу.
 */
export async function sendTelegramNotification(input: SendTelegramNotificationInput): Promise<void> {
  const telegramUserId = String(input.telegramUserId).trim();
  const text = input.text.trim();

  if (!telegramUserId || !/^\d+$/.test(telegramUserId)) {
    throw new ValidationError('Некоректний telegramUserId для Telegram-сповіщення', {
      telegramUserId: input.telegramUserId,
    });
  }

  if (!text) {
    throw new ValidationError('Порожній текст Telegram-сповіщення');
  }

  if (!telegramNotificationSender) {
    throw new ExternalServiceError('Telegram notification sender is not configured', {
      telegramUserId,
    });
  }

  try {
    await telegramNotificationSender({ telegramUserId, text });
  } catch (error) {
    handleError({
      logger: loggerNotification,
      scope: 'notification-telegram',
      action: 'Failed to send Telegram notification',
      error,
      meta: { telegramUserId },
    });
    throw error;
  }
}
