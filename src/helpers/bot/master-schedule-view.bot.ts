import { Markup } from 'telegraf';
import type {
  MasterPanelScheduleData,
  MasterTemporaryScheduleDayInput,
  MasterScheduleTemporaryHoursItem,
  MasterScheduleWeeklyItem,
} from '../../types/db-helpers/db-master-schedule.types.js';
import {
  MASTER_PANEL_ACTION,
  makeMasterPanelScheduleDayOffDeleteRequestAction,
  makeMasterPanelScheduleConfigureDayOffAction,
  makeMasterPanelScheduleConfigureDayWeekdayAction,
  makeMasterPanelScheduleTemporaryDeleteRequestAction,
  makeMasterPanelScheduleVacationDeleteRequestAction,
  makeMasterPanelTemporaryHoursDayAction,
  makeMasterPanelTemporaryHoursDayOffAction,
} from '../../types/bot-master-panel.types.js';
import { tBot, tBotTemplate } from './i18n.bot.js';
import type { BotUiLanguage } from './i18n.bot.js';

/**
 * @file master-schedule-view.bot.ts
 * @summary UI/helper-и для екрану "Мій розклад" у панелі майстра.
 */

const WEEKDAY_LABELS: Record<BotUiLanguage, Record<number, string>> = {
  uk: {
    1: 'Пн',
    2: 'Вт',
    3: 'Ср',
    4: 'Чт',
    5: 'Пт',
    6: 'Сб',
    7: 'Нд',
  },
  en: {
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
    7: 'Sun',
  },
  cs: {
    1: 'Po',
    2: 'Út',
    3: 'St',
    4: 'Čt',
    5: 'Pá',
    6: 'So',
    7: 'Ne',
  },
};

const DATE_LOCALE_BY_LANGUAGE: Record<BotUiLanguage, string> = {
  uk: 'uk-UA',
  en: 'en-US',
  cs: 'cs-CZ',
};

/**
 * uk: Внутрішня bot helper функція getWeekdayLabel.
 * en: Internal bot helper function getWeekdayLabel.
 * cz: Interní bot helper funkce getWeekdayLabel.
 */
function getWeekdayLabel(weekday: number, language: BotUiLanguage): string {
  return (
    WEEKDAY_LABELS[language]?.[weekday] ??
    tBotTemplate(language, 'MASTERS_WEEKDAY_FALLBACK', { weekday })
  );
}

/**
 * uk: Внутрішня bot helper функція dateLabel.
 * en: Internal bot helper function dateLabel.
 * cz: Interní bot helper funkce dateLabel.
 */
function dateLabel(date: Date, language: BotUiLanguage): string {
  return date.toLocaleDateString(DATE_LOCALE_BY_LANGUAGE[language]);
}

/**
 * uk: Внутрішня bot helper функція dateCode.
 * en: Internal bot helper function dateCode.
 * cz: Interní bot helper funkce dateCode.
 */
