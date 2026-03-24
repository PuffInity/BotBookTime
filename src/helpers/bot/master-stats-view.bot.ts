import { Markup } from 'telegraf';
import type { MasterPanelStatsData } from '../../types/db-helpers/db-master-stats.types.js';
import { MASTER_PANEL_ACTION, MASTER_PANEL_BUTTON_TEXT } from '../../types/bot-master-panel.types.js';

/**
 * @file master-stats-view.bot.ts
 * @summary UI/helper-и для блоку "Моя статистика" в панелі майстра.
 */

function formatTopServices(stats: MasterPanelStatsData): string {
  if (stats.topServices.length === 0) {
    return 'Поки що немає завершених процедур у поточному місяці.';
  }

  return stats.topServices
    .map((item, index) => `${index + 1}️⃣ ${item.serviceName} — ${item.completedCount} разів`)
    .join('\n\n');
}

/**
 * @summary Формує текст екрану статистики майстра.
 */
export function formatMasterStatsText(stats: MasterPanelStatsData): string {
  return (
    '📊 ВАША СТАТИСТИКА\n\n' +
    '📅 Період статистики: поточний місяць\n\n' +
    'У цьому розділі відображається ваша робоча активність, завантаженість та інформація про клієнтів.\n\n' +
    '⸻\n\n' +
    '📊 Основні показники\n\n' +
    `📋 Виконано процедур:\n${stats.completedProceduresMonth}\n\n` +
    `👥 Клієнтів обслужено:\n${stats.clientsServedMonth}\n\n` +
    `📊 Завантаженість за місяць:\n${stats.workloadPercentMonth}%\n\n` +
    '⸻\n\n' +
    '👥 Робота з клієнтами\n\n' +
    `🔁 Повторні клієнти:\n${stats.repeatClientsPercentMonth}%\n\n` +
    `🆕 Нові клієнти:\n${stats.newClientsMonth}\n\n` +
    '⸻\n\n' +
    '💼 Найпопулярніші процедури\n\n' +
    `${formatTopServices(stats)}\n\n` +
    '⸻\n\n' +
    '📅 Поточна активність\n\n' +
    `📅 Записів цього тижня:\n${stats.bookingsThisWeek}\n\n` +
    `📅 Записів сьогодні:\n${stats.bookingsToday}`
  );
}

/**
 * @summary Клавіатура блоку статистики майстра.
 */
export function createMasterStatsKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.STATS_FINANCE, MASTER_PANEL_ACTION.OPEN_STATS_FINANCE)],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.BACK_TO_PANEL, MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}
