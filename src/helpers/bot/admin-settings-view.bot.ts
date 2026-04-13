import { Markup } from 'telegraf';
import {
  ADMIN_PANEL_ACTION,
  makeAdminPanelSettingsLanguageSelectAction,
  makeAdminPanelSettingsNotificationsToggleAction,
  makeAdminPanelSettingsStudioEditBlockOpenAction,
} from '../../types/bot-admin-panel.types.js';
import type { ContentBlockKey, LanguageCode } from '../../types/db/dbEnums.type.js';
import type { AdminStudioAdminMember, AdminStudioUserLookup } from '../../types/db-helpers/db-admin-settings.types.js';
import type { AdminStudioProfileSettings } from '../../types/db-helpers/db-admin-studio-settings.types.js';
import type {
  NotificationSettingsState,
  UserDeliveryProfile,
} from '../../types/db-helpers/db-notification-settings.types.js';
import {
  getLanguageLabel as getUiLanguageLabel,
  tBot,
  tBotTemplate,
} from './i18n.bot.js';
import type { BotUiLanguage } from './i18n.bot.js';

/**
 * @file admin-settings-view.bot.ts
 * @summary UI/helper-и для блоку "Налаштування" в адмін-панелі.
 */

// uk: UI константа NUMBER_BADGES / en: UI constant NUMBER_BADGES / cz: UI konstanta NUMBER_BADGES
const NUMBER_BADGES = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

/**
 * uk: Внутрішня bot helper функція getNumberBadge.
 * en: Internal bot helper function getNumberBadge.
 * cz: Interní bot helper funkce getNumberBadge.
 */
function getNumberBadge(index: number): string {
  return NUMBER_BADGES[index] ?? `${index + 1}.`;
}

/**
 * uk: Внутрішня bot helper функція formatTelegramLogin.
 * en: Internal bot helper function formatTelegramLogin.
 * cz: Interní bot helper funkce formatTelegramLogin.
 */
function formatTelegramLogin(username: string | null, language: BotUiLanguage): string {
  return username ? `@${username}` : tBot(language, 'ADMIN_PANEL_SETTINGS_NOT_SET');
}

/**
 * uk: Внутрішня bot helper функція formatLanguageLabel.
 * en: Internal bot helper function formatLanguageLabel.
 * cz: Interní bot helper funkce formatLanguageLabel.
 */
function formatLanguageLabel(language: LanguageCode, uiLanguage: BotUiLanguage): string {
  return getUiLanguageLabel(language, uiLanguage);
}

/**
 * @summary Форматує меню налаштувань адмін-панелі.
 */
export function formatAdminSettingsMenuText(language: BotUiLanguage = 'uk'): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_MENU_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBot(language, 'ADMIN_PANEL_SETTINGS_MENU_SUBTITLE')
  );
}

/**
 * @summary Клавіатура меню блоку "Налаштування".
 */
export function createAdminSettingsMenuKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_LANGUAGE'), ADMIN_PANEL_ACTION.SETTINGS_OPEN_LANGUAGE)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_ADMINS'), ADMIN_PANEL_ACTION.SETTINGS_OPEN_ADMINS)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_STUDIO'), ADMIN_PANEL_ACTION.SETTINGS_OPEN_STUDIO)],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_NOTIFICATIONS'),
        ADMIN_PANEL_ACTION.SETTINGS_OPEN_NOTIFICATIONS,
      ),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_BACK'), ADMIN_PANEL_ACTION.SETTINGS_BACK)],
  ]);
}

/**
 * @summary Форматує екран списку адміністраторів.
 */
