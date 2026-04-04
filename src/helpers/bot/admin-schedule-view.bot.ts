import { Markup } from 'telegraf';
import type {
  AdminStudioScheduleData,
  AdminStudioTemporaryScheduleDayInput,
} from '../../types/db-helpers/db-admin-schedule.types.js';
import {
  ADMIN_PANEL_ACTION,
  makeAdminPanelScheduleConfigureDayOffAction,
  makeAdminPanelScheduleConfigureDayWeekdayAction,
  makeAdminPanelScheduleDayOffDeleteRequestAction,
  makeAdminPanelScheduleHolidayDeleteRequestAction,
  makeAdminPanelScheduleTemporaryDayAction,
  makeAdminPanelScheduleTemporaryDayOffAction,
  makeAdminPanelScheduleTemporaryDeleteRequestAction,
} from '../../types/bot-admin-panel.types.js';
import { tBot, tBotTemplate } from './i18n.bot.js';
import type { BotUiLanguage } from './i18n.bot.js';

/**
 * @file admin-schedule-view.bot.ts
 * @summary UI/helper-и для блоку "Розклад" в адмін-панелі.
 */

const WEEKDAY_LABELS: Record<BotUiLanguage, Record<number, string>> = {
  uk: { 1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт', 6: 'Сб', 7: 'Нд' },
  en: { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' },
  cs: { 1: 'Po', 2: 'Út', 3: 'St', 4: 'Čt', 5: 'Pá', 6: 'So', 7: 'Ne' },
};

const DATE_LOCALE_BY_LANGUAGE: Record<BotUiLanguage, string> = {
  uk: 'uk-UA',
  en: 'en-US',
  cs: 'cs-CZ',
};

const TEMPORARY_WEEKDAY_ROWS = [
  [1, 2, 3],
  [4, 5, 6],
  [7],
];

function toSafeDate(value: Date | string): Date | null {
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(date: Date | string, language: BotUiLanguage): string {
  const parsed = toSafeDate(date);
  if (!parsed) return tBot(language, 'ADMIN_PANEL_SCHEDULE_UNKNOWN_DATE');
  return parsed.toLocaleDateString(DATE_LOCALE_BY_LANGUAGE[language]);
}

function weekdayLabel(weekday: number, language: BotUiLanguage): string {
  return (
    WEEKDAY_LABELS[language][weekday] ??
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_WEEKDAY_FALLBACK', { day: weekday })
  );
}

function formatWeeklyLine(
  weekday: number,
  isOpen: boolean,
  openTime: string | null,
  closeTime: string | null,
  language: BotUiLanguage,
): string {
  const day = weekdayLabel(weekday, language);
  if (!isOpen) {
    return tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_WEEKLY_LINE_OFF', { day });
  }
  if (!openTime || !closeTime) {
    return tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_WEEKLY_LINE_EMPTY', { day });
  }
  return tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_WEEKLY_LINE_OPEN', {
    day,
    from: openTime,
    to: closeTime,
  });
}

function dateToCode(date: Date | string): string | null {
  const parsed = toSafeDate(date);
  if (!parsed) return null;

  const year = String(parsed.getFullYear());
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * @summary Текст меню розкладу адмін-панелі.
 */
export function formatAdminScheduleMenuText(language: BotUiLanguage = 'uk'): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_MENU_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_MENU_DESCRIPTION')}\n` +
    tBot(language, 'ADMIN_PANEL_SCHEDULE_MENU_PICK_SECTION')
  );
}

/**
 * @summary Клавіатура меню розкладу.
 */
export function createAdminScheduleMenuKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_OVERVIEW'), ADMIN_PANEL_ACTION.SCHEDULE_OPEN_OVERVIEW)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_CONFIGURE_DAY'), ADMIN_PANEL_ACTION.SCHEDULE_CONFIGURE_DAY)],
    [
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_DAYS_OFF'), ADMIN_PANEL_ACTION.SCHEDULE_OPEN_DAYS_OFF),
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_HOLIDAYS'), ADMIN_PANEL_ACTION.SCHEDULE_OPEN_HOLIDAYS),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_TEMPORARY'), ADMIN_PANEL_ACTION.SCHEDULE_OPEN_TEMPORARY)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_BACK'), ADMIN_PANEL_ACTION.SCHEDULE_BACK)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_HOME'), ADMIN_PANEL_ACTION.HOME)],
  ]);
}

/**
 * @summary Текст екрану "Огляд розкладу".
 */
