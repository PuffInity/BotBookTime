import { Markup } from 'telegraf';
import type {
  AdminStudioScheduleData,
  AdminStudioTemporaryScheduleDayInput,
} from '../../types/db-helpers/db-admin-schedule.types.js';
import {
  ADMIN_PANEL_ACTION,
  ADMIN_PANEL_BUTTON_TEXT,
  makeAdminPanelScheduleConfigureDayOffAction,
  makeAdminPanelScheduleConfigureDayWeekdayAction,
  makeAdminPanelScheduleDayOffDeleteRequestAction,
  makeAdminPanelScheduleHolidayDeleteRequestAction,
  makeAdminPanelScheduleTemporaryDayAction,
  makeAdminPanelScheduleTemporaryDayOffAction,
  makeAdminPanelScheduleTemporaryDeleteRequestAction,
} from '../../types/bot-admin-panel.types.js';

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

const TEMPORARY_WEEKDAY_ROWS = [
  [1, 2, 3],
  [4, 5, 6],
  [7],
];

function formatDate(date: Date): string {
  return date.toLocaleDateString('uk-UA');
}

function formatWeeklyLine(weekday: number, isOpen: boolean, openTime: string | null, closeTime: string | null): string {
  const day = WEEKDAY_LABELS[weekday] ?? `День ${weekday}`;
  if (!isOpen) return `• ${day}: вихідний`;
  if (!openTime || !closeTime) return `• ${day}: графік не заповнено`;
  return `• ${day}: ${openTime}–${closeTime}`;
}

function dateToCode(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * @summary Текст меню розкладу адмін-панелі.
 */
export function formatAdminScheduleMenuText(): string {
  return (
    '🕒 Розклад студії\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Тут ви можете переглядати й оновлювати робочий графік студії.\n' +
    'Оберіть потрібний підрозділ:'
  );
}

/**
 * @summary Клавіатура меню розкладу.
 */
export function createAdminScheduleMenuKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_OVERVIEW, ADMIN_PANEL_ACTION.SCHEDULE_OPEN_OVERVIEW)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_CONFIGURE_DAY, ADMIN_PANEL_ACTION.SCHEDULE_CONFIGURE_DAY)],
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
 * @summary Текст екрану налаштування тижневого графіка студії.
 */
export function formatAdminScheduleConfigureDayText(data: AdminStudioScheduleData): string {
  const mapped = new Map(data.weeklyHours.map((item) => [item.weekday, item]));
  const lines: string[] = [];

  for (let weekday = 1; weekday <= 7; weekday += 1) {
    const current = mapped.get(weekday);
    lines.push(
      formatWeeklyLine(
        weekday,
        current?.isOpen ?? false,
        current?.openTime ?? null,
        current?.closeTime ?? null,
      ),
    );
  }

  return (
    '✏️ Налаштування робочого дня\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Оберіть день тижня кнопкою нижче, щоб змінити його графік.\n\n' +
    `${lines.join('\n')}`
  );
}

/**
 * @summary Клавіатура екрана налаштування тижневого графіка студії.
 */
export function createAdminScheduleConfigureDayKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('Пн', makeAdminPanelScheduleConfigureDayWeekdayAction(1)),
      Markup.button.callback('Вт', makeAdminPanelScheduleConfigureDayWeekdayAction(2)),
      Markup.button.callback('Ср', makeAdminPanelScheduleConfigureDayWeekdayAction(3)),
    ],
    [
      Markup.button.callback('Чт', makeAdminPanelScheduleConfigureDayWeekdayAction(4)),
      Markup.button.callback('Пт', makeAdminPanelScheduleConfigureDayWeekdayAction(5)),
      Markup.button.callback('Сб', makeAdminPanelScheduleConfigureDayWeekdayAction(6)),
    ],
    [Markup.button.callback('Нд', makeAdminPanelScheduleConfigureDayWeekdayAction(7))],
    [Markup.button.callback('🔄 Оновити', ADMIN_PANEL_ACTION.SCHEDULE_CONFIGURE_DAY)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_BACK_TO_MENU, ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_BACK, ADMIN_PANEL_ACTION.SCHEDULE_BACK)],
  ]);
}

