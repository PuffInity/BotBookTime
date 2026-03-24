import { Markup } from 'telegraf';
import type {
  MasterPanelScheduleData,
  MasterScheduleTemporaryHoursItem,
  MasterScheduleWeeklyItem,
} from '../../types/db-helpers/db-master-schedule.types.js';
import {
  MASTER_PANEL_ACTION,
  MASTER_PANEL_BUTTON_TEXT,
} from '../../types/bot-master-panel.types.js';

/**
 * @file master-schedule-view.bot.ts
 * @summary UI/helper-и для екрану "Мій розклад" у панелі майстра.
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

function dateLabel(date: Date): string {
  return date.toLocaleDateString('uk-UA');
}

function timeRangeLabel(item: MasterScheduleWeeklyItem): string {
  if (!item.isWorking || !item.openTime || !item.closeTime) {
    return '🚫 вихідний';
  }

  return `${item.openTime.slice(0, 5)}–${item.closeTime.slice(0, 5)}`;
}

function tempTimeRangeLabel(item: MasterScheduleTemporaryHoursItem): string {
  if (!item.isWorking || !item.openTime || !item.closeTime) {
    return '🚫 вихідний';
  }
  return `${item.openTime.slice(0, 5)}–${item.closeTime.slice(0, 5)}`;
}

function formatWeeklyBlock(data: MasterPanelScheduleData): string {
  if (data.weeklyHours.length === 0) {
    return '⚠️ Базовий тижневий графік ще не налаштовано.';
  }

  const mapped = new Map(data.weeklyHours.map((item) => [item.weekday, item]));
  const lines: string[] = [];

  for (let weekday = 1; weekday <= 7; weekday += 1) {
    const current = mapped.get(weekday);
    const label = WEEKDAY_LABELS[weekday];

    if (!current) {
      lines.push(`${label}: не налаштовано`);
      continue;
    }

    lines.push(`${label}: ${timeRangeLabel(current)}`);
  }

  return lines.join('\n');
}

function formatTemporaryBlock(data: MasterPanelScheduleData): string {
  if (data.upcomingTemporaryHours.length === 0) {
    return 'немає';
  }

  return data.upcomingTemporaryHours
    .slice(0, 3)
    .map((item, index) => {
      const day = WEEKDAY_LABELS[item.weekday] ?? `День ${item.weekday}`;
      const note = item.note?.trim() ? ` • ${item.note.trim()}` : '';
      return (
        `${index + 1}️⃣ ${dateLabel(item.dateFrom)}–${dateLabel(item.dateTo)} (${day})\n` +
        `${tempTimeRangeLabel(item)}${note}`
      );
    })
    .join('\n\n');
}

function formatDaysOffBlock(data: MasterPanelScheduleData): string {
  if (data.upcomingDaysOff.length === 0) {
    return 'немає';
  }

  return data.upcomingDaysOff
    .slice(0, 3)
    .map((item, index) => {
      const reason = item.reason?.trim() ? ` • ${item.reason.trim()}` : '';
      return `${index + 1}️⃣ ${dateLabel(item.offDate)}${reason}`;
    })
    .join('\n');
}

function formatVacationsBlock(data: MasterPanelScheduleData): string {
  if (data.upcomingVacations.length === 0) {
    return 'немає';
  }

  return data.upcomingVacations
    .slice(0, 3)
    .map((item, index) => {
      const reason = item.reason?.trim() ? ` • ${item.reason.trim()}` : '';
      return `${index + 1}️⃣ ${dateLabel(item.dateFrom)}–${dateLabel(item.dateTo)}${reason}`;
    })
    .join('\n');
}

function formatDaysOffList(data: MasterPanelScheduleData): string {
  if (data.upcomingDaysOff.length === 0) {
    return '📭 Найближчих вихідних дат не знайдено.';
  }

  return data.upcomingDaysOff
    .slice(0, 10)
    .map((item, index) => {
      const reason = item.reason?.trim() ? `\n📝 Причина: ${item.reason.trim()}` : '';
      return `${index + 1}️⃣ ${dateLabel(item.offDate)}\n🚫 Вихідний день${reason}`;
    })
    .join('\n\n');
}

function formatVacationsList(data: MasterPanelScheduleData): string {
  if (data.upcomingVacations.length === 0) {
    return '📭 Найближчих періодів відпустки не знайдено.';
  }

  return data.upcomingVacations
    .slice(0, 10)
    .map((item, index) => {
      const reason = item.reason?.trim() ? `\n📝 Причина: ${item.reason.trim()}` : '';
      return `${index + 1}️⃣ ${dateLabel(item.dateFrom)}–${dateLabel(item.dateTo)}${reason}`;
    })
    .join('\n\n');
}

function formatTemporaryHoursList(data: MasterPanelScheduleData): string {
  if (data.upcomingTemporaryHours.length === 0) {
    return '📭 Тимчасових змін графіка не знайдено.';
  }

  return data.upcomingTemporaryHours
    .slice(0, 10)
    .map((item, index) => {
      const day = WEEKDAY_LABELS[item.weekday] ?? `День ${item.weekday}`;
      const note = item.note?.trim() ? `\n📝 Примітка: ${item.note.trim()}` : '';
      return (
        `${index + 1}️⃣ ${dateLabel(item.dateFrom)}–${dateLabel(item.dateTo)} (${day})\n` +
        `🕒 ${tempTimeRangeLabel(item)}${note}`
      );
    })
    .join('\n\n');
}

/**
 * @summary Формує текст екрану "Мій розклад".
 */