export function formatAdminScheduleOverviewText(
  data: AdminStudioScheduleData,
  language: BotUiLanguage = 'uk',
): string {
  const weekly =
    data.weeklyHours
      .sort((a, b) => a.weekday - b.weekday)
      .map((item) =>
        formatWeeklyLine(item.weekday, item.isOpen, item.openTime, item.closeTime, language),
      )
      .join('\n') || tBot(language, 'ADMIN_PANEL_SCHEDULE_OVERVIEW_WEEKLY_EMPTY');

  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_OVERVIEW_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_OVERVIEW_WEEKLY_TITLE')}\n` +
    `${weekly}\n\n` +
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_OVERVIEW_DAYS_OFF_COUNT', {
      count: data.upcomingDaysOff.length,
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_OVERVIEW_HOLIDAYS_COUNT', {
      count: data.upcomingHolidays.length,
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_OVERVIEW_TEMPORARY_COUNT', {
      count: data.upcomingTemporaryHours.length,
    })
  );
}

/**
 * @summary Текст екрану налаштування тижневого графіка студії.
 */
export function formatAdminScheduleConfigureDayText(
  data: AdminStudioScheduleData,
  language: BotUiLanguage = 'uk',
): string {
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
        language,
      ),
    );
  }

  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_CONFIGURE_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_CONFIGURE_PICK_WEEKDAY')}\n\n` +
    `${lines.join('\n')}`
  );
}

/**
 * @summary Клавіатура екрана налаштування тижневого графіка студії.
 */
export function createAdminScheduleConfigureDayKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(weekdayLabel(1, language), makeAdminPanelScheduleConfigureDayWeekdayAction(1)),
      Markup.button.callback(weekdayLabel(2, language), makeAdminPanelScheduleConfigureDayWeekdayAction(2)),
      Markup.button.callback(weekdayLabel(3, language), makeAdminPanelScheduleConfigureDayWeekdayAction(3)),
    ],
    [
      Markup.button.callback(weekdayLabel(4, language), makeAdminPanelScheduleConfigureDayWeekdayAction(4)),
      Markup.button.callback(weekdayLabel(5, language), makeAdminPanelScheduleConfigureDayWeekdayAction(5)),
      Markup.button.callback(weekdayLabel(6, language), makeAdminPanelScheduleConfigureDayWeekdayAction(6)),
    ],
    [Markup.button.callback(weekdayLabel(7, language), makeAdminPanelScheduleConfigureDayWeekdayAction(7))],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_REFRESH'), ADMIN_PANEL_ACTION.SCHEDULE_CONFIGURE_DAY)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_BACK_TO_MENU'), ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_BACK'), ADMIN_PANEL_ACTION.SCHEDULE_BACK)],
  ]);
}

/**
 * @summary Текст кроку вводу часу початку для обраного дня.
 */
export function formatAdminScheduleConfigureDayFromInputText(
  weekday: number,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_CONFIGURE_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_LABEL_WEEKDAY', {
      day: weekdayLabel(weekday, language),
    }) + '\n\n' +
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_INPUT_FROM')}\n` +
    tBot(language, 'ADMIN_PANEL_SCHEDULE_INPUT_EXAMPLE_FROM')
  );
}

/**
 * @summary Текст кроку вводу часу завершення для обраного дня.
 */
export function formatAdminScheduleConfigureDayToInputText(
  weekday: number,
  fromTime: string,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_CONFIGURE_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_LABEL_WEEKDAY', {
      day: weekdayLabel(weekday, language),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_LABEL_FROM', {
      from: fromTime,
    }) + '\n\n' +
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_INPUT_TO')}\n` +
    tBot(language, 'ADMIN_PANEL_SCHEDULE_INPUT_EXAMPLE_TO')
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
  language: BotUiLanguage = 'uk',
): string {
  const range =
    isOpen && openTime && closeTime
      ? tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_RANGE_OPEN', {
          from: openTime,
          to: closeTime,
        })
      : tBot(language, 'ADMIN_PANEL_SCHEDULE_RANGE_DAY_OFF');

  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_CONFIGURE_SUCCESS_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_CONFIGURE_SUCCESS_BODY', {
      day: weekdayLabel(weekday, language),
      range,
    })
  );
}

/**
 * @summary Клавіатура кроку вводу часу для дня тижня.
 */
