import { Markup } from 'telegraf';
import type { AppUsersEntity } from '../../types/db/index.js';
import type { MyContext } from '../../types/bot.types.js';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import { PROFILE_ACTION, PROFILE_BUTTON_TEXT } from '../../types/bot-profile.types.js';

/**
 * @file profile-view.bot.ts
 * @summary UI/helper-и для екрана профілю клієнта (текст + inline-кнопки).
 */

function getFullName(user: AppUsersEntity): string {
  return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`.trim();
}

function getTelegramLabel(user: AppUsersEntity): string {
  return user.telegramUsername ? `@${user.telegramUsername}` : 'Не вказано';
}

function getVerificationLabel(verifiedAt: Date | null): string {
  return verifiedAt ? '✅ підтверджено' : '⚪ не підтверджено';
}

function hasEmail(user: AppUsersEntity): boolean {
  return Boolean(user.email && user.email.trim().length > 0);
}

function hasPhone(user: AppUsersEntity): boolean {
  return Boolean(user.phoneE164 && user.phoneE164.trim().length > 0);
}

function getEmailButtonLabel(user: AppUsersEntity): string {
  return hasEmail(user) ? PROFILE_BUTTON_TEXT.EDIT_EMAIL : PROFILE_BUTTON_TEXT.ADD_EMAIL;
}

function getPhoneButtonLabel(user: AppUsersEntity): string {
  return hasPhone(user) ? PROFILE_BUTTON_TEXT.EDIT_PHONE : PROFILE_BUTTON_TEXT.ADD_PHONE;
}

export function getEmailProfileActionTitle(user: AppUsersEntity): string {
  return hasEmail(user) ? '✉️ Зміна email' : '➕ Додавання email';
}

export function getPhoneProfileActionTitle(user: AppUsersEntity): string {
  return hasPhone(user) ? '📱 Зміна телефону' : '➕ Додавання телефону';
}

/**
 * @summary Форматує картку профілю клієнта.
 */
export function formatProfileCardText(user: AppUsersEntity): string {
  const bookingAvailability = user.phoneVerifiedAt
    ? '✅ Бронювання доступне.'
    : '⚠️ Бронювання може бути обмежене, поки телефон не підтверджено.';
  const hasPhoneValue = hasPhone(user);
  const hasEmailValue = hasEmail(user);
  const phoneVerificationLine = hasPhoneValue
    ? `${getVerificationLabel(user.phoneVerifiedAt)}\n\n`
    : '\n\n';
  const emailVerificationLine = hasEmailValue
    ? `${getVerificationLabel(user.emailVerifiedAt)}\n\n`
    : '\n\n';

  return (
    '👤 Профіль клієнта\n\n' +
    `🪪 ID профілю: ${user.id}\n` +
    `👤 Імʼя: ${getFullName(user)}\n` +
    `💬 Telegram: ${getTelegramLabel(user)}\n\n` +
    `📱 Телефон: ${user.phoneE164 ?? 'Не вказано'}\n` +
    `${phoneVerificationLine}` +
    `✉️ Email: ${user.email ?? 'Не вказано'}\n` +
    `${emailVerificationLine}` +
    `🌐 Мова: ${user.preferredLanguage}\n` +
    `🔔 Сповіщення: керуються в розділі "Налаштування сповіщень"\n\n` +
    `${bookingAvailability}`
  );
}

/**
 * @summary Inline-клавіатура головного екрана профілю.
 */
export function createProfileInlineKeyboard(
  user: AppUsersEntity,
): ReturnType<typeof Markup.inlineKeyboard> {
  const profileRows = [
    [
      Markup.button.callback(PROFILE_BUTTON_TEXT.EDIT_NAME, PROFILE_ACTION.EDIT_NAME),
      Markup.button.callback(getEmailButtonLabel(user), PROFILE_ACTION.EDIT_EMAIL),
    ],
    [
      Markup.button.callback(getPhoneButtonLabel(user), PROFILE_ACTION.EDIT_PHONE),
      Markup.button.callback(PROFILE_BUTTON_TEXT.EDIT_LANGUAGE, PROFILE_ACTION.EDIT_LANGUAGE),
    ],
  ];

  if (hasEmail(user) && !user.emailVerifiedAt) {
    profileRows.push([
      Markup.button.callback(PROFILE_BUTTON_TEXT.VERIFY_EMAIL, PROFILE_ACTION.VERIFY_EMAIL),
    ]);
  }

  return Markup.inlineKeyboard([
    ...profileRows,
    [
      Markup.button.callback(PROFILE_BUTTON_TEXT.BOOKING_STATUS, PROFILE_ACTION.BOOKING_STATUS),
      Markup.button.callback(
        PROFILE_BUTTON_TEXT.NOTIFICATION_SETTINGS,
        PROFILE_ACTION.NOTIFICATION_SETTINGS,
      ),
    ],
    [Markup.button.callback('🏠 Головне меню', COMMON_NAV_ACTION.HOME)],
  ]);
}

/**
 * @summary Inline-клавіатура для заглушок профілю.
 */
export function createProfileStubKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(PROFILE_BUTTON_TEXT.BACK_TO_PROFILE, PROFILE_ACTION.OPEN),
      Markup.button.callback('🏠 Головне меню', COMMON_NAV_ACTION.HOME),
    ],
  ]);
}

/**
 * @summary Inline-клавіатура для кроку зміни імені.
 */
export function createProfileNamePromptKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(PROFILE_BUTTON_TEXT.EDIT_NAME_CANCEL, PROFILE_ACTION.EDIT_NAME_CANCEL),
      Markup.button.callback(PROFILE_BUTTON_TEXT.BACK_TO_PROFILE, PROFILE_ACTION.OPEN),
    ],
  ]);
}

/**
 * @summary Inline-клавіатура для OTP-підтвердження email.
 */
export function createProfileEmailOtpKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(PROFILE_BUTTON_TEXT.EMAIL_OTP_RESEND, PROFILE_ACTION.EMAIL_OTP_RESEND),
      Markup.button.callback(PROFILE_BUTTON_TEXT.EMAIL_OTP_CANCEL, PROFILE_ACTION.EMAIL_OTP_CANCEL),
    ],
    [
      Markup.button.callback(PROFILE_BUTTON_TEXT.BACK_TO_PROFILE, PROFILE_ACTION.OPEN),
      Markup.button.callback('🏠 Головне меню', COMMON_NAV_ACTION.HOME),
    ],
  ]);
}

/**
 * @summary Inline-клавіатура для кроку додавання email.
 */
export function createProfileEmailAddKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(PROFILE_BUTTON_TEXT.ADD_EMAIL_CANCEL, PROFILE_ACTION.ADD_EMAIL_CANCEL),
      Markup.button.callback(PROFILE_BUTTON_TEXT.BACK_TO_PROFILE, PROFILE_ACTION.OPEN),
    ],
    [Markup.button.callback('🏠 Головне меню', COMMON_NAV_ACTION.HOME)],
  ]);
}

/**
 * @summary Відправляє користувачу головний екран профілю.
 */
export async function sendProfileCard(ctx: MyContext, user: AppUsersEntity): Promise<void> {
  await ctx.reply(formatProfileCardText(user), createProfileInlineKeyboard(user));
}

/**
 * @summary Універсальна заглушка для дій у розділі профілю.
 */
export async function sendProfileFeatureStub(ctx: MyContext, featureTitle: string): Promise<void> {
  await ctx.reply(
    `🛠 ${featureTitle}\n` +
      'Цей розділ вже зарезервований у логіці, зараз тимчасово працює як заглушка.\n' +
      'На наступному етапі підключимо повну робочу реалізацію.',
    createProfileStubKeyboard(),
  );
}

export async function sendProfileNameBlockedMessage(ctx: MyContext): Promise<void> {
  await ctx.reply(
    '⛔ Зміна імені тимчасово недоступна.\n' +
      'Спробуйте знову через кілька хвилин.',
    createProfileStubKeyboard(),
  );
}

export async function sendProfileNameCooldownMessage(ctx: MyContext): Promise<void> {
  await ctx.reply(
    '⏳ Ви вже змінювали імʼя протягом останніх 24 годин.\n' +
      'Повторна зміна стане доступною пізніше.',
    createProfileStubKeyboard(),
  );
}

export async function sendProfileNamePrompt(ctx: MyContext): Promise<void> {
  await ctx.reply(
    "✏️ Змінити імʼя\n\n" +
      'Введіть нове імʼя, яке буде використовуватися для записів.\n\n' +
      'Імʼя повинно бути реальним та відповідати людині, яка відвідує процедуру.\n\n' +
      '⚠️ Зверніть увагу: змінити імʼя можна лише один раз протягом 24 годин.',
    createProfileNamePromptKeyboard(),
  );
}

export async function sendProfileNameValidationError(ctx: MyContext): Promise<void> {
  await ctx.reply(
    "⚠️ Некоректне імʼя.\n" +
      'Використовуйте тільки літери та мінімум 2 символи.',
    createProfileNamePromptKeyboard(),
  );
}

export async function sendProfileNameUpdatedMessage(ctx: MyContext, firstName: string): Promise<void> {
  await ctx.reply(
    `✅ Імʼя успішно оновлено.\nНове імʼя: ${firstName}`,
    createProfileStubKeyboard(),
  );
}

export async function sendProfileNameCancelledMessage(ctx: MyContext): Promise<void> {
  await ctx.reply('❌ Зміну імені скасовано.', createProfileStubKeyboard());
}

export async function sendProfileEmailAddPrompt(ctx: MyContext): Promise<void> {
  await ctx.reply(
    '➕ Додати email\n\n' +
      'Введіть email для вашого профілю.\n\n' +
      'Вимоги:\n' +
      '• валідний формат email\n' +
      '• від 5 до 100 символів',
    createProfileEmailAddKeyboard(),
  );
}

export async function sendProfileEmailValidationError(ctx: MyContext): Promise<void> {
  await ctx.reply('⚠️ Некоректний формат email. Спробуйте ще раз.', createProfileEmailAddKeyboard());
}

export async function sendProfileEmailAlreadyUsedError(ctx: MyContext): Promise<void> {
  await ctx.reply(
    '⚠️ Цей email вже використовується іншим користувачем.',
    createProfileEmailAddKeyboard(),
  );
}

export async function sendProfileEmailAddedMessage(ctx: MyContext, email: string): Promise<void> {
  await ctx.reply(
    `✅ Email успішно додано.\nEmail: ${email}\n\nТепер ви можете підтвердити його через кнопку "✅ Підтвердити email".`,
    createProfileStubKeyboard(),
  );
}

export async function sendProfileEmailAddCancelledMessage(ctx: MyContext): Promise<void> {
  await ctx.reply('❌ Додавання email скасовано.', createProfileStubKeyboard());
}
