import { Markup } from 'telegraf';
import type { MasterPanelStatsData } from '../../types/db-helpers/db-master-stats.types.js';
import { MASTER_PANEL_ACTION } from '../../types/bot-master-panel.types.js';
import { tBot, type BotUiLanguage } from './i18n.bot.js';

/**
 * @file master-stats-view.bot.ts
 * @summary UI/helper-и для блоку "Моя статистика" в панелі майстра.
 */

/**
 * uk: Внутрішня bot helper функція formatTopServices.
 * en: Internal bot helper function formatTopServices.
 * cz: Interní bot helper funkce formatTopServices.
 */
function formatTopServices(stats: MasterPanelStatsData, language: BotUiLanguage): string {
  if (stats.topServices.length === 0) {
    return tBot(language, 'MASTER_PANEL_STATS_TOP_SERVICES_EMPTY');
  }

  return stats.topServices
    .map((item, index) => `${index + 1}️⃣ ${item.serviceName} — ${item.completedCount}`)
    .join('\n\n');
}

/**
 * @summary Формує текст екрану статистики майстра.
 */
export function formatMasterStatsText(stats: MasterPanelStatsData, language: BotUiLanguage): string {
  return (
    `${tBot(language, 'MASTER_PANEL_STATS_TITLE')}\n\n` +
    `${tBot(language, 'MASTER_PANEL_STATS_PERIOD_CURRENT_MONTH')}\n\n` +
    `${tBot(language, 'MASTER_PANEL_STATS_DESCRIPTION')}\n\n` +
    '⸻\n\n' +
    `${tBot(language, 'MASTER_PANEL_STATS_SECTION_MAIN')}\n\n` +
    `${tBot(language, 'MASTER_PANEL_STATS_LABEL_COMPLETED_PROCEDURES')}:\n${stats.completedProceduresMonth}\n\n` +
    `${tBot(language, 'MASTER_PANEL_STATS_LABEL_CLIENTS_SERVED')}:\n${stats.clientsServedMonth}\n\n` +
    `${tBot(language, 'MASTER_PANEL_STATS_LABEL_WORKLOAD')}:\n${stats.workloadPercentMonth}%\n\n` +
    '⸻\n\n' +
    `${tBot(language, 'MASTER_PANEL_STATS_SECTION_CLIENTS')}\n\n` +
    `${tBot(language, 'MASTER_PANEL_STATS_LABEL_REPEAT_CLIENTS')}:\n${stats.repeatClientsPercentMonth}%\n\n` +
    `${tBot(language, 'MASTER_PANEL_STATS_LABEL_NEW_CLIENTS')}:\n${stats.newClientsMonth}\n\n` +
    '⸻\n\n' +
    `${tBot(language, 'MASTER_PANEL_STATS_SECTION_TOP_SERVICES')}\n\n` +
    `${formatTopServices(stats, language)}\n\n` +
    '⸻\n\n' +
    `${tBot(language, 'MASTER_PANEL_STATS_SECTION_CURRENT_ACTIVITY')}\n\n` +
    `${tBot(language, 'MASTER_PANEL_STATS_LABEL_BOOKINGS_THIS_WEEK')}:\n${stats.bookingsThisWeek}\n\n` +
    `${tBot(language, 'MASTER_PANEL_STATS_LABEL_BOOKINGS_TODAY')}:\n${stats.bookingsToday}`
  );
}

/**
 * @summary Клавіатура блоку статистики майстра.
 */
export function createMasterStatsKeyboard(language: BotUiLanguage): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_FINANCE'), MASTER_PANEL_ACTION.OPEN_STATS_FINANCE)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_PANEL'), MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}