export function createAdminScheduleConfigureDayInputKeyboard(
  weekday: number,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_MARK_DAY_OFF'),
        makeAdminPanelScheduleConfigureDayOffAction(weekday),
      ),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_CANCEL_ACTION'), ADMIN_PANEL_ACTION.SCHEDULE_CONFIGURE_DAY)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_BACK_TO_MENU'), ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
  ]);
}

/**
 * @summary Текст екрану "Вихідні студії".
 */
export function formatAdminScheduleDaysOffText(
  data: AdminStudioScheduleData,
  language: BotUiLanguage = 'uk',
): string {
  if (data.upcomingDaysOff.length === 0) {
    return (
      `${tBot(language, 'ADMIN_PANEL_SCHEDULE_DAYS_OFF_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      tBot(language, 'ADMIN_PANEL_SCHEDULE_DAYS_OFF_EMPTY')
    );
  }

  const lines = data.upcomingDaysOff
    .map(
      (item) =>
        `• ${formatDate(item.offDate, language)}${item.reason ? ` — ${item.reason}` : ''}`,
    )
    .join('\n');

  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_DAYS_OFF_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    lines
  );
}

/**
 * @summary Текст екрану "Святкові дні".
 */
export function formatAdminScheduleHolidaysText(
  data: AdminStudioScheduleData,
  language: BotUiLanguage = 'uk',
): string {
  if (data.upcomingHolidays.length === 0) {
    return (
      `${tBot(language, 'ADMIN_PANEL_SCHEDULE_HOLIDAYS_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      tBot(language, 'ADMIN_PANEL_SCHEDULE_HOLIDAYS_EMPTY')
    );
  }

  const lines = data.upcomingHolidays
    .map((item) => `• ${formatDate(item.holidayDate, language)} — ${item.holidayName}`)
    .join('\n');

  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_HOLIDAYS_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    lines
  );
}

/**
 * @summary Текст екрану "Тимчасові зміни графіку".
 */
export function formatAdminScheduleTemporaryText(
  data: AdminStudioScheduleData,
  language: BotUiLanguage = 'uk',
): string {
  if (data.upcomingTemporaryHours.length === 0) {
    return (
      `${tBot(language, 'ADMIN_PANEL_SCHEDULE_TEMPORARY_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      tBot(language, 'ADMIN_PANEL_SCHEDULE_TEMPORARY_EMPTY')
    );
  }

  const lines = data.upcomingTemporaryHours
    .map((item) => {
      const day = weekdayLabel(item.weekday, language);
      const range = item.isOpen
        ? `${item.openTime ?? '--:--'}–${item.closeTime ?? '--:--'}`
        : tBot(language, 'ADMIN_PANEL_SCHEDULE_RANGE_DAY_OFF');
      const note = item.note ? ` (${item.note})` : '';
      return `• ${formatDate(item.dateFrom, language)}–${formatDate(item.dateTo, language)}, ${day}: ${range}${note}`;
    })
    .join('\n');

  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_TEMPORARY_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    lines
  );
}

/**
 * @summary Базова клавіатура розділів розкладу.
 */
export function createAdminScheduleSectionKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_REFRESH'), ADMIN_PANEL_ACTION.SCHEDULE_REFRESH)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_BACK_TO_MENU'), ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_BACK'), ADMIN_PANEL_ACTION.SCHEDULE_BACK)],
  ]);
}

/**
 * @summary Клавіатура розділу "Вихідні студії".
 */
export function createAdminScheduleDaysOffKeyboard(
  data: AdminStudioScheduleData,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const deleteRows = data.upcomingDaysOff.map((item, index) => [
    Markup.button.callback(
      tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_BTN_DELETE_INDEXED', {
        index: index + 1,
      }),
      makeAdminPanelScheduleDayOffDeleteRequestAction(item.id),
    ),
  ]);

  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_ADD_DAY_OFF'), ADMIN_PANEL_ACTION.SCHEDULE_DAY_OFF_ADD_OPEN)],
    ...deleteRows,
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_REFRESH'), ADMIN_PANEL_ACTION.SCHEDULE_OPEN_DAYS_OFF)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_BACK_TO_MENU'), ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_BACK'), ADMIN_PANEL_ACTION.SCHEDULE_BACK)],
  ]);
}

/**
 * @summary Клавіатура розділу "Святкові дні".
 */
export function createAdminScheduleHolidaysKeyboard(
  data: AdminStudioScheduleData,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const deleteRows = data.upcomingHolidays.map((item, index) => [
    Markup.button.callback(
      tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_BTN_DELETE_INDEXED', {
        index: index + 1,
      }),
      makeAdminPanelScheduleHolidayDeleteRequestAction(item.id),
    ),
  ]);

  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_ADD_HOLIDAY'), ADMIN_PANEL_ACTION.SCHEDULE_HOLIDAY_ADD_OPEN)],
    ...deleteRows,
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_REFRESH'), ADMIN_PANEL_ACTION.SCHEDULE_OPEN_HOLIDAYS)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_BACK_TO_MENU'), ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_BACK'), ADMIN_PANEL_ACTION.SCHEDULE_BACK)],
  ]);
}

/**
 * @summary Текст вводу дати для вихідного дня.
 */
export function formatAdminScheduleDayOffInputText(language: BotUiLanguage = 'uk'): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_DAY_OFF_ADD_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_DAY_OFF_ADD_INPUT')}\n` +
    tBot(language, 'ADMIN_PANEL_SCHEDULE_DAY_OFF_ADD_EXAMPLE')
  );
}

/**
 * @summary Текст підтвердження створення вихідного дня.
 */
export function formatAdminScheduleDayOffConfirmText(
  dateLabel: string,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_DAY_OFF_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_DAY_OFF_CONFIRM_ASK', {
      date: dateLabel,
    }) + '\n\n' +
    tBot(language, 'ADMIN_PANEL_SCHEDULE_DAY_OFF_CONFIRM_HINT')
  );
}

