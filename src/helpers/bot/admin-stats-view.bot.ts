import { Markup } from 'telegraf';
import {
  ADMIN_PANEL_ACTION,
  makeAdminPanelStatsClientsOpenAction,
  makeAdminPanelStatsMastersOpenAction,
  makeAdminPanelStatsMonthlyOpenAction,
  makeAdminPanelStatsServicesOpenAction,
} from '../../types/bot-admin-panel.types.js';
import type {
  AdminPanelStatsClientDetails,
  AdminPanelStatsClientsFeedPage,
  AdminPanelStatsMasterDetails,
  AdminPanelStatsMastersFeedPage,
  AdminPanelStatsMonthlyFeedPage,
  AdminPanelStatsMonthlyReportDetails,
  AdminPanelStatsOverview,
  AdminPanelStatsServiceDetails,
  AdminPanelStatsServicesFeedPage,
} from '../../types/db-helpers/db-admin-stats.types.js';
import { tBot, tBotTemplate } from './i18n.bot.js';
import type { BotUiLanguage } from './i18n.bot.js';

/**
 * @file admin-stats-view.bot.ts
 * @summary UI/helper-и для блоку "Статистика" в адмін-панелі.
 */

/**
 * uk: Внутрішня bot helper функція resolveLocale.
 * en: Internal bot helper function resolveLocale.
 * cz: Interní bot helper funkce resolveLocale.
 */
function resolveLocale(language: BotUiLanguage): string {
  if (language === 'en') return 'en-US';
  if (language === 'cs') return 'cs-CZ';
  return 'uk-UA';
}

/**
 * uk: Внутрішня bot helper функція formatMoney.
 * en: Internal bot helper function formatMoney.
 * cz: Interní bot helper funkce formatMoney.
 */
function formatMoney(value: number, currencyCode: string): string {
  const rounded = Number.isFinite(value) ? value : 0;
  const normalized = rounded.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  return `${normalized} ${currencyCode}`;
}

/**
 * uk: Внутрішня bot helper функція formatDate.
 * en: Internal bot helper function formatDate.
 * cz: Interní bot helper funkce formatDate.
 */
function formatDate(value: Date | null, language: BotUiLanguage): string {
  if (!value) return tBot(language, 'ADMIN_PANEL_STATS_LABEL_DASH');
  return new Intl.DateTimeFormat(resolveLocale(language), {
    timeZone: 'Europe/Prague',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(value);
}

/**
 * uk: Внутрішня bot helper функція formatMonthCode.
 * en: Internal bot helper function formatMonthCode.
 * cz: Interní bot helper funkce formatMonthCode.
 */
function formatMonthCode(monthCode: string, language: BotUiLanguage): string {
  const match = monthCode.match(/^(\d{4})(\d{2})$/);
  if (!match) return monthCode;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return monthCode;
  }

  const date = new Date(year, month - 1, 1);
  const monthLabel = new Intl.DateTimeFormat(resolveLocale(language), {
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Prague',
  }).format(date);

  return monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
}

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
 * uk: Публічна bot helper функція formatAdminStatsOverviewText.
 * en: Public bot helper function formatAdminStatsOverviewText.
 * cz: Veřejná bot helper funkce formatAdminStatsOverviewText.
 */
export function formatAdminStatsOverviewText(
  data: AdminPanelStatsOverview,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_STATS_OVERVIEW_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'ADMIN_PANEL_STATS_OVERVIEW_SECTION_GLOBAL')}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_MONTH', { value: formatMoney(data.grossMonth, data.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_3M', { value: formatMoney(data.gross3m, data.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_6M', { value: formatMoney(data.gross6m, data.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_YEAR', { value: formatMoney(data.grossYear, data.currencyCode) })}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_STATS_OVERVIEW_SECTION_SALON')}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_MONTH', { value: formatMoney(data.salonMonth, data.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_3M', { value: formatMoney(data.salon3m, data.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_6M', { value: formatMoney(data.salon6m, data.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_YEAR', { value: formatMoney(data.salonYear, data.currencyCode) })}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_STATS_OVERVIEW_SECTION_CURRENT_MONTH')}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_COMPLETED', { value: data.completedProceduresMonth })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_UNIQUE_CLIENTS', { value: data.uniqueClientsMonth })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_AVG_CHECK', { value: formatMoney(data.avgCheckMonth, data.currencyCode) })}\n\n` +
    tBot(language, 'ADMIN_PANEL_STATS_OVERVIEW_HINT')
  );
}