function dateCode(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * uk: Внутрішня bot helper функція timeRangeLabel.
 * en: Internal bot helper function timeRangeLabel.
 * cz: Interní bot helper funkce timeRangeLabel.
 */
function timeRangeLabel(item: MasterScheduleWeeklyItem, language: BotUiLanguage): string {
  if (!item.isWorking || !item.openTime || !item.closeTime) {
    return `🚫 ${tBot(language, 'MASTER_PANEL_SCHEDULE_DAY_OFF')}`;
  }

  return `${item.openTime.slice(0, 5)}–${item.closeTime.slice(0, 5)}`;
}

/**
 * uk: Внутрішня bot helper функція tempTimeRangeLabel.
 * en: Internal bot helper function tempTimeRangeLabel.
 * cz: Interní bot helper funkce tempTimeRangeLabel.
 */
function tempTimeRangeLabel(item: MasterScheduleTemporaryHoursItem, language: BotUiLanguage): string {
  if (!item.isWorking || !item.openTime || !item.closeTime) {
    return `🚫 ${tBot(language, 'MASTER_PANEL_SCHEDULE_DAY_OFF')}`;
  }
  return `${item.openTime.slice(0, 5)}–${item.closeTime.slice(0, 5)}`;
}

/**
 * uk: Внутрішня bot helper функція formatWeeklyBlock.
 * en: Internal bot helper function formatWeeklyBlock.
 * cz: Interní bot helper funkce formatWeeklyBlock.
 */
function formatWeeklyBlock(data: MasterPanelScheduleData, language: BotUiLanguage): string {
  if (data.weeklyHours.length === 0) {
    return tBot(language, 'MASTER_PANEL_SCHEDULE_WEEKLY_NOT_CONFIGURED');
  }

  const mapped = new Map(data.weeklyHours.map((item) => [item.weekday, item]));
  const lines: string[] = [];

  for (let weekday = 1; weekday <= 7; weekday += 1) {
    const current = mapped.get(weekday);
    const label = getWeekdayLabel(weekday, language);

    if (!current) {
      lines.push(`${label}: ${tBot(language, 'MASTER_PANEL_SCHEDULE_DAY_NOT_CONFIGURED')}`);
      continue;
    }

    lines.push(`${label}: ${timeRangeLabel(current, language)}`);
  }

  return lines.join('\n');
}

/**
 * uk: Внутрішня bot helper функція formatTemporaryBlock.
 * en: Internal bot helper function formatTemporaryBlock.
 * cz: Interní bot helper funkce formatTemporaryBlock.
 */
function formatTemporaryBlock(data: MasterPanelScheduleData, language: BotUiLanguage): string {
  if (data.upcomingTemporaryHours.length === 0) {
    return tBot(language, 'MASTER_PANEL_SCHEDULE_LIST_EMPTY');
  }

  return data.upcomingTemporaryHours
    .slice(0, 3)
    .map((item, index) => {
      const day = getWeekdayLabel(item.weekday, language);
      const note = item.note?.trim() ? ` • ${item.note.trim()}` : '';
      return (
        `${index + 1}️⃣ ${dateLabel(item.dateFrom, language)}–${dateLabel(item.dateTo, language)} (${day})\n` +
        `${tempTimeRangeLabel(item, language)}${note}`
      );
    })
    .join('\n\n');
}

/**
 * uk: Внутрішня bot helper функція formatDaysOffBlock.
 * en: Internal bot helper function formatDaysOffBlock.
 * cz: Interní bot helper funkce formatDaysOffBlock.
 */
function formatDaysOffBlock(data: MasterPanelScheduleData, language: BotUiLanguage): string {
  if (data.upcomingDaysOff.length === 0) {
    return tBot(language, 'MASTER_PANEL_SCHEDULE_LIST_EMPTY');
  }

  return data.upcomingDaysOff
    .slice(0, 3)
    .map((item, index) => {
      const reason = item.reason?.trim() ? ` • ${item.reason.trim()}` : '';
      return `${index + 1}️⃣ ${dateLabel(item.offDate, language)}${reason}`;
    })
    .join('\n');
}

/**
 * uk: Внутрішня bot helper функція formatVacationsBlock.
 * en: Internal bot helper function formatVacationsBlock.
 * cz: Interní bot helper funkce formatVacationsBlock.
 */
function formatVacationsBlock(data: MasterPanelScheduleData, language: BotUiLanguage): string {
  if (data.upcomingVacations.length === 0) {
    return tBot(language, 'MASTER_PANEL_SCHEDULE_LIST_EMPTY');
  }

  return data.upcomingVacations
    .slice(0, 3)
    .map((item, index) => {
      const reason = item.reason?.trim() ? ` • ${item.reason.trim()}` : '';
      return `${index + 1}️⃣ ${dateLabel(item.dateFrom, language)}–${dateLabel(item.dateTo, language)}${reason}`;
    })
    .join('\n');
}

/**
 * uk: Внутрішня bot helper функція formatDaysOffList.
 * en: Internal bot helper function formatDaysOffList.
 * cz: Interní bot helper funkce formatDaysOffList.
 */
function formatDaysOffList(data: MasterPanelScheduleData, language: BotUiLanguage): string {
  if (data.upcomingDaysOff.length === 0) {
    return tBot(language, 'MASTER_PANEL_SCHEDULE_DAYS_OFF_LIST_EMPTY');
  }

  return data.upcomingDaysOff
    .slice(0, 10)
    .map((item, index) => {
      const reason = item.reason?.trim() ? `\n📝 ${item.reason.trim()}` : '';
      return `${index + 1}️⃣ ${dateLabel(item.offDate, language)}\n🚫 ${tBot(language, 'MASTER_PANEL_SCHEDULE_DAY_OFF')}${reason}`;
    })
    .join('\n\n');
}

/**
 * uk: Внутрішня bot helper функція formatVacationsList.
 * en: Internal bot helper function formatVacationsList.
 * cz: Interní bot helper funkce formatVacationsList.
 */
function formatVacationsList(data: MasterPanelScheduleData, language: BotUiLanguage): string {
  if (data.upcomingVacations.length === 0) {
    return tBot(language, 'MASTER_PANEL_SCHEDULE_VACATION_LIST_EMPTY');
  }

  return data.upcomingVacations
    .slice(0, 10)
    .map((item, index) => {
      const reason = item.reason?.trim() ? `\n📝 ${item.reason.trim()}` : '';
      return `${index + 1}️⃣ ${dateLabel(item.dateFrom, language)}–${dateLabel(item.dateTo, language)}${reason}`;
    })
    .join('\n\n');
}

/**
 * uk: Внутрішня bot helper функція formatTemporaryHoursList.
 * en: Internal bot helper function formatTemporaryHoursList.
 * cz: Interní bot helper funkce formatTemporaryHoursList.
 */
function formatTemporaryHoursList(data: MasterPanelScheduleData, language: BotUiLanguage): string {
  if (data.upcomingTemporaryHours.length === 0) {
    return tBot(language, 'MASTER_PANEL_SCHEDULE_TEMPORARY_LIST_EMPTY');
  }

  const periodMap = new Map<string, MasterScheduleTemporaryHoursItem[]>();
  for (const item of data.upcomingTemporaryHours) {
    const key = `${dateCode(item.dateFrom)}:${dateCode(item.dateTo)}`;
    const existing = periodMap.get(key) ?? [];
    existing.push(item);
    periodMap.set(key, existing);
  }

  const periods = Array.from(periodMap.values())
    .map((items) => items.sort((a, b) => a.weekday - b.weekday))
    .sort((a, b) => a[0].dateFrom.getTime() - b[0].dateFrom.getTime())
    .slice(0, 10);

  return periods
    .map((items, index) => {
      const first = items[0];
      const daysText = items
        .map((item) => {
          const day = getWeekdayLabel(item.weekday, language);
          return `${day}: ${tempTimeRangeLabel(item, language)}`;
        })
        .join('\n');
      return (
        `${index + 1}️⃣ ${dateLabel(first.dateFrom, language)}–${dateLabel(first.dateTo, language)}\n` +
        `${daysText}`
      );
    })
    .join('\n\n');
}

type MasterTemporarySchedulePeriodView = {
  dateFrom: Date;
  dateTo: Date;
  dateFromCode: string;
  dateToCode: string;
};

/**
 * uk: Внутрішня bot helper функція extractTemporaryPeriods.
 * en: Internal bot helper function extractTemporaryPeriods.
 * cz: Interní bot helper funkce extractTemporaryPeriods.
 */
function extractTemporaryPeriods(data: MasterPanelScheduleData): MasterTemporarySchedulePeriodView[] {
  const periodMap = new Map<string, MasterTemporarySchedulePeriodView>();
  for (const item of data.upcomingTemporaryHours) {
    const fromCode = dateCode(item.dateFrom);
    const toCode = dateCode(item.dateTo);
    const key = `${fromCode}:${toCode}`;
    if (!periodMap.has(key)) {
      periodMap.set(key, {
        dateFrom: item.dateFrom,
        dateTo: item.dateTo,
        dateFromCode: fromCode,
        dateToCode: toCode,
      });
    }
  }

  return Array.from(periodMap.values()).sort((a, b) => a.dateFrom.getTime() - b.dateFrom.getTime());
}

/**
 * @summary Клавіатура списку вихідних днів з діями видалення.
 */
export function createMasterScheduleDaysOffListKeyboard(
  data: MasterPanelScheduleData,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = data.upcomingDaysOff
    .slice(0, 10)
    .map((item, index) => [
      Markup.button.callback(
        tBotTemplate(language, 'MASTER_PANEL_SCHEDULE_BTN_DELETE_BY_INDEX', { index: index + 1 }),
        makeMasterPanelScheduleDayOffDeleteRequestAction(item.id),
      ),
    ]);

  return Markup.inlineKeyboard([
    ...rows,
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_SCHEDULE'), MASTER_PANEL_ACTION.OPEN_SCHEDULE)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_PANEL'), MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Клавіатура секції "Відпустка" з діями видалення.
 */
export function createMasterScheduleVacationsListKeyboard(
  data: MasterPanelScheduleData,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = data.upcomingVacations
    .slice(0, 10)
    .map((item, index) => [
      Markup.button.callback(
        tBotTemplate(language, 'MASTER_PANEL_SCHEDULE_BTN_DELETE_BY_INDEX', { index: index + 1 }),
        makeMasterPanelScheduleVacationDeleteRequestAction(item.id),
      ),
    ]);

  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_SET_VACATION_PERIOD'), MASTER_PANEL_ACTION.SCHEDULE_VACATIONS_CREATE)],
    ...rows,
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_REFRESH_LIST'), MASTER_PANEL_ACTION.SCHEDULE_VACATIONS)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_SCHEDULE'), MASTER_PANEL_ACTION.OPEN_SCHEDULE)],
  ]);
}