/**
 * @summary Текст кроку вводу часу початку для обраного дня.
 */
export function formatAdminScheduleConfigureDayFromInputText(weekday: number): string {
  const label = WEEKDAY_LABELS[weekday] ?? `День ${weekday}`;
  return (
    '✏️ Налаштування робочого дня\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `📅 День: ${label}\n\n` +
    'Введіть час початку у форматі HH:MM\n' +
    'Приклад: 9:00'
  );
}

/**
 * @summary Текст кроку вводу часу завершення для обраного дня.
 */
export function formatAdminScheduleConfigureDayToInputText(
  weekday: number,
  fromTime: string,
): string {
  const label = WEEKDAY_LABELS[weekday] ?? `День ${weekday}`;
  return (
    '✏️ Налаштування робочого дня\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `📅 День: ${label}\n` +
    `⏱ Від: ${fromTime}\n\n` +
    'Введіть час завершення у форматі HH:MM\n' +
    'Приклад: 18:00'
  );
}

/**
 * @summary Повідомлення про успішне оновлення тижневого дня.
 */
export function formatAdminScheduleConfigureDaySuccessText(
  weekday: number,
  isOpen: boolean,
  openTime: string | null,
  closeTime: string | null,
): string {
  const label = WEEKDAY_LABELS[weekday] ?? `День ${weekday}`;
  const range = isOpen && openTime && closeTime ? `${openTime} - ${closeTime}` : 'вихідний';

  return (
    '✅ Робочий день оновлено\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `📅 ${label}: ${range}`
  );
}

/**
 * @summary Клавіатура кроку вводу часу для дня тижня.
 */
export function createAdminScheduleConfigureDayInputKeyboard(
  weekday: number,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🚫 Зробити вихідним', makeAdminPanelScheduleConfigureDayOffAction(weekday))],
    [Markup.button.callback('❌ Скасувати дію', ADMIN_PANEL_ACTION.SCHEDULE_CONFIGURE_DAY)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_BACK_TO_MENU, ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
  ]);
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

/**
 * @summary Клавіатура розділу "Вихідні студії".
 */
export function createAdminScheduleDaysOffKeyboard(
  data: AdminStudioScheduleData,
): ReturnType<typeof Markup.inlineKeyboard> {
  const deleteRows = data.upcomingDaysOff.map((item, index) => [
    Markup.button.callback(
      `🗑 Видалити #${index + 1}`,
      makeAdminPanelScheduleDayOffDeleteRequestAction(item.id),
    ),
  ]);

  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_ADD_DAY_OFF, ADMIN_PANEL_ACTION.SCHEDULE_DAY_OFF_ADD_OPEN)],
    ...deleteRows,
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_REFRESH, ADMIN_PANEL_ACTION.SCHEDULE_OPEN_DAYS_OFF)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_BACK_TO_MENU, ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_BACK, ADMIN_PANEL_ACTION.SCHEDULE_BACK)],
  ]);
}

/**
 * @summary Клавіатура розділу "Святкові дні".
 */
export function createAdminScheduleHolidaysKeyboard(
  data: AdminStudioScheduleData,
): ReturnType<typeof Markup.inlineKeyboard> {
  const deleteRows = data.upcomingHolidays.map((item, index) => [
    Markup.button.callback(
      `🗑 Видалити #${index + 1}`,
      makeAdminPanelScheduleHolidayDeleteRequestAction(item.id),
    ),
  ]);

  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_ADD_HOLIDAY, ADMIN_PANEL_ACTION.SCHEDULE_HOLIDAY_ADD_OPEN)],
    ...deleteRows,
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_REFRESH, ADMIN_PANEL_ACTION.SCHEDULE_OPEN_HOLIDAYS)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_BACK_TO_MENU, ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_BACK, ADMIN_PANEL_ACTION.SCHEDULE_BACK)],
  ]);
}

/**
 * @summary Текст вводу дати для вихідного дня.
 */
