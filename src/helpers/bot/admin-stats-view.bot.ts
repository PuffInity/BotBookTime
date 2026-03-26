import { Markup } from 'telegraf';
import {
  ADMIN_PANEL_ACTION,
  ADMIN_PANEL_BUTTON_TEXT,
} from '../../types/bot-admin-panel.types.js';
import type { AdminPanelStatsOverview } from '../../types/db-helpers/db-admin-stats.types.js';

/**
 * @file admin-stats-view.bot.ts
 * @summary UI/helper-и для блоку "Статистика" в адмін-панелі.
 */

function formatMoney(value: number, currencyCode: string): string {
  const rounded = Number.isFinite(value) ? value : 0;
  const normalized = rounded.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  return `${normalized} ${currencyCode}`;
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
