import { ValidationError } from '../../utils/error.utils.js';
import { TwilioSmsSender } from '../mailer.helper.js';

/**
 * @file notification-sms.helper.ts
 * @summary uk: Канал SMS-сповіщень. Використовує Twilio для відправки.
 * en: Module summary.
 * cz: Shrnutí modulu.
 */

export type SendSmsNotificationInput = {
  phoneE164: string;
  text: string;
};

export type SmsNotificationSender = (input: SendSmsNotificationInput) => Promise<void>;

const twilioSender = new TwilioSmsSender();

let smsNotificationSender: SmsNotificationSender = async (input) => {
  await twilioSender.sendSms({ to: input.phoneE164, text: input.text });
};

/**
 * @summary uk: Реєструє реальний SMS sender.
 * en: Registers real SMS sender.
 * cz: Registruje reálný SMS sender.
 */
export function setSmsNotificationSender(sender: SmsNotificationSender): void {
  smsNotificationSender = sender;
}

/**
 * @summary uk: Надсилає SMS-сповіщення.
 * en: Sends SMS notification.
 * cz: Odešle SMS notifikaci.
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