export function formatAdminSettingsAdminsText(
  admins: AdminStudioAdminMember[],
  language: BotUiLanguage = 'uk',
): string {
  if (admins.length === 0) {
    return (
      `${tBot(language, 'ADMIN_PANEL_SETTINGS_ADMINS_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      `${tBot(language, 'ADMIN_PANEL_SETTINGS_ADMINS_EMPTY')}\n\n` +
      tBot(language, 'ADMIN_PANEL_SETTINGS_ADMINS_EMPTY_HINT')
    );
  }

  const lines = admins.map((admin, index) => {
    return (
      `${getNumberBadge(index)} ${admin.displayName}\n` +
      tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_ADMINS_LABEL_TELEGRAM_ID', {
        id: admin.telegramUserId,
      }) + '\n' +
      tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_ADMINS_LABEL_USERNAME', {
        username: formatTelegramLogin(admin.telegramUsername, language),
      })
    );
  });

  return (
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_ADMINS_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_ADMINS_LIST_TITLE')}\n\n` +
    lines.join('\n\n')
  );
}

/**
 * @summary Клавіатура меню адміністраторів.
 */
export function createAdminSettingsAdminsKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_ADMINS_GRANT'),
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_GRANT_OPEN,
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_ADMINS_REVOKE'),
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_REVOKE_OPEN,
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_BACK_TO_MENU'),
        ADMIN_PANEL_ACTION.SETTINGS_BACK_TO_MENU,
      ),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_BACK'), ADMIN_PANEL_ACTION.SETTINGS_BACK)],
  ]);
}

/**
 * @summary Форматує екран налаштування мови адмін-панелі.
 */
export function formatAdminSettingsLanguageText(
  currentLanguage: LanguageCode,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_LANGUAGE_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_LANGUAGE_DESCRIPTION')}\n` +
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_LANGUAGE_NOTE')}\n\n` +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_LANGUAGE_CURRENT', {
      language: formatLanguageLabel(currentLanguage, language),
    }) + '\n\n' +
    tBot(language, 'ADMIN_PANEL_SETTINGS_LANGUAGE_PICK')
  );
}

/**
 * @summary Клавіатура вибору мови адмін-панелі.
 */
export function createAdminSettingsLanguageKeyboard(
  currentLanguage: LanguageCode,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const withMark = (label: string, targetLanguage: LanguageCode): string =>
    targetLanguage === currentLanguage ? `✅ ${label}` : label;

  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        withMark(tBot(language, 'LANGUAGE_UK'), 'uk'),
        makeAdminPanelSettingsLanguageSelectAction('uk'),
      ),
    ],
    [
      Markup.button.callback(
        withMark(tBot(language, 'LANGUAGE_EN'), 'en'),
        makeAdminPanelSettingsLanguageSelectAction('en'),
      ),
    ],
    [
      Markup.button.callback(
        withMark(tBot(language, 'LANGUAGE_CS'), 'cs'),
        makeAdminPanelSettingsLanguageSelectAction('cs'),
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_BACK_TO_MENU'),
        ADMIN_PANEL_ACTION.SETTINGS_BACK_TO_MENU,
      ),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_BACK'), ADMIN_PANEL_ACTION.SETTINGS_BACK)],
  ]);
}

/**
 * @summary Форматує підтвердження зміни мови адмін-панелі.
 */
export function formatAdminSettingsLanguageConfirmText(
  currentLanguage: LanguageCode,
  nextLanguage: LanguageCode,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_LANGUAGE_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_LANGUAGE_CONFIRM_FROM', {
      language: formatLanguageLabel(currentLanguage, language),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_LANGUAGE_CONFIRM_TO', {
      language: formatLanguageLabel(nextLanguage, language),
    }) + '\n\n' +
    tBot(language, 'ADMIN_PANEL_SETTINGS_LANGUAGE_CONFIRM_HINT')
  );
}

/**
 * @summary Клавіатура підтвердження зміни мови.
 */
export function createAdminSettingsLanguageConfirmKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_LANGUAGE_CONFIRM'),
        ADMIN_PANEL_ACTION.SETTINGS_LANGUAGE_CONFIRM,
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_LANGUAGE_CANCEL'),
        ADMIN_PANEL_ACTION.SETTINGS_LANGUAGE_CANCEL,
      ),
    ],
  ]);
}

/**
 * @summary Текст кроку введення Telegram ID для надання ролі.
 */
export function formatAdminSettingsGrantInputText(language: BotUiLanguage = 'uk'): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_ADMINS_GRANT_INPUT_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_ADMINS_INPUT_BODY')}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_ADMINS_INPUT_FORMAT')}\n` +
    tBot(language, 'ADMIN_PANEL_SETTINGS_ADMINS_INPUT_EXAMPLE')
  );
}

/**
 * @summary Текст кроку введення Telegram ID для зняття ролі.
 */
export function formatAdminSettingsRevokeInputText(language: BotUiLanguage = 'uk'): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_ADMINS_REVOKE_INPUT_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_ADMINS_REVOKE_INPUT_BODY')}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_ADMINS_INPUT_FORMAT')}\n` +
    tBot(language, 'ADMIN_PANEL_SETTINGS_ADMINS_INPUT_EXAMPLE')
  );
}