/**
 * uk: Публічна bot helper функція createAdminStatsOverviewKeyboard.
 * en: Public bot helper function createAdminStatsOverviewKeyboard.
 * cz: Veřejná bot helper funkce createAdminStatsOverviewKeyboard.
 */
export function createAdminStatsOverviewKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_MASTERS'), ADMIN_PANEL_ACTION.STATS_OPEN_MASTERS),
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_SERVICES'), ADMIN_PANEL_ACTION.STATS_OPEN_SERVICES),
    ],
    [
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_MONTHLY'), ADMIN_PANEL_ACTION.STATS_OPEN_MONTHLY),
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_CLIENTS'), ADMIN_PANEL_ACTION.STATS_OPEN_CLIENTS),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_BACK'), ADMIN_PANEL_ACTION.STATS_BACK)],
    [Markup.button.callback(tBot(language, 'HOME'), ADMIN_PANEL_ACTION.HOME)],
  ]);
}

/**
 * uk: Публічна bot helper функція formatAdminStatsMastersListText.
 * en: Public bot helper function formatAdminStatsMastersListText.
 * cz: Veřejná bot helper funkce formatAdminStatsMastersListText.
 */
export function formatAdminStatsMastersListText(
  page: AdminPanelStatsMastersFeedPage,
  language: BotUiLanguage = 'uk',
): string {
  if (page.items.length === 0) {
    return (
      `${tBot(language, 'ADMIN_PANEL_STATS_MASTERS_LIST_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      tBot(language, 'ADMIN_PANEL_STATS_MASTERS_LIST_EMPTY')
    );
  }

  const lines = page.items.map((item, index) => {
    const number = getNumberBadge(index + page.offset);
    return (
      `${number} ${item.displayName}\n` +
      `${tBotTemplate(language, 'ADMIN_PANEL_STATS_ROW_INCOME', { value: formatMoney(item.grossMonth, item.currencyCode) })}\n` +
      `${tBotTemplate(language, 'ADMIN_PANEL_STATS_ROW_SALON_SHARE', { value: formatMoney(item.salonMonth, item.currencyCode) })}\n` +
      tBotTemplate(language, 'ADMIN_PANEL_STATS_ROW_PROCEDURES_CLIENTS', {
        procedures: item.completedProceduresMonth,
        clients: item.clientsServedMonth,
      })
    );
  });

  const currentPage = Math.floor(page.offset / page.limit) + 1;
  const pagesTotal = Math.max(1, Math.ceil(page.total / page.limit));

  return (
    `${tBot(language, 'ADMIN_PANEL_STATS_MASTERS_LIST_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    lines.join('\n\n') +
    `\n\n${tBotTemplate(language, 'ADMIN_PANEL_STATS_PAGINATION', { current: currentPage, total: pagesTotal })}`
  );
}

/**
 * uk: Публічна bot helper функція createAdminStatsMastersListKeyboard.
 * en: Public bot helper function createAdminStatsMastersListKeyboard.
 * cz: Veřejná bot helper funkce createAdminStatsMastersListKeyboard.
 */
export function createAdminStatsMastersListKeyboard(
  page: AdminPanelStatsMastersFeedPage,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const masterButtons = page.items.map((item, index) => [
    Markup.button.callback(
      `${getNumberBadge(index + page.offset)} ${item.displayName}`,
      makeAdminPanelStatsMastersOpenAction(item.masterId),
    ),
  ]);

  const pagingRow = [];
  if (page.hasPrevPage) {
    pagingRow.push(Markup.button.callback(tBot(language, 'ADMIN_PANEL_BTN_PREV'), ADMIN_PANEL_ACTION.STATS_MASTERS_PREV_PAGE));
  }
  if (page.hasNextPage) {
    pagingRow.push(Markup.button.callback(tBot(language, 'ADMIN_PANEL_BTN_NEXT'), ADMIN_PANEL_ACTION.STATS_MASTERS_NEXT_PAGE));
  }

  return Markup.inlineKeyboard([
    ...masterButtons,
    ...(pagingRow.length > 0 ? [pagingRow] : []),
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_BACK_TO_OVERVIEW'), ADMIN_PANEL_ACTION.STATS_BACK_TO_OVERVIEW)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_BACK'), ADMIN_PANEL_ACTION.STATS_BACK)],
  ]);
}

