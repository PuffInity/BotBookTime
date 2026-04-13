import { ExternalServiceError, ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerNotification } from '../../utils/logger/loggers-list.js';

/**
 * @file notification-telegram.helper.ts
 * @summary uk: Канал відправки Telegram-сповіщень через інʼєкцію sender-функції.
 * en: Module summary.
 * cz: Shrnutí modulu.
 */

export type SendTelegramNotificationInput = {
  telegramUserId: string;
  text: string;
};

export type TelegramNotificationSender = (input: SendTelegramNotificationInput) => Promise<void>;

let telegramNotificationSender: TelegramNotificationSender | null = null;

/**
 * @summary uk: Реєструє transport-функцію Telegram-відправки.
 * en: Registers Telegram delivery transport function.
 * cz: Registruje transportní funkci pro Telegram odeslání.
 */
export function setTelegramNotificationSender(sender: TelegramNotificationSender): void {
  telegramNotificationSender = sender;
}

/**
 * @summary uk: Надсилає Telegram-сповіщення користувачу.
 * en: Sends Telegram notification to user.
 * cz: Odešle Telegram notifikaci uživateli.
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
