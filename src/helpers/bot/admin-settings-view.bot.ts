import { Markup } from 'telegraf';
import {
  ADMIN_PANEL_ACTION,
  ADMIN_PANEL_BUTTON_TEXT,
  makeAdminPanelSettingsStudioEditBlockOpenAction,
} from '../../types/bot-admin-panel.types.js';
import type { ContentBlockKey } from '../../types/db/dbEnums.type.js';
import type { AdminStudioAdminMember, AdminStudioUserLookup } from '../../types/db-helpers/db-admin-settings.types.js';
import type { AdminStudioProfileSettings } from '../../types/db-helpers/db-admin-studio-settings.types.js';

/**
 * @file admin-settings-view.bot.ts
 * @summary UI/helper-и для блоку "Налаштування" в адмін-панелі.
 */

/**
 * @summary Форматує меню налаштувань адмін-панелі.
 */
export function formatAdminSettingsMenuText(): string {
  return (
    '⚙️ Налаштування\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Оберіть розділ, який потрібно відкрити:'
  );
}

/**
 * @summary Клавіатура меню блоку "Налаштування".
 */
export function createAdminSettingsMenuKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SETTINGS_LANGUAGE, ADMIN_PANEL_ACTION.SETTINGS_OPEN_LANGUAGE)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SETTINGS_ADMINS, ADMIN_PANEL_ACTION.SETTINGS_OPEN_ADMINS)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SETTINGS_STUDIO, ADMIN_PANEL_ACTION.SETTINGS_OPEN_STUDIO)],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_NOTIFICATIONS,
        ADMIN_PANEL_ACTION.SETTINGS_OPEN_NOTIFICATIONS,
      ),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SETTINGS_BACK, ADMIN_PANEL_ACTION.SETTINGS_BACK)],
  ]);
}

/**
 * @summary Форматує заглушку підрозділу налаштувань.
 */
export function formatAdminSettingsSectionText(title: string, description: string): string {
  return (
    `${title}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${description}\n\n` +
    'Функціонал цього підрозділу буде доступний у наступному блоці.'
  );
}

/**
 * @summary Клавіатура підрозділу налаштувань.
 */
export function createAdminSettingsSectionKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_BACK_TO_MENU,
        ADMIN_PANEL_ACTION.SETTINGS_BACK_TO_MENU,
      ),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SETTINGS_BACK, ADMIN_PANEL_ACTION.SETTINGS_BACK)],
  ]);
}

const NUMBER_BADGES = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

function getNumberBadge(index: number): string {
  return NUMBER_BADGES[index] ?? `${index + 1}.`;
}

function formatTelegramLogin(username: string | null): string {
  return username ? `@${username}` : '—';
}

/**
 * @summary Форматує екран списку адміністраторів.
 */
export function formatAdminSettingsAdminsText(admins: AdminStudioAdminMember[]): string {
  if (admins.length === 0) {
    return (
      '👑 Адміністратори\n' +
      '━━━━━━━━━━━━━━\n\n' +
      'У цьому салоні ще немає активних адміністраторів.\n\n' +
      'Щоб почати, додайте адміністратора через Telegram ID.'
    );
  }

  const lines = admins.map((admin, index) => {
    return (
      `${getNumberBadge(index)} ${admin.displayName}\n` +
      `🆔 Telegram ID: ${admin.telegramUserId}\n` +
      `🔹 Username: ${formatTelegramLogin(admin.telegramUsername)}`
    );
  });

  return (
    '👑 Адміністратори\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Список адміністраторів салону:\n\n' +
    lines.join('\n\n')
  );
}

/**
 * @summary Клавіатура меню адміністраторів.
 */
export function createAdminSettingsAdminsKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_ADMINS_GRANT,
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_GRANT_OPEN,
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_ADMINS_REVOKE,
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_REVOKE_OPEN,
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_BACK_TO_MENU,
        ADMIN_PANEL_ACTION.SETTINGS_BACK_TO_MENU,
      ),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SETTINGS_BACK, ADMIN_PANEL_ACTION.SETTINGS_BACK)],
  ]);
}

/**
 * @summary Текст кроку введення Telegram ID для надання ролі.
 */
export function formatAdminSettingsGrantInputText(): string {
  return (
    '👑 Надання ролі адміністратора\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Надішліть Telegram ID користувача одним повідомленням.\n\n' +
    'Формат: лише цифри\n' +
    'Приклад: 6712153038'
  );
}

/**
 * @summary Текст кроку введення Telegram ID для зняття ролі.
 */
