import { Markup } from 'telegraf';
import {
  ADMIN_PANEL_ACTION,
  ADMIN_PANEL_BUTTON_TEXT,
  makeAdminPanelStatsMastersOpenAction,
  makeAdminPanelStatsMonthlyOpenAction,
  makeAdminPanelStatsServicesOpenAction,
} from '../../types/bot-admin-panel.types.js';
import type {
  AdminPanelStatsMasterDetails,
  AdminPanelStatsMastersFeedPage,
  AdminPanelStatsMonthlyFeedPage,
  AdminPanelStatsMonthlyReportDetails,
  AdminPanelStatsOverview,
  AdminPanelStatsServiceDetails,
  AdminPanelStatsServicesFeedPage,
} from '../../types/db-helpers/db-admin-stats.types.js';

/**
 * @file admin-stats-view.bot.ts
 * @summary UI/helper-и для блоку "Статистика" в адмін-панелі.
 */

function formatMoney(value: number, currencyCode: string): string {
  const rounded = Number.isFinite(value) ? value : 0;
  const normalized = rounded.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  return `${normalized} ${currencyCode}`;
}

function formatDate(value: Date | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('uk-UA', {
    timeZone: 'Europe/Prague',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(value);
}

function formatMonthCode(monthCode: string): string {
  const match = monthCode.match(/^(\d{4})(\d{2})$/);
  if (!match) return monthCode;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return monthCode;
  }

  const date = new Date(year, month - 1, 1);
  const monthLabel = new Intl.DateTimeFormat('uk-UA', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Prague',
  }).format(date);

  return monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
}

const NUMBER_BADGES = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

function getNumberBadge(index: number): string {
  return NUMBER_BADGES[index] ?? `${index + 1}.`;
}

/**
 * @summary Форматує оглядову статистику салону.
 */
export function formatAdminStatsOverviewText(data: AdminPanelStatsOverview): string {
  return (
    '📊 Статистика салону\n' +
    '━━━━━━━━━━━━━━\n\n' +
    '💵 Глобальний дохід\n' +
    `📅 За місяць: ${formatMoney(data.grossMonth, data.currencyCode)}\n` +
    `📅 За 3 місяці: ${formatMoney(data.gross3m, data.currencyCode)}\n` +
    `📅 За пів року: ${formatMoney(data.gross6m, data.currencyCode)}\n` +
    `📅 За рік: ${formatMoney(data.grossYear, data.currencyCode)}\n\n` +
    '🏢 Дохід салону (15%)\n' +
    `📅 За місяць: ${formatMoney(data.salonMonth, data.currencyCode)}\n` +
    `📅 За 3 місяці: ${formatMoney(data.salon3m, data.currencyCode)}\n` +
    `📅 За пів року: ${formatMoney(data.salon6m, data.currencyCode)}\n` +
    `📅 За рік: ${formatMoney(data.salonYear, data.currencyCode)}\n\n` +
    '📈 Поточний місяць\n' +
    `📋 Завершено процедур: ${data.completedProceduresMonth}\n` +
    `👥 Унікальних клієнтів: ${data.uniqueClientsMonth}\n` +
    `💳 Середній чек: ${formatMoney(data.avgCheckMonth, data.currencyCode)}\n\n` +
    'Оберіть розділ для детального перегляду.'
  );
}

/**
 * @summary Клавіатура оглядової статистики.
 */
export function createAdminStatsOverviewKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_MASTERS, ADMIN_PANEL_ACTION.STATS_OPEN_MASTERS),
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_SERVICES, ADMIN_PANEL_ACTION.STATS_OPEN_SERVICES),
    ],
    [
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_MONTHLY, ADMIN_PANEL_ACTION.STATS_OPEN_MONTHLY),
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_CLIENTS, ADMIN_PANEL_ACTION.STATS_OPEN_CLIENTS),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_BACK, ADMIN_PANEL_ACTION.STATS_BACK)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.HOME, ADMIN_PANEL_ACTION.HOME)],
  ]);
}

