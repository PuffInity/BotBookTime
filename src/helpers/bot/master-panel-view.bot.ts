import { Markup } from 'telegraf';
import type { MasterPanelAccess } from '../../types/db-helpers/db-master-panel.types.js';
import {
  MASTER_PANEL_ACTION,
  MASTER_PANEL_BUTTON_TEXT,
} from '../../types/bot-master-panel.types.js';

/**
 * @file master-panel-view.bot.ts
 * @summary UI/helper-и для skeleton панелі майстра.
 */

/**
 * @summary Текст кореневого екрану панелі майстра.
 */
export function formatMasterPanelRootText(access: MasterPanelAccess): string {
  return (
    '👩‍🎨 Панель майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `Вітаю, ${access.displayName}!\n\n` +
    'Тут ви можете керувати своїми записами, робочим графіком та профілем майстра.\n' +
    'Оберіть потрібний розділ нижче.'
  );
}

/**
 * @summary Inline-клавіатура головного екрану панелі майстра.
 */
export function createMasterPanelRootKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.PROFILE, MASTER_PANEL_ACTION.OPEN_PROFILE),
      Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.BOOKINGS, MASTER_PANEL_ACTION.OPEN_BOOKINGS),
    ],
    [
      Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.SCHEDULE, MASTER_PANEL_ACTION.OPEN_SCHEDULE),
      Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.STATS, MASTER_PANEL_ACTION.OPEN_STATS),
    ],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.HOME, MASTER_PANEL_ACTION.HOME)],
  ]);
}

/**
 * @summary Текст заглушки для розділів панелі майстра (блок 1).
 */
export function formatMasterPanelSectionStubText(title: string): string {
  return (
    `${title}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    'Цей розділ підключимо в наступних блоках реалізації.\n' +
    'Skeleton панелі вже готовий, рухаємось поетапно.'
  );
}

/**
 * @summary Inline-клавіатура заглушки розділу.
 */
export function createMasterPanelSectionStubKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.BACK_TO_PANEL, MASTER_PANEL_ACTION.BACK_TO_PANEL)],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.HOME, MASTER_PANEL_ACTION.HOME)],
  ]);
}