/**
 * @summary Клавіатура для вводу вихідного дня.
 */
export function createAdminScheduleDayOffInputKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_CANCEL_ACTION'), ADMIN_PANEL_ACTION.SCHEDULE_DAY_OFF_ADD_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_BACK_TO_MENU'), ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
  ]);
}

/**
 * @summary Клавіатура підтвердження вихідного дня.
 */
export function createAdminScheduleDayOffConfirmKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_CONFIRM'), ADMIN_PANEL_ACTION.SCHEDULE_DAY_OFF_ADD_CONFIRM)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_CANCEL_ACTION'), ADMIN_PANEL_ACTION.SCHEDULE_DAY_OFF_ADD_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_BACK_TO_MENU'), ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
  ]);
}

/**
 * @summary Текст кроку вводу дати свята.
 */
export function formatAdminScheduleHolidayDateInputText(language: BotUiLanguage = 'uk'): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_HOLIDAY_ADD_STEP1_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_HOLIDAY_ADD_STEP1_INPUT')}\n` +
    tBot(language, 'ADMIN_PANEL_SCHEDULE_HOLIDAY_ADD_STEP1_EXAMPLE')
  );
}

/**
 * @summary Текст кроку вводу назви свята.
 */
export function formatAdminScheduleHolidayNameInputText(
  dateLabel: string,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_HOLIDAY_ADD_STEP2_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_HOLIDAY_LABEL_DATE', {
      date: dateLabel,
    }) + '\n\n' +
    tBot(language, 'ADMIN_PANEL_SCHEDULE_HOLIDAY_ADD_STEP2_INPUT')
  );
}

/**
 * @summary Текст підтвердження створення свята.
 */
export function formatAdminScheduleHolidayConfirmText(
  dateLabel: string,
  holidayName: string,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_HOLIDAY_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_HOLIDAY_LABEL_DATE', {
      date: dateLabel,
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_HOLIDAY_LABEL_NAME', {
      name: holidayName,
    }) + '\n\n' +
    tBot(language, 'ADMIN_PANEL_SCHEDULE_HOLIDAY_CONFIRM_HINT')
  );
}

/**
 * @summary Клавіатура вводу свята.
 */
export function createAdminScheduleHolidayInputKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_CANCEL_ACTION'), ADMIN_PANEL_ACTION.SCHEDULE_HOLIDAY_ADD_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_BACK_TO_MENU'), ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
  ]);
}

/**
 * @summary Клавіатура підтвердження свята.
 */
export function createAdminScheduleHolidayConfirmKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_CONFIRM'), ADMIN_PANEL_ACTION.SCHEDULE_HOLIDAY_ADD_CONFIRM)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_CANCEL_ACTION'), ADMIN_PANEL_ACTION.SCHEDULE_HOLIDAY_ADD_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_BACK_TO_MENU'), ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
  ]);
}

/**
 * @summary Текст підтвердження видалення вихідного дня.
 */
export function formatAdminScheduleDeleteDayOffConfirmText(
  date: Date | string,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_DELETE_DAY_OFF_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_DELETE_DAY_OFF_ASK', {
      date: formatDate(date, language),
    })
  );
}