/**
 * @summary Текст списку статистики майстрів.
 */
export function formatAdminStatsMastersListText(page: AdminPanelStatsMastersFeedPage): string {
  if (page.items.length === 0) {
    return (
      '👩‍🎨 Статистика майстрів\n' +
      '━━━━━━━━━━━━━━\n\n' +
      'За поточний місяць даних поки немає.'
    );
  }

  const lines = page.items.map((item, index) => {
    const number = getNumberBadge(index + page.offset);
    return (
      `${number} ${item.displayName}\n` +
      `💰 Дохід: ${formatMoney(item.grossMonth, item.currencyCode)}\n` +
      `🏢 Частка салону: ${formatMoney(item.salonMonth, item.currencyCode)}\n` +
      `📋 Процедур: ${item.completedProceduresMonth} • 👥 Клієнтів: ${item.clientsServedMonth}`
    );
  });

  const currentPage = Math.floor(page.offset / page.limit) + 1;
  const pagesTotal = Math.max(1, Math.ceil(page.total / page.limit));

  return (
    '👩‍🎨 Статистика майстрів\n' +
    '━━━━━━━━━━━━━━\n\n' +
    lines.join('\n\n') +
    `\n\n📄 Сторінка ${currentPage} з ${pagesTotal}`
  );
}

/**
 * @summary Клавіатура списку статистики майстрів.
 */
export function createAdminStatsMastersListKeyboard(
  page: AdminPanelStatsMastersFeedPage,
): ReturnType<typeof Markup.inlineKeyboard> {
  const masterButtons = page.items.map((item, index) => [
    Markup.button.callback(
      `${getNumberBadge(index + page.offset)} ${item.displayName}`,
      makeAdminPanelStatsMastersOpenAction(item.masterId),
    ),
  ]);

  const pagingRow = [];
  if (page.hasPrevPage) {
    pagingRow.push(
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_PREV_PAGE, ADMIN_PANEL_ACTION.STATS_MASTERS_PREV_PAGE),
    );
  }
  if (page.hasNextPage) {
    pagingRow.push(
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_NEXT_PAGE, ADMIN_PANEL_ACTION.STATS_MASTERS_NEXT_PAGE),
    );
  }

  return Markup.inlineKeyboard([
    ...masterButtons,
    ...(pagingRow.length > 0 ? [pagingRow] : []),
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_BACK_TO_OVERVIEW, ADMIN_PANEL_ACTION.STATS_BACK_TO_OVERVIEW)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_BACK, ADMIN_PANEL_ACTION.STATS_BACK)],
  ]);
}

/**
 * @summary Текст детальної статистики конкретного майстра.
 */
export function formatAdminStatsMasterDetailsText(
  details: AdminPanelStatsMasterDetails,
): string {
  const topServices =
    details.topServices.length > 0
      ? details.topServices
          .map((item, index) => `${getNumberBadge(index)} ${item.serviceName} — ${item.completedCount}`)
          .join('\n')
      : 'Немає даних';

  return (
    '👩‍🎨 Деталі статистики майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👤 ${details.displayName}\n` +
    `🪪 ID: ${details.masterId}\n\n` +
    '💰 Фінанси\n' +
    `📅 Місяць: ${formatMoney(details.grossMonth, details.currencyCode)}\n` +
    `📅 3 місяці: ${formatMoney(details.gross3m, details.currencyCode)}\n` +
    `📅 Пів року: ${formatMoney(details.gross6m, details.currencyCode)}\n` +
    `📅 Рік: ${formatMoney(details.grossYear, details.currencyCode)}\n` +
    `🏢 Частка салону (місяць): ${formatMoney(details.salonMonth, details.currencyCode)}\n` +
    `💳 Середній чек: ${formatMoney(details.avgCheck, details.currencyCode)}\n\n` +
    '📈 Активність (поточний місяць)\n' +
    `📋 Завершено процедур: ${details.completedProceduresMonth}\n` +
    `👥 Клієнтів: ${details.clientsServedMonth}\n` +
    `📊 Завантаженість: ${details.workloadPercentMonth}%\n` +
    `🔁 Повторні клієнти: ${details.repeatClientsPercentMonth}%\n` +
    `🆕 Нові клієнти: ${details.newClientsMonth}\n` +
    `📅 Записів цього тижня: ${details.bookingsThisWeek}\n` +
    `📅 Записів сьогодні: ${details.bookingsToday}\n\n` +
    '💼 ТОП послуги (місяць)\n' +
    `${topServices}\n\n` +
    `🏆 Найприбутковіша послуга: ${details.bestServiceName ?? '—'}\n` +
    `💸 Дохід по ній: ${formatMoney(details.bestServiceAmount, details.currencyCode)}\n` +
    `📅 Найкращий місяць: ${formatDate(details.bestMonthStart)} (${formatMoney(details.bestMonthAmount, details.currencyCode)})`
  );
}