export function formatAdminSettingsRevokeInputText(): string {
  return (
    '🚫 Видалення ролі адміністратора\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Надішліть Telegram ID адміністратора, у якого потрібно забрати роль.\n\n' +
    'Формат: лише цифри\n' +
    'Приклад: 6712153038'
  );
}

/**
 * @summary Клавіатура кроку введення ID для надання ролі.
 */
export function createAdminSettingsGrantInputKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_ADMINS_CANCEL,
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_GRANT_CANCEL,
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_BACK_TO_MENU,
        ADMIN_PANEL_ACTION.SETTINGS_BACK_TO_MENU,
      ),
    ],
  ]);
}

/**
 * @summary Клавіатура кроку введення ID для зняття ролі.
 */
export function createAdminSettingsRevokeInputKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_ADMINS_CANCEL,
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_REVOKE_CANCEL,
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_BACK_TO_MENU,
        ADMIN_PANEL_ACTION.SETTINGS_BACK_TO_MENU,
      ),
    ],
  ]);
}

/**
 * @summary Текст підтвердження надання ролі адміністратора.
 */
export function formatAdminSettingsGrantConfirmText(target: AdminStudioUserLookup): string {
  return (
    '⚠️ Підтвердження надання ролі\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👤 Користувач: ${target.displayName}\n` +
    `🆔 Telegram ID: ${target.telegramUserId}\n` +
    `🔹 Username: ${formatTelegramLogin(target.telegramUsername)}\n\n` +
    'Після підтвердження користувач отримає повний доступ до адмін-панелі.'
  );
}

/**
 * @summary Текст підтвердження зняття ролі адміністратора.
 */
export function formatAdminSettingsRevokeConfirmText(target: AdminStudioUserLookup): string {
  return (
    '⚠️ Підтвердження видалення ролі\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👤 Користувач: ${target.displayName}\n` +
    `🆔 Telegram ID: ${target.telegramUserId}\n` +
    `🔹 Username: ${formatTelegramLogin(target.telegramUsername)}\n\n` +
    'Після підтвердження користувач втратить доступ до адмін-панелі.'
  );
}

/**
 * @summary Клавіатура підтвердження надання ролі.
 */
export function createAdminSettingsGrantConfirmKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_ADMINS_CONFIRM_GRANT,
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_GRANT_CONFIRM,
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_ADMINS_CANCEL,
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_GRANT_CANCEL,
      ),
    ],
  ]);
}

/**
 * @summary Клавіатура підтвердження зняття ролі.
 */
export function createAdminSettingsRevokeConfirmKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_ADMINS_CONFIRM_REVOKE,
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_REVOKE_CONFIRM,
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_ADMINS_CANCEL,
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_REVOKE_CANCEL,
      ),
    ],
  ]);
}

function formatWeeklyHoursLine(
  item: AdminStudioProfileSettings['weeklyHours'][number],
): string {
  const weekdayLabels: Record<number, string> = {
    1: 'Пн',
    2: 'Вт',
    3: 'Ср',
    4: 'Чт',
    5: 'Пт',
    6: 'Сб',
    7: 'Нд',
  };
  const weekday = weekdayLabels[item.weekday] ?? `День ${item.weekday}`;

  if (!item.isOpen || !item.openTime || !item.closeTime) {
    return `${weekday} — вихідний`;
  }
  return `${weekday} — ${item.openTime.slice(0, 5)}–${item.closeTime.slice(0, 5)}`;
}

