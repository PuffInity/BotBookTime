import { ExternalServiceError, ValidationError } from '../../utils/error.utils.js';

/**
 * @file notification-sms.helper.ts
 * @summary Канал SMS-сповіщень. Поки що працює через заглушку sender-а.
 */

export type SendSmsNotificationInput = {
  phoneE164: string;
  text: string;
};

export type SmsNotificationSender = (input: SendSmsNotificationInput) => Promise<void>;

class TodoSmsNotificationSender {
  async send(_: SendSmsNotificationInput): Promise<void> {
    // TODO: Підключити production SMS provider (Twilio / MessageBird / AWS SNS).
    throw new ExternalServiceError('SMS sender is not implemented yet');
  }
}

let smsNotificationSender: SmsNotificationSender = async (input) => {
  await new TodoSmsNotificationSender().send(input);
};

/**
 * @summary Реєструє реальний SMS sender.
 */
export function setSmsNotificationSender(sender: SmsNotificationSender): void {
  smsNotificationSender = sender;
}

/**
 * @summary Надсилає SMS-сповіщення.
 */
export async function sendSmsNotification(input: SendSmsNotificationInput): Promise<void> {
  const phoneE164 = input.phoneE164.trim();
  const text = input.text.trim();

  if (!/^\+[1-9][0-9]{6,14}$/.test(phoneE164)) {
    throw new ValidationError('Некоректний E.164 номер телефону для SMS-сповіщення', {
      phoneE164: input.phoneE164,
    });
  }

  if (!text) {
    throw new ValidationError('Порожній текст SMS-сповіщення');
  }

  await smsNotificationSender({ phoneE164, text });
}