export function formatMasterScheduleText(data: MasterPanelScheduleData): string {
  return (
    '🕒 Мій розклад\n' +
    '━━━━━━━━━━━━━━\n\n' +
    '📅 Поточний тижневий графік:\n' +
    `${formatWeeklyBlock(data)}\n\n` +
    '📌 Тимчасові зміни графіку:\n' +
    `${formatTemporaryBlock(data)}\n\n` +
    '🏝 Найближчі вихідні:\n' +
    `${formatDaysOffBlock(data)}\n\n` +
    '🏖 Найближчі відпустки:\n' +
    `${formatVacationsBlock(data)}\n\n` +
    'Оберіть дію кнопками нижче.'
  );
}

/**
 * @summary Клавіатура екрану "Мій розклад".
 */
export function createMasterScheduleKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        MASTER_PANEL_BUTTON_TEXT.SCHEDULE_CONFIGURE_DAY,
        MASTER_PANEL_ACTION.SCHEDULE_CONFIGURE_DAY,
      ),
    ],
    [
      Markup.button.callback(
        MASTER_PANEL_BUTTON_TEXT.SCHEDULE_SET_DAY_OFF,
        MASTER_PANEL_ACTION.SCHEDULE_SET_DAY_OFF,
      ),
      Markup.button.callback(
        MASTER_PANEL_BUTTON_TEXT.SCHEDULE_LIST_DAYS_OFF,
        MASTER_PANEL_ACTION.SCHEDULE_LIST_DAYS_OFF,
      ),
    ],
    [
      Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.SCHEDULE_VACATIONS, MASTER_PANEL_ACTION.SCHEDULE_VACATIONS),
      Markup.button.callback(
        MASTER_PANEL_BUTTON_TEXT.SCHEDULE_TEMPORARY_HOURS,
        MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS,
      ),
    ],
    [Markup.button.callback('🔄 Оновити розклад', MASTER_PANEL_ACTION.OPEN_SCHEDULE)],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.BACK_TO_PANEL, MASTER_PANEL_ACTION.BACK_TO_PANEL)],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.HOME, MASTER_PANEL_ACTION.HOME)],
  ]);
}

/**
 * @summary Текст екрану налаштування робочого дня (інфо-крок).
 */
export function formatMasterScheduleConfigureDayText(): string {
  return (
    '👩‍🎨 Налаштування робочого дня\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Тут змінюються години роботи для конкретного дня тижня.\n\n' +
    'Формат часу: HH:MM–HH:MM\n' +
    'Приклад: 10:00–19:00\n\n' +
    'Наступним кроком підключимо редагування днів напряму в цьому розділі.'
  );
}

/**
 * @summary Текст екрану встановлення вихідного дня (інфо-крок).
 */
export function formatMasterScheduleSetDayOffText(): string {
  return (
    '📅 Встановити вихідний день\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Оберіть дату, на яку потрібно встановити вихідний день.\n\n' +
    'У цей день нові записи для клієнтів будуть недоступні.\n\n' +
    'Якщо на дату вже є активні записи, система попросить спочатку перенести або скасувати їх.\n\n' +
    '⸻\n\n' +
    'Формат дати: ДД.ММ.РРРР\n' +
    'Приклад: 12.03.2026'
  );
}

/**
 * @summary Текст списку найближчих вихідних днів.
 */
export function formatMasterScheduleDaysOffListText(data: MasterPanelScheduleData): string {
  return (
    '📋 Ваші вихідні дні\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `${formatDaysOffList(data)}`
  );
}

/**
 * @summary Текст списку найближчих відпусток.
 */
export function formatMasterScheduleVacationsText(data: MasterPanelScheduleData): string {
  return (
    '🏖 Ваші періоди відпустки\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `${formatVacationsList(data)}\n\n` +
    'Кнопками нижче можна встановити новий період відпустки.'
  );
}

/**
 * @summary Текст списку тимчасових змін графіка.
 */
export function formatMasterScheduleTemporaryHoursText(data: MasterPanelScheduleData): string {
  return (
    '🕒 Тимчасові зміни графіку\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `${formatTemporaryHoursList(data)}`
  );
}

/**
 * @summary Базова клавіатура для вкладених екранів розкладу.
 */