/**
 * @summary Клавіатура кроку введення ID для надання ролі.
 */
export function createAdminSettingsGrantInputKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_ADMINS_CANCEL'),
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_GRANT_CANCEL,
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_BACK_TO_MENU'),
        ADMIN_PANEL_ACTION.SETTINGS_BACK_TO_MENU,
      ),
    ],
  ]);
}

/**
 * @summary Клавіатура кроку введення ID для зняття ролі.
 */
export function createAdminSettingsRevokeInputKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_ADMINS_CANCEL'),
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_REVOKE_CANCEL,
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_BACK_TO_MENU'),
        ADMIN_PANEL_ACTION.SETTINGS_BACK_TO_MENU,
      ),
    ],
  ]);
}

/**
 * @summary Текст підтвердження надання ролі адміністратора.
 */
export function formatAdminSettingsGrantConfirmText(
  target: AdminStudioUserLookup,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_ADMINS_GRANT_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_ADMINS_LABEL_USER', {
      user: target.displayName,
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_ADMINS_LABEL_TELEGRAM_ID', {
      id: target.telegramUserId,
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_ADMINS_LABEL_USERNAME', {
      username: formatTelegramLogin(target.telegramUsername, language),
    }) + '\n\n' +
    tBot(language, 'ADMIN_PANEL_SETTINGS_ADMINS_GRANT_CONFIRM_HINT')
  );
}

/**
 * @summary Текст підтвердження зняття ролі адміністратора.
 */
export function formatAdminSettingsRevokeConfirmText(
  target: AdminStudioUserLookup,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_ADMINS_REVOKE_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_ADMINS_LABEL_USER', {
      user: target.displayName,
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_ADMINS_LABEL_TELEGRAM_ID', {
      id: target.telegramUserId,
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_ADMINS_LABEL_USERNAME', {
      username: formatTelegramLogin(target.telegramUsername, language),
    }) + '\n\n' +
    tBot(language, 'ADMIN_PANEL_SETTINGS_ADMINS_REVOKE_CONFIRM_HINT')
  );
}

/**
 * @summary Клавіатура підтвердження надання ролі.
 */
export function createAdminSettingsGrantConfirmKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_ADMINS_CONFIRM_GRANT'),
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_GRANT_CONFIRM,
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_ADMINS_CANCEL'),
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_GRANT_CANCEL,
      ),
    ],
  ]);
}

/**
 * @summary Клавіатура підтвердження зняття ролі.
 */
export function createAdminSettingsRevokeConfirmKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_ADMINS_CONFIRM_REVOKE'),
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_REVOKE_CONFIRM,
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_ADMINS_CANCEL'),
        ADMIN_PANEL_ACTION.SETTINGS_ADMINS_REVOKE_CANCEL,
      ),
    ],
  ]);
}

const WEEKDAY_LABELS: Record<BotUiLanguage, Record<number, string>> = {
  uk: { 1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт', 6: 'Сб', 7: 'Нд' },
  en: { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' },
  cs: { 1: 'Po', 2: 'Út', 3: 'St', 4: 'Čt', 5: 'Pá', 6: 'So', 7: 'Ne' },
};

/**
 * uk: Внутрішня bot helper функція formatWeeklyHoursLine.
 * en: Internal bot helper function formatWeeklyHoursLine.
 * cz: Interní bot helper funkce formatWeeklyHoursLine.
 */
function formatWeeklyHoursLine(
  item: AdminStudioProfileSettings['weeklyHours'][number],
  language: BotUiLanguage,
): string {
  const weekday = WEEKDAY_LABELS[language][item.weekday] ??
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_WEEKDAY_FALLBACK', { day: item.weekday });

  if (!item.isOpen || !item.openTime || !item.closeTime) {
    return tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_WEEKLY_OFF', { weekday });
  }

  return tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_WEEKLY_OPEN', {
    weekday,
    from: item.openTime.slice(0, 5),
    to: item.closeTime.slice(0, 5),
  });
}