/**
 * uk: Публічна bot helper функція formatAdminStatsMasterDetailsText.
 * en: Public bot helper function formatAdminStatsMasterDetailsText.
 * cz: Veřejná bot helper funkce formatAdminStatsMasterDetailsText.
 */
export function formatAdminStatsMasterDetailsText(
  details: AdminPanelStatsMasterDetails,
  language: BotUiLanguage = 'uk',
): string {
  const topServices =
    details.topServices.length > 0
      ? details.topServices
          .map((item, index) => `${getNumberBadge(index)} ${item.serviceName} — ${item.completedCount}`)
          .join('\n')
      : tBot(language, 'ADMIN_PANEL_STATS_NO_DATA');

  return (
    `${tBot(language, 'ADMIN_PANEL_STATS_MASTER_DETAILS_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MASTER_DETAILS_NAME', { value: details.displayName })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_LABEL_ID_ROW', { value: details.masterId })}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_STATS_SECTION_FINANCE')}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_MONTH', { value: formatMoney(details.grossMonth, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_3M', { value: formatMoney(details.gross3m, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_6M', { value: formatMoney(details.gross6m, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_YEAR', { value: formatMoney(details.grossYear, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MASTER_DETAILS_SALON_MONTH', { value: formatMoney(details.salonMonth, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MASTER_DETAILS_AVG_CHECK', { value: formatMoney(details.avgCheck, details.currencyCode) })}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_STATS_SECTION_ACTIVITY')}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MASTER_DETAILS_COMPLETED', { value: details.completedProceduresMonth })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MASTER_DETAILS_CLIENTS', { value: details.clientsServedMonth })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MASTER_DETAILS_WORKLOAD', { value: details.workloadPercentMonth })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MASTER_DETAILS_REPEAT', { value: details.repeatClientsPercentMonth })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MASTER_DETAILS_NEW_CLIENTS', { value: details.newClientsMonth })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MASTER_DETAILS_WEEK', { value: details.bookingsThisWeek })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MASTER_DETAILS_TODAY', { value: details.bookingsToday })}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_STATS_MASTER_DETAILS_TOP_SERVICES')}\n` +
    `${topServices}\n\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MASTER_DETAILS_BEST_SERVICE', { value: details.bestServiceName ?? tBot(language, 'ADMIN_PANEL_STATS_LABEL_DASH') })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MASTER_DETAILS_BEST_SERVICE_AMOUNT', { value: formatMoney(details.bestServiceAmount, details.currencyCode) })}\n` +
    tBotTemplate(language, 'ADMIN_PANEL_STATS_MASTER_DETAILS_BEST_MONTH', {
      month: formatDate(details.bestMonthStart, language),
      value: formatMoney(details.bestMonthAmount, details.currencyCode),
    })
  );
}

/**
 * uk: Публічна bot helper функція createAdminStatsMasterDetailsKeyboard.
 * en: Public bot helper function createAdminStatsMasterDetailsKeyboard.
 * cz: Veřejná bot helper funkce createAdminStatsMasterDetailsKeyboard.
 */
export function createAdminStatsMasterDetailsKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_MASTERS_BACK_TO_LIST'), ADMIN_PANEL_ACTION.STATS_MASTERS_BACK_TO_LIST)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_BACK_TO_OVERVIEW'), ADMIN_PANEL_ACTION.STATS_BACK_TO_OVERVIEW)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_BACK'), ADMIN_PANEL_ACTION.STATS_BACK)],
  ]);
}

/**
 * uk: Публічна bot helper функція formatAdminStatsServicesListText.
 * en: Public bot helper function formatAdminStatsServicesListText.
 * cz: Veřejná bot helper funkce formatAdminStatsServicesListText.
 */
export function formatAdminStatsServicesListText(
  page: AdminPanelStatsServicesFeedPage,
  language: BotUiLanguage = 'uk',
): string {
  if (page.items.length === 0) {
    return (
      `${tBot(language, 'ADMIN_PANEL_STATS_SERVICES_LIST_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      tBot(language, 'ADMIN_PANEL_STATS_SERVICES_LIST_EMPTY')
    );
  }

  const lines = page.items.map((item, index) => {
    const number = getNumberBadge(index + page.offset);
    return (
      `${number} ${item.serviceName}\n` +
      `${tBotTemplate(language, 'ADMIN_PANEL_STATS_ROW_INCOME', { value: formatMoney(item.grossMonth, item.currencyCode) })}\n` +
      `${tBotTemplate(language, 'ADMIN_PANEL_STATS_ROW_SALON_SHARE', { value: formatMoney(item.salonMonth, item.currencyCode) })}\n` +
      tBotTemplate(language, 'ADMIN_PANEL_STATS_ROW_PROCEDURES_CLIENTS', {
        procedures: item.completedProceduresMonth,
        clients: item.clientsServedMonth,
      })
    );
  });

  const currentPage = Math.floor(page.offset / page.limit) + 1;
  const pagesTotal = Math.max(1, Math.ceil(page.total / page.limit));

  return (
    `${tBot(language, 'ADMIN_PANEL_STATS_SERVICES_LIST_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    lines.join('\n\n') +
    `\n\n${tBotTemplate(language, 'ADMIN_PANEL_STATS_PAGINATION', { current: currentPage, total: pagesTotal })}`
  );
}

/**
 * uk: Публічна bot helper функція createAdminStatsServicesListKeyboard.
 * en: Public bot helper function createAdminStatsServicesListKeyboard.
 * cz: Veřejná bot helper funkce createAdminStatsServicesListKeyboard.
 */
export function createAdminStatsServicesListKeyboard(
  page: AdminPanelStatsServicesFeedPage,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const serviceButtons = page.items.map((item, index) => [
    Markup.button.callback(
      `${getNumberBadge(index + page.offset)} ${item.serviceName}`,
      makeAdminPanelStatsServicesOpenAction(item.serviceId),
    ),
  ]);

  const pagingRow = [];
  if (page.hasPrevPage) {
    pagingRow.push(Markup.button.callback(tBot(language, 'ADMIN_PANEL_BTN_PREV'), ADMIN_PANEL_ACTION.STATS_SERVICES_PREV_PAGE));
  }
  if (page.hasNextPage) {
    pagingRow.push(Markup.button.callback(tBot(language, 'ADMIN_PANEL_BTN_NEXT'), ADMIN_PANEL_ACTION.STATS_SERVICES_NEXT_PAGE));
  }

  return Markup.inlineKeyboard([
    ...serviceButtons,
    ...(pagingRow.length > 0 ? [pagingRow] : []),
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_BACK_TO_OVERVIEW'), ADMIN_PANEL_ACTION.STATS_BACK_TO_OVERVIEW)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_BACK'), ADMIN_PANEL_ACTION.STATS_BACK)],
  ]);
}

/**
 * uk: Публічна bot helper функція formatAdminStatsServiceDetailsText.
 * en: Public bot helper function formatAdminStatsServiceDetailsText.
 * cz: Veřejná bot helper funkce formatAdminStatsServiceDetailsText.
 */