/**
 * @summary Клавіатура секції "Тимчасова зміна графіку" з діями видалення періоду.
 */
export function createMasterScheduleTemporaryHoursListKeyboard(
  data: MasterPanelScheduleData,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const periods = extractTemporaryPeriods(data).slice(0, 10);
  const rows = periods.map((period, index) => [
    Markup.button.callback(
      tBotTemplate(language, 'MASTER_PANEL_SCHEDULE_BTN_DELETE_PERIOD_BY_INDEX', { index: index + 1 }),
      makeMasterPanelScheduleTemporaryDeleteRequestAction(period.dateFromCode, period.dateToCode),
    ),
  ]);

  return periods.length > 0
    ? Markup.inlineKeyboard([
        [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_SET_TEMPORARY_PERIOD'), MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS_CREATE)],
        ...rows,
        [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_REFRESH_LIST'), MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS)],
        [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_SCHEDULE'), MASTER_PANEL_ACTION.OPEN_SCHEDULE)],
      ])
    : Markup.inlineKeyboard([
        [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_SET_TEMPORARY_PERIOD'), MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS_CREATE)],
        [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_REFRESH_LIST'), MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS)],
        [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_SCHEDULE'), MASTER_PANEL_ACTION.OPEN_SCHEDULE)],
      ]);
}

/**
 * @summary Формує текст екрану "Мій розклад".
 */
export function formatMasterScheduleText(
  data: MasterPanelScheduleData,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_SECTION_WEEKLY')}\n` +
    `${formatWeeklyBlock(data, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_SECTION_TEMPORARY')}\n` +
    `${formatTemporaryBlock(data, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_SECTION_DAYS_OFF')}\n` +
    `${formatDaysOffBlock(data, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_SECTION_VACATIONS')}\n` +
    `${formatVacationsBlock(data, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_ACTION_PROMPT')}`
  );
}

/**
 * @summary Клавіатура екрану "Мій розклад".
 */
export function createMasterScheduleKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_CONFIGURE_DAY'),
        MASTER_PANEL_ACTION.SCHEDULE_CONFIGURE_DAY,
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_SET_DAY_OFF'),
        MASTER_PANEL_ACTION.SCHEDULE_SET_DAY_OFF,
      ),
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_LIST_DAYS_OFF'),
        MASTER_PANEL_ACTION.SCHEDULE_LIST_DAYS_OFF,
      ),
    ],
    [
      Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_VACATIONS'), MASTER_PANEL_ACTION.SCHEDULE_VACATIONS),
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_TEMPORARY_HOURS'),
        MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS,
      ),
    ],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_REFRESH'), MASTER_PANEL_ACTION.OPEN_SCHEDULE)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_PANEL'), MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Текст екрану налаштування робочого дня.
 */
