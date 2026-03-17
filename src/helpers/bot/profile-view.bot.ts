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

/**
 * @summary Форматує картку профілю клієнта.
 */
export function formatProfileCardText(user: AppUsersEntity): string {
  const bookingAvailability = user.phoneVerifiedAt
    ? '✅ Бронювання доступне.'
    : '⚠️ Бронювання може бути обмежене, поки телефон не підтверджено.';

  return (
    '👤 Профіль клієнта\n\n' +
    `🪪 ID профілю: ${user.id}\n` +
    `👤 Імʼя: ${getFullName(user)}\n` +
    `💬 Telegram: ${getTelegramLabel(user)}\n\n` +
    `📱 Телефон: ${user.phoneE164 ?? 'Не вказано'}\n` +
    `${getVerificationLabel(user.phoneVerifiedAt)}\n\n` +
    `✉️ Email: ${user.email ?? 'Не вказано'}\n` +
    `${getVerificationLabel(user.emailVerifiedAt)}\n\n` +
    `🌐 Мова: ${user.preferredLanguage}\n` +
    `🔔 Сповіщення: увімкнено\n\n` +
    `${bookingAvailability}`
  );
}

/**
 * @summary Inline-клавіатура головного екрана профілю.
 */
export function createProfileInlineKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(PROFILE_BUTTON_TEXT.EDIT_NAME, PROFILE_ACTION.EDIT_NAME),
      Markup.button.callback(PROFILE_BUTTON_TEXT.EDIT_EMAIL, PROFILE_ACTION.EDIT_EMAIL),
    ],
    [
      Markup.button.callback(PROFILE_BUTTON_TEXT.EDIT_PHONE, PROFILE_ACTION.EDIT_PHONE),
      Markup.button.callback(PROFILE_BUTTON_TEXT.EDIT_LANGUAGE, PROFILE_ACTION.EDIT_LANGUAGE),
    ],
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
 * @summary Відправляє користувачу головний екран профілю.
 */
export async function sendProfileCard(ctx: MyContext, user: AppUsersEntity): Promise<void> {
  await ctx.reply(formatProfileCardText(user), createProfileInlineKeyboard());
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