/**
 * uk: Внутрішня bot helper функція trimPreview.
 * en: Internal bot helper function trimPreview.
 * cz: Interní bot helper funkce trimPreview.
 */
function trimPreview(value: string, max = 220): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max).trimEnd()}…`;
}

/**
 * uk: Публічна bot helper функція getAdminStudioBlockTitle.
 * en: Public bot helper function getAdminStudioBlockTitle.
 * cz: Veřejná bot helper funkce getAdminStudioBlockTitle.
 */
export function getAdminStudioBlockTitle(
  blockKey: ContentBlockKey,
  language: BotUiLanguage = 'uk',
): string {
  switch (blockKey) {
    case 'about':
      return tBot(language, 'ADMIN_PANEL_SETTINGS_STUDIO_BLOCK_ABOUT');
    case 'contacts':
      return tBot(language, 'ADMIN_PANEL_SETTINGS_STUDIO_BLOCK_CONTACTS');
    case 'booking_rules':
      return tBot(language, 'ADMIN_PANEL_SETTINGS_STUDIO_BLOCK_BOOKING_RULES');
    case 'cancellation_policy':
      return tBot(language, 'ADMIN_PANEL_SETTINGS_STUDIO_BLOCK_CANCELLATION');
    case 'preparation':
      return tBot(language, 'ADMIN_PANEL_SETTINGS_STUDIO_BLOCK_PREPARATION');
    case 'comfort':
      return tBot(language, 'ADMIN_PANEL_SETTINGS_STUDIO_BLOCK_COMFORT');
    case 'guarantee_service':
      return tBot(language, 'ADMIN_PANEL_SETTINGS_STUDIO_BLOCK_GUARANTEE');
    default:
      return tBot(language, 'ADMIN_PANEL_SETTINGS_STUDIO_BLOCK_FALLBACK');
  }
}

/**
 * @summary Форматує головний екран блоку "Параметри салону".
 */
export function formatAdminSettingsStudioProfileText(
  data: AdminStudioProfileSettings,
  language: BotUiLanguage = 'uk',
): string {
  const notSet = tBot(language, 'ADMIN_PANEL_SETTINGS_NOT_SET');
  const scheduleText =
    data.weeklyHours.length > 0
      ? data.weeklyHours
          .slice()
          .sort((a, b) => a.weekday - b.weekday)
          .map((item) => formatWeeklyHoursLine(item, language))
          .join('\n')
      : tBot(language, 'ADMIN_PANEL_SETTINGS_STUDIO_SCHEDULE_EMPTY');

  return (
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_STUDIO_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_STUDIO_LABEL_NAME', { value: data.studio.name }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_STUDIO_LABEL_CITY', { value: data.studio.city ?? notSet }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_STUDIO_LABEL_ADDRESS', { value: data.studio.addressLine ?? notSet }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_STUDIO_LABEL_PHONE', { value: data.studio.phoneE164 ?? notSet }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_STUDIO_LABEL_EMAIL', { value: data.studio.email ?? notSet }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_STUDIO_LABEL_TIMEZONE', { value: data.studio.timezone }) + '\n\n' +
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_STUDIO_SCHEDULE_TITLE')}\n${scheduleText}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_STUDIO_CONTENT_TITLE')}\n` +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_STUDIO_CONTENT_ABOUT', {
      value: trimPreview(data.contentBlocks.about, 110),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_STUDIO_CONTENT_CONTACTS', {
      value: trimPreview(data.contentBlocks.contacts, 110),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_STUDIO_CONTENT_BOOKING_RULES', {
      value: trimPreview(data.contentBlocks.booking_rules, 110),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_STUDIO_CONTENT_CANCELLATION', {
      value: trimPreview(data.contentBlocks.cancellation_policy, 110),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_STUDIO_CONTENT_PREPARATION', {
      value: trimPreview(data.contentBlocks.preparation, 110),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_STUDIO_CONTENT_COMFORT', {
      value: trimPreview(data.contentBlocks.comfort, 110),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_STUDIO_CONTENT_GUARANTEE', {
      value: trimPreview(data.contentBlocks.guarantee_service, 110),
    })
  );
}

