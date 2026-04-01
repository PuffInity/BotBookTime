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
