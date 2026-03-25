import { Markup } from 'telegraf';
import type { AdminStudioScheduleData } from '../../types/db-helpers/db-admin-schedule.types.js';
import { ADMIN_PANEL_ACTION, ADMIN_PANEL_BUTTON_TEXT } from '../../types/bot-admin-panel.types.js';

/**
 * @file admin-schedule-view.bot.ts
 * @summary UI/helper-и для блоку "Розклад" в адмін-панелі.
 */

const WEEKDAY_LABELS: Record<number, string> = {
  1: 'Пн',
  2: 'Вт',
  3: 'Ср',
  4: 'Чт',
  5: 'Пт',
  6: 'Сб',
  7: 'Нд',
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('uk-UA');
}

function formatWeeklyLine(weekday: number, isOpen: boolean, openTime: string | null, closeTime: string | null): string {
  const day = WEEKDAY_LABELS[weekday] ?? `День ${weekday}`;
  if (!isOpen) return `• ${day}: вихідний`;
  if (!openTime || !closeTime) return `• ${day}: графік не заповнено`;
  return `• ${day}: ${openTime}–${closeTime}`;
}

/**
 * @summary Текст меню розкладу адмін-панелі.
 */
export function formatAdminScheduleMenuText(): string {
  return (
    '🕒 Розклад студії\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Блок 2 активний.\n' +
    'Оберіть підрозділ для перегляду:'
  );
}

/**
 * @summary Клавіатура меню розкладу.
 */
export function createAdminScheduleMenuKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_OVERVIEW, ADMIN_PANEL_ACTION.SCHEDULE_OPEN_OVERVIEW)],
    [
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_DAYS_OFF, ADMIN_PANEL_ACTION.SCHEDULE_OPEN_DAYS_OFF),
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_HOLIDAYS, ADMIN_PANEL_ACTION.SCHEDULE_OPEN_HOLIDAYS),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_TEMPORARY, ADMIN_PANEL_ACTION.SCHEDULE_OPEN_TEMPORARY)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_BACK, ADMIN_PANEL_ACTION.SCHEDULE_BACK)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.HOME, ADMIN_PANEL_ACTION.HOME)],
  ]);
}

/**
 * @summary Текст екрану "Огляд розкладу".
 */
export function formatAdminScheduleOverviewText(data: AdminStudioScheduleData): string {
  const weekly = data.weeklyHours
    .sort((a, b) => a.weekday - b.weekday)
    .map((item) => formatWeeklyLine(item.weekday, item.isOpen, item.openTime, item.closeTime))
    .join('\n') || '• Графік студії ще не заповнено';

  return (
    '📋 Огляд розкладу студії\n' +
    '━━━━━━━━━━━━━━\n\n' +
    '🗓 Тижневий графік:\n' +
    `${weekly}\n\n` +
    `📅 Вихідні (майбутні): ${data.upcomingDaysOff.length}\n` +
    `🎉 Свята (майбутні): ${data.upcomingHolidays.length}\n` +
    `🕒 Тимчасові зміни: ${data.upcomingTemporaryHours.length}`
  );
}

/**
 * @summary Текст екрану "Вихідні студії".
 */
export function formatAdminScheduleDaysOffText(data: AdminStudioScheduleData): string {
  if (data.upcomingDaysOff.length === 0) {
    return (
      '📅 Вихідні студії\n' +
      '━━━━━━━━━━━━━━\n\n' +
      '📭 Майбутніх вихідних поки немає.'
    );
  }

  const lines = data.upcomingDaysOff
    .map((item) => `• ${formatDate(item.offDate)}${item.reason ? ` — ${item.reason}` : ''}`)
    .join('\n');

  return (
    '📅 Вихідні студії\n' +
    '━━━━━━━━━━━━━━\n\n' +
    lines
  );
}

/**
 * @summary Текст екрану "Святкові дні".
 */
export function formatAdminScheduleHolidaysText(data: AdminStudioScheduleData): string {
  if (data.upcomingHolidays.length === 0) {
    return (
      '🎉 Святкові дні\n' +
      '━━━━━━━━━━━━━━\n\n' +
      '📭 Майбутніх святкових днів поки немає.'
    );
  }

  const lines = data.upcomingHolidays
    .map((item) => `• ${formatDate(item.holidayDate)} — ${item.holidayName}`)
    .join('\n');

  return (
    '🎉 Святкові дні\n' +
    '━━━━━━━━━━━━━━\n\n' +
    lines
  );
}

/**
 * @summary Текст екрану "Тимчасові зміни графіку".
 */
export function formatAdminScheduleTemporaryText(data: AdminStudioScheduleData): string {
  if (data.upcomingTemporaryHours.length === 0) {
    return (
      '🕒 Тимчасові зміни графіку\n' +
      '━━━━━━━━━━━━━━\n\n' +
      '📭 Активних тимчасових змін поки немає.'
    );
  }

  const lines = data.upcomingTemporaryHours
    .map((item) => {
      const day = WEEKDAY_LABELS[item.weekday] ?? `День ${item.weekday}`;
      const range = item.isOpen
        ? `${item.openTime ?? '--:--'}–${item.closeTime ?? '--:--'}`
        : 'вихідний';
      const note = item.note ? ` (${item.note})` : '';
      return `• ${formatDate(item.dateFrom)}–${formatDate(item.dateTo)}, ${day}: ${range}${note}`;
    })
    .join('\n');

  return (
    '🕒 Тимчасові зміни графіку\n' +
    '━━━━━━━━━━━━━━\n\n' +
    lines
  );
}

/**
 * @summary Базова клавіатура розділів розкладу.
 */
export function createAdminScheduleSectionKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_REFRESH, ADMIN_PANEL_ACTION.SCHEDULE_REFRESH)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_BACK_TO_MENU, ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_BACK, ADMIN_PANEL_ACTION.SCHEDULE_BACK)],
  ]);
}