/**
 * @summary Клавіатура блоку "Параметри салону".
 */
export function createAdminSettingsStudioProfileKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_STUDIO_EDIT_ABOUT'),
        makeAdminPanelSettingsStudioEditBlockOpenAction('about'),
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_STUDIO_EDIT_CONTACTS'),
        makeAdminPanelSettingsStudioEditBlockOpenAction('contacts'),
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_STUDIO_EDIT_BOOKING_RULES'),
        makeAdminPanelSettingsStudioEditBlockOpenAction('booking_rules'),
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_STUDIO_EDIT_CANCELLATION'),
        makeAdminPanelSettingsStudioEditBlockOpenAction('cancellation_policy'),
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_STUDIO_EDIT_PREPARATION'),
        makeAdminPanelSettingsStudioEditBlockOpenAction('preparation'),
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_STUDIO_EDIT_COMFORT'),
        makeAdminPanelSettingsStudioEditBlockOpenAction('comfort'),
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_STUDIO_EDIT_GUARANTEE'),
        makeAdminPanelSettingsStudioEditBlockOpenAction('guarantee_service'),
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_BACK_TO_MENU'),
        ADMIN_PANEL_ACTION.SETTINGS_BACK_TO_MENU,
      ),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_BACK'), ADMIN_PANEL_ACTION.SETTINGS_BACK)],
  ]);
}

/**
 * @summary Форматує екран вводу нового тексту контент-блоку.
 */
export function formatAdminSettingsStudioEditPromptText(
  blockTitle: string,
  currentContent: string,
  language: BotUiLanguage = 'uk',
): string {
  return (
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_STUDIO_EDIT_PROMPT_TITLE', { block: blockTitle }) + '\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_STUDIO_EDIT_PROMPT_CURRENT')}\n` +
    `${currentContent}\n\n` +
    tBot(language, 'ADMIN_PANEL_SETTINGS_STUDIO_EDIT_PROMPT_SEND')
  );
}

/**
 * @summary Клавіатура екрана вводу тексту контент-блоку.
 */
export function createAdminSettingsStudioEditInputKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_STUDIO_CANCEL'),
        ADMIN_PANEL_ACTION.SETTINGS_STUDIO_EDIT_BLOCK_CANCEL,
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_BACK_TO_MENU'),
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
  language: BotUiLanguage = 'uk',
): string {
  return (
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_STUDIO_EDIT_CONFIRM_TITLE', { block: blockTitle }) + '\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_STUDIO_EDIT_CONFIRM_NEW')}\n` +
    `${newContent}\n\n` +
    tBot(language, 'ADMIN_PANEL_SETTINGS_STUDIO_EDIT_CONFIRM_HINT')
  );
}

/**
 * @summary Клавіатура підтвердження редагування контент-блоку.
 */
export function createAdminSettingsStudioEditConfirmKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_STUDIO_CONFIRM'),
        ADMIN_PANEL_ACTION.SETTINGS_STUDIO_EDIT_BLOCK_CONFIRM,
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_STUDIO_CANCEL'),
        ADMIN_PANEL_ACTION.SETTINGS_STUDIO_EDIT_BLOCK_CANCEL,
      ),
    ],
  ]);
}

/**
 * uk: Внутрішня bot helper функція getNotificationStatusIcon.
 * en: Internal bot helper function getNotificationStatusIcon.
 * cz: Interní bot helper funkce getNotificationStatusIcon.
 */
function getNotificationStatusIcon(enabled: boolean): string {
  return enabled ? '✅' : '⚪';
}

/**
 * uk: Внутрішня bot helper функція getDeliveryStatusLabel.
 * en: Internal bot helper function getDeliveryStatusLabel.
 * cz: Interní bot helper funkce getDeliveryStatusLabel.
 */
function getDeliveryStatusLabel(verifiedAt: Date | null, language: BotUiLanguage): string {
  return verifiedAt
    ? tBot(language, 'ADMIN_PANEL_SETTINGS_NOTIFICATIONS_DELIVERY_VERIFIED')
    : tBot(language, 'ADMIN_PANEL_SETTINGS_NOTIFICATIONS_DELIVERY_UNVERIFIED');
}

