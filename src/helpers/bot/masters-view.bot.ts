import { Markup } from 'telegraf';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import {
  MASTERS_ACTION,
  makeMasterItemAction,
} from '../../types/bot-masters.types.js';
import type {
  MasterCatalogDetails,
  MasterCatalogItem,
  MasterCatalogCertificate,
  MasterUpcomingScheduleException,
  MasterSpecializationItem,
  MasterWeeklyScheduleItem,
} from '../../types/db-helpers/db-masters.types.js';
import { tBot, tBotTemplate } from './i18n.bot.js';
import type { BotUiLanguage } from './i18n.bot.js';

/**
 * @file masters-view.bot.ts
 * @summary UI/helper-и для розділу "Майстри" (тексти + inline-клавіатури).
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
 * uk: Внутрішня bot helper функція formatPrice.
 * en: Internal bot helper function formatPrice.
 * cz: Interní bot helper funkce formatPrice.
 */
function formatPrice(price: string, currencyCode: string): string {
  const normalizedPrice = price
    .replace(/[.,]00$/, '')
    .replace(/([.,]\d)0$/, '$1');

  return `${normalizedPrice} ${currencyCode}`;
}

/**
 * uk: Внутрішня bot helper функція toLocale.
 * en: Internal bot helper function toLocale.
 * cz: Interní bot helper funkce toLocale.
 */
function toLocale(language: BotUiLanguage): string {
  if (language === 'en') return 'en-US';
  if (language === 'cs') return 'cs-CZ';
  return 'uk-UA';
}

/**
 * uk: Внутрішня bot helper функція getMinutesUnit.
 * en: Internal bot helper function getMinutesUnit.
 * cz: Interní bot helper funkce getMinutesUnit.
 */
function getMinutesUnit(language: BotUiLanguage): string {
  return language === 'uk' ? 'хв' : 'min';
}

/**
 * uk: Внутрішня bot helper функція formatDate.
 * en: Internal bot helper function formatDate.
 * cz: Interní bot helper funkce formatDate.
 */