export function formatMasterScheduleConfigureDayText(
  data: MasterPanelScheduleData,
  language: BotUiLanguage = 'uk',
): string {
  const mapped = new Map(data.weeklyHours.map((item) => [item.weekday, item]));
  const lines: string[] = [];

  for (let weekday = 1; weekday <= 7; weekday += 1) {
    const label = getWeekdayLabel(weekday, language);
    const item = mapped.get(weekday);
    if (!item) {
      lines.push(`${label}: ${tBot(language, 'MASTER_PANEL_SCHEDULE_DAY_NOT_CONFIGURED')}`);
      continue;
    }
    lines.push(`${label}: ${timeRangeLabel(item, language)}`);
  }

  return (
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${lines.join('\n')}\n\n` +
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_SELECT_WEEKDAY')}`
  );
}

/**
 * @summary Клавіатура екрану налаштування робочого дня.
 */
export function createMasterScheduleConfigureDayKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(getWeekdayLabel(1, language), makeMasterPanelScheduleConfigureDayWeekdayAction(1)),
      Markup.button.callback(getWeekdayLabel(2, language), makeMasterPanelScheduleConfigureDayWeekdayAction(2)),
      Markup.button.callback(getWeekdayLabel(3, language), makeMasterPanelScheduleConfigureDayWeekdayAction(3)),
    ],
    [
      Markup.button.callback(getWeekdayLabel(4, language), makeMasterPanelScheduleConfigureDayWeekdayAction(4)),
      Markup.button.callback(getWeekdayLabel(5, language), makeMasterPanelScheduleConfigureDayWeekdayAction(5)),
      Markup.button.callback(getWeekdayLabel(6, language), makeMasterPanelScheduleConfigureDayWeekdayAction(6)),
    ],
    [Markup.button.callback(getWeekdayLabel(7, language), makeMasterPanelScheduleConfigureDayWeekdayAction(7))],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_REFRESH_SHORT'), MASTER_PANEL_ACTION.SCHEDULE_CONFIGURE_DAY)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_SCHEDULE'), MASTER_PANEL_ACTION.OPEN_SCHEDULE)],
  ]);
}