export function createMasterScheduleSectionKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.SCHEDULE_BACK, MASTER_PANEL_ACTION.OPEN_SCHEDULE)],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.BACK_TO_PANEL, MASTER_PANEL_ACTION.BACK_TO_PANEL)],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.HOME, MASTER_PANEL_ACTION.HOME)],
  ]);
}

/**
 * @summary Клавіатура секції "Відпустка".
 */
export function createMasterScheduleVacationsKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback('➕ Встановити період відпустки', MASTER_PANEL_ACTION.SCHEDULE_VACATIONS_CREATE)],
    [Markup.button.callback('🔄 Оновити список', MASTER_PANEL_ACTION.SCHEDULE_VACATIONS)],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.SCHEDULE_BACK, MASTER_PANEL_ACTION.OPEN_SCHEDULE)],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.HOME, MASTER_PANEL_ACTION.HOME)],
  ]);
}

/**
 * @summary Текст підтвердження встановлення вихідного дня.
 */
export function formatMasterScheduleSetDayOffConfirmText(dateLabelValue: string): string {
  return (
    '⚠️ Підтвердження\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Ви впевнені, що хочете встановити вихідний день на дату:\n\n' +
    `📅 ${dateLabelValue}\n\n` +
    'У цей день нові записи для клієнтів будуть недоступні.'
  );
}

/**
 * @summary Повідомлення про успішне встановлення вихідного дня.
 */
export function formatMasterScheduleSetDayOffSuccessText(dateLabelValue: string): string {
  return (
    '✅ Вихідний день встановлено\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `📅 Дата: ${dateLabelValue}\n\n` +
    'У цей день клієнти не зможуть записатися на процедури.'
  );
}

/**
 * @summary Клавіатура для кроку вводу дати вихідного дня.
 */
export function createMasterScheduleSetDayOffInputKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback('❌ Скасувати дію', MASTER_PANEL_ACTION.SCHEDULE_SET_DAY_OFF_CANCEL)],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.SCHEDULE_BACK, MASTER_PANEL_ACTION.OPEN_SCHEDULE)],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.HOME, MASTER_PANEL_ACTION.HOME)],
  ]);
}

/**
 * @summary Клавіатура для підтвердження встановлення вихідного дня.
 */
export function createMasterScheduleSetDayOffConfirmKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback('✅ Підтвердити', MASTER_PANEL_ACTION.SCHEDULE_SET_DAY_OFF_CONFIRM)],
    [Markup.button.callback('❌ Скасувати дію', MASTER_PANEL_ACTION.SCHEDULE_SET_DAY_OFF_CANCEL)],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.SCHEDULE_BACK, MASTER_PANEL_ACTION.OPEN_SCHEDULE)],
  ]);
}

/**
 * @summary Текст старту flow встановлення відпустки.
 */
export function formatMasterScheduleVacationSetText(): string {
  return (
    '🏖 Встановити період відпустки\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Вкажіть період відпустки у форматі:\n' +
    'ДД.ММ.РРРР - ДД.ММ.РРРР\n\n' +
    'Приклад: 15.07.2026 - 25.07.2026\n\n' +
    'У цей період нові записи для клієнтів будуть недоступні.'
  );
}

/**
 * @summary Текст підтвердження створення періоду відпустки.
 */
export function formatMasterScheduleVacationConfirmText(
  dateFromLabel: string,
  dateToLabel: string,
): string {
  return (
    '⚠️ Підтвердження\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Ви впевнені, що хочете встановити період відпустки:\n\n' +
    `📅 ${dateFromLabel} - ${dateToLabel}\n\n` +
    'У цей період нові записи для клієнтів будуть недоступні.'
  );
}

/**
 * @summary Повідомлення про успішне встановлення відпустки.
 */
export function formatMasterScheduleVacationSuccessText(
  dateFromLabel: string,
  dateToLabel: string,
): string {
  return (
    '✅ Відпустку успішно встановлено\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `📅 Період: ${dateFromLabel} - ${dateToLabel}\n\n` +
    'У цей період ви будете недоступні для нових записів.'
  );
}

/**
 * @summary Клавіатура кроку вводу періоду відпустки.
 */
export function createMasterScheduleVacationInputKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback('❌ Скасувати дію', MASTER_PANEL_ACTION.SCHEDULE_VACATIONS_CANCEL)],
    [Markup.button.callback('⬅️ До відпустки', MASTER_PANEL_ACTION.SCHEDULE_VACATIONS)],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.HOME, MASTER_PANEL_ACTION.HOME)],
  ]);
}

/**
 * @summary Клавіатура підтвердження періоду відпустки.
 */
export function createMasterScheduleVacationConfirmKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback('✅ Підтвердити', MASTER_PANEL_ACTION.SCHEDULE_VACATIONS_CONFIRM)],
    [Markup.button.callback('❌ Скасувати дію', MASTER_PANEL_ACTION.SCHEDULE_VACATIONS_CANCEL)],
    [Markup.button.callback('⬅️ До відпустки', MASTER_PANEL_ACTION.SCHEDULE_VACATIONS)],
  ]);
}