export function formatAdminScheduleDayOffInputText(): string {
  return (
    '📅 Додавання вихідного дня\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Введіть дату вихідного дня у форматі ДД.ММ.РРРР\n' +
    'Наприклад: 25.12.2026'
  );
}

/**
 * @summary Текст підтвердження створення вихідного дня.
 */
export function formatAdminScheduleDayOffConfirmText(dateLabel: string): string {
  return (
    '⚠️ Підтвердження вихідного дня\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `Встановити вихідний день на ${dateLabel}?\n\n` +
    'У цей день нові записи для клієнтів будуть недоступні.'
  );
}

/**
 * @summary Клавіатура для вводу вихідного дня.
 */
export function createAdminScheduleDayOffInputKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_CANCEL_ACTION, ADMIN_PANEL_ACTION.SCHEDULE_DAY_OFF_ADD_CANCEL)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_BACK_TO_MENU, ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
  ]);
}

/**
 * @summary Клавіатура підтвердження вихідного дня.
 */
export function createAdminScheduleDayOffConfirmKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_CONFIRM, ADMIN_PANEL_ACTION.SCHEDULE_DAY_OFF_ADD_CONFIRM)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_CANCEL_ACTION, ADMIN_PANEL_ACTION.SCHEDULE_DAY_OFF_ADD_CANCEL)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_BACK_TO_MENU, ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
  ]);
}

/**
 * @summary Текст кроку вводу дати свята.
 */
export function formatAdminScheduleHolidayDateInputText(): string {
  return (
    '🎉 Додавання святкового дня — крок 1/2\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Введіть дату свята у форматі ДД.ММ.РРРР\n' +
    'Наприклад: 24.12.2026'
  );
}

/**
 * @summary Текст кроку вводу назви свята.
 */
export function formatAdminScheduleHolidayNameInputText(dateLabel: string): string {
  return (
    '🎉 Додавання святкового дня — крок 2/2\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `📅 Дата: ${dateLabel}\n\n` +
    'Введіть назву свята.'
  );
}

/**
 * @summary Текст підтвердження створення свята.
 */
export function formatAdminScheduleHolidayConfirmText(dateLabel: string, holidayName: string): string {
  return (
    '⚠️ Підтвердження святкового дня\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `📅 Дата: ${dateLabel}\n` +
    `🎉 Назва: ${holidayName}\n\n` +
    'Підтвердьте створення святкового дня.'
  );
}

/**
 * @summary Клавіатура вводу свята.
 */
export function createAdminScheduleHolidayInputKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_CANCEL_ACTION, ADMIN_PANEL_ACTION.SCHEDULE_HOLIDAY_ADD_CANCEL)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_BACK_TO_MENU, ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
  ]);
}

/**
 * @summary Клавіатура підтвердження свята.
 */
export function createAdminScheduleHolidayConfirmKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_CONFIRM, ADMIN_PANEL_ACTION.SCHEDULE_HOLIDAY_ADD_CONFIRM)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_CANCEL_ACTION, ADMIN_PANEL_ACTION.SCHEDULE_HOLIDAY_ADD_CANCEL)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_BACK_TO_MENU, ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
  ]);
}

/**
 * @summary Текст підтвердження видалення вихідного дня.
 */
export function formatAdminScheduleDeleteDayOffConfirmText(date: Date): string {
  return (
    '⚠️ Видалення вихідного дня\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `Видалити вихідний день на дату ${formatDate(date)}?`
  );
}

/**
 * @summary Текст підтвердження видалення свята.
 */
export function formatAdminScheduleDeleteHolidayConfirmText(
  date: Date,
  holidayName: string,
): string {
  return (
    '⚠️ Видалення святкового дня\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `Видалити святковий день ${formatDate(date)} — ${holidayName}?`
  );
}

/**
 * @summary Базова клавіатура підтвердження видалення.
 */
export function createAdminScheduleDeleteConfirmKeyboard(
  confirmAction: string,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_CONFIRM, confirmAction)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_DELETE_CANCEL, ADMIN_PANEL_ACTION.SCHEDULE_DELETE_CANCEL)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_BACK_TO_MENU, ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
  ]);
}