/**
 * @summary Текст кроку вводу часу початку для робочого дня.
 */
export function formatMasterScheduleConfigureDayFromInputText(
  weekday: number,
  language: BotUiLanguage = 'uk',
): string {
  const label = getWeekdayLabel(weekday, language);
  return (
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_INPUT_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `📅 ${label}\n\n` +
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_INPUT_FROM')}`
  );
}

/**
 * @summary Текст кроку вводу часу завершення для робочого дня.
 */
export function formatMasterScheduleConfigureDayToInputText(
  weekday: number,
  fromTime: string,
  language: BotUiLanguage = 'uk',
): string {
  const label = getWeekdayLabel(weekday, language);
  return (
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_INPUT_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `📅 ${label}\n` +
    `⏱ ${fromTime}\n\n` +
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_INPUT_TO')}`
  );
}

/**
 * @summary Повідомлення про успішне оновлення робочого дня.
 */
export function formatMasterScheduleConfigureDaySuccessText(
  weekday: number,
  isWorking: boolean,
  openTime: string | null,
  closeTime: string | null,
  language: BotUiLanguage = 'uk',
): string {
  const label = getWeekdayLabel(weekday, language);
  const range =
    !isWorking || !openTime || !closeTime
      ? `🚫 ${tBot(language, 'MASTER_PANEL_SCHEDULE_DAY_OFF')}`
      : `${openTime} - ${closeTime}`;
  return (
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_SUCCESS_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `📅 ${label}: ${range}`
  );
}

/**
 * @summary Клавіатура для кроків вводу часу робочого дня.
 */
export function createMasterScheduleConfigureDayInputKeyboard(
  weekday: number,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_MAKE_DAY_OFF'), makeMasterPanelScheduleConfigureDayOffAction(weekday))],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_CANCEL_ACTION'), MASTER_PANEL_ACTION.SCHEDULE_CONFIGURE_DAY)],
  ]);
}

/**
 * @summary Текст екрану встановлення вихідного дня (інфо-крок).
 */
export function formatMasterScheduleSetDayOffText(language: BotUiLanguage = 'uk'): string {
  return (
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_SET_DAY_OFF_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_SET_DAY_OFF_GUIDE')}`
  );
}

/**
 * @summary Текст списку найближчих вихідних днів.
 */
export function formatMasterScheduleDaysOffListText(
  data: MasterPanelScheduleData,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_DAYS_OFF_LIST_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${formatDaysOffList(data, language)}`
  );
}

/**
 * @summary Текст списку найближчих відпусток.
 */
export function formatMasterScheduleVacationsText(
  data: MasterPanelScheduleData,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_VACATION_LIST_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${formatVacationsList(data, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_SET_VACATION_PERIOD')}`
  );
}

/**
 * @summary Текст списку тимчасових змін графіка.
 */
export function formatMasterScheduleTemporaryHoursText(
  data: MasterPanelScheduleData,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_TEMPORARY_LIST_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${formatTemporaryHoursList(data, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_SET_TEMPORARY_PERIOD')}`
  );
}

/**
 * @summary Базова клавіатура для вкладених екранів розкладу.
 */
export function createMasterScheduleSectionKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_SCHEDULE'), MASTER_PANEL_ACTION.OPEN_SCHEDULE)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_PANEL'), MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Клавіатура секції "Відпустка".
 */
export function createMasterScheduleVacationsKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_SET_VACATION_PERIOD'), MASTER_PANEL_ACTION.SCHEDULE_VACATIONS_CREATE)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_REFRESH_LIST'), MASTER_PANEL_ACTION.SCHEDULE_VACATIONS)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_SCHEDULE'), MASTER_PANEL_ACTION.OPEN_SCHEDULE)],
  ]);
}

/**
 * @summary Клавіатура секції "Тимчасова зміна графіку".
 */
export function createMasterScheduleTemporaryHoursKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_SET_TEMPORARY_PERIOD'), MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS_CREATE)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_REFRESH_LIST'), MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_SCHEDULE'), MASTER_PANEL_ACTION.OPEN_SCHEDULE)],
  ]);
}

/**
 * @summary Текст підтвердження видалення вихідного дня.
 */
export function formatMasterScheduleDeleteDayOffConfirmText(
  dateValue: Date,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_DELETE_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'MASTER_PANEL_SCHEDULE_DELETE_DAY_OFF_BODY', {
      date: dateLabel(dateValue, language),
    })
  );
}

/**
 * @summary Текст підтвердження видалення відпустки.
 */
export function formatMasterScheduleDeleteVacationConfirmText(
  dateFromValue: Date,
  dateToValue: Date,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_DELETE_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'MASTER_PANEL_SCHEDULE_DELETE_VACATION_BODY', {
      dateFrom: dateLabel(dateFromValue, language),
      dateTo: dateLabel(dateToValue, language),
    })
  );
}

/**
 * @summary Текст підтвердження видалення тимчасового графіку.
 */
export function formatMasterScheduleDeleteTemporaryConfirmText(
  dateFromValue: Date,
  dateToValue: Date,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_DELETE_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'MASTER_PANEL_SCHEDULE_DELETE_TEMPORARY_BODY', {
      dateFrom: dateLabel(dateFromValue, language),
      dateTo: dateLabel(dateToValue, language),
    })
  );
}

/**
 * @summary Клавіатура підтвердження видалення запису в розкладі.
 */
export function createMasterScheduleDeleteConfirmKeyboard(
  confirmAction: string,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_CONFIRM_DELETE'), confirmAction)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_CANCEL_ACTION'), MASTER_PANEL_ACTION.SCHEDULE_DELETE_CANCEL)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_SCHEDULE'), MASTER_PANEL_ACTION.OPEN_SCHEDULE)],
  ]);
}

/**
 * @summary Текст підтвердження встановлення вихідного дня.
 */
export function formatMasterScheduleSetDayOffConfirmText(
  dateLabelValue: string,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_SET_DAY_OFF_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'MASTER_PANEL_SCHEDULE_SET_DAY_OFF_CONFIRM_BODY', {
      date: `📅 ${dateLabelValue}`,
    })
  );
}

/**
 * @summary Повідомлення про успішне встановлення вихідного дня.
 */
export function formatMasterScheduleSetDayOffSuccessText(
  dateLabelValue: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'MASTER_PANEL_SCHEDULE_SET_DAY_OFF_SUCCESS', {
    date: dateLabelValue,
  });
}

/**
 * @summary Клавіатура для кроку вводу дати вихідного дня.
 */
export function createMasterScheduleSetDayOffInputKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_CANCEL_ACTION'), MASTER_PANEL_ACTION.SCHEDULE_SET_DAY_OFF_CANCEL)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_SCHEDULE'), MASTER_PANEL_ACTION.OPEN_SCHEDULE)],
  ]);
}

/**
 * @summary Клавіатура для підтвердження встановлення вихідного дня.
 */
export function createMasterScheduleSetDayOffConfirmKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_CONFIRM'), MASTER_PANEL_ACTION.SCHEDULE_SET_DAY_OFF_CONFIRM)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_CANCEL_ACTION'), MASTER_PANEL_ACTION.SCHEDULE_SET_DAY_OFF_CANCEL)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_SCHEDULE'), MASTER_PANEL_ACTION.OPEN_SCHEDULE)],
  ]);
}

/**
 * @summary Текст старту flow встановлення відпустки.
 */
export function formatMasterScheduleVacationSetText(language: BotUiLanguage = 'uk'): string {
  return (
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_VACATION_SET_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_VACATION_SET_GUIDE')}`
  );
}