export function formatAdminStatsServiceDetailsText(
  details: AdminPanelStatsServiceDetails,
  language: BotUiLanguage = 'uk',
): string {
  const topMasters =
    details.topMasters.length > 0
      ? details.topMasters
          .map((item, index) => `${getNumberBadge(index)} ${item.displayName} — ${item.completedCount}`)
          .join('\n')
      : tBot(language, 'ADMIN_PANEL_STATS_NO_DATA');

  return (
    `${tBot(language, 'ADMIN_PANEL_STATS_SERVICE_DETAILS_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_SERVICE_DETAILS_NAME', { value: details.serviceName })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_LABEL_ID_ROW', { value: details.serviceId })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_SERVICE_DETAILS_DURATION', { value: details.durationMinutes })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_SERVICE_DETAILS_BASE_PRICE', { value: formatMoney(details.basePrice, details.currencyCode) })}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_STATS_SECTION_FINANCE')}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_MONTH', { value: formatMoney(details.grossMonth, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_3M', { value: formatMoney(details.gross3m, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_6M', { value: formatMoney(details.gross6m, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_YEAR', { value: formatMoney(details.grossYear, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MASTER_DETAILS_SALON_MONTH', { value: formatMoney(details.salonMonth, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_SERVICE_DETAILS_AVG_CHECK_MONTH', { value: formatMoney(details.avgCheckMonth, details.currencyCode) })}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_STATS_OVERVIEW_SECTION_CURRENT_MONTH')}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MASTER_DETAILS_COMPLETED', { value: details.completedProceduresMonth })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_UNIQUE_CLIENTS', { value: details.clientsServedMonth })}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_STATS_SERVICE_DETAILS_TOP_MASTERS')}\n` +
    `${topMasters}`
  );
}

/**
 * uk: Публічна bot helper функція createAdminStatsServiceDetailsKeyboard.
 * en: Public bot helper function createAdminStatsServiceDetailsKeyboard.
 * cz: Veřejná bot helper funkce createAdminStatsServiceDetailsKeyboard.
 */
export function createAdminStatsServiceDetailsKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_SERVICES_BACK_TO_LIST'), ADMIN_PANEL_ACTION.STATS_SERVICES_BACK_TO_LIST)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_BACK_TO_OVERVIEW'), ADMIN_PANEL_ACTION.STATS_BACK_TO_OVERVIEW)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_BACK'), ADMIN_PANEL_ACTION.STATS_BACK)],
  ]);
}

/**
 * uk: Публічна bot helper функція formatAdminStatsMonthlyListText.
 * en: Public bot helper function formatAdminStatsMonthlyListText.
 * cz: Veřejná bot helper funkce formatAdminStatsMonthlyListText.
 */
