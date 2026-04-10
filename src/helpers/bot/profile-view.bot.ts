import { Markup } from 'telegraf';
import type { AppUsersEntity } from '../../types/db/index.js';
import type { LanguageCode } from '../../types/db/dbEnums.type.js';
import type { MyContext } from '../../types/bot.types.js';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import {
  PROFILE_ACTION,
  makeProfileEditLanguageSelectAction,
} from '../../types/bot-profile.types.js';
import { getLanguageLabel, resolveBotUiLanguage, tBot } from './i18n.bot.js';
import type { BotUiLanguage } from './i18n.bot.js';
import { isTwilioConfigured } from '../../config/twilio.config.js';

/**
 * @file profile-view.bot.ts
 * @summary UI/helper-и для екрана профілю клієнта (текст + inline-кнопки).
 */

function getFullName(user: AppUsersEntity): string {
  return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`.trim();
}

function getTelegramLabel(user: AppUsersEntity): string {
  const language = resolveBotUiLanguage(user.preferredLanguage);
  return user.telegramUsername ? `@${user.telegramUsername}` : tBot(language, 'PROFILE_NOT_SET');
}

function getVerificationLabel(verifiedAt: Date | null, language: BotUiLanguage): string {
  return verifiedAt ? tBot(language, 'PROFILE_VERIFIED') : tBot(language, 'PROFILE_NOT_VERIFIED');
}

function hasEmail(user: AppUsersEntity): boolean {
  return Boolean(user.email && user.email.trim().length > 0);
}

function hasPhone(user: AppUsersEntity): boolean {
  return Boolean(user.phoneE164 && user.phoneE164.trim().length > 0);
}

function getEmailButtonLabel(user: AppUsersEntity, language: BotUiLanguage): string {
  return hasEmail(user) ? tBot(language, 'PROFILE_EDIT_EMAIL') : tBot(language, 'PROFILE_ADD_EMAIL');
}

function getPhoneButtonLabel(user: AppUsersEntity, language: BotUiLanguage): string {
  return hasPhone(user) ? tBot(language, 'PROFILE_EDIT_PHONE') : tBot(language, 'PROFILE_ADD_PHONE');
}

export function getEmailProfileActionTitle(user: AppUsersEntity, language: BotUiLanguage): string {
  return hasEmail(user) ? tBot(language, 'PROFILE_EDIT_EMAIL') : tBot(language, 'PROFILE_ADD_EMAIL');
}

export function getPhoneProfileActionTitle(user: AppUsersEntity, language: BotUiLanguage): string {
  return hasPhone(user) ? tBot(language, 'PROFILE_EDIT_PHONE') : tBot(language, 'PROFILE_ADD_PHONE');
}

/**
 * @summary Форматує картку профілю клієнта.
 */
export function formatProfileCardText(user: AppUsersEntity): string {
  const language = resolveBotUiLanguage(user.preferredLanguage);
  const bookingAvailability = user.phoneVerifiedAt
    ? tBot(language, 'PROFILE_BOOKING_AVAILABLE')
    : tBot(language, 'PROFILE_BOOKING_RESTRICTED');
  const hasPhoneValue = hasPhone(user);
  const hasEmailValue = hasEmail(user);
  const isPhoneVerifyAvailable = isTwilioConfigured();
  const phoneVerificationLabel =
    hasPhoneValue && !user.phoneVerifiedAt && !isPhoneVerifyAvailable
      ? tBot(language, 'PROFILE_PHONE_NOT_VERIFIED_UNAVAILABLE')
      : getVerificationLabel(user.phoneVerifiedAt, language);
  const phoneVerificationLine = hasPhoneValue
    ? `${phoneVerificationLabel}\n\n`
    : '\n\n';
  const emailVerificationLine = hasEmailValue
    ? `${getVerificationLabel(user.emailVerifiedAt, language)}\n\n`
    : '\n\n';

  return (
    `${tBot(language, 'PROFILE_TITLE')}\n\n` +
    `${tBot(language, 'PROFILE_ID')}: ${user.id}\n` +
    `${tBot(language, 'PROFILE_NAME')}: ${getFullName(user)}\n` +
    `${tBot(language, 'PROFILE_TELEGRAM')}: ${getTelegramLabel(user)}\n\n` +
    `${tBot(language, 'PROFILE_PHONE')}: ${user.phoneE164 ?? tBot(language, 'PROFILE_NOT_SET')}\n` +
    `${phoneVerificationLine}` +
    `${tBot(language, 'PROFILE_EMAIL')}: ${user.email ?? tBot(language, 'PROFILE_NOT_SET')}\n` +
    `${emailVerificationLine}` +
    `${tBot(language, 'PROFILE_LANGUAGE')}: ${getLanguageLabel(user.preferredLanguage, language)}\n` +
    `${tBot(language, 'PROFILE_NOTIFICATIONS')}\n\n` +
    `${bookingAvailability}`
  );
}

/**
 * @summary Inline-клавіатура головного екрана профілю.
 */
export function createProfileInlineKeyboard(
  user: AppUsersEntity,
): ReturnType<typeof Markup.inlineKeyboard> {
  const language = resolveBotUiLanguage(user.preferredLanguage);
  const secondRow = [
    Markup.button.callback(getPhoneButtonLabel(user, language), PROFILE_ACTION.EDIT_PHONE),
  ];

  const profileRows = [
    [
      Markup.button.callback(tBot(language, 'PROFILE_EDIT_NAME'), PROFILE_ACTION.EDIT_NAME),
      Markup.button.callback(getEmailButtonLabel(user, language), PROFILE_ACTION.EDIT_EMAIL),
    ],
    secondRow,
  ];

  if (hasEmail(user) && !user.emailVerifiedAt) {
    profileRows.push([
      Markup.button.callback(tBot(language, 'PROFILE_VERIFY_EMAIL'), PROFILE_ACTION.VERIFY_EMAIL),
    ]);
  }

  if (hasPhone(user) && !user.phoneVerifiedAt) {
    const verifyPhoneLabel = isTwilioConfigured()
      ? tBot(language, 'PROFILE_VERIFY_PHONE')
      : tBot(language, 'PROFILE_VERIFY_PHONE_DISABLED');
    profileRows.push([
      Markup.button.callback(verifyPhoneLabel, PROFILE_ACTION.VERIFY_PHONE),
    ]);
  }

  return Markup.inlineKeyboard([
    ...profileRows,
    [
      Markup.button.callback(tBot(language, 'PROFILE_BOOKING_STATUS'), PROFILE_ACTION.BOOKING_STATUS),
      Markup.button.callback(tBot(language, 'PROFILE_NOTIFICATION_SETTINGS'), PROFILE_ACTION.NOTIFICATION_SETTINGS),
    ],
    [Markup.button.callback(tBot(language, 'HOME'), COMMON_NAV_ACTION.HOME)],
  ]);
}

/**
 * @summary Inline-клавіатура для заглушок профілю.
 */
export function createProfileStubKeyboard(language: BotUiLanguage = 'uk'): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(tBot(language, 'BACK_TO_PROFILE'), PROFILE_ACTION.OPEN),
      Markup.button.callback(tBot(language, 'HOME'), COMMON_NAV_ACTION.HOME),
    ],
  ]);
}

/**
 * @summary Inline-клавіатура для кроку зміни імені.
 */
export function createProfileNamePromptKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(tBot(language, 'PROFILE_BTN_CANCEL'), PROFILE_ACTION.EDIT_NAME_CANCEL),
      Markup.button.callback(tBot(language, 'BACK_TO_PROFILE'), PROFILE_ACTION.OPEN),
    ],
  ]);
}

/**
 * @summary Inline-клавіатура для OTP-підтвердження email.
 */
export function createProfileEmailOtpKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(tBot(language, 'PROFILE_OTP_BTN_RESEND'), PROFILE_ACTION.EMAIL_OTP_RESEND),
      Markup.button.callback(tBot(language, 'PROFILE_OTP_BTN_CANCEL'), PROFILE_ACTION.EMAIL_OTP_CANCEL),
    ],
    [
      Markup.button.callback(tBot(language, 'BACK_TO_PROFILE'), PROFILE_ACTION.OPEN),
      Markup.button.callback(tBot(language, 'HOME'), COMMON_NAV_ACTION.HOME),
    ],
  ]);
}

/**
 * @summary Inline-клавіатура для OTP-підтвердження телефону.
 */
export function createProfilePhoneOtpKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(tBot(language, 'PROFILE_OTP_BTN_RESEND'), PROFILE_ACTION.PHONE_OTP_RESEND),
      Markup.button.callback(tBot(language, 'PROFILE_OTP_BTN_CANCEL'), PROFILE_ACTION.PHONE_OTP_CANCEL),
    ],
    [
      Markup.button.callback(tBot(language, 'BACK_TO_PROFILE'), PROFILE_ACTION.OPEN),
      Markup.button.callback(tBot(language, 'HOME'), COMMON_NAV_ACTION.HOME),
    ],
  ]);
}

/**
 * @summary Inline-клавіатура для кроку додавання email.
 */
export function createProfileEmailAddKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(tBot(language, 'PROFILE_BTN_CANCEL'), PROFILE_ACTION.ADD_EMAIL_CANCEL),
      Markup.button.callback(tBot(language, 'BACK_TO_PROFILE'), PROFILE_ACTION.OPEN),
    ],
    [Markup.button.callback(tBot(language, 'HOME'), COMMON_NAV_ACTION.HOME)],
  ]);
}

/**
 * @summary Inline-клавіатура для кроку додавання телефону.
 */
export function createProfilePhoneAddKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(tBot(language, 'PROFILE_BTN_CANCEL'), PROFILE_ACTION.ADD_PHONE_CANCEL),
      Markup.button.callback(tBot(language, 'BACK_TO_PROFILE'), PROFILE_ACTION.OPEN),
    ],
    [Markup.button.callback(tBot(language, 'HOME'), COMMON_NAV_ACTION.HOME)],
  ]);
}

/**
 * @summary Відправляє користувачу головний екран профілю.
 */
export async function sendProfileCard(ctx: MyContext, user: AppUsersEntity): Promise<void> {
  await ctx.reply(formatProfileCardText(user), createProfileInlineKeyboard(user));
}

export async function sendProfileNameBlockedMessage(
  ctx: MyContext,
  language: BotUiLanguage = 'uk',
): Promise<void> {
  await ctx.reply(
    tBot(language, 'PROFILE_NAME_BLOCKED'),
    createProfileStubKeyboard(language),
  );
}

export async function sendProfileNameCooldownMessage(
  ctx: MyContext,
  language: BotUiLanguage = 'uk',
): Promise<void> {
  await ctx.reply(
    tBot(language, 'PROFILE_NAME_COOLDOWN'),
    createProfileStubKeyboard(language),
  );
}

export async function sendProfileNamePrompt(
  ctx: MyContext,
  language: BotUiLanguage = 'uk',
): Promise<void> {
  await ctx.reply(
    tBot(language, 'PROFILE_NAME_PROMPT'),
    createProfileNamePromptKeyboard(language),
  );
}

export async function sendProfileNameValidationError(
  ctx: MyContext,
  language: BotUiLanguage = 'uk',
): Promise<void> {
  await ctx.reply(
    tBot(language, 'PROFILE_NAME_INVALID'),
    createProfileNamePromptKeyboard(language),
  );
}

export async function sendProfileNameUpdatedMessage(
  ctx: MyContext,
  firstName: string,
  language: BotUiLanguage = 'uk',
): Promise<void> {
  await ctx.reply(
    `${tBot(language, 'PROFILE_NAME_UPDATED')}\n${tBot(language, 'PROFILE_NAME_UPDATED_VALUE')}: ${firstName}`,
    createProfileStubKeyboard(language),
  );
}

export async function sendProfileNameCancelledMessage(
  ctx: MyContext,
  language: BotUiLanguage = 'uk',
): Promise<void> {
  await ctx.reply(tBot(language, 'PROFILE_NAME_CANCELLED'), createProfileStubKeyboard(language));
}

export async function sendProfileEmailAddPrompt(
  ctx: MyContext,
  language: BotUiLanguage = 'uk',
): Promise<void> {
  await ctx.reply(
    tBot(language, 'PROFILE_EMAIL_ADD_PROMPT'),
    createProfileEmailAddKeyboard(language),
  );
}

export async function sendProfileEmailValidationError(
  ctx: MyContext,
  language: BotUiLanguage = 'uk',
): Promise<void> {
  await ctx.reply(tBot(language, 'PROFILE_EMAIL_INVALID'), createProfileEmailAddKeyboard(language));
}

export async function sendProfileEmailAlreadyUsedError(
  ctx: MyContext,
  language: BotUiLanguage = 'uk',
): Promise<void> {
  await ctx.reply(tBot(language, 'PROFILE_EMAIL_ALREADY_USED'), createProfileEmailAddKeyboard(language));
}

export async function sendProfileEmailAddedMessage(
  ctx: MyContext,
  email: string,
  language: BotUiLanguage = 'uk',
): Promise<void> {
  await ctx.reply(
    `${tBot(language, 'PROFILE_EMAIL_ADDED_TITLE')}\n${tBot(language, 'PROFILE_EMAIL_ADDED_VALUE')}: ${email}\n\n${tBot(language, 'PROFILE_EMAIL_ADDED_HINT')}`,
    createProfileStubKeyboard(language),
  );
}

export async function sendProfileEmailAddCancelledMessage(
  ctx: MyContext,
  language: BotUiLanguage = 'uk',
): Promise<void> {
  await ctx.reply(tBot(language, 'PROFILE_EMAIL_ADD_CANCELLED'), createProfileStubKeyboard(language));
}

export async function sendProfilePhoneAddPrompt(
  ctx: MyContext,
  language: BotUiLanguage = 'uk',
): Promise<void> {
  await ctx.reply(
    tBot(language, 'PROFILE_PHONE_ADD_PROMPT'),
    createProfilePhoneAddKeyboard(language),
  );
}

export async function sendProfilePhoneValidationError(
  ctx: MyContext,
  language: BotUiLanguage = 'uk',
): Promise<void> {
  await ctx.reply(tBot(language, 'PROFILE_PHONE_INVALID'), createProfilePhoneAddKeyboard(language));
}

export async function sendProfilePhoneAlreadyUsedError(
  ctx: MyContext,
  language: BotUiLanguage = 'uk',
): Promise<void> {
  await ctx.reply(tBot(language, 'PROFILE_PHONE_ALREADY_USED'), createProfilePhoneAddKeyboard(language));
}

export async function sendProfilePhoneAddedMessage(
  ctx: MyContext,
  phone: string,
  language: BotUiLanguage = 'uk',
): Promise<void> {
  await ctx.reply(
    `${tBot(language, 'PROFILE_PHONE_ADDED_TITLE')}\n${tBot(language, 'PROFILE_PHONE_ADDED_VALUE')}: ${phone}\n\n${tBot(language, 'PROFILE_PHONE_ADDED_HINT')}`,
    createProfileStubKeyboard(language),
  );
}

export async function sendProfilePhoneAddCancelledMessage(
  ctx: MyContext,
  language: BotUiLanguage = 'uk',
): Promise<void> {
  await ctx.reply(tBot(language, 'PROFILE_PHONE_ADD_CANCELLED'), createProfileStubKeyboard(language));
}

export function formatProfileLanguagePromptText(
  currentLanguage: LanguageCode,
  language: BotUiLanguage,
): string {
  return (
    `${tBot(language, 'PROFILE_LANGUAGE_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `📋 ${tBot(language, 'PROFILE_LANGUAGE_CURRENT')}: ${getLanguageLabel(currentLanguage, language)}\n\n` +
    tBot(language, 'PROFILE_LANGUAGE_CHOOSE')
  );
}

export function createProfileLanguageKeyboard(
  currentLanguage: LanguageCode,
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  const withMark = (label: string, language: LanguageCode): string =>
    language === currentLanguage ? `✅ ${label}` : label;

  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        withMark(tBot(language, 'LANGUAGE_UK'), 'uk'),
        makeProfileEditLanguageSelectAction('uk'),
      ),
    ],
    [
      Markup.button.callback(
        withMark(tBot(language, 'LANGUAGE_EN'), 'en'),
        makeProfileEditLanguageSelectAction('en'),
      ),
    ],
    [
      Markup.button.callback(
        withMark(tBot(language, 'LANGUAGE_CS'), 'cs'),
        makeProfileEditLanguageSelectAction('cs'),
      ),
    ],
    [
      Markup.button.callback(tBot(language, 'BACK_TO_PROFILE'), PROFILE_ACTION.OPEN),
      Markup.button.callback(tBot(language, 'HOME'), COMMON_NAV_ACTION.HOME),
    ],
  ]);
}

export async function sendProfileLanguageUpdatedMessage(
  ctx: MyContext,
  language: LanguageCode,
): Promise<void> {
  const uiLanguage = resolveBotUiLanguage(language);
  await ctx.reply(
    `${tBot(uiLanguage, 'PROFILE_LANGUAGE_UPDATED')}: ${getLanguageLabel(language, uiLanguage)}`,
    createProfileStubKeyboard(uiLanguage),
  );
}