function formatDate(value: Date | null, language: BotUiLanguage): string | null {
  if (!value) return null;

  return new Intl.DateTimeFormat(toLocale(language), {
    timeZone: 'Europe/Prague',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(value);
}

/**
 * uk: Внутрішня bot helper функція formatWeekdayLabel.
 * en: Internal bot helper function formatWeekdayLabel.
 * cz: Interní bot helper funkce formatWeekdayLabel.
 */
function formatWeekdayLabel(weekday: number, language: BotUiLanguage): string {
  const labels: Record<number, string> = {
    1: language === 'en' ? 'Mon' : language === 'cs' ? 'Po' : 'Пн',
    2: language === 'en' ? 'Tue' : language === 'cs' ? 'Út' : 'Вт',
    3: language === 'en' ? 'Wed' : language === 'cs' ? 'St' : 'Ср',
    4: language === 'en' ? 'Thu' : language === 'cs' ? 'Čt' : 'Чт',
    5: language === 'en' ? 'Fri' : language === 'cs' ? 'Pá' : 'Пт',
    6: language === 'en' ? 'Sat' : language === 'cs' ? 'So' : 'Сб',
    7: language === 'en' ? 'Sun' : language === 'cs' ? 'Ne' : 'Нд',
  };

  return labels[weekday] ?? tBotTemplate(language, 'MASTERS_WEEKDAY_FALLBACK', { weekday });
}

/**
 * uk: Внутрішня bot helper функція formatWorkingRange.
 * en: Internal bot helper function formatWorkingRange.
 * cz: Interní bot helper funkce formatWorkingRange.
 */
function formatWorkingRange(item: MasterWeeklyScheduleItem, language: BotUiLanguage): string {
  if (!item.isWorking || !item.openTime || !item.closeTime) {
    return tBot(language, 'MASTERS_DAY_OFF');
  }

  return `${item.openTime.slice(0, 5)}–${item.closeTime.slice(0, 5)}`;
}

/**
 * uk: Внутрішня bot helper функція formatMasterListLine.
 * en: Internal bot helper function formatMasterListLine.
 * cz: Interní bot helper funkce formatMasterListLine.
 */
function formatMasterListLine(
  master: MasterCatalogItem,
  index: number,
  language: BotUiLanguage,
): string {
  const experienceLabel =
    master.experienceYears == null
      ? tBot(language, 'MASTERS_EXPERIENCE_NOT_SET')
      : tBotTemplate(language, 'MASTERS_EXPERIENCE_YEARS', { years: master.experienceYears });

  return (
    `${getNumberBadge(index)} 👩‍🎨 ${master.displayName}\n` +
    `⭐ ${master.ratingAvg} (${master.ratingCount}) • ${experienceLabel}`
  );
}

/**
 * uk: Внутрішня bot helper функція formatSpecializationLine.
 * en: Internal bot helper function formatSpecializationLine.
 * cz: Interní bot helper funkce formatSpecializationLine.
 */
function formatSpecializationLine(item: MasterSpecializationItem, language: BotUiLanguage): string {
  return (
    `• ${item.serviceName}\n` +
    `  ⏱ ${item.durationMinutes} ${getMinutesUnit(language)} • 💰 ${formatPrice(item.priceAmount, item.currencyCode)}`
  );
}

/**
 * uk: Внутрішня bot helper функція formatCertificateLine.
 * en: Internal bot helper function formatCertificateLine.
 * cz: Interní bot helper funkce formatCertificateLine.
 */
function formatCertificateLine(
  certificate: MasterCatalogCertificate,
  language: BotUiLanguage,
): string {
  const issuer = certificate.issuer ? ` (${certificate.issuer})` : '';
  const issuedOn = formatDate(certificate.issuedOn, language);
  const dateLabel = issuedOn ? ` — ${issuedOn}` : '';
  return `• ${certificate.title}${issuer}${dateLabel}`;
}

/**
 * uk: Внутрішня bot helper функція formatSpecializationsBlock.
 * en: Internal bot helper function formatSpecializationsBlock.
 * cz: Interní bot helper funkce formatSpecializationsBlock.
 */
function formatSpecializationsBlock(details: MasterCatalogDetails, language: BotUiLanguage): string {
  if (details.specializations.length === 0) {
    return `${tBot(language, 'MASTERS_SPECIALIZATION_TITLE')}\n${tBot(language, 'MASTERS_SPECIALIZATION_EMPTY')}`;
  }

  const lines = details.specializations.map((item) => formatSpecializationLine(item, language));
  return `${tBot(language, 'MASTERS_SPECIALIZATION_TITLE')}\n${lines.join('\n\n')}`;
}

/**
 * uk: Внутрішня bot helper функція formatCertificatesBlock.
 * en: Internal bot helper function formatCertificatesBlock.
 * cz: Interní bot helper funkce formatCertificatesBlock.
 */
function formatCertificatesBlock(details: MasterCatalogDetails, language: BotUiLanguage): string {
  if (details.certificates.length === 0) {
    return `${tBot(language, 'MASTERS_CERTIFICATES_TITLE')}\n${tBot(language, 'MASTERS_CERTIFICATES_EMPTY')}`;
  }

  const lines = details.certificates.map((item) => formatCertificateLine(item, language));
  return `${tBot(language, 'MASTERS_CERTIFICATES_TITLE')}\n${lines.join('\n')}`;
}

/**
 * uk: Внутрішня bot helper функція formatContactsBlock.
 * en: Internal bot helper function formatContactsBlock.
 * cz: Interní bot helper funkce formatContactsBlock.
 */
function formatContactsBlock(details: MasterCatalogDetails, language: BotUiLanguage): string {
  return (
    `${tBot(language, 'MASTERS_CONTACTS_TITLE')}\n` +
    `${tBot(language, 'MASTERS_CONTACT_PHONE')}: ${details.contactPhoneE164 ?? tBot(language, 'PROFILE_NOT_SET')}\n` +
    `${tBot(language, 'MASTERS_CONTACT_EMAIL')}: ${details.contactEmail ?? tBot(language, 'PROFILE_NOT_SET')}`
  );
}

/**
 * uk: Внутрішня bot helper функція formatWeeklyScheduleBlock.
 * en: Internal bot helper function formatWeeklyScheduleBlock.
 * cz: Interní bot helper funkce formatWeeklyScheduleBlock.
 */
function formatWeeklyScheduleBlock(details: MasterCatalogDetails, language: BotUiLanguage): string {
  if (details.weeklySchedule.length === 0) {
    return `${tBot(language, 'MASTERS_SCHEDULE_TITLE')}\n${tBot(language, 'MASTERS_SCHEDULE_EMPTY')}`;
  }

  const lines = details.weeklySchedule
    .slice()
    .sort((a, b) => a.weekday - b.weekday)
    .map((item) => `• ${formatWeekdayLabel(item.weekday, language)}: ${formatWorkingRange(item, language)}`);

  return `${tBot(language, 'MASTERS_SCHEDULE_TITLE')}\n${lines.join('\n')}`;
}

/**
 * uk: Внутрішня bot helper функція formatScheduleExceptionLine.
 * en: Internal bot helper function formatScheduleExceptionLine.
 * cz: Interní bot helper funkce formatScheduleExceptionLine.
 */
function formatScheduleExceptionLine(
  item: MasterUpcomingScheduleException,
  language: BotUiLanguage,
): string {
  if (item.type === 'day_off') {
    const dateLabel = formatDate(item.offDate, language) ?? '—';
    const reasonLabel = item.reason ? ` (${item.reason})` : '';
    return `• ${dateLabel}: ${tBot(language, 'MASTERS_DAY_OFF')}${reasonLabel}`;
  }

  if (item.type === 'vacation') {
    const from = formatDate(item.dateFrom, language) ?? '—';
    const to = formatDate(item.dateTo, language) ?? '—';
    const reasonLabel = item.reason ? ` (${item.reason})` : '';
    return `• ${from}–${to}: ${tBot(language, 'MASTERS_VACATION')}${reasonLabel}`;
  }

  const from = formatDate(item.dateFrom, language) ?? '—';
  const to = formatDate(item.dateTo, language) ?? '—';
  const weekday = formatWeekdayLabel(item.weekday, language);

  if (!item.isWorking || !item.openTime || !item.closeTime) {
    const noteLabel = item.note ? ` (${item.note})` : '';
    return `• ${from}–${to}, ${weekday}: ${tBot(language, 'MASTERS_DAY_OFF')}${noteLabel}`;
  }

  const noteLabel = item.note ? ` (${item.note})` : '';
  return (
    `• ${from}–${to}, ${weekday}: ` +
    `${item.openTime.slice(0, 5)}–${item.closeTime.slice(0, 5)}${noteLabel}`
  );
}

/**
 * uk: Внутрішня bot helper функція formatUpcomingScheduleExceptionsBlock.
 * en: Internal bot helper function formatUpcomingScheduleExceptionsBlock.
 * cz: Interní bot helper funkce formatUpcomingScheduleExceptionsBlock.
 */
function formatUpcomingScheduleExceptionsBlock(
  details: MasterCatalogDetails,
  language: BotUiLanguage,
): string {
  if (details.upcomingScheduleExceptions.length === 0) {
    return `${tBot(language, 'MASTERS_SCHEDULE_CHANGES_TITLE')}\n${tBot(language, 'MASTERS_SCHEDULE_CHANGES_EMPTY')}`;
  }

  const lines = details.upcomingScheduleExceptions.map((item) =>
    formatScheduleExceptionLine(item, language),
  );
  return `${tBot(language, 'MASTERS_SCHEDULE_CHANGES_TITLE')}\n${lines.join('\n')}`;
}

/**
 * @summary Форматує текст каталогу майстрів.
 */
export function formatMastersCatalogText(
  masters: MasterCatalogItem[],
  language: BotUiLanguage,
): string {
  if (masters.length === 0) {
    return (
      `${tBot(language, 'MASTERS_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n' +
      `${tBot(language, 'MASTERS_EMPTY')}\n` +
      tBot(language, 'MASTERS_EMPTY_HINT')
    );
  }

  const lines = masters.map((master, index) => formatMasterListLine(master, index, language));
  return (
    `${tBot(language, 'MASTERS_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n' +
    `${tBot(language, 'MASTERS_SELECT')}\n\n` +
    lines.join('\n\n')
  );
}

/**
 * @summary Форматує текст детального профілю майстра.
 */
export function formatMasterDetailsText(
  details: MasterCatalogDetails,
  language: BotUiLanguage,
): string {
  const bioBlock = details.master.bio
    ? `${tBot(language, 'MASTERS_ABOUT_TITLE')}\n${details.master.bio}`
    : `${tBot(language, 'MASTERS_ABOUT_TITLE')}\n${tBot(language, 'MASTERS_ABOUT_EMPTY')}`;

  const materialsBlock = details.materialsInfo
    ? `${tBot(language, 'MASTERS_ADDITIONAL_TITLE')}\n${details.materialsInfo}`
    : `${tBot(language, 'MASTERS_ADDITIONAL_TITLE')}\n${tBot(language, 'MASTERS_ADDITIONAL_EMPTY')}`;

  return (
    `${tBot(language, 'MASTERS_PROFILE_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n' +
    `👤 ${details.master.displayName}\n` +
    `${tBot(language, 'MASTERS_RATING_LABEL')}: ${details.master.ratingAvg} (${details.master.ratingCount})\n` +
    `${tBot(language, 'MASTERS_EXPERIENCE_LABEL')}: ${details.master.experienceYears ?? tBot(language, 'PROFILE_NOT_SET')}\n` +
    `${tBot(language, 'MASTERS_PROCEDURES_LABEL')}: ${details.master.proceduresDoneTotal}\n\n` +
    `${formatSpecializationsBlock(details, language)}\n\n` +
    `${formatCertificatesBlock(details, language)}\n\n` +
    `${formatWeeklyScheduleBlock(details, language)}\n\n` +
    `${formatUpcomingScheduleExceptionsBlock(details, language)}\n\n` +
    `${bioBlock}\n\n` +
    `${materialsBlock}\n\n` +
    formatContactsBlock(details, language)
  );
}

/**
 * @summary Створює inline-клавіатуру каталогу майстрів.
 */
export function createMastersCatalogKeyboard(
  masters: MasterCatalogItem[],
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  const masterRows = masters.map((master, index) => [
    Markup.button.callback(
      `${getNumberBadge(index)} 👩‍🎨 ${master.displayName}`,
      makeMasterItemAction(master.userId),
    ),
  ]);

  return Markup.inlineKeyboard([
    ...masterRows,
    [Markup.button.callback(tBot(language, 'HOME'), COMMON_NAV_ACTION.HOME)],
  ]);
}

/**
 * @summary Створює inline-клавіатуру детальної картки майстра.
 */
export function createMasterDetailsKeyboard(
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(tBot(language, 'COMMON_BACK'), MASTERS_ACTION.BACK_TO_LIST),
      Markup.button.callback(tBot(language, 'HOME'), COMMON_NAV_ACTION.HOME),
    ],
  ]);
}
