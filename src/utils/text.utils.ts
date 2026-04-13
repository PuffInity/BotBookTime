/**
 * uk: Текстові helper-и
 * en: Text helpers
 * cz: Textové helpery
 */
import { tBot, tBotTemplate } from '../helpers/bot/i18n.bot.js';
import type { BotUiLanguage } from '../helpers/bot/i18n.bot.js';

/** uk: OTP email sent | en: OTP email sent | cz: OTP email sent */
export function otpEmailCodeSentText(email: string, language: BotUiLanguage = 'uk'): string {
  return tBotTemplate(language, 'OTP_EMAIL_CODE_SENT', { email });
}

/** uk: Email verified state | en: Email verified state | cz: Email verified state */
export function otpEmailAlreadyVerifiedText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_EMAIL_ALREADY_VERIFIED');
}

/** uk: Email missing state | en: Email missing state | cz: Email missing state */
export function otpEmailMissingText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_EMAIL_MISSING');
}

/** uk: Email code invalid | en: Email code invalid | cz: Email code invalid */
export function otpEmailInvalidCodeText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_EMAIL_INVALID_CODE');
}

/** uk: Email code expired | en: Email code expired | cz: Email code expired */
export function otpEmailExpiredText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_EMAIL_EXPIRED');
}

/** uk: Email blocked state | en: Email blocked state | cz: Email blocked state */
export function otpEmailBlockedText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_EMAIL_BLOCKED');
}

/** uk: Email resend cooldown | en: Email resend cooldown | cz: Email resend cooldown */
export function otpEmailResendCooldownText(
  retryAfterSec: number,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'OTP_EMAIL_RESEND_COOLDOWN', { seconds: retryAfterSec });
}

/** uk: Email verified message | en: Email verified message | cz: Email verified message */
export function otpEmailVerifiedText(email: string, language: BotUiLanguage = 'uk'): string {
  return tBotTemplate(language, 'OTP_EMAIL_VERIFIED', { email });
}

/** uk: Email flow cancel | en: Email flow cancel | cz: Email flow cancel */
export function otpEmailCancelledText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_EMAIL_CANCELLED');
}

/** uk: Mailer unavailable | en: Mailer unavailable | cz: Mailer unavailable */
export function otpEmailMailerNotConfiguredText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_EMAIL_MAILER_NOT_CONFIGURED');
}

/** uk: Email send failed | en: Email send failed | cz: Email send failed */
export function otpEmailSendFailedText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_EMAIL_SEND_FAILED');
}

/** uk: OTP phone sent | en: OTP phone sent | cz: OTP phone sent */
export function otpPhoneCodeSentText(phone: string, language: BotUiLanguage = 'uk'): string {
  return tBotTemplate(language, 'OTP_PHONE_CODE_SENT', { phone });
}

/** uk: Phone verified state | en: Phone verified state | cz: Phone verified state */
export function otpPhoneAlreadyVerifiedText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_PHONE_ALREADY_VERIFIED');
}

/** uk: Phone missing state | en: Phone missing state | cz: Phone missing state */
export function otpPhoneMissingText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_PHONE_MISSING');
}

/** uk: Phone code invalid | en: Phone code invalid | cz: Phone code invalid */
export function otpPhoneInvalidCodeText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_PHONE_INVALID_CODE');
}

/** uk: Phone code expired | en: Phone code expired | cz: Phone code expired */
export function otpPhoneExpiredText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_PHONE_EXPIRED');
}

/** uk: Phone blocked state | en: Phone blocked state | cz: Phone blocked state */
export function otpPhoneBlockedText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_PHONE_BLOCKED');
}

/** uk: Phone resend cooldown | en: Phone resend cooldown | cz: Phone resend cooldown */
export function otpPhoneResendCooldownText(
  retryAfterSec: number,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'OTP_PHONE_RESEND_COOLDOWN', { seconds: retryAfterSec });
}

/** uk: Phone verified message | en: Phone verified message | cz: Phone verified message */
export function otpPhoneVerifiedText(phone: string, language: BotUiLanguage = 'uk'): string {
  return tBotTemplate(language, 'OTP_PHONE_VERIFIED', { phone });
}

/** uk: Phone flow cancel | en: Phone flow cancel | cz: Phone flow cancel */
export function otpPhoneCancelledText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_PHONE_CANCELLED');
}

/** uk: SMS unavailable | en: SMS unavailable | cz: SMS unavailable */
export function otpPhoneNotConfiguredText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_PHONE_SMS_NOT_CONFIGURED');
}

/** uk: Phone send failed | en: Phone send failed | cz: Phone send failed */
export function otpPhoneSendFailedText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'OTP_PHONE_SEND_FAILED');
}