/**
 * @summary Форматує екран системних сповіщень для адміністратора.
 */
export function formatAdminSettingsNotificationsText(
  state: NotificationSettingsState,
  deliveryProfile: UserDeliveryProfile | null,
  language: BotUiLanguage = 'uk',
): string {
  const notSet = tBot(language, 'ADMIN_PANEL_SETTINGS_NOT_SET');
  const phone = deliveryProfile?.phoneE164 ?? notSet;
  const email = deliveryProfile?.email ?? notSet;

  return (
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_NOTIFICATIONS_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_NOTIFICATIONS_DESCRIPTION')}\n\n` +
    `${getNotificationStatusIcon(state.booking_confirmation)} ${tBot(language, 'ADMIN_PANEL_SETTINGS_NOTIFICATIONS_BOOKING_CONFIRMATION')}\n` +
    `${getNotificationStatusIcon(state.status_change)} ${tBot(language, 'ADMIN_PANEL_SETTINGS_NOTIFICATIONS_STATUS_CHANGE')}\n` +
    `${getNotificationStatusIcon(state.visit_reminder)} ${tBot(language, 'ADMIN_PANEL_SETTINGS_NOTIFICATIONS_VISIT_REMINDER')}\n` +
    `${getNotificationStatusIcon(state.promo_news)} ${tBot(language, 'ADMIN_PANEL_SETTINGS_NOTIFICATIONS_PROMO_NEWS')}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_NOTIFICATIONS_CHANNELS_TITLE')}\n` +
    `${tBot(language, 'ADMIN_PANEL_SETTINGS_NOTIFICATIONS_CHANNEL_TELEGRAM')}\n` +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_NOTIFICATIONS_CHANNEL_PHONE', {
      phone,
      status: getDeliveryStatusLabel(deliveryProfile?.phoneVerifiedAt ?? null, language),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SETTINGS_NOTIFICATIONS_CHANNEL_EMAIL', {
      email,
      status: getDeliveryStatusLabel(deliveryProfile?.emailVerifiedAt ?? null, language),
    })
  );
}

/**
 * @summary Клавіатура керування системними сповіщеннями.
 */
export function createAdminSettingsNotificationsKeyboard(
  state: NotificationSettingsState,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        `${getNotificationStatusIcon(state.booking_confirmation)} ${tBot(language, 'ADMIN_PANEL_SETTINGS_NOTIFICATIONS_BOOKING_CONFIRMATION')}`,
        makeAdminPanelSettingsNotificationsToggleAction('booking_confirmation'),
      ),
    ],
    [
      Markup.button.callback(
        `${getNotificationStatusIcon(state.status_change)} ${tBot(language, 'ADMIN_PANEL_SETTINGS_NOTIFICATIONS_STATUS_CHANGE_SHORT')}`,
        makeAdminPanelSettingsNotificationsToggleAction('status_change'),
      ),
    ],
    [
      Markup.button.callback(
        `${getNotificationStatusIcon(state.visit_reminder)} ${tBot(language, 'ADMIN_PANEL_SETTINGS_NOTIFICATIONS_VISIT_REMINDER')}`,
        makeAdminPanelSettingsNotificationsToggleAction('visit_reminder'),
      ),
    ],
    [
      Markup.button.callback(
        `${getNotificationStatusIcon(state.promo_news)} ${tBot(language, 'ADMIN_PANEL_SETTINGS_NOTIFICATIONS_PROMO_NEWS')}`,
        makeAdminPanelSettingsNotificationsToggleAction('promo_news'),
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_NOTIFICATIONS_ALL_ON'),
        ADMIN_PANEL_ACTION.SETTINGS_NOTIFICATIONS_ALL_ON,
      ),
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_NOTIFICATIONS_ALL_OFF'),
        ADMIN_PANEL_ACTION.SETTINGS_NOTIFICATIONS_ALL_OFF,
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_BACK_TO_MENU'),
        ADMIN_PANEL_ACTION.SETTINGS_BACK_TO_MENU,
      ),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SETTINGS_BTN_BACK'), ADMIN_PANEL_ACTION.SETTINGS_BACK)],
  ]);
}
