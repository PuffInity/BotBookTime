/**
 * @file text.utils.ts
 * @summary Reusable text builders for bot screens.
 */
import { tBot, tBotTemplate } from '../helpers/bot/i18n.bot.js';
import type { BotUiLanguage } from '../helpers/bot/i18n.bot.js';

export function otpEmailCodeSentText(email: string, language: BotUiLanguage = 'uk'): string {
  return tBotTemplate(language, 'OTP_EMAIL_CODE_SENT', { email });
}

export function otpEmailAlreadyVerifiedText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_EMAIL_ALREADY_VERIFIED');
}

export function otpEmailMissingText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_EMAIL_MISSING');
}

export function otpEmailInvalidCodeText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_EMAIL_INVALID_CODE');
}

export function otpEmailExpiredText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_EMAIL_EXPIRED');
}

export function otpEmailBlockedText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_EMAIL_BLOCKED');
}

export function otpEmailResendCooldownText(
  retryAfterSec: number,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'OTP_EMAIL_RESEND_COOLDOWN', { seconds: retryAfterSec });
}

export function otpEmailVerifiedText(email: string, language: BotUiLanguage = 'uk'): string {
  return tBotTemplate(language, 'OTP_EMAIL_VERIFIED', { email });
}

export function otpEmailCancelledText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_EMAIL_CANCELLED');
}

export function otpEmailMailerNotConfiguredText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_EMAIL_MAILER_NOT_CONFIGURED');
}

export function otpEmailSendFailedText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_EMAIL_SEND_FAILED');
}

export function otpPhoneCodeSentText(phone: string, language: BotUiLanguage = 'uk'): string {
  return tBotTemplate(language, 'OTP_PHONE_CODE_SENT', { phone });
}

export function otpPhoneAlreadyVerifiedText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_PHONE_ALREADY_VERIFIED');
}

export function otpPhoneMissingText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_PHONE_MISSING');
}

export function otpPhoneInvalidCodeText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_PHONE_INVALID_CODE');
}

export function otpPhoneExpiredText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_PHONE_EXPIRED');
}

export function otpPhoneBlockedText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_PHONE_BLOCKED');
}

export function otpPhoneResendCooldownText(
  retryAfterSec: number,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'OTP_PHONE_RESEND_COOLDOWN', { seconds: retryAfterSec });
}

export function otpPhoneVerifiedText(phone: string, language: BotUiLanguage = 'uk'): string {
  return tBotTemplate(language, 'OTP_PHONE_VERIFIED', { phone });
}

export function otpPhoneCancelledText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_PHONE_CANCELLED');
}

export function otpPhoneNotConfiguredText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_PHONE_SMS_NOT_CONFIGURED');
}

export function otpPhoneSendFailedText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_PHONE_SEND_FAILED');
}