export function formatAdminStatsMonthlyListText(
  page: AdminPanelStatsMonthlyFeedPage,
  language: BotUiLanguage = 'uk',
): string {
  if (page.items.length === 0) {
    return (
      `${tBot(language, 'ADMIN_PANEL_STATS_MONTHLY_LIST_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      tBot(language, 'ADMIN_PANEL_STATS_MONTHLY_LIST_EMPTY')
    );
  }

  const lines = page.items.map((item, index) => {
    const number = getNumberBadge(index + page.offset);
    return (
      `${number} 📅 ${formatMonthCode(item.monthCode, language)}\n` +
      `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MONTHLY_LIST_GROSS', { value: formatMoney(item.grossMonth, item.currencyCode) })}\n` +
      `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MONTHLY_LIST_SALON', { value: formatMoney(item.salonMonth, item.currencyCode) })}\n` +
      `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MONTHLY_LIST_PROCEDURES', { value: item.completedProceduresMonth })}`
    );
  });

  const currentPage = Math.floor(page.offset / page.limit) + 1;
  const pagesTotal = Math.max(1, Math.ceil(page.total / page.limit));

  return (
    `${tBot(language, 'ADMIN_PANEL_STATS_MONTHLY_LIST_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    lines.join('\n\n') +
    `\n\n${tBotTemplate(language, 'ADMIN_PANEL_STATS_PAGINATION', { current: currentPage, total: pagesTotal })}`
  );
}

/**
 * uk: Публічна bot helper функція createAdminStatsMonthlyListKeyboard.
 * en: Public bot helper function createAdminStatsMonthlyListKeyboard.
 * cz: Veřejná bot helper funkce createAdminStatsMonthlyListKeyboard.
 */
export function createAdminStatsMonthlyListKeyboard(
  page: AdminPanelStatsMonthlyFeedPage,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const monthButtons = page.items.map((item, index) => [
    Markup.button.callback(
      `${getNumberBadge(index + page.offset)} ${formatMonthCode(item.monthCode, language)}`,
      makeAdminPanelStatsMonthlyOpenAction(item.monthCode),
    ),
  ]);

  const pagingRow = [];
  if (page.hasPrevPage) {
    pagingRow.push(Markup.button.callback(tBot(language, 'ADMIN_PANEL_BTN_PREV'), ADMIN_PANEL_ACTION.STATS_MONTHLY_PREV_PAGE));
  }
  if (page.hasNextPage) {
    pagingRow.push(Markup.button.callback(tBot(language, 'ADMIN_PANEL_BTN_NEXT'), ADMIN_PANEL_ACTION.STATS_MONTHLY_NEXT_PAGE));
  }

  return Markup.inlineKeyboard([
    ...monthButtons,
    ...(pagingRow.length > 0 ? [pagingRow] : []),
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_BACK_TO_OVERVIEW'), ADMIN_PANEL_ACTION.STATS_BACK_TO_OVERVIEW)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_BACK'), ADMIN_PANEL_ACTION.STATS_BACK)],
  ]);
}

/**
 * uk: Публічна bot helper функція formatAdminStatsMonthlyReportDetailsText.
 * en: Public bot helper function formatAdminStatsMonthlyReportDetailsText.
 * cz: Veřejná bot helper funkce formatAdminStatsMonthlyReportDetailsText.
 */
export function formatAdminStatsMonthlyReportDetailsText(
  details: AdminPanelStatsMonthlyReportDetails,
  language: BotUiLanguage = 'uk',
): string {
  const topServices =
    details.topServices.length > 0
      ? details.topServices
          .map((item, index) => `${getNumberBadge(index)} ${item.serviceName} — ${formatMoney(item.grossAmount, details.currencyCode)}`)
          .join('\n')
      : tBot(language, 'ADMIN_PANEL_STATS_NO_DATA');

  const topMasters =
    details.topMasters.length > 0
      ? details.topMasters
          .map((item, index) => `${getNumberBadge(index)} ${item.displayName} — ${formatMoney(item.grossAmount, details.currencyCode)}`)
          .join('\n')
      : tBot(language, 'ADMIN_PANEL_STATS_NO_DATA');

  return (
    `${tBot(language, 'ADMIN_PANEL_STATS_MONTHLY_DETAILS_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MONTHLY_DETAILS_PERIOD', { value: formatMonthCode(details.monthCode, language) })}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_STATS_MONTHLY_DETAILS_MAIN')}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MONTHLY_LIST_GROSS', { value: formatMoney(details.grossMonth, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MONTHLY_DETAILS_SALON_15', { value: formatMoney(details.salonMonth, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MONTHLY_DETAILS_MASTER_EARNINGS', { value: formatMoney(details.masterEarningsMonth, details.currencyCode) })}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_STATS_MONTHLY_DETAILS_ADDITIONAL')}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MONTHLY_LIST_PROCEDURES', { value: details.completedProceduresMonth })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MONTHLY_DETAILS_CLIENTS', { value: details.clientsCountMonth })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_AVG_CHECK', { value: formatMoney(details.avgCheckMonth, details.currencyCode) })}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_STATS_MONTHLY_DETAILS_TOP_SERVICES')}\n` +
    `${topServices}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_STATS_MONTHLY_DETAILS_TOP_MASTERS')}\n` +
    `${topMasters}`
  );
}