/**
 * @summary Текст підтвердження видалення свята.
 */
export function formatAdminScheduleDeleteHolidayConfirmText(
  date: Date | string,
  holidayName: string,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_DELETE_HOLIDAY_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_DELETE_HOLIDAY_ASK', {
      date: formatDate(date, language),
      name: holidayName,
    })
  );
}

/**
 * @summary Базова клавіатура підтвердження видалення.
 */
export function createAdminScheduleDeleteConfirmKeyboard(
  confirmAction: string,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_CONFIRM'), confirmAction)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_DELETE_CANCEL'), ADMIN_PANEL_ACTION.SCHEDULE_DELETE_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_BACK_TO_MENU'), ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
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
    const dateFrom = toSafeDate(item.dateFrom);
    const dateTo = toSafeDate(item.dateTo);
    const dateFromCode = dateToCode(item.dateFrom);
    const dateToCodeValue = dateToCode(item.dateTo);

    if (!dateFrom || !dateTo || !dateFromCode || !dateToCodeValue) {
      continue;
    }

    const key = `${dateFromCode}:${dateToCodeValue}`;
    if (!unique.has(key)) {
      unique.set(key, {
        dateFrom,
        dateTo,
        dateFromCode,
        dateToCode: dateToCodeValue,
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
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const periods = extractTemporaryPeriods(data).slice(0, 10);
  const deleteRows = periods.map((period, index) => [
    Markup.button.callback(
      tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_BTN_DELETE_PERIOD_INDEXED', {
        index: index + 1,
      }),
      makeAdminPanelScheduleTemporaryDeleteRequestAction(period.dateFromCode, period.dateToCode),
    ),
  ]);

  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_ADD_TEMPORARY'), ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_CREATE_OPEN)],
    ...deleteRows,
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_REFRESH'), ADMIN_PANEL_ACTION.SCHEDULE_OPEN_TEMPORARY)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_BACK_TO_MENU'), ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_BACK'), ADMIN_PANEL_ACTION.SCHEDULE_BACK)],
  ]);
}

/**
 * @summary Текст старту flow встановлення тимчасового графіку.
 */
export function formatAdminScheduleTemporarySetPeriodText(
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_TEMPORARY_SET_PERIOD_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_TEMPORARY_SET_PERIOD_INPUT_FORMAT')}\n` +
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_TEMPORARY_SET_PERIOD_EXAMPLE')}\n\n` +
    tBot(language, 'ADMIN_PANEL_SCHEDULE_TEMPORARY_SET_PERIOD_MIN_DAYS')
  );
}

function formatTemporaryDayState(
  day: AdminStudioTemporaryScheduleDayInput | null,
  language: BotUiLanguage,
): string {
  if (!day) return tBot(language, 'ADMIN_PANEL_SCHEDULE_TEMPORARY_DAY_NOT_CONFIGURED');
  if (!day.isOpen || !day.openTime || !day.closeTime) {
    return tBot(language, 'ADMIN_PANEL_SCHEDULE_RANGE_DAY_OFF');
  }
  return tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_RANGE_OPEN', {
    from: day.openTime,
    to: day.closeTime,
  });
}

/**
 * @summary Текст кроку налаштування днів для тимчасового графіку.
 */
export function formatAdminScheduleTemporaryDaysConfigText(
  dateFromLabel: string,
  dateToLabel: string,
  days: AdminStudioTemporaryScheduleDayInput[],
  language: BotUiLanguage = 'uk',
): string {
  const byWeekday = new Map<number, AdminStudioTemporaryScheduleDayInput>(
    days.map((day) => [day.weekday, day]),
  );

  const lines: string[] = [];
  for (let weekday = 1; weekday <= 7; weekday += 1) {
    const label = weekdayLabel(weekday, language);
    const day = byWeekday.get(weekday) ?? null;
    lines.push(`${label}: ${formatTemporaryDayState(day, language)}`);
  }

  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_TEMPORARY_CONFIG_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_TEMPORARY_PERIOD_LABEL', {
      from: dateFromLabel,
      to: dateToLabel,
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_TEMPORARY_CONFIGURED_DAYS', {
      count: days.length,
    }) + '\n\n' +
    `${lines.join('\n')}\n\n` +
    tBot(language, 'ADMIN_PANEL_SCHEDULE_TEMPORARY_PICK_DAY')
  );
}

/**
 * @summary Текст кроку вводу часу початку для обраного дня.
 */
