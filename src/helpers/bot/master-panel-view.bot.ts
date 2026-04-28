import { Markup } from 'telegraf';
import type { MasterPanelAccess } from '../../types/db-helpers/db-master-panel.types.js';
import { MASTER_PANEL_ACTION } from '../../types/bot-master-panel.types.js';
import type { BotUiLanguage } from './i18n.bot.js';
import { tBot, tBotTemplate } from './i18n.bot.js';

/**
 * @file master-panel-view.bot.ts
 * @summary UI/helper-и для кореневого екрану панелі майстра.
 */

/**
 * @summary Текст кореневого екрану панелі майстра.
 */
export function formatMasterPanelRootText(
  access: MasterPanelAccess,
  language: BotUiLanguage,
): string {
  const masterStatus = access.isBookable
    ? tBot(language, 'MASTER_PANEL_STATUS_AVAILABLE')
    : tBot(language, 'MASTER_PANEL_STATUS_UNAVAILABLE');

  return (
    `${tBot(language, 'MASTER_PANEL_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBotTemplate(language, 'MASTER_PANEL_GREETING', { name: access.displayName })}\n\n` +
    `${masterStatus}\n\n` +
    tBot(language, 'MASTER_PANEL_ROOT_DESCRIPTION')
  );
}

/**
 * @summary Inline-клавіатура головного екрану панелі майстра.
 */
export function createMasterPanelRootKeyboard(
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_PROFILE'), MASTER_PANEL_ACTION.OPEN_PROFILE),
      Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BOOKINGS'), MASTER_PANEL_ACTION.OPEN_BOOKINGS),
    ],
    [
      Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_SCHEDULE'), MASTER_PANEL_ACTION.OPEN_SCHEDULE),
      Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_STATS'), MASTER_PANEL_ACTION.OPEN_STATS),
    ],
    [Markup.button.callback(tBot(language, 'HOME'), MASTER_PANEL_ACTION.HOME)],
  ]);
}