/**
 * @summary Клавіатура детальної статистики майстра.
 */
export function createAdminStatsMasterDetailsKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_MASTERS_BACK_TO_LIST, ADMIN_PANEL_ACTION.STATS_MASTERS_BACK_TO_LIST)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_BACK_TO_OVERVIEW, ADMIN_PANEL_ACTION.STATS_BACK_TO_OVERVIEW)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_BACK, ADMIN_PANEL_ACTION.STATS_BACK)],
  ]);
}

/**
 * @summary Текст списку статистики послуг.
 */
export function formatAdminStatsServicesListText(page: AdminPanelStatsServicesFeedPage): string {
  if (page.items.length === 0) {
    return (
      '💼 Статистика послуг\n' +
      '━━━━━━━━━━━━━━\n\n' +
      'За поточний місяць активних даних поки немає.'
    );
  }

  const lines = page.items.map((item, index) => {
    const number = getNumberBadge(index + page.offset);
    return (
      `${number} ${item.serviceName}\n` +
      `💰 Дохід: ${formatMoney(item.grossMonth, item.currencyCode)}\n` +
      `🏢 Частка салону: ${formatMoney(item.salonMonth, item.currencyCode)}\n` +
      `📋 Процедур: ${item.completedProceduresMonth} • 👥 Клієнтів: ${item.clientsServedMonth}`
    );
  });

  const currentPage = Math.floor(page.offset / page.limit) + 1;
  const pagesTotal = Math.max(1, Math.ceil(page.total / page.limit));

  return (
    '💼 Статистика послуг\n' +
    '━━━━━━━━━━━━━━\n\n' +
    lines.join('\n\n') +
    `\n\n📄 Сторінка ${currentPage} з ${pagesTotal}`
  );
}

/**
 * @summary Клавіатура списку статистики послуг.
 */
export function createAdminStatsServicesListKeyboard(
  page: AdminPanelStatsServicesFeedPage,
): ReturnType<typeof Markup.inlineKeyboard> {
  const serviceButtons = page.items.map((item, index) => [
    Markup.button.callback(
      `${getNumberBadge(index + page.offset)} ${item.serviceName}`,
      makeAdminPanelStatsServicesOpenAction(item.serviceId),
    ),
  ]);

  const pagingRow = [];
  if (page.hasPrevPage) {
    pagingRow.push(
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_PREV_PAGE, ADMIN_PANEL_ACTION.STATS_SERVICES_PREV_PAGE),
    );
  }
  if (page.hasNextPage) {
    pagingRow.push(
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_NEXT_PAGE, ADMIN_PANEL_ACTION.STATS_SERVICES_NEXT_PAGE),
    );
  }

  return Markup.inlineKeyboard([
    ...serviceButtons,
    ...(pagingRow.length > 0 ? [pagingRow] : []),
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_BACK_TO_OVERVIEW, ADMIN_PANEL_ACTION.STATS_BACK_TO_OVERVIEW)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_BACK, ADMIN_PANEL_ACTION.STATS_BACK)],
  ]);
}