/**
 * @summary Текст підтвердження створення періоду відпустки.
 */
export function formatMasterScheduleVacationConfirmText(
  dateFromLabel: string,
  dateToLabel: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'MASTER_PANEL_SCHEDULE_VACATION_CONFIRM_BODY', {
    dateFrom: dateFromLabel,
    dateTo: dateToLabel,
  });
}

/**
 * @summary Повідомлення про успішне встановлення відпустки.
 */
export function formatMasterScheduleVacationSuccessText(
  dateFromLabel: string,
  dateToLabel: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'MASTER_PANEL_SCHEDULE_VACATION_SUCCESS_BODY', {
    dateFrom: dateFromLabel,
    dateTo: dateToLabel,
  });
}

/**
 * @summary Клавіатура кроку вводу періоду відпустки.
 */
export function createMasterScheduleVacationInputKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_CANCEL_ACTION'), MASTER_PANEL_ACTION.SCHEDULE_VACATIONS_CANCEL)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_BACK_TO_VACATIONS'), MASTER_PANEL_ACTION.SCHEDULE_VACATIONS)],
  ]);
}

/**
 * @summary Клавіатура підтвердження періоду відпустки.
 */
export function createMasterScheduleVacationConfirmKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_CONFIRM'), MASTER_PANEL_ACTION.SCHEDULE_VACATIONS_CONFIRM)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_CANCEL_ACTION'), MASTER_PANEL_ACTION.SCHEDULE_VACATIONS_CANCEL)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_BACK_TO_VACATIONS'), MASTER_PANEL_ACTION.SCHEDULE_VACATIONS)],
  ]);
}

/**
 * @summary Текст старту flow встановлення тимчасового графіку.
 */
export function formatMasterScheduleTemporarySetPeriodText(
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_TEMPORARY_SET_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_TEMPORARY_SET_GUIDE')}`
  );
}

type TemporaryPreviewDay = {
  weekday: number;
  isWorking: boolean;
  openTime: string | null;
  closeTime: string | null;
};

/**
 * uk: Внутрішня bot helper функція formatTemporaryPreviewLines.
 * en: Internal bot helper function formatTemporaryPreviewLines.
 * cz: Interní bot helper funkce formatTemporaryPreviewLines.
 */
function formatTemporaryPreviewLines(days: TemporaryPreviewDay[], language: BotUiLanguage): string {
  return days
    .sort((a, b) => a.weekday - b.weekday)
    .map((day) => {
      const label = getWeekdayLabel(day.weekday, language);
      if (!day.isWorking || !day.openTime || !day.closeTime) {
        return `${label}: ${tBot(language, 'MASTER_PANEL_SCHEDULE_DAY_OFF')}`;
      }
      return `${label}: ${day.openTime} - ${day.closeTime}`;
    })
    .join('\n');
}

/**
 * uk: Внутрішня bot helper функція formatTemporaryDayState.
 * en: Internal bot helper function formatTemporaryDayState.
 * cz: Interní bot helper funkce formatTemporaryDayState.
 */
function formatTemporaryDayState(
  day: MasterTemporaryScheduleDayInput | null,
  language: BotUiLanguage,
): string {
  if (!day) {
    return tBot(language, 'MASTER_PANEL_SCHEDULE_DAY_NOT_CONFIGURED');
  }
  if (!day.isWorking || !day.openTime || !day.closeTime) {
    return tBot(language, 'MASTER_PANEL_SCHEDULE_DAY_OFF');
  }
  return `${day.openTime} - ${day.closeTime}`;
}

/**
 * @summary Текст кроку вибору днів для тимчасового графіку.
 */
export function formatMasterScheduleTemporaryDaysConfigText(
  dateFromLabel: string,
  dateToLabel: string,
  days: MasterTemporaryScheduleDayInput[],
  language: BotUiLanguage = 'uk',
): string {
  const byWeekday = new Map<number, MasterTemporaryScheduleDayInput>(
    days.map((day) => [day.weekday, day]),
  );

  const lines: string[] = [];
  for (let weekday = 1; weekday <= 7; weekday += 1) {
    const label = getWeekdayLabel(weekday, language);
    const day = byWeekday.get(weekday) ?? null;
    lines.push(`${label}: ${formatTemporaryDayState(day, language)}`);
  }

  const configuredDays = days.length;

  return (
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_TEMPORARY_CONFIG_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `📅 ${dateFromLabel} - ${dateToLabel}\n` +
    `✅ ${configuredDays}/7\n\n` +
    `${lines.join('\n')}\n\n` +
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_TEMPORARY_CONFIG_HINT')}`
  );
}

