import { Markup } from 'telegraf';
import type { AdminPanelAccess } from '../../types/db-helpers/db-admin-panel.types.js';
import { ADMIN_PANEL_ACTION, ADMIN_PANEL_BUTTON_TEXT } from '../../types/bot-admin-panel.types.js';

/**
 * @file admin-panel-view.bot.ts
 * @summary UI/helper-и для skeleton адмін-панелі.
 */

function getAdminDisplayName(access: AdminPanelAccess): string {
  return `${access.firstName}${access.lastName ? ` ${access.lastName}` : ''}`.trim();
}

/**
 * @summary Форматує кореневий екран адмін-панелі.
 */
export function formatAdminPanelRootText(access: AdminPanelAccess): string {
  const adminName = getAdminDisplayName(access);

  return (
    '🛡 Адмін-панель\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `Вітаю, ${adminName}.\n\n` +
    'Зараз це стартовий skeleton адмін-панелі.\n' +
    'Ми реалізуємо кожну кнопку окремим блоком (1 кнопка = 1 блок).\n\n' +
    '🧭 Порядок блоків:\n' +
    '1) 📅 Записи\n' +
    '2) 🕒 Розклад\n' +
    '3) 👩‍🎨 Майстри\n' +
    '4) 💼 Послуги\n' +
    '5) 📊 Статистика\n' +
    '6) ⚙️ Налаштування\n\n' +
    'Оберіть розділ нижче.'
  );
}

/**
 * @summary Клавіатура головного меню адмін-панелі.
 */
export function createAdminPanelRootKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS, ADMIN_PANEL_ACTION.OPEN_RECORDS),
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE, ADMIN_PANEL_ACTION.OPEN_SCHEDULE),
    ],
    [
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.MASTERS, ADMIN_PANEL_ACTION.OPEN_MASTERS),
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES, ADMIN_PANEL_ACTION.OPEN_SERVICES),
    ],
    [
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.STATS, ADMIN_PANEL_ACTION.OPEN_STATS),
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SETTINGS, ADMIN_PANEL_ACTION.OPEN_SETTINGS),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.EXIT, ADMIN_PANEL_ACTION.EXIT)],
  ]);
}

/**
 * @summary Текст заглушки розділу адмін-панелі.
 */
export function formatAdminPanelSectionStubText(title: string, blockNumber: number): string {
  return (
    `${title}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `🧱 Блок ${blockNumber}\n` +
    'Статус: заглушка (ще не реалізовано)\n\n' +
    'Цей розділ буде підключено в окремому етапі за нашим планом.\n' +
    'Зараз кнопка залишена для наочної навігації.'
  );
}

/**
 * @summary Клавіатура заглушки розділу адмін-панелі.
 */
export function createAdminPanelSectionStubKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.BACK_TO_ROOT, ADMIN_PANEL_ACTION.BACK_TO_ROOT)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.HOME, ADMIN_PANEL_ACTION.HOME)],
  ]);
}