/**
 * @summary Текст детальної статистики конкретної послуги.
 */
export function formatAdminStatsServiceDetailsText(
  details: AdminPanelStatsServiceDetails,
): string {
  const topMasters =
    details.topMasters.length > 0
      ? details.topMasters
          .map((item, index) => `${getNumberBadge(index)} ${item.displayName} — ${item.completedCount}`)
          .join('\n')
      : 'Немає даних';

  return (
    '💼 Деталі статистики послуги\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `🧾 Назва: ${details.serviceName}\n` +
    `🪪 ID: ${details.serviceId}\n` +
    `⏱ Тривалість: ${details.durationMinutes} хв\n` +
    `💵 Базова ціна: ${formatMoney(details.basePrice, details.currencyCode)}\n\n` +
    '💰 Фінанси\n' +
    `📅 Місяць: ${formatMoney(details.grossMonth, details.currencyCode)}\n` +
    `📅 3 місяці: ${formatMoney(details.gross3m, details.currencyCode)}\n` +
    `📅 Пів року: ${formatMoney(details.gross6m, details.currencyCode)}\n` +
    `📅 Рік: ${formatMoney(details.grossYear, details.currencyCode)}\n` +
    `🏢 Частка салону (місяць): ${formatMoney(details.salonMonth, details.currencyCode)}\n` +
    `💳 Середній чек (місяць): ${formatMoney(details.avgCheckMonth, details.currencyCode)}\n\n` +
    '📈 Поточний місяць\n' +
    `📋 Завершено процедур: ${details.completedProceduresMonth}\n` +
    `👥 Унікальних клієнтів: ${details.clientsServedMonth}\n\n` +
    '👩‍🎨 Топ майстри по послузі\n' +
    `${topMasters}`
  );
}

/**
 * @summary Клавіатура детальної статистики послуги.
 */
export function createAdminStatsServiceDetailsKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_SERVICES_BACK_TO_LIST, ADMIN_PANEL_ACTION.STATS_SERVICES_BACK_TO_LIST)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_BACK_TO_OVERVIEW, ADMIN_PANEL_ACTION.STATS_BACK_TO_OVERVIEW)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_BACK, ADMIN_PANEL_ACTION.STATS_BACK)],
  ]);
}

/**
 * @summary Текст списку місячних звітів.
 */
export function formatAdminStatsMonthlyListText(page: AdminPanelStatsMonthlyFeedPage): string {
  if (page.items.length === 0) {
    return (
      '📅 Місячні звіти\n' +
      '━━━━━━━━━━━━━━\n\n' +
      'Поки що немає завершених даних по місяцях.'
    );
  }

  const lines = page.items.map((item, index) => {
    const number = getNumberBadge(index + page.offset);
    return (
      `${number} 📅 ${formatMonthCode(item.monthCode)}\n` +
      `💰 Глобальний дохід: ${formatMoney(item.grossMonth, item.currencyCode)}\n` +
      `🏢 Дохід салону: ${formatMoney(item.salonMonth, item.currencyCode)}\n` +
      `📋 Кількість процедур: ${item.completedProceduresMonth}`
    );
  });

  const currentPage = Math.floor(page.offset / page.limit) + 1;
  const pagesTotal = Math.max(1, Math.ceil(page.total / page.limit));

  return (
    '📅 Місячні звіти\n' +
    '━━━━━━━━━━━━━━\n\n' +
    lines.join('\n\n') +
    `\n\n📄 Сторінка ${currentPage} з ${pagesTotal}`
  );
}

/**
 * @summary Клавіатура списку місячних звітів.
 */