export function formatAdminScheduleTemporaryDayFromInputText(
  weekday: number,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_TEMPORARY_DAY_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_LABEL_WEEKDAY', {
      day: weekdayLabel(weekday, language),
    }) + '\n\n' +
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_INPUT_FROM')}\n` +
    tBot(language, 'ADMIN_PANEL_SCHEDULE_INPUT_EXAMPLE_TEMPORARY')
  );
}

/**
 * @summary Текст кроку вводу часу завершення для обраного дня.
 */
export function formatAdminScheduleTemporaryDayToInputText(
  weekday: number,
  fromTime: string,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_TEMPORARY_DAY_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_LABEL_WEEKDAY', {
      day: weekdayLabel(weekday, language),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_LABEL_FROM', {
      from: fromTime,
    }) + '\n\n' +
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_INPUT_TO')}\n` +
    tBot(language, 'ADMIN_PANEL_SCHEDULE_INPUT_EXAMPLE_TO')
  );
}

function formatTemporaryPreviewLines(
  days: AdminStudioTemporaryScheduleDayInput[],
  language: BotUiLanguage,
): string {
  return days
    .sort((a, b) => a.weekday - b.weekday)
    .map((day) => {
      const label = weekdayLabel(day.weekday, language);
      if (!day.isOpen || !day.openTime || !day.closeTime) {
        return tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_TEMPORARY_PREVIEW_OFF', {
          day: label,
        });
      }
      return tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_TEMPORARY_PREVIEW_OPEN', {
        day: label,
        from: day.openTime,
        to: day.closeTime,
      });
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
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_TEMPORARY_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_TEMPORARY_PERIOD_LABEL', {
      from: dateFromLabel,
      to: dateToLabel,
    }) + '\n\n' +
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_TEMPORARY_CONFIRM_NEW_SCHEDULE')}\n` +
    `${formatTemporaryPreviewLines(days, language)}\n\n` +
    tBot(language, 'ADMIN_PANEL_SCHEDULE_TEMPORARY_CONFIRM_HINT')
  );
}

/**
 * @summary Клавіатура вводу періоду тимчасового графіку.
 */
export function createAdminScheduleTemporaryPeriodInputKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_CANCEL_ACTION'), ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_CREATE_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_BACK_TO_SECTION'), ADMIN_PANEL_ACTION.SCHEDULE_OPEN_TEMPORARY)],
  ]);
}

/**
 * @summary Клавіатура налаштування днів тижня для тимчасового графіку.
 */
export function createAdminScheduleTemporaryDaysConfigKeyboard(
  days: AdminStudioTemporaryScheduleDayInput[],
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const byWeekday = new Map<number, AdminStudioTemporaryScheduleDayInput>(
    days.map((day) => [day.weekday, day]),
  );

  const dayRows = TEMPORARY_WEEKDAY_ROWS.map((row) =>
    row.map((weekday) => {
      const label = weekdayLabel(weekday, language);
      const day = byWeekday.get(weekday);
      const icon = day ? '✅' : '⚪';
      return Markup.button.callback(`${icon} ${label}`, makeAdminPanelScheduleTemporaryDayAction(weekday));
    }),
  );

  return Markup.inlineKeyboard([
    ...dayRows,
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_CONFIRM'), ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_CREATE_CONFIRM)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_CANCEL_ACTION'), ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_CREATE_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_BACK_TO_SECTION'), ADMIN_PANEL_ACTION.SCHEDULE_OPEN_TEMPORARY)],
  ]);
}

/**
 * @summary Клавіатура вводу часу для обраного дня тимчасового графіку.
 */
export function createAdminScheduleTemporaryDayInputKeyboard(
  weekday: number,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_MARK_DAY_OFF'),
        makeAdminPanelScheduleTemporaryDayOffAction(weekday),
      ),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_CANCEL_ACTION'), ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_CREATE_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SCHEDULE_BTN_BACK_TO_SECTION'), ADMIN_PANEL_ACTION.SCHEDULE_OPEN_TEMPORARY)],
  ]);
}

/**
 * @summary Текст підтвердження видалення періоду тимчасового графіку.
 */
export function formatAdminScheduleDeleteTemporaryConfirmText(
  dateFrom: Date | string,
  dateTo: Date | string,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_SCHEDULE_DELETE_TEMPORARY_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_SCHEDULE_DELETE_TEMPORARY_ASK', {
      from: formatDate(dateFrom, language),
      to: formatDate(dateTo, language),
    })
  );
}