type TemporaryPeriod = {
  dateFrom: Date;
  dateTo: Date;
  dateFromCode: string;
  dateToCode: string;
};

function extractTemporaryPeriods(data: AdminStudioScheduleData): TemporaryPeriod[] {
  const unique = new Map<string, TemporaryPeriod>();

  for (const item of data.upcomingTemporaryHours) {
    const key = `${dateToCode(item.dateFrom)}:${dateToCode(item.dateTo)}`;
    if (!unique.has(key)) {
      unique.set(key, {
        dateFrom: item.dateFrom,
        dateTo: item.dateTo,
        dateFromCode: dateToCode(item.dateFrom),
        dateToCode: dateToCode(item.dateTo),
      });
    }
  }

  return Array.from(unique.values()).sort((a, b) => a.dateFrom.getTime() - b.dateFrom.getTime());
}

/**
 * @summary Клавіатура розділу "Тимчасові зміни графіку".
 */
export function createAdminScheduleTemporaryKeyboard(
  data: AdminStudioScheduleData,
): ReturnType<typeof Markup.inlineKeyboard> {
  const periods = extractTemporaryPeriods(data).slice(0, 10);
  const deleteRows = periods.map((period, index) => [
    Markup.button.callback(
      `🗑 Видалити період #${index + 1}`,
      makeAdminPanelScheduleTemporaryDeleteRequestAction(period.dateFromCode, period.dateToCode),
    ),
  ]);

  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_ADD_TEMPORARY, ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_CREATE_OPEN)],
    ...deleteRows,
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_REFRESH, ADMIN_PANEL_ACTION.SCHEDULE_OPEN_TEMPORARY)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_BACK_TO_MENU, ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_BACK, ADMIN_PANEL_ACTION.SCHEDULE_BACK)],
  ]);
}

/**
 * @summary Текст старту flow встановлення тимчасового графіку.
 */
export function formatAdminScheduleTemporarySetPeriodText(): string {
  return (
    '🕒 Встановити тимчасовий графік студії\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Вкажіть період дії у форматі:\n' +
    'ДД.ММ.РРРР - ДД.ММ.РРРР\n\n' +
    'Приклад: 10.03.2026 - 16.03.2026\n\n' +
    'Мінімальна тривалість періоду: 7 календарних днів.'
  );
}

function formatTemporaryDayState(day: AdminStudioTemporaryScheduleDayInput | null): string {
  if (!day) return 'не налаштовано';
  if (!day.isOpen || !day.openTime || !day.closeTime) return 'вихідний';
  return `${day.openTime} - ${day.closeTime}`;
}

/**
 * @summary Текст кроку налаштування днів для тимчасового графіку.
 */
export function formatAdminScheduleTemporaryDaysConfigText(
  dateFromLabel: string,
  dateToLabel: string,
  days: AdminStudioTemporaryScheduleDayInput[],
): string {
  const byWeekday = new Map<number, AdminStudioTemporaryScheduleDayInput>(
    days.map((day) => [day.weekday, day]),
  );

  const lines: string[] = [];
  for (let weekday = 1; weekday <= 7; weekday += 1) {
    const label = WEEKDAY_LABELS[weekday];
    const day = byWeekday.get(weekday) ?? null;
    lines.push(`${label}: ${formatTemporaryDayState(day)}`);
  }

  return (
    '🕒 Налаштування тимчасового графіку\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `📅 Період: ${dateFromLabel} - ${dateToLabel}\n` +
    `✅ Налаштовано днів: ${days.length}/7\n\n` +
    `${lines.join('\n')}\n\n` +
    'Оберіть день кнопкою нижче, потім введіть час "від" та "до".'
  );
}

/**
 * @summary Текст кроку вводу часу початку для обраного дня.
 */
export function formatAdminScheduleTemporaryDayFromInputText(weekday: number): string {
  const label = WEEKDAY_LABELS[weekday] ?? `День ${weekday}`;
  return (
    '🕒 Налаштування дня\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `📅 День: ${label}\n\n` +
    'Введіть час початку у форматі HH:MM\n' +
    'Приклад: 10:00'
  );
}