/**
 * uk: Публічна bot helper функція createAdminStatsMonthlyReportDetailsKeyboard.
 * en: Public bot helper function createAdminStatsMonthlyReportDetailsKeyboard.
 * cz: Veřejná bot helper funkce createAdminStatsMonthlyReportDetailsKeyboard.
 */
export function createAdminStatsMonthlyReportDetailsKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_MONTHLY_BACK_TO_LIST'), ADMIN_PANEL_ACTION.STATS_MONTHLY_BACK_TO_LIST)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_BACK_TO_OVERVIEW'), ADMIN_PANEL_ACTION.STATS_BACK_TO_OVERVIEW)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_BACK'), ADMIN_PANEL_ACTION.STATS_BACK)],
  ]);
}

/**
 * uk: Публічна bot helper функція formatAdminStatsClientsListText.
 * en: Public bot helper function formatAdminStatsClientsListText.
 * cz: Veřejná bot helper funkce formatAdminStatsClientsListText.
 */
export function formatAdminStatsClientsListText(
  page: AdminPanelStatsClientsFeedPage,
  language: BotUiLanguage = 'uk',
): string {
  if (page.items.length === 0) {
    return (
      `${tBot(language, 'ADMIN_PANEL_STATS_CLIENTS_LIST_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      tBot(language, 'ADMIN_PANEL_STATS_CLIENTS_LIST_EMPTY')
    );
  }

  const lines = page.items.map((item, index) => {
    const number = getNumberBadge(index + page.offset);
    return (
      `${number} 👤 ${item.fullName}\n` +
      `${tBotTemplate(language, 'ADMIN_PANEL_STATS_CLIENTS_LIST_SPENT', { value: formatMoney(item.spentTotal, item.currencyCode) })}\n` +
      `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MONTHLY_LIST_PROCEDURES', { value: item.proceduresTotal })}\n` +
      `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_AVG_CHECK', { value: formatMoney(item.avgCheck, item.currencyCode) })}`
    );
  });

  const currentPage = Math.floor(page.offset / page.limit) + 1;
  const pagesTotal = Math.max(1, Math.ceil(page.total / page.limit));

  return (
    `${tBot(language, 'ADMIN_PANEL_STATS_CLIENTS_LIST_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    lines.join('\n\n') +
    `\n\n${tBotTemplate(language, 'ADMIN_PANEL_STATS_PAGINATION', { current: currentPage, total: pagesTotal })}`
  );
}

/**
 * uk: Публічна bot helper функція createAdminStatsClientsListKeyboard.
 * en: Public bot helper function createAdminStatsClientsListKeyboard.
 * cz: Veřejná bot helper funkce createAdminStatsClientsListKeyboard.
 */
export function createAdminStatsClientsListKeyboard(
  page: AdminPanelStatsClientsFeedPage,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const clientButtons = page.items.map((item, index) => [
    Markup.button.callback(
      `${getNumberBadge(index + page.offset)} ${item.fullName}`,
      makeAdminPanelStatsClientsOpenAction(item.clientId),
    ),
  ]);

  const pagingRow = [];
  if (page.hasPrevPage) {
    pagingRow.push(Markup.button.callback(tBot(language, 'ADMIN_PANEL_BTN_PREV'), ADMIN_PANEL_ACTION.STATS_CLIENTS_PREV_PAGE));
  }
  if (page.hasNextPage) {
    pagingRow.push(Markup.button.callback(tBot(language, 'ADMIN_PANEL_BTN_NEXT'), ADMIN_PANEL_ACTION.STATS_CLIENTS_NEXT_PAGE));
  }

  return Markup.inlineKeyboard([
    ...clientButtons,
    ...(pagingRow.length > 0 ? [pagingRow] : []),
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_BACK_TO_OVERVIEW'), ADMIN_PANEL_ACTION.STATS_BACK_TO_OVERVIEW)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_BACK'), ADMIN_PANEL_ACTION.STATS_BACK)],
  ]);
}

/**
 * uk: Публічна bot helper функція formatAdminStatsClientDetailsText.
 * en: Public bot helper function formatAdminStatsClientDetailsText.
 * cz: Veřejná bot helper funkce formatAdminStatsClientDetailsText.
 */
export function formatAdminStatsClientDetailsText(
  details: AdminPanelStatsClientDetails,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_STATS_CLIENT_DETAILS_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_CLIENT_DETAILS_NAME', { value: details.fullName })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_LABEL_ID_ROW', { value: details.clientId })}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_STATS_CLIENT_DETAILS_SECTION_SPENT')}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_MONTH', { value: formatMoney(details.spentMonth, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_3M', { value: formatMoney(details.spent3m, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_6M', { value: formatMoney(details.spent6m, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_YEAR', { value: formatMoney(details.spentYear, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_CLIENT_DETAILS_TOTAL', { value: formatMoney(details.spentTotal, details.currencyCode) })}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_STATS_CLIENT_DETAILS_SECTION_SALON')}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_MONTH', { value: formatMoney(details.salonMonth, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_3M', { value: formatMoney(details.salon3m, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_6M', { value: formatMoney(details.salon6m, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_YEAR', { value: formatMoney(details.salonYear, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_CLIENT_DETAILS_TOTAL', { value: formatMoney(details.salonTotal, details.currencyCode) })}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_STATS_MONTHLY_DETAILS_ADDITIONAL')}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_OVERVIEW_ROW_AVG_CHECK', { value: formatMoney(details.avgCheck, details.currencyCode) })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_MONTHLY_LIST_PROCEDURES', { value: details.proceduresTotal })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_CLIENT_DETAILS_MOST_EXPENSIVE_NAME', {
      value: details.mostExpensiveServiceName ?? tBot(language, 'ADMIN_PANEL_STATS_LABEL_DASH'),
    })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_CLIENT_DETAILS_MOST_EXPENSIVE_AMOUNT', {
      value: formatMoney(details.mostExpensiveServiceAmount, details.currencyCode),
    })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_STATS_CLIENT_DETAILS_LAST_VISIT', {
      value: formatDate(details.lastVisitAt, language),
    })}`
  );
}