export function createAdminStatsMonthlyListKeyboard(
  page: AdminPanelStatsMonthlyFeedPage,
): ReturnType<typeof Markup.inlineKeyboard> {
  const monthButtons = page.items.map((item, index) => [
    Markup.button.callback(
      `${getNumberBadge(index + page.offset)} ${formatMonthCode(item.monthCode)}`,
      makeAdminPanelStatsMonthlyOpenAction(item.monthCode),
    ),
  ]);

  const pagingRow = [];
  if (page.hasPrevPage) {
    pagingRow.push(
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_PREV_PAGE, ADMIN_PANEL_ACTION.STATS_MONTHLY_PREV_PAGE),
    );
  }
  if (page.hasNextPage) {
    pagingRow.push(
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_NEXT_PAGE, ADMIN_PANEL_ACTION.STATS_MONTHLY_NEXT_PAGE),
    );
  }

  return Markup.inlineKeyboard([
    ...monthButtons,
    ...(pagingRow.length > 0 ? [pagingRow] : []),
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_BACK_TO_OVERVIEW, ADMIN_PANEL_ACTION.STATS_BACK_TO_OVERVIEW)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_BACK, ADMIN_PANEL_ACTION.STATS_BACK)],
  ]);
}

/**
 * @summary Текст деталізованого місячного фінансового звіту.
 */
export function formatAdminStatsMonthlyReportDetailsText(
  details: AdminPanelStatsMonthlyReportDetails,
): string {
  const topServices =
    details.topServices.length > 0
      ? details.topServices
          .map((item, index) => `${getNumberBadge(index)} ${item.serviceName} — ${formatMoney(item.grossAmount, details.currencyCode)}`)
          .join('\n')
      : 'Немає даних';

  const topMasters =
    details.topMasters.length > 0
      ? details.topMasters
          .map((item, index) => `${getNumberBadge(index)} ${item.displayName} — ${formatMoney(item.grossAmount, details.currencyCode)}`)
          .join('\n')
      : 'Немає даних';

  return (
    '📊 Фінансовий звіт\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `📅 Період: ${formatMonthCode(details.monthCode)}\n\n` +
    '💰 Основні фінансові показники\n' +
    `💰 Глобальний дохід: ${formatMoney(details.grossMonth, details.currencyCode)}\n` +
    `🏢 Дохід салону (15%): ${formatMoney(details.salonMonth, details.currencyCode)}\n` +
    `💸 Заробіток майстрів: ${formatMoney(details.masterEarningsMonth, details.currencyCode)}\n\n` +
    '📈 Додаткові показники\n' +
    `📋 Кількість процедур: ${details.completedProceduresMonth}\n` +
    `👥 Кількість клієнтів: ${details.clientsCountMonth}\n` +
    `💳 Середній чек: ${formatMoney(details.avgCheckMonth, details.currencyCode)}\n\n` +
    '💼 Найприбутковіші послуги\n' +
    `${topServices}\n\n` +
    '👩‍🎨 Найприбутковіші майстри\n' +
    `${topMasters}`
  );
}

/**
 * @summary Клавіатура деталізованого місячного фінансового звіту.
 */
export function createAdminStatsMonthlyReportDetailsKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_MONTHLY_BACK_TO_LIST, ADMIN_PANEL_ACTION.STATS_MONTHLY_BACK_TO_LIST)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_BACK_TO_OVERVIEW, ADMIN_PANEL_ACTION.STATS_BACK_TO_OVERVIEW)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_BACK, ADMIN_PANEL_ACTION.STATS_BACK)],
  ]);
}

/**
 * @summary Текст тимчасово недоступного підрозділу статистики.
 */
export function formatAdminStatsSectionStubText(title: string): string {
  return (
    `${title}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    '⚠️ Розділ тимчасово недоступний.\n' +
    'Після підключення тут буде деталізована аналітика.'
  );
}

/**
 * @summary Клавіатура для підрозділів статистики.
 */
export function createAdminStatsSectionStubKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_BACK_TO_OVERVIEW, ADMIN_PANEL_ACTION.STATS_BACK_TO_OVERVIEW)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS_BACK, ADMIN_PANEL_ACTION.STATS_BACK)],
  ]);
}
