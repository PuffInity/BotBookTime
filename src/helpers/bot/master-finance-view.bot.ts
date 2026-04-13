import { Markup } from 'telegraf';
import type { MasterPanelFinanceData } from '../../types/db-helpers/db-master-finance.types.js';
import { MASTER_PANEL_ACTION } from '../../types/bot-master-panel.types.js';
import { tBot, type BotUiLanguage } from './i18n.bot.js';

/**
 * @file master-finance-view.bot.ts
 * @summary UI/helper-и для підблоку "Фінанси" у статистиці майстра.
 */

/**
 * uk: Внутрішня bot helper функція localeByLanguage.
 * en: Internal bot helper function localeByLanguage.
 * cz: Interní bot helper funkce localeByLanguage.
 */
function localeByLanguage(language: BotUiLanguage): string {
  if (language === 'en') return 'en-US';
  if (language === 'cs') return 'cs-CZ';
  return 'uk-UA';
}

/**
 * uk: Внутрішня bot helper функція formatMoney.
 * en: Internal bot helper function formatMoney.
 * cz: Interní bot helper funkce formatMoney.
 */
function formatMoney(value: number, language: BotUiLanguage): string {
  const formatter = new Intl.NumberFormat(localeByLanguage(language), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return `${formatter.format(Math.round(value))} Kč`;
}

/**
 * uk: Внутрішня bot helper функція formatBestMonthLabel.
 * en: Internal bot helper function formatBestMonthLabel.
 * cz: Interní bot helper funkce formatBestMonthLabel.
 */
function formatBestMonthLabel(bestMonthStart: Date | null, language: BotUiLanguage): string {
  if (!bestMonthStart) {
    return tBot(language, 'MASTER_PANEL_FINANCE_EMPTY_VALUE');
  }

  const label = new Intl.DateTimeFormat(localeByLanguage(language), {
    month: 'long',
    year: 'numeric',
  }).format(bestMonthStart);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * uk: Внутрішня bot helper функція formatBestServiceName.
 * en: Internal bot helper function formatBestServiceName.
 * cz: Interní bot helper funkce formatBestServiceName.
 */
function formatBestServiceName(name: string | null, language: BotUiLanguage): string {
  return name?.trim() || tBot(language, 'MASTER_PANEL_FINANCE_EMPTY_VALUE');
}

/**
 * @summary Формує текст екрану "Фінанси" для панелі майстра.
 */
export function formatMasterFinanceText(finance: MasterPanelFinanceData, language: BotUiLanguage): string {
  const bestMonthLabel = formatBestMonthLabel(finance.bestMonthStart, language);

  return (
    `${tBot(language, 'MASTER_PANEL_FINANCE_TITLE')}\n\n` +
    `${tBot(language, 'MASTER_PANEL_FINANCE_DESCRIPTION')}\n\n` +
    '⸻\n\n' +
    `${tBot(language, 'MASTER_PANEL_FINANCE_SECTION_INCOME')}\n\n` +
    `${tBot(language, 'MASTER_PANEL_FINANCE_LABEL_MONTH')}\n💰 ${formatMoney(finance.grossMonth, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_FINANCE_LABEL_3_MONTHS')}\n💰 ${formatMoney(finance.gross3m, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_FINANCE_LABEL_6_MONTHS')}\n💰 ${formatMoney(finance.gross6m, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_FINANCE_LABEL_YEAR')}\n💰 ${formatMoney(finance.grossYear, language)}\n\n` +
    '⸻\n\n' +
    `${tBot(language, 'MASTER_PANEL_FINANCE_SECTION_SALON_COMMISSION')}\n\n` +
    `${tBot(language, 'MASTER_PANEL_FINANCE_LABEL_MONTH')}\n💰 ${formatMoney(finance.salonMonth, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_FINANCE_LABEL_3_MONTHS')}\n💰 ${formatMoney(finance.salon3m, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_FINANCE_LABEL_6_MONTHS')}\n💰 ${formatMoney(finance.salon6m, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_FINANCE_LABEL_YEAR')}\n💰 ${formatMoney(finance.salonYear, language)}\n\n` +
    '⸻\n\n' +
    `${tBot(language, 'MASTER_PANEL_FINANCE_SECTION_ADDITIONAL')}\n\n` +
    `${tBot(language, 'MASTER_PANEL_FINANCE_LABEL_AVG_CHECK')}:\n${formatMoney(finance.avgCheck, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_FINANCE_LABEL_BEST_SERVICE')}:\n${formatBestServiceName(finance.bestServiceName, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_FINANCE_LABEL_GROSS_ALL_TIME')}:\n${formatMoney(finance.grossAllTime, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_FINANCE_LABEL_BEST_MONTH')}:\n${bestMonthLabel} — ${formatMoney(finance.bestMonthAmount, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_FINANCE_LABEL_MASTER_ALL_TIME')}:\n${formatMoney(finance.masterAllTime, language)}`
  );
}

/**
 * @summary Клавіатура екрана фінансів у панелі майстра.
 */
export function createMasterFinanceKeyboard(language: BotUiLanguage): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_FINANCE_BTN_BACK'), MASTER_PANEL_ACTION.BACK_TO_PANEL)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_STATS'), MASTER_PANEL_ACTION.OPEN_STATS)],
  ]);
}