/**
 * @summary Текст кроку вводу часу завершення для обраного дня.
 */
export function formatAdminScheduleTemporaryDayToInputText(
  weekday: number,
  fromTime: string,
): string {
  const label = WEEKDAY_LABELS[weekday] ?? `День ${weekday}`;
  return (
    '🕒 Налаштування дня\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `📅 День: ${label}\n` +
    `⏱ Від: ${fromTime}\n\n` +
    'Введіть час завершення у форматі HH:MM\n' +
    'Приклад: 18:00'
  );
}

function formatTemporaryPreviewLines(days: AdminStudioTemporaryScheduleDayInput[]): string {
  return days
    .sort((a, b) => a.weekday - b.weekday)
    .map((day) => {
      const label = WEEKDAY_LABELS[day.weekday] ?? `День ${day.weekday}`;
      if (!day.isOpen || !day.openTime || !day.closeTime) {
        return `${label}: вихідний`;
      }
      return `${label}: ${day.openTime} - ${day.closeTime}`;
    })
    .join('\n');
}

/**
 * @summary Текст підтвердження тимчасового графіку.
 */
export function formatAdminScheduleTemporaryConfirmText(
  dateFromLabel: string,
  dateToLabel: string,
  days: AdminStudioTemporaryScheduleDayInput[],
): string {
  return (
    '⚠️ Підтвердження\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `📅 Період: ${dateFromLabel} - ${dateToLabel}\n\n` +
    '🕒 Новий тимчасовий графік студії:\n' +
    `${formatTemporaryPreviewLines(days)}\n\n` +
    'Після підтвердження цей графік буде діяти лише у вказаний період.'
  );
}

/**
 * @summary Клавіатура вводу періоду тимчасового графіку.
 */
export function createAdminScheduleTemporaryPeriodInputKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_CANCEL_ACTION, ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_CREATE_CANCEL)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_BACK_TO_SECTION, ADMIN_PANEL_ACTION.SCHEDULE_OPEN_TEMPORARY)],
  ]);
}

/**
 * @summary Клавіатура налаштування днів тижня для тимчасового графіку.
 */
export function createAdminScheduleTemporaryDaysConfigKeyboard(
  days: AdminStudioTemporaryScheduleDayInput[],
): ReturnType<typeof Markup.inlineKeyboard> {
  const byWeekday = new Map<number, AdminStudioTemporaryScheduleDayInput>(
    days.map((day) => [day.weekday, day]),
  );

  const dayRows = TEMPORARY_WEEKDAY_ROWS.map((row) =>
    row.map((weekday) => {
      const label = WEEKDAY_LABELS[weekday];
      const day = byWeekday.get(weekday);
      const icon = day ? '✅' : '⚪';
      return Markup.button.callback(
        `${icon} ${label}`,
        makeAdminPanelScheduleTemporaryDayAction(weekday),
      );
    }),
  );

  return Markup.inlineKeyboard([
    ...dayRows,
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_CONFIRM, ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_CREATE_CONFIRM)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_CANCEL_ACTION, ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_CREATE_CANCEL)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_BACK_TO_SECTION, ADMIN_PANEL_ACTION.SCHEDULE_OPEN_TEMPORARY)],
  ]);
}

/**
 * @summary Клавіатура вводу часу для обраного дня тимчасового графіку.
 */
export function createAdminScheduleTemporaryDayInputKeyboard(
  weekday: number,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🚫 Зробити вихідним', makeAdminPanelScheduleTemporaryDayOffAction(weekday))],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_CANCEL_ACTION, ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_CREATE_CANCEL)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SCHEDULE_BACK_TO_SECTION, ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_CREATE_OPEN)],
  ]);
}

/**
 * @summary Текст підтвердження видалення періоду тимчасового графіку.
 */
export function formatAdminScheduleDeleteTemporaryConfirmText(
  dateFrom: Date,
  dateTo: Date,
): string {
  return (
    '⚠️ Видалення тимчасового графіку\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `Видалити тимчасовий графік за період ${formatDate(dateFrom)} - ${formatDate(dateTo)}?`
  );
}
