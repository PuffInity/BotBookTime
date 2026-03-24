import { Markup } from 'telegraf';
import type { MasterPanelFinanceData } from '../../types/db-helpers/db-master-finance.types.js';
import { MASTER_PANEL_ACTION, MASTER_PANEL_BUTTON_TEXT } from '../../types/bot-master-panel.types.js';

/**
 * @file master-finance-view.bot.ts
 * @summary UI/helper-и для підблоку "Фінанси" у статистиці майстра.
 */

const currencyFormatter = new Intl.NumberFormat('cs-CZ', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatMoney(value: number): string {
  return `${currencyFormatter.format(Math.round(value))} Kč`;
}

function formatBestMonthLabel(bestMonthStart: Date | null): string {
  if (!bestMonthStart) {
    return '—';
  }

  const label = new Intl.DateTimeFormat('uk-UA', {
    month: 'long',
    year: 'numeric',
  }).format(bestMonthStart);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatBestServiceName(name: string | null): string {
  return name?.trim() || '—';
}

/**
 * @summary Формує текст екрану "Фінанси" для панелі майстра.
 */
export function formatMasterFinanceText(finance: MasterPanelFinanceData): string {
  const bestMonthLabel = formatBestMonthLabel(finance.bestMonthStart);

  return (
    '👩‍🎨 Ваш фінансовий звіт\n\n' +
    'Цей розділ показує дохід від виконаних процедур, а також частку салону.\n\n' +
    '⸻\n\n' +
    '💰 Дохід від процедур\n\n' +
    `📅 За місяць\n💰 ${formatMoney(finance.grossMonth)}\n\n` +
    `📅 За 3 місяці\n💰 ${formatMoney(finance.gross3m)}\n\n` +
    `📅 За пів року\n💰 ${formatMoney(finance.gross6m)}\n\n` +
    `📅 За рік\n💰 ${formatMoney(finance.grossYear)}\n\n` +
    '⸻\n\n' +
    '🏢 Комісія салону (15%)\n\n' +
    `📅 За місяць\n💰 ${formatMoney(finance.salonMonth)}\n\n` +
    `📅 За 3 місяці\n💰 ${formatMoney(finance.salon3m)}\n\n` +
    `📅 За пів року\n💰 ${formatMoney(finance.salon6m)}\n\n` +
    `📅 За рік\n💰 ${formatMoney(finance.salonYear)}\n\n` +
    '⸻\n\n' +
    '📊 Додаткові фінансові показники\n\n' +
    `💳 Середній чек:\n${formatMoney(finance.avgCheck)}\n\n` +
    `💼 Найприбутковіша послуга:\n${formatBestServiceName(finance.bestServiceName)}\n\n` +
    `💰 Загальний дохід за весь час:\n${formatMoney(finance.grossAllTime)}\n\n` +
    `📈 Найприбутковіший місяць:\n${bestMonthLabel} — ${formatMoney(finance.bestMonthAmount)}\n\n` +
    `💸 Ваш заробіток (після комісії салону):\n${formatMoney(finance.masterAllTime)}`
  );
}

/**
 * @summary Клавіатура екрана фінансів у панелі майстра.
 */
export function createMasterFinanceKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback('⬅️ Назад', MASTER_PANEL_ACTION.BACK_TO_PANEL)],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.STATS, MASTER_PANEL_ACTION.OPEN_STATS)],
  ]);
}