function trimPreview(value: string, max = 220): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max).trimEnd()}…`;
}

export function getAdminStudioBlockTitle(blockKey: ContentBlockKey): string {
  switch (blockKey) {
    case 'about':
      return 'Інформація про студію';
    case 'contacts':
      return 'Контакти';
    case 'booking_rules':
      return 'Правила запису';
    case 'cancellation_policy':
      return 'Скасування та перенесення';
    case 'preparation':
      return 'Підготовка до процедури';
    case 'comfort':
      return 'Комфорт під час візиту';
    case 'guarantee_service':
      return 'Гарантія та сервіс';
    default:
      return 'Контент-блок';
  }
}

/**
 * @summary Форматує головний екран блоку "Параметри салону".
 */
export function formatAdminSettingsStudioProfileText(data: AdminStudioProfileSettings): string {
  const scheduleText =
    data.weeklyHours.length > 0
      ? data.weeklyHours
          .slice()
          .sort((a, b) => a.weekday - b.weekday)
          .map(formatWeeklyHoursLine)
          .join('\n')
      : 'Графік ще не налаштований';

  return (
    '🏢 Профіль салону\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `🏷 Назва: ${data.studio.name}\n` +
    `📍 Місто: ${data.studio.city ?? 'Не вказано'}\n` +
    `📌 Адреса: ${data.studio.addressLine ?? 'Не вказано'}\n` +
    `📞 Телефон: ${data.studio.phoneE164 ?? 'Не вказано'}\n` +
    `✉️ Email: ${data.studio.email ?? 'Не вказано'}\n` +
    `🕒 Таймзона: ${data.studio.timezone}\n\n` +
    '🗓 Графік роботи\n' +
    `${scheduleText}\n\n` +
    'ℹ️ Контент для клієнтів\n' +
    `• Інформація: ${trimPreview(data.contentBlocks.about, 110)}\n` +
    `• Контакти: ${trimPreview(data.contentBlocks.contacts, 110)}\n` +
    `• Правила запису: ${trimPreview(data.contentBlocks.booking_rules, 110)}\n` +
    `• Скасування: ${trimPreview(data.contentBlocks.cancellation_policy, 110)}\n` +
    `• Підготовка: ${trimPreview(data.contentBlocks.preparation, 110)}\n` +
    `• Комфорт: ${trimPreview(data.contentBlocks.comfort, 110)}\n` +
    `• Гарантія: ${trimPreview(data.contentBlocks.guarantee_service, 110)}`
  );
}

/**
 * @summary Клавіатура блоку "Параметри салону".
 */
export function createAdminSettingsStudioProfileKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_STUDIO_EDIT_ABOUT,
        makeAdminPanelSettingsStudioEditBlockOpenAction('about'),
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_STUDIO_EDIT_CONTACTS,
        makeAdminPanelSettingsStudioEditBlockOpenAction('contacts'),
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_STUDIO_EDIT_BOOKING_RULES,
        makeAdminPanelSettingsStudioEditBlockOpenAction('booking_rules'),
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_STUDIO_EDIT_CANCELLATION,
        makeAdminPanelSettingsStudioEditBlockOpenAction('cancellation_policy'),
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_STUDIO_EDIT_PREPARATION,
        makeAdminPanelSettingsStudioEditBlockOpenAction('preparation'),
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_STUDIO_EDIT_COMFORT,
        makeAdminPanelSettingsStudioEditBlockOpenAction('comfort'),
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_STUDIO_EDIT_GUARANTEE,
        makeAdminPanelSettingsStudioEditBlockOpenAction('guarantee_service'),
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_BACK_TO_MENU,
        ADMIN_PANEL_ACTION.SETTINGS_BACK_TO_MENU,
      ),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SETTINGS_BACK, ADMIN_PANEL_ACTION.SETTINGS_BACK)],
  ]);
}

/**
 * @summary Форматує екран вводу нового тексту контент-блоку.
 */
export function formatAdminSettingsStudioEditPromptText(
  blockTitle: string,
  currentContent: string,
): string {
  return (
    `✏️ Редагування: ${blockTitle}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    'Поточний текст:\n' +
    `${currentContent}\n\n` +
    'Надішліть новий текст одним повідомленням.'
  );
}

/**
 * @summary Клавіатура екрана вводу тексту контент-блоку.
 */
export function createAdminSettingsStudioEditInputKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_STUDIO_CANCEL,
        ADMIN_PANEL_ACTION.SETTINGS_STUDIO_EDIT_BLOCK_CANCEL,
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_BACK_TO_MENU,
        ADMIN_PANEL_ACTION.SETTINGS_BACK_TO_MENU,
      ),
    ],
  ]);
}

/**
 * @summary Форматує підтвердження перед збереженням нового тексту.
 */
export function formatAdminSettingsStudioEditConfirmText(
  blockTitle: string,
  newContent: string,
): string {
  return (
    `⚠️ Підтвердження змін: ${blockTitle}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    'Новий текст:\n' +
    `${newContent}\n\n` +
    'Підтвердьте, щоб зберегти зміни в профілі салону.'
  );
}

/**
 * @summary Клавіатура підтвердження редагування контент-блоку.
 */
export function createAdminSettingsStudioEditConfirmKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_STUDIO_CONFIRM,
        ADMIN_PANEL_ACTION.SETTINGS_STUDIO_EDIT_BLOCK_CONFIRM,
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SETTINGS_STUDIO_CANCEL,
        ADMIN_PANEL_ACTION.SETTINGS_STUDIO_EDIT_BLOCK_CANCEL,
      ),
    ],
  ]);
}