/**
 * uk: Публічна bot helper функція createAdminStatsClientDetailsKeyboard.
 * en: Public bot helper function createAdminStatsClientDetailsKeyboard.
 * cz: Veřejná bot helper funkce createAdminStatsClientDetailsKeyboard.
 */
export function createAdminStatsClientDetailsKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_CLIENTS_BACK_TO_LIST'), ADMIN_PANEL_ACTION.STATS_CLIENTS_BACK_TO_LIST)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_BACK_TO_OVERVIEW'), ADMIN_PANEL_ACTION.STATS_BACK_TO_OVERVIEW)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_BACK'), ADMIN_PANEL_ACTION.STATS_BACK)],
  ]);
}

/**
 * uk: Публічна bot helper функція formatAdminStatsSectionStubText.
 * en: Public bot helper function formatAdminStatsSectionStubText.
 * cz: Veřejná bot helper funkce formatAdminStatsSectionStubText.
 */
export function formatAdminStatsSectionStubText(
  title: string,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${title}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'ADMIN_PANEL_STATS_SECTION_STUB_TEXT')}`
  );
}

/**
 * uk: Публічна bot helper функція createAdminStatsSectionStubKeyboard.
 * en: Public bot helper function createAdminStatsSectionStubKeyboard.
 * cz: Veřejná bot helper funkce createAdminStatsSectionStubKeyboard.
 */
export function createAdminStatsSectionStubKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_BACK_TO_OVERVIEW'), ADMIN_PANEL_ACTION.STATS_BACK_TO_OVERVIEW)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_STATS_BTN_BACK'), ADMIN_PANEL_ACTION.STATS_BACK)],
  ]);
}