/**
 * @summary Текст кроку вводу часу початку для обраного дня.
 */
export function formatMasterScheduleTemporaryDayFromInputText(
  weekday: number,
  language: BotUiLanguage = 'uk',
): string {
  const label = getWeekdayLabel(weekday, language);
  return (
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_TEMPORARY_DAY_INPUT_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `📅 ${label}\n\n` +
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_TEMPORARY_DAY_INPUT_FROM')}`
  );
}

/**
 * @summary Текст кроку вводу часу завершення для обраного дня.
 */
export function formatMasterScheduleTemporaryDayToInputText(
  weekday: number,
  fromTime: string,
  language: BotUiLanguage = 'uk',
): string {
  const label = getWeekdayLabel(weekday, language);
  return (
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_TEMPORARY_DAY_INPUT_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `📅 ${label}\n` +
    `⏱ ${fromTime}\n\n` +
    `${tBot(language, 'MASTER_PANEL_SCHEDULE_TEMPORARY_DAY_INPUT_TO')}`
  );
}

/**
 * @summary Текст підтвердження встановлення тимчасового графіку.
 */
export function formatMasterScheduleTemporaryConfirmText(
  dateFromLabel: string,
  dateToLabel: string,
  days: TemporaryPreviewDay[],
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'MASTER_PANEL_SCHEDULE_TEMPORARY_CONFIRM_BODY', {
    dateFrom: dateFromLabel,
    dateTo: dateToLabel,
    schedule: formatTemporaryPreviewLines(days, language),
  });
}

/**
 * @summary Повідомлення про успішне встановлення тимчасового графіку.
 */
export function formatMasterScheduleTemporarySuccessText(
  dateFromLabel: string,
  dateToLabel: string,
  days: TemporaryPreviewDay[],
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'MASTER_PANEL_SCHEDULE_TEMPORARY_SUCCESS_BODY', {
    dateFrom: dateFromLabel,
    dateTo: dateToLabel,
    schedule: formatTemporaryPreviewLines(days, language),
  });
}

/**
 * @summary Клавіатура кроку вводу періоду тимчасового графіку.
 */
export function createMasterScheduleTemporaryPeriodInputKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_CANCEL_ACTION'), MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS_CANCEL)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_BACK_TO_TEMPORARY'), MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS)],
  ]);
}

/**
 * @summary Клавіатура кроку налаштування днів тижня для тимчасового графіку.
 */
export function createMasterScheduleTemporaryDaysConfigKeyboard(
  days: MasterTemporaryScheduleDayInput[],
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const byWeekday = new Map<number, MasterTemporaryScheduleDayInput>(
    days.map((day) => [day.weekday, day]),
  );

  const rows = [
    [1, 2, 3],
    [4, 5, 6],
    [7],
  ];

  const dayRows = rows.map((row) =>
    row.map((weekday) => {
      const label = getWeekdayLabel(weekday, language);
      const day = byWeekday.get(weekday);
      const icon = day ? '✅' : '⚪';
      return Markup.button.callback(
        `${icon} ${label}`,
        makeMasterPanelTemporaryHoursDayAction(weekday),
      );
    }),
  );

  return Markup.inlineKeyboard([
    ...dayRows,
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_CONFIRM_SCHEDULE'), MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS_CONFIRM)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_CANCEL_ACTION'), MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS_CANCEL)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_BACK_TO_TEMPORARY'), MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS)],
  ]);
}

/**
 * @summary Клавіатура кроку вводу часу для обраного дня.
 */
export function createMasterScheduleTemporaryDayInputKeyboard(
  weekday: number,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_MAKE_DAY_OFF'), makeMasterPanelTemporaryHoursDayOffAction(weekday))],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_CANCEL_ACTION'), MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS_CANCEL)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_BACK_TO_DAYS_CONFIG'), MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS_CREATE)],
  ]);
}

/**
 * @summary Клавіатура підтвердження тимчасового графіку.
 */
export function createMasterScheduleTemporaryConfirmKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_CONFIRM'), MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS_CONFIRM)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_CANCEL_ACTION'), MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS_CANCEL)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_SCHEDULE_BTN_BACK_TO_DAYS_CONFIG'), MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS_CREATE)],
  ]);
}
