import { Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import type { AdminPanelAccess } from '../../types/db-helpers/db-admin-panel.types.js';
import type {
  AdminBookingItem,
  AdminBookingsCategory,
  AdminBookingsFeedPage,
  RescheduleAdminBookingResult,
} from '../../types/db-helpers/db-admin-bookings.types.js';
import type {
  MasterBookingOption,
  MasterCatalogDetails,
  MasterCatalogItem,
} from '../../types/db-helpers/db-masters.types.js';
import type {
  ServicesCatalogDetails,
  ServicesCatalogItem,
} from '../../types/db-helpers/db-services.types.js';
import type { AdminPanelStatsOverview } from '../../types/db-helpers/db-admin-stats.types.js';
import type {
  AdminPanelStatsClientDetails,
  AdminPanelStatsClientsFeedPage,
  AdminPanelStatsMasterDetails,
  AdminPanelStatsMastersFeedPage,
  AdminPanelStatsMonthlyFeedPage,
  AdminPanelStatsMonthlyReportDetails,
  AdminPanelStatsServiceDetails,
  AdminPanelStatsServicesFeedPage,
} from '../../types/db-helpers/db-admin-stats.types.js';
import type { AdminStudioScheduleData } from '../../types/db-helpers/db-admin-schedule.types.js';
import type { AdminStudioTemporaryScheduleDayInput } from '../../types/db-helpers/db-admin-schedule.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import {
  createAdminRecordsMenuKeyboard,
  createAdminPanelRootKeyboard,
  formatAdminRecordsMenuText,
  formatAdminPanelRootText,
} from '../../helpers/bot/admin-panel-view.bot.js';
import {
  createAdminSettingsMenuKeyboard,
  createAdminSettingsSectionKeyboard,
  formatAdminSettingsMenuText,
  formatAdminSettingsSectionText,
} from '../../helpers/bot/admin-settings-view.bot.js';
import {
  createAdminScheduleDaysOffKeyboard,
  createAdminScheduleDeleteConfirmKeyboard,
  createAdminScheduleDayOffConfirmKeyboard,
  createAdminScheduleDayOffInputKeyboard,
  createAdminScheduleHolidaysKeyboard,
  createAdminScheduleHolidayConfirmKeyboard,
  createAdminScheduleHolidayInputKeyboard,
  createAdminScheduleMenuKeyboard,
  createAdminScheduleTemporaryDayInputKeyboard,
  createAdminScheduleTemporaryDaysConfigKeyboard,
  createAdminScheduleTemporaryKeyboard,
  createAdminScheduleTemporaryPeriodInputKeyboard,
  createAdminScheduleSectionKeyboard,
  formatAdminScheduleDayOffConfirmText,
  formatAdminScheduleDayOffInputText,
  formatAdminScheduleDeleteDayOffConfirmText,
  formatAdminScheduleDeleteHolidayConfirmText,
  formatAdminScheduleDeleteTemporaryConfirmText,
  formatAdminScheduleDaysOffText,
  formatAdminScheduleHolidayConfirmText,
  formatAdminScheduleHolidayDateInputText,
  formatAdminScheduleHolidayNameInputText,
  formatAdminScheduleHolidaysText,
  formatAdminScheduleMenuText,
  formatAdminScheduleTemporaryConfirmText,
  formatAdminScheduleTemporaryDayFromInputText,
  formatAdminScheduleTemporaryDayToInputText,
  formatAdminScheduleTemporaryDaysConfigText,
  formatAdminScheduleTemporarySetPeriodText,
  formatAdminScheduleOverviewText,
  formatAdminScheduleTemporaryText,
} from '../../helpers/bot/admin-schedule-view.bot.js';
import {
  createAdminCancelBookingConfirmKeyboard,
  createAdminChangeMasterConfirmKeyboard,
  createAdminChangeMasterSelectKeyboard,
  createAdminBookingDetailsCardKeyboard,
  createAdminBookingsFeedKeyboard,
  createAdminRescheduleConfirmKeyboard,
  createAdminRescheduleDateKeyboard,
  createAdminRescheduleTimeKeyboard,
  formatAdminCancelBookingConfirmText,
  formatAdminChangeMasterConfirmText,
  formatAdminChangeMasterStepText,
  formatAdminBookingDetailsCardText,
  formatAdminBookingsFeedText,
  formatAdminRescheduleConfirmText,
  formatAdminRescheduleDateStepText,
  formatAdminRescheduleTimeStepText,
} from '../../helpers/bot/admin-bookings-view.bot.js';
import {
  createAdminMasterBookingCardKeyboard,
  createAdminMasterBookingsFeedKeyboard,
  createAdminMasterDetailsKeyboard,
  createAdminMastersCatalogKeyboard,
  formatAdminMasterBookingCardText,
  formatAdminMasterBookingsFeedText,
  formatAdminMasterDetailsText,
  formatAdminMastersCatalogText,
} from '../../helpers/bot/admin-masters-view.bot.js';
import {
  createAdminServiceDetailsKeyboard,
  createAdminServicesCatalogKeyboard,
  formatAdminServiceDetailsText,
  formatAdminServicesCatalogText,
} from '../../helpers/bot/admin-services-view.bot.js';
import {
  createAdminStatsClientDetailsKeyboard,
  createAdminStatsClientsListKeyboard,
  createAdminStatsMonthlyListKeyboard,
  createAdminStatsMonthlyReportDetailsKeyboard,
  createAdminStatsServiceDetailsKeyboard,
  createAdminStatsServicesListKeyboard,
  createAdminStatsMasterDetailsKeyboard,
  createAdminStatsMastersListKeyboard,
  createAdminStatsOverviewKeyboard,
  createAdminStatsSectionStubKeyboard,
  formatAdminStatsClientDetailsText,
  formatAdminStatsClientsListText,
  formatAdminStatsMonthlyListText,
  formatAdminStatsMonthlyReportDetailsText,
  formatAdminStatsServiceDetailsText,
  formatAdminStatsServicesListText,
  formatAdminStatsMasterDetailsText,
  formatAdminStatsMastersListText,
  formatAdminStatsOverviewText,
  formatAdminStatsSectionStubText,
} from '../../helpers/bot/admin-stats-view.bot.js';
import {
  ADMIN_PANEL_ACTION,
  ADMIN_PANEL_MASTERS_OPEN_ACTION_REGEX,
  ADMIN_PANEL_MASTERS_BOOKINGS_OPEN_CARD_ACTION_REGEX,
  ADMIN_PANEL_MASTERS_OPEN_BOOKINGS_ACTION_REGEX,
  ADMIN_PANEL_MASTERS_OPEN_STATS_ACTION_REGEX,
  ADMIN_PANEL_STATS_CLIENTS_OPEN_ACTION_REGEX,
  ADMIN_PANEL_STATS_MASTERS_OPEN_ACTION_REGEX,
  ADMIN_PANEL_STATS_MONTHLY_OPEN_ACTION_REGEX,
  ADMIN_PANEL_STATS_SERVICES_OPEN_ACTION_REGEX,
  ADMIN_PANEL_SERVICES_OPEN_ACTION_REGEX,
  ADMIN_PANEL_SERVICES_OPEN_STATS_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_CANCEL_CONFIRM_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_CANCEL_REQUEST_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_CHANGE_MASTER_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_CHANGE_MASTER_SELECT_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_CONFIRM_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_OPEN_CARD_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_RESCHEDULE_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_RESCHEDULE_DATE_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_RESCHEDULE_TIME_ACTION_REGEX,
  ADMIN_PANEL_SCHEDULE_DAY_OFF_DELETE_CONFIRM_ACTION_REGEX,
  ADMIN_PANEL_SCHEDULE_DAY_OFF_DELETE_REQUEST_ACTION_REGEX,
  ADMIN_PANEL_SCHEDULE_HOLIDAY_DELETE_CONFIRM_ACTION_REGEX,
  ADMIN_PANEL_SCHEDULE_HOLIDAY_DELETE_REQUEST_ACTION_REGEX,
  ADMIN_PANEL_SCHEDULE_TEMPORARY_DAY_ACTION_REGEX,
  ADMIN_PANEL_SCHEDULE_TEMPORARY_DAY_OFF_ACTION_REGEX,
  ADMIN_PANEL_SCHEDULE_TEMPORARY_DELETE_CONFIRM_ACTION_REGEX,
  ADMIN_PANEL_SCHEDULE_TEMPORARY_DELETE_REQUEST_ACTION_REGEX,
  makeAdminPanelScheduleDayOffDeleteConfirmAction,
  makeAdminPanelScheduleHolidayDeleteConfirmAction,
  makeAdminPanelScheduleTemporaryDeleteConfirmAction,
} from '../../types/bot-admin-panel.types.js';
import { getAdminPanelAccessByTelegramId } from '../../helpers/db/db-admin-panel.helper.js';
import {
  cancelAdminBooking,
  confirmAdminPendingBooking,
  getAdminBookingCardById,
  listAdminBookingsFeed,
  reassignAdminBookingMaster,
  rescheduleAdminBooking,
} from '../../helpers/db/db-admin-bookings.helper.js';
import {
  createAdminStudioDayOff,
  createAdminStudioHoliday,
  createAdminStudioTemporarySchedule,
  deleteAdminStudioDayOff,
  deleteAdminStudioHoliday,
  deleteAdminStudioTemporarySchedulePeriod,
  getAdminStudioSchedule,
} from '../../helpers/db/db-admin-schedule.helper.js';
import {
  getMasterCatalogDetailsById,
  listActiveMastersByService,
  listActiveMastersCatalog,
} from '../../helpers/db/db-masters.helper.js';
import {
  getServiceCatalogDetailsById,
  listActiveServicesCatalog,
} from '../../helpers/db/db-services.helper.js';
import { getAdminPanelStatsOverview } from '../../helpers/db/db-admin-stats.helper.js';
import {
  getAdminPanelStatsClientDetails,
  getAdminPanelStatsMonthlyReportDetails,
  getAdminPanelStatsMasterDetails,
  getAdminPanelStatsServiceDetails,
  listAdminPanelStatsClientsFeed,
  listAdminPanelStatsMonthlyFeed,
  listAdminPanelStatsMastersFeed,
  listAdminPanelStatsServicesFeed,
} from '../../helpers/db/db-admin-stats.helper.js';
import { buildBookingDateOptions, buildBookingTimeOptions } from '../../helpers/bot/booking-view.bot.js';
import { bookingDateCodeSchema, bookingTimeCodeSchema } from '../../validator/booking-input.schema.js';
import { dispatchNotification } from '../../helpers/notification/notification-dispatch.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerNotification } from '../../utils/logger/loggers-list.js';

/**
 * @file admin-panel.scene.ts
 * @summary Сцена адмін-панелі:
 * - перевірка доступу
 * - кореневе меню розділів
 * - обробка підрозділів адмін-функціоналу
 */

export const ADMIN_PANEL_SCENE_ID = 'admin-panel-scene';

type AdminRescheduleDraft = {
  appointmentId: string;
  dateCode: string | null;
  timeCode: string | null;
};

type AdminChangeMasterDraft = {
  appointmentId: string;
  selectedMasterId: string | null;
  selectedMasterName: string | null;
  candidates: MasterBookingOption[];
};

type AdminScheduleSection = 'overview' | 'days-off' | 'holidays' | 'temporary';

type AdminScheduleDayOffDraft = {
  mode: 'awaiting_date' | 'awaiting_confirm';
  offDate: string | null;
  offDateLabel: string | null;
};

type AdminScheduleHolidayDraft = {
  mode: 'awaiting_date' | 'awaiting_name' | 'awaiting_confirm';
  holidayDate: string | null;
  holidayDateLabel: string | null;
  holidayName: string | null;
};

type AdminScheduleTemporaryDraft = {
  mode:
    | 'awaiting_period'
    | 'configuring_days'
    | 'awaiting_day_from'
    | 'awaiting_day_to'
    | 'awaiting_confirm';
  dateFrom: string | null;
  dateTo: string | null;
  dateFromLabel: string | null;
  dateToLabel: string | null;
  days: AdminStudioTemporaryScheduleDayInput[];
  selectedWeekday: number | null;
  pendingFromTime: string | null;
};

type AdminScheduleDeleteDraft = {
  type: 'day_off' | 'holiday' | 'temporary_period';
  id: string | null;
  dateFrom: string | null;
  dateTo: string | null;
};

type AdminMasterSubSection = 'catalog' | 'details' | 'bookings' | 'stats';
type AdminServiceSubSection = 'catalog' | 'details' | 'stats';
type AdminStatsSection = 'overview' | 'masters' | 'services' | 'monthly' | 'clients';
type AdminSettingsSection = 'menu' | 'language' | 'admins' | 'studio' | 'notifications';

type AdminPanelSceneState = {
  access: AdminPanelAccess | null;
  recordsFeed: AdminBookingsFeedPage | null;
  recordsLastCategory: AdminBookingsCategory | null;
  recordsOpenedAppointmentId: string | null;
  recordsRescheduleDraft: AdminRescheduleDraft | null;
  recordsChangeMasterDraft: AdminChangeMasterDraft | null;
  scheduleData: AdminStudioScheduleData | null;
  scheduleCurrentSection: AdminScheduleSection | null;
  scheduleDayOffDraft: AdminScheduleDayOffDraft | null;
  scheduleHolidayDraft: AdminScheduleHolidayDraft | null;
  scheduleTemporaryDraft: AdminScheduleTemporaryDraft | null;
  scheduleDeleteDraft: AdminScheduleDeleteDraft | null;
  mastersCatalog: MasterCatalogItem[] | null;
  mastersSelectedMasterId: string | null;
  mastersBookingsFeed: AdminBookingsFeedPage | null;
  mastersBookingsOpenedAppointmentId: string | null;
  mastersCurrentSection: AdminMasterSubSection | null;
  servicesCatalog: ServicesCatalogItem[] | null;
  servicesSelectedServiceId: string | null;
  servicesCurrentSection: AdminServiceSubSection | null;
  statsOverview: AdminPanelStatsOverview | null;
  statsMastersFeed: AdminPanelStatsMastersFeedPage | null;
  statsSelectedMasterId: string | null;
  statsMasterDetails: AdminPanelStatsMasterDetails | null;
  statsServicesFeed: AdminPanelStatsServicesFeedPage | null;
  statsSelectedServiceId: string | null;
  statsServiceDetails: AdminPanelStatsServiceDetails | null;
  statsMonthlyFeed: AdminPanelStatsMonthlyFeedPage | null;
  statsSelectedMonthCode: string | null;
  statsMonthlyReportDetails: AdminPanelStatsMonthlyReportDetails | null;
  statsClientsFeed: AdminPanelStatsClientsFeedPage | null;
  statsSelectedClientId: string | null;
  statsClientDetails: AdminPanelStatsClientDetails | null;
  statsCurrentSection: AdminStatsSection | null;
  settingsCurrentSection: AdminSettingsSection | null;
};

function getSceneState(ctx: MyContext): AdminPanelSceneState {
  return ctx.wizard.state as AdminPanelSceneState;
}

function resetRecordsActionDrafts(state: AdminPanelSceneState): void {
  state.recordsRescheduleDraft = null;
  state.recordsChangeMasterDraft = null;
}

function resetScheduleDrafts(state: AdminPanelSceneState): void {
  state.scheduleDayOffDraft = null;
  state.scheduleHolidayDraft = null;
  state.scheduleTemporaryDraft = null;
  state.scheduleDeleteDraft = null;
}

function resetMastersState(state: AdminPanelSceneState): void {
  state.mastersCatalog = null;
  state.mastersSelectedMasterId = null;
  state.mastersBookingsFeed = null;
  state.mastersBookingsOpenedAppointmentId = null;
  state.mastersCurrentSection = null;
}

function resetServicesState(state: AdminPanelSceneState): void {
  state.servicesCatalog = null;
  state.servicesSelectedServiceId = null;
  state.servicesCurrentSection = null;
}

function resetStatsState(state: AdminPanelSceneState): void {
  state.statsOverview = null;
  state.statsMastersFeed = null;
  state.statsSelectedMasterId = null;
  state.statsMasterDetails = null;
  state.statsServicesFeed = null;
  state.statsSelectedServiceId = null;
  state.statsServiceDetails = null;
  state.statsMonthlyFeed = null;
  state.statsSelectedMonthCode = null;
  state.statsMonthlyReportDetails = null;
  state.statsClientsFeed = null;
  state.statsSelectedClientId = null;
  state.statsClientDetails = null;
  state.statsMonthlyFeed = null;
  state.statsSelectedMonthCode = null;
  state.statsMonthlyReportDetails = null;
  state.statsClientsFeed = null;
  state.statsSelectedClientId = null;
  state.statsClientDetails = null;
  state.statsCurrentSection = null;
}

function resetSettingsState(state: AdminPanelSceneState): void {
  state.settingsCurrentSection = null;
}

function getUserText(ctx: MyContext): string | null {
  if (!ctx.message) return null;
  if (!('text' in ctx.message)) return null;
  return ctx.message.text.trim();
}

function formatDateLabel(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatDateSql(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

function parseFutureDateInput(input: string): Date {
  const normalized = input.trim();
  const match = normalized.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) {
    throw new ValidationError('Дата має бути у форматі ДД.ММ.РРРР');
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    throw new ValidationError('Введено некоректну дату');
  }

  const parsedDay = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (parsedDay.getTime() < today.getTime()) {
    throw new ValidationError('Не можна вказувати дату у минулому');
  }

  return parsedDay;
}

function normalizeHolidayName(value: string): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length < 2) {
    throw new ValidationError('Назва свята має містити мінімум 2 символи');
  }
  if (normalized.length > 120) {
    throw new ValidationError('Назва свята занадто довга (максимум 120 символів)');
  }
  return normalized;
}

const MIN_TEMPORARY_SCHEDULE_DAYS = 7;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function parseDateRangeInput(input: string): { dateFrom: Date; dateTo: Date } {
  const normalized = input.trim();
  const match = normalized.match(
    /^(\d{2}\.\d{2}\.\d{4})\s*[-–—]\s*(\d{2}\.\d{2}\.\d{4})$/,
  );

  if (!match) {
    throw new ValidationError('Період має бути у форматі ДД.ММ.РРРР - ДД.ММ.РРРР');
  }

  const dateFrom = parseFutureDateInput(match[1]);
  const dateTo = parseFutureDateInput(match[2]);
  if (dateTo.getTime() < dateFrom.getTime()) {
    throw new ValidationError('Дата завершення не може бути раніше дати початку');
  }

  return { dateFrom, dateTo };
}

function countInclusiveDays(dateFrom: Date, dateTo: Date): number {
  return Math.floor((dateTo.getTime() - dateFrom.getTime()) / DAY_IN_MS) + 1;
}

function parseTimeInput(value: string): string {
  const normalized = value.trim();
  const match = normalized.match(/^(\d{1,2}):([0-5]\d)$/);
  if (!match) {
    throw new ValidationError('Час має бути у форматі HH:MM (приклад: 10:00)');
  }

  const hour = Number(match[1]);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new ValidationError('Година має бути в діапазоні від 0 до 23');
  }

  return `${hour}:${match[2]}`;
}

function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

function upsertTemporaryDay(
  days: AdminStudioTemporaryScheduleDayInput[],
  day: AdminStudioTemporaryScheduleDayInput,
): AdminStudioTemporaryScheduleDayInput[] {
  const filtered = days.filter((current) => current.weekday !== day.weekday);
  return [...filtered, day].sort((a, b) => a.weekday - b.weekday);
}

function parseDateFromCode(code: string): Date {
  const normalized = code.trim();
  const match = normalized.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (!match) {
    throw new ValidationError('Некоректний код дати');
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    throw new ValidationError('Некоректна дата');
  }

  return parsed;
}

function getTodayDateCode(): string {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function toStartAt(dateCode: string, timeCode: string): Date {
  const year = Number(dateCode.slice(0, 4));
  const month = Number(dateCode.slice(4, 6));
  const day = Number(dateCode.slice(6, 8));
  const hour = Number(timeCode.slice(0, 2));
  const minute = Number(timeCode.slice(2, 4));
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function getAvailableRescheduleTimeCodes(dateCode: string): string[] {
  const options = buildBookingTimeOptions().map((item) => item.replace(':', ''));
  if (dateCode !== getTodayDateCode()) {
    return options;
  }

  const now = Date.now();
  return options.filter((timeCode) => toStartAt(dateCode, timeCode).getTime() > now);
}

async function renderAdminRoot(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  if (!state.access) return;

  const text = formatAdminPanelRootText(state.access);
  const keyboard = createAdminPanelRootKeyboard();

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // Якщо редагувати не вдалося — надсилаємо нове повідомлення.
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderRecordsMenu(ctx: MyContext): Promise<void> {
  const text = formatAdminRecordsMenuText();
  const keyboard = createAdminRecordsMenuKeyboard();

  try {
    await ctx.editMessageText(text, keyboard);
  } catch {
    await ctx.reply(text, keyboard);
  }
}

async function renderScheduleMenu(ctx: MyContext): Promise<void> {
  const text = formatAdminScheduleMenuText();
  const keyboard = createAdminScheduleMenuKeyboard();

  try {
    await ctx.editMessageText(text, keyboard);
  } catch {
    await ctx.reply(text, keyboard);
  }
}

async function loadAdminSchedule(state: AdminPanelSceneState): Promise<AdminStudioScheduleData> {
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError('Не вдалося визначити студію адміністратора');
  }

  const data = await getAdminStudioSchedule(studioId, 12);
  state.scheduleData = data;
  return data;
}

function formatScheduleSectionText(
  section: AdminScheduleSection,
  data: AdminStudioScheduleData,
): string {
  switch (section) {
    case 'overview':
      return formatAdminScheduleOverviewText(data);
    case 'days-off':
      return formatAdminScheduleDaysOffText(data);
    case 'holidays':
      return formatAdminScheduleHolidaysText(data);
    case 'temporary':
      return formatAdminScheduleTemporaryText(data);
    default:
      return formatAdminScheduleOverviewText(data);
  }
}

async function renderScheduleSection(
  ctx: MyContext,
  section: AdminScheduleSection,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const data = await loadAdminSchedule(state);
  state.scheduleCurrentSection = section;

  const text = formatScheduleSectionText(section, data);
  const keyboard =
    section === 'days-off'
      ? createAdminScheduleDaysOffKeyboard(data)
      : section === 'holidays'
        ? createAdminScheduleHolidaysKeyboard(data)
        : section === 'temporary'
          ? createAdminScheduleTemporaryKeyboard(data)
        : createAdminScheduleSectionKeyboard();

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

function getSettingsSectionText(section: Exclude<AdminSettingsSection, 'menu'>): string {
  switch (section) {
    case 'language':
      return formatAdminSettingsSectionText(
        '🌐 Мова панелі',
        'Тут буде керування мовою адмін-панелі та локалями інтерфейсу.',
      );
    case 'admins':
      return formatAdminSettingsSectionText(
        '👑 Адміністратори',
        'Тут буде керування доступами адміністраторів, ролями та правами.',
      );
    case 'studio':
      return formatAdminSettingsSectionText(
        '🏢 Параметри салону',
        'Тут буде редагування назви, контактів, таймзони та базових параметрів салону.',
      );
    case 'notifications':
      return formatAdminSettingsSectionText(
        '🔔 Системні сповіщення',
        'Тут буде налаштування службових сповіщень для команди салону.',
      );
    default:
      return formatAdminSettingsSectionText('⚙️ Налаштування', 'Оберіть підрозділ налаштувань.');
  }
}

async function renderAdminSettingsMenu(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  state.settingsCurrentSection = 'menu';

  const text = formatAdminSettingsMenuText();
  const keyboard = createAdminSettingsMenuKeyboard();

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminSettingsSection(
  ctx: MyContext,
  section: Exclude<AdminSettingsSection, 'menu'>,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  state.settingsCurrentSection = section;

  const text = getSettingsSectionText(section);
  const keyboard = createAdminSettingsSectionKeyboard();

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function loadAdminMastersCatalog(state: AdminPanelSceneState): Promise<MasterCatalogItem[]> {
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError('Не вдалося визначити студію адміністратора');
  }

  const masters = await listActiveMastersCatalog({ studioId, limit: 50 });
  state.mastersCatalog = masters;
  return masters;
}

async function renderAdminMastersCatalog(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const masters = await loadAdminMastersCatalog(state);
  state.mastersCurrentSection = 'catalog';
  state.mastersSelectedMasterId = null;
  state.mastersBookingsFeed = null;
  state.mastersBookingsOpenedAppointmentId = null;

  const text = formatAdminMastersCatalogText(masters);
  const keyboard = createAdminMastersCatalogKeyboard(masters);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminMasterDetails(
  ctx: MyContext,
  masterId: string,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError('Не вдалося визначити студію адміністратора');
  }

  const details = await getMasterCatalogDetailsById({ masterId, studioId });
  if (!details) {
    await ctx.reply('⚠️ Майстра не знайдено або профіль вже неактивний.');
    await renderAdminMastersCatalog(ctx, false);
    return;
  }

  state.mastersCurrentSection = 'details';
  state.mastersSelectedMasterId = masterId;
  state.mastersBookingsFeed = null;
  state.mastersBookingsOpenedAppointmentId = null;

  const text = formatAdminMasterDetailsText(details);
  const keyboard = createAdminMasterDetailsKeyboard(masterId);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminMasterBookingsList(
  ctx: MyContext,
  masterId: string,
  offset: number,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError('Не вдалося визначити студію адміністратора');
  }

  const details = await getMasterCatalogDetailsById({ masterId, studioId });
  if (!details) {
    await ctx.reply('⚠️ Майстра не знайдено або профіль вже неактивний.');
    await renderAdminMastersCatalog(ctx, false);
    return;
  }

  const feed = await listAdminBookingsFeed({
    studioId,
    category: 'all',
    masterId,
    limit: 5,
    offset,
  });

  state.mastersCurrentSection = 'bookings';
  state.mastersSelectedMasterId = masterId;
  state.mastersBookingsFeed = feed;
  state.mastersBookingsOpenedAppointmentId = null;

  const text = formatAdminMasterBookingsFeedText(details.master.displayName, feed);
  const keyboard = createAdminMasterBookingsFeedKeyboard(feed);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminMasterBookingCard(
  ctx: MyContext,
  masterId: string,
  appointmentId: string,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError('Не вдалося визначити студію адміністратора');
  }

  const fromFeed =
    state.mastersBookingsFeed?.items.find((item) => item.appointmentId === appointmentId) ?? null;
  const booking = fromFeed ?? (await getAdminBookingCardById({ studioId, appointmentId }));
  if (!booking || booking.masterId !== masterId) {
    await ctx.reply('⚠️ Запис не знайдено в контексті цього майстра.');
    await renderAdminMasterBookingsList(ctx, masterId, state.mastersBookingsFeed?.offset ?? 0, false);
    return;
  }

  state.mastersCurrentSection = 'bookings';
  state.mastersSelectedMasterId = masterId;
  state.mastersBookingsOpenedAppointmentId = appointmentId;

  const text = formatAdminMasterBookingCardText(booking);
  const keyboard = createAdminMasterBookingCardKeyboard();

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function loadAdminServicesCatalog(state: AdminPanelSceneState): Promise<ServicesCatalogItem[]> {
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError('Не вдалося визначити студію адміністратора');
  }

  const services = await listActiveServicesCatalog({ studioId, limit: 50 });
  state.servicesCatalog = services;
  return services;
}

async function renderAdminServicesCatalog(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const services = await loadAdminServicesCatalog(state);
  state.servicesCurrentSection = 'catalog';
  state.servicesSelectedServiceId = null;

  const text = formatAdminServicesCatalogText(services);
  const keyboard = createAdminServicesCatalogKeyboard(services);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminServiceDetails(
  ctx: MyContext,
  serviceId: string,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError('Не вдалося визначити студію адміністратора');
  }

  const details = await getServiceCatalogDetailsById({ serviceId, studioId });
  if (!details) {
    await ctx.reply('⚠️ Послугу не знайдено або вона неактивна.');
    await renderAdminServicesCatalog(ctx, false);
    return;
  }

  state.servicesCurrentSection = 'details';
  state.servicesSelectedServiceId = serviceId;

  const text = formatAdminServiceDetailsText(details);
  const keyboard = createAdminServiceDetailsKeyboard(serviceId);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminStatsOverview(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError('Не вдалося визначити студію адміністратора');
  }

  const overview = await getAdminPanelStatsOverview(studioId);
  state.statsOverview = overview;
  state.statsCurrentSection = 'overview';
  state.statsMastersFeed = null;
  state.statsSelectedMasterId = null;
  state.statsMasterDetails = null;
  state.statsServicesFeed = null;
  state.statsSelectedServiceId = null;
  state.statsServiceDetails = null;

  const text = formatAdminStatsOverviewText(overview);
  const keyboard = createAdminStatsOverviewKeyboard();

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminStatsMastersList(
  ctx: MyContext,
  offset: number,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError('Не вдалося визначити студію адміністратора');
  }

  const feed = await listAdminPanelStatsMastersFeed({
    studioId,
    limit: 5,
    offset,
  });
  state.statsCurrentSection = 'masters';
  state.statsMastersFeed = feed;
  state.statsSelectedMasterId = null;
  state.statsMasterDetails = null;
  state.statsSelectedServiceId = null;
  state.statsServiceDetails = null;
  state.statsMonthlyFeed = null;
  state.statsSelectedMonthCode = null;
  state.statsMonthlyReportDetails = null;
  state.statsClientsFeed = null;
  state.statsSelectedClientId = null;
  state.statsClientDetails = null;

  const text = formatAdminStatsMastersListText(feed);
  const keyboard = createAdminStatsMastersListKeyboard(feed);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminStatsMasterDetails(
  ctx: MyContext,
  masterId: string,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError('Не вдалося визначити студію адміністратора');
  }

  const details = await getAdminPanelStatsMasterDetails({ studioId, masterId });
  state.statsCurrentSection = 'masters';
  state.statsSelectedMasterId = masterId;
  state.statsMasterDetails = details;
  state.statsSelectedServiceId = null;
  state.statsServiceDetails = null;
  state.statsMonthlyFeed = null;
  state.statsSelectedMonthCode = null;
  state.statsMonthlyReportDetails = null;
  state.statsClientsFeed = null;
  state.statsSelectedClientId = null;
  state.statsClientDetails = null;

  const text = formatAdminStatsMasterDetailsText(details);
  const keyboard = createAdminStatsMasterDetailsKeyboard();

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminStatsServicesList(
  ctx: MyContext,
  offset: number,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError('Не вдалося визначити студію адміністратора');
  }

  const feed = await listAdminPanelStatsServicesFeed({
    studioId,
    limit: 5,
    offset,
  });
  state.statsCurrentSection = 'services';
  state.statsServicesFeed = feed;
  state.statsSelectedServiceId = null;
  state.statsServiceDetails = null;
  state.statsSelectedMasterId = null;
  state.statsMasterDetails = null;
  state.statsMonthlyFeed = null;
  state.statsSelectedMonthCode = null;
  state.statsMonthlyReportDetails = null;
  state.statsClientsFeed = null;
  state.statsSelectedClientId = null;
  state.statsClientDetails = null;

  const text = formatAdminStatsServicesListText(feed);
  const keyboard = createAdminStatsServicesListKeyboard(feed);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminStatsServiceDetails(
  ctx: MyContext,
  serviceId: string,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError('Не вдалося визначити студію адміністратора');
  }

  const details = await getAdminPanelStatsServiceDetails({ studioId, serviceId });
  state.statsCurrentSection = 'services';
  state.statsSelectedServiceId = serviceId;
  state.statsServiceDetails = details;
  state.statsSelectedMasterId = null;
  state.statsMasterDetails = null;
  state.statsMonthlyFeed = null;
  state.statsSelectedMonthCode = null;
  state.statsMonthlyReportDetails = null;
  state.statsClientsFeed = null;
  state.statsSelectedClientId = null;
  state.statsClientDetails = null;

  const text = formatAdminStatsServiceDetailsText(details);
  const keyboard = createAdminStatsServiceDetailsKeyboard();

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminStatsMonthlyList(
  ctx: MyContext,
  offset: number,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError('Не вдалося визначити студію адміністратора');
  }

  const feed = await listAdminPanelStatsMonthlyFeed({
    studioId,
    limit: 5,
    offset,
  });
  state.statsCurrentSection = 'monthly';
  state.statsSelectedMasterId = null;
  state.statsMasterDetails = null;
  state.statsSelectedServiceId = null;
  state.statsServiceDetails = null;
  state.statsMonthlyFeed = feed;
  state.statsSelectedMonthCode = null;
  state.statsMonthlyReportDetails = null;
  state.statsClientsFeed = null;
  state.statsSelectedClientId = null;
  state.statsClientDetails = null;

  const text = formatAdminStatsMonthlyListText(feed);
  const keyboard = createAdminStatsMonthlyListKeyboard(feed);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminStatsMonthlyReportDetails(
  ctx: MyContext,
  monthCode: string,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError('Не вдалося визначити студію адміністратора');
  }

  const details = await getAdminPanelStatsMonthlyReportDetails({ studioId, monthCode });
  state.statsCurrentSection = 'monthly';
  state.statsSelectedMonthCode = monthCode;
  state.statsMonthlyReportDetails = details;
  state.statsSelectedMasterId = null;
  state.statsMasterDetails = null;
  state.statsSelectedServiceId = null;
  state.statsServiceDetails = null;
  state.statsClientsFeed = null;
  state.statsSelectedClientId = null;
  state.statsClientDetails = null;

  const text = formatAdminStatsMonthlyReportDetailsText(details);
  const keyboard = createAdminStatsMonthlyReportDetailsKeyboard();

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminStatsClientsList(
  ctx: MyContext,
  offset: number,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError('Не вдалося визначити студію адміністратора');
  }

  const feed = await listAdminPanelStatsClientsFeed({
    studioId,
    limit: 5,
    offset,
  });
  state.statsCurrentSection = 'clients';
  state.statsClientsFeed = feed;
  state.statsSelectedClientId = null;
  state.statsClientDetails = null;
  state.statsSelectedMasterId = null;
  state.statsMasterDetails = null;
  state.statsSelectedServiceId = null;
  state.statsServiceDetails = null;
  state.statsMonthlyFeed = null;
  state.statsSelectedMonthCode = null;
  state.statsMonthlyReportDetails = null;

  const text = formatAdminStatsClientsListText(feed);
  const keyboard = createAdminStatsClientsListKeyboard(feed);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminStatsClientDetails(
  ctx: MyContext,
  clientId: string,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError('Не вдалося визначити студію адміністратора');
  }

  const details = await getAdminPanelStatsClientDetails({ studioId, clientId });
  state.statsCurrentSection = 'clients';
  state.statsSelectedClientId = clientId;
  state.statsClientDetails = details;
  state.statsSelectedMasterId = null;
  state.statsMasterDetails = null;
  state.statsSelectedServiceId = null;
  state.statsServiceDetails = null;
  state.statsMonthlyFeed = null;
  state.statsSelectedMonthCode = null;
  state.statsMonthlyReportDetails = null;

  const text = formatAdminStatsClientDetailsText(details);
  const keyboard = createAdminStatsClientDetailsKeyboard();

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminStatsSectionStub(
  ctx: MyContext,
  section: Exclude<AdminStatsSection, 'overview'>,
  title: string,
): Promise<void> {
  const state = getSceneState(ctx);
  state.statsCurrentSection = section;

  try {
    await ctx.editMessageText(
      formatAdminStatsSectionStubText(title),
      createAdminStatsSectionStubKeyboard(),
    );
  } catch {
    await ctx.reply(
      formatAdminStatsSectionStubText(title),
      createAdminStatsSectionStubKeyboard(),
    );
  }
}

async function renderRecordsCategoryStub(
  ctx: MyContext,
  category: AdminBookingsCategory,
  offset: number,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError('Не вдалося визначити студію адміністратора');
  }

  state.recordsFeed = await listAdminBookingsFeed({
    studioId,
    category,
    limit: 5,
    offset,
  });
  state.recordsLastCategory = category;

  const text = formatAdminBookingsFeedText(state.recordsFeed);
  const keyboard = createAdminBookingsFeedKeyboard(state.recordsFeed);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // Якщо редагування не вдалося — надсилаємо нове повідомлення.
    }
  }

  await ctx.reply(text, keyboard);
}

function parseAppointmentIdFromAction(ctx: MyContext, regex: RegExp): string {
  const callbackData =
    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
  const matches = callbackData.match(regex);
  const appointmentId = matches?.[1];
  if (!appointmentId) {
    throw new ValidationError('Некоректна callback-дія для запису');
  }

  return appointmentId;
}

function parseNumericIdFromAction(ctx: MyContext, regex: RegExp, fieldLabel: string): string {
  const callbackData =
    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
  const match = callbackData.match(regex);
  const id = match?.[1]?.trim() ?? '';
  if (!/^\d+$/.test(id) || id === '0') {
    throw new ValidationError(`Некоректний ${fieldLabel}`);
  }
  return id;
}

function parseMonthCodeFromAction(ctx: MyContext, regex: RegExp): string {
  const callbackData =
    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
  const match = callbackData.match(regex);
  const monthCode = match?.[1]?.trim() ?? '';
  const monthMatch = monthCode.match(/^(\d{4})(\d{2})$/);
  const month = monthMatch?.[2] ? Number(monthMatch[2]) : NaN;
  if (!monthMatch || !Number.isFinite(month) || month < 1 || month > 12) {
    throw new ValidationError('Некоректний код місячного звіту');
  }
  return monthCode;
}

async function resolveAdminRecordById(
  state: AdminPanelSceneState,
  appointmentId: string,
): Promise<AdminBookingItem | null> {
  const fromFeed = state.recordsFeed?.items.find((item) => item.appointmentId === appointmentId) ?? null;
  if (fromFeed) return fromFeed;

  const studioId = state.access?.studioId;
  if (!studioId) return null;
  return getAdminBookingCardById({
    studioId,
    appointmentId,
  });
}

async function renderAdminBookingCard(ctx: MyContext, item: AdminBookingItem): Promise<void> {
  const state = getSceneState(ctx);
  state.recordsOpenedAppointmentId = item.appointmentId;
  const text = formatAdminBookingDetailsCardText(item);
  const keyboard = createAdminBookingDetailsCardKeyboard(item);

  try {
    await ctx.editMessageText(text, keyboard);
  } catch {
    await ctx.reply(text, keyboard);
  }
}

async function renderRecordsFallback(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  if (state.recordsFeed) {
    await renderRecordsCategoryStub(ctx, state.recordsFeed.category, state.recordsFeed.offset, preferEdit);
    return;
  }

  await renderRecordsMenu(ctx);
}

async function renderAdminCancelBookingConfirm(ctx: MyContext, item: AdminBookingItem): Promise<void> {
  const text = formatAdminCancelBookingConfirmText(item);
  const keyboard = createAdminCancelBookingConfirmKeyboard(item);

  try {
    await ctx.editMessageText(text, keyboard);
  } catch {
    await ctx.reply(text, keyboard);
  }
}

async function resolveRescheduleTargetItem(state: AdminPanelSceneState): Promise<AdminBookingItem | null> {
  const appointmentId = state.recordsRescheduleDraft?.appointmentId;
  if (!appointmentId) return null;

  return resolveAdminRecordById(state, appointmentId);
}

async function renderRescheduleDateStep(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const item = await resolveRescheduleTargetItem(state);
  if (!item) {
    resetRecordsActionDrafts(state);
    await renderRecordsFallback(ctx, preferEdit);
    return;
  }

  const text = formatAdminRescheduleDateStepText(item);
  const keyboard = createAdminRescheduleDateKeyboard(buildBookingDateOptions(7));

  try {
    if (preferEdit) {
      await ctx.editMessageText(text, keyboard);
    } else {
      await ctx.reply(text, keyboard);
    }
  } catch {
    await ctx.reply(text, keyboard);
  }
}

async function renderRescheduleTimeStep(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const draft = state.recordsRescheduleDraft;
  const item = await resolveRescheduleTargetItem(state);
  if (!draft || !item || !draft.dateCode) {
    await renderRescheduleDateStep(ctx, preferEdit);
    return;
  }

  const timeCodes = getAvailableRescheduleTimeCodes(draft.dateCode);
  const baseText = formatAdminRescheduleTimeStepText(item, draft.dateCode);
  const text =
    timeCodes.length > 0
      ? baseText
      : `${baseText}\n\n⚠️ На цю дату вже немає доступного часу. Оберіть іншу дату.`;
  const keyboard = createAdminRescheduleTimeKeyboard(timeCodes);

  try {
    if (preferEdit) {
      await ctx.editMessageText(text, keyboard);
    } else {
      await ctx.reply(text, keyboard);
    }
  } catch {
    await ctx.reply(text, keyboard);
  }
}

async function renderRescheduleConfirmStep(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const draft = state.recordsRescheduleDraft;
  const item = await resolveRescheduleTargetItem(state);
  if (!draft || !item || !draft.dateCode || !draft.timeCode) {
    await renderRescheduleTimeStep(ctx, preferEdit);
    return;
  }

  const newStartAt = toStartAt(draft.dateCode, draft.timeCode);
  const durationMs = item.endAt.getTime() - item.startAt.getTime();
  const newEndAt = new Date(newStartAt.getTime() + durationMs);
  const text = formatAdminRescheduleConfirmText(item, newStartAt, newEndAt);
  const keyboard = createAdminRescheduleConfirmKeyboard();

  try {
    if (preferEdit) {
      await ctx.editMessageText(text, keyboard);
    } else {
      await ctx.reply(text, keyboard);
    }
  } catch {
    await ctx.reply(text, keyboard);
  }
}

async function loadChangeMasterCandidates(item: AdminBookingItem): Promise<MasterBookingOption[]> {
  const candidates = await listActiveMastersByService({
    studioId: item.studioId,
    serviceId: item.serviceId,
    limit: 20,
  });

  return candidates.filter((candidate) => candidate.masterId !== item.masterId);
}

async function renderChangeMasterSelectStep(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const draft = state.recordsChangeMasterDraft;
  if (!draft) {
    await renderRecordsFallback(ctx, preferEdit);
    return;
  }

  const item = await resolveAdminRecordById(state, draft.appointmentId);
  if (!item) {
    state.recordsChangeMasterDraft = null;
    await renderRecordsFallback(ctx, preferEdit);
    return;
  }

  const text = formatAdminChangeMasterStepText(item, draft.candidates);
  const keyboard = createAdminChangeMasterSelectKeyboard(item, draft.candidates);
  try {
    if (preferEdit) {
      await ctx.editMessageText(text, keyboard);
    } else {
      await ctx.reply(text, keyboard);
    }
  } catch {
    await ctx.reply(text, keyboard);
  }
}

async function renderChangeMasterConfirmStep(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const draft = state.recordsChangeMasterDraft;
  if (!draft || !draft.selectedMasterId || !draft.selectedMasterName) {
    await renderChangeMasterSelectStep(ctx, preferEdit);
    return;
  }

  const item = await resolveAdminRecordById(state, draft.appointmentId);
  if (!item) {
    state.recordsChangeMasterDraft = null;
    await renderRecordsFallback(ctx, preferEdit);
    return;
  }

  const text = formatAdminChangeMasterConfirmText(item, draft.selectedMasterName);
  const keyboard = createAdminChangeMasterConfirmKeyboard();
  try {
    if (preferEdit) {
      await ctx.editMessageText(text, keyboard);
    } else {
      await ctx.reply(text, keyboard);
    }
  } catch {
    await ctx.reply(text, keyboard);
  }
}

async function notifyAdminConfirmedBooking(item: AdminBookingItem): Promise<void> {
  try {
    await dispatchNotification({
      userId: item.clientId,
      notificationType: 'booking_confirmation',
      appointmentId: item.appointmentId,
      textPayload: {
        studioName: item.studioName,
        serviceName: item.serviceName,
        startAt: item.startAt,
        statusLabel: 'Підтверджено',
        message: 'Ваш запис підтверджено адміністратором.',
      },
      email: {
        template: 'bookingConfirmed',
        data: {
          recipientName: item.attendeeName ?? item.clientFirstName,
          bookingId: item.appointmentId,
          studioName: item.studioName,
          serviceName: item.serviceName,
          masterName: item.masterName,
          startAt: item.startAt,
        },
      },
      metadata: { source: 'admin-panel' },
    });
  } catch (error) {
    handleError({
      logger: loggerNotification,
      level: 'warn',
      scope: 'admin-panel.scene',
      action: 'Failed to notify client after admin booking confirm',
      error,
      meta: { appointmentId: item.appointmentId, clientId: item.clientId },
    });
  }
}

async function notifyAdminCanceledBooking(item: AdminBookingItem): Promise<void> {
  try {
    await dispatchNotification({
      userId: item.clientId,
      notificationType: 'status_change',
      appointmentId: item.appointmentId,
      textPayload: {
        studioName: item.studioName,
        serviceName: item.serviceName,
        startAt: item.startAt,
        statusLabel: 'Скасовано',
        message: 'Ваш запис було скасовано адміністратором.',
      },
      email: {
        template: 'bookingCancelled',
        data: {
          recipientName: item.attendeeName ?? item.clientFirstName,
          bookingId: item.appointmentId,
          studioName: item.studioName,
          serviceName: item.serviceName,
          masterName: item.masterName,
          startAt: item.startAt,
          cancelReason: 'Скасовано адміністратором через Telegram-бота',
        },
      },
      metadata: { source: 'admin-panel' },
    });
  } catch (error) {
    handleError({
      logger: loggerNotification,
      level: 'warn',
      scope: 'admin-panel.scene',
      action: 'Failed to notify client after admin booking cancel',
      error,
      meta: { appointmentId: item.appointmentId, clientId: item.clientId },
    });
  }
}

async function notifyAdminRescheduledBooking(result: RescheduleAdminBookingResult): Promise<void> {
  try {
    await dispatchNotification({
      userId: result.current.clientId,
      notificationType: 'status_change',
      appointmentId: result.current.appointmentId,
      textPayload: {
        studioName: result.current.studioName,
        serviceName: result.current.serviceName,
        startAt: result.current.startAt,
        statusLabel: 'Перенесено',
        message: 'Ваш запис перенесено адміністратором. Перевірте нову дату та час.',
      },
      email: {
        template: 'bookingRescheduled',
        data: {
          recipientName: result.current.attendeeName ?? result.current.clientFirstName,
          bookingId: result.current.appointmentId,
          oldStartAt: result.previous.startAt,
          newStartAt: result.current.startAt,
          serviceName: result.current.serviceName,
          masterName: result.current.masterName,
          studioName: result.current.studioName,
        },
      },
      metadata: { source: 'admin-panel' },
    });
  } catch (error) {
    handleError({
      logger: loggerNotification,
      level: 'warn',
      scope: 'admin-panel.scene',
      action: 'Failed to notify client after admin booking reschedule',
      error,
      meta: { appointmentId: result.current.appointmentId, clientId: result.current.clientId },
    });
  }
}

async function notifyAdminMasterChangedBooking(
  previous: AdminBookingItem,
  current: AdminBookingItem,
): Promise<void> {
  try {
    await dispatchNotification({
      userId: current.clientId,
      notificationType: 'status_change',
      appointmentId: current.appointmentId,
      textPayload: {
        studioName: current.studioName,
        serviceName: current.serviceName,
        startAt: current.startAt,
        statusLabel: 'Змінено майстра',
        message: 'Адміністратор призначив нового майстра для вашого запису.',
      },
      email: {
        template: 'masterChanged',
        data: {
          recipientName: current.attendeeName ?? current.clientFirstName,
          bookingId: current.appointmentId,
          serviceName: current.serviceName,
          oldMasterName: previous.masterName,
          newMasterName: current.masterName,
          startAt: current.startAt,
          studioName: current.studioName,
        },
      },
      metadata: { source: 'admin-panel' },
    });
  } catch (error) {
    handleError({
      logger: loggerNotification,
      level: 'warn',
      scope: 'admin-panel.scene',
      action: 'Failed to notify client after admin master change',
      error,
      meta: { appointmentId: current.appointmentId, clientId: current.clientId },
    });
  }
}

export function createAdminPanelScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    ADMIN_PANEL_SCENE_ID,
    async (ctx) => {
      const telegramId = ctx.from?.id;
      const state = getSceneState(ctx);

      state.access = telegramId ? await getAdminPanelAccessByTelegramId(telegramId) : null;
      state.recordsFeed = null;
      state.recordsLastCategory = null;
      state.recordsOpenedAppointmentId = null;
      state.recordsRescheduleDraft = null;
      state.recordsChangeMasterDraft = null;
      state.scheduleData = null;
      state.scheduleCurrentSection = null;
      state.scheduleDayOffDraft = null;
      state.scheduleHolidayDraft = null;
      state.scheduleTemporaryDraft = null;
      state.scheduleDeleteDraft = null;
      state.mastersCatalog = null;
      state.mastersSelectedMasterId = null;
      state.mastersBookingsFeed = null;
      state.mastersBookingsOpenedAppointmentId = null;
      state.mastersCurrentSection = null;
      state.servicesCatalog = null;
      state.servicesSelectedServiceId = null;
      state.servicesCurrentSection = null;
      state.statsOverview = null;
      state.statsMastersFeed = null;
      state.statsSelectedMasterId = null;
      state.statsMasterDetails = null;
      state.statsServicesFeed = null;
      state.statsSelectedServiceId = null;
      state.statsServiceDetails = null;
      state.statsMonthlyFeed = null;
      state.statsSelectedMonthCode = null;
      state.statsMonthlyReportDetails = null;
      state.statsClientsFeed = null;
      state.statsSelectedClientId = null;
      state.statsClientDetails = null;
      state.statsCurrentSection = null;
      state.settingsCurrentSection = null;

      if (!state.access) {
        await ctx.reply(
          '🚫 Доступ до адмін-панелі відсутній.\n\n' +
            'Якщо доступ має бути відкритий, зверніться до власника салону.',
        );
        await ctx.scene.leave();
        await sendClientMainMenu(ctx);
        return;
      }

      await renderAdminRoot(ctx, false);
      return ctx.wizard.next();
    },
    async (ctx) => {
      const state = getSceneState(ctx);
      const text = getUserText(ctx);
      if (!text) return;

      const dayOffDraft = state.scheduleDayOffDraft;
      if (dayOffDraft?.mode === 'awaiting_date') {
        try {
          const date = parseFutureDateInput(text);
          state.scheduleDayOffDraft = {
            mode: 'awaiting_confirm',
            offDate: formatDateSql(date),
            offDateLabel: formatDateLabel(date),
          };

          await ctx.reply(
            formatAdminScheduleDayOffConfirmText(formatDateLabel(date)),
            createAdminScheduleDayOffConfirmKeyboard(),
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError('Виникла помилка при перевірці дати');

          await ctx.reply(
            `⚠️ ${err.message}\n\nСпробуйте ще раз у форматі ДД.ММ.РРРР.`,
            createAdminScheduleDayOffInputKeyboard(),
          );
        }
        return;
      }

      if (dayOffDraft?.mode === 'awaiting_confirm') {
        await ctx.reply(
          '⚠️ Для завершення дії натисніть "✅ Підтвердити" або "❌ Скасувати дію".',
          createAdminScheduleDayOffConfirmKeyboard(),
        );
        return;
      }

      const holidayDraft = state.scheduleHolidayDraft;
      if (holidayDraft?.mode === 'awaiting_date') {
        try {
          const date = parseFutureDateInput(text);
          state.scheduleHolidayDraft = {
            mode: 'awaiting_name',
            holidayDate: formatDateSql(date),
            holidayDateLabel: formatDateLabel(date),
            holidayName: null,
          };

          await ctx.reply(
            formatAdminScheduleHolidayNameInputText(formatDateLabel(date)),
            createAdminScheduleHolidayInputKeyboard(),
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError('Виникла помилка при перевірці дати');

          await ctx.reply(
            `⚠️ ${err.message}\n\nСпробуйте ще раз у форматі ДД.ММ.РРРР.`,
            createAdminScheduleHolidayInputKeyboard(),
          );
        }
        return;
      }

      if (holidayDraft?.mode === 'awaiting_name') {
        try {
          const holidayName = normalizeHolidayName(text);
          if (!holidayDraft.holidayDate || !holidayDraft.holidayDateLabel) {
            throw new ValidationError('Спочатку вкажіть дату свята');
          }

          state.scheduleHolidayDraft = {
            mode: 'awaiting_confirm',
            holidayDate: holidayDraft.holidayDate,
            holidayDateLabel: holidayDraft.holidayDateLabel,
            holidayName,
          };

          await ctx.reply(
            formatAdminScheduleHolidayConfirmText(holidayDraft.holidayDateLabel, holidayName),
            createAdminScheduleHolidayConfirmKeyboard(),
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError('Виникла помилка при перевірці назви свята');

          await ctx.reply(
            `⚠️ ${err.message}`,
            createAdminScheduleHolidayInputKeyboard(),
          );
        }
        return;
      }

      if (holidayDraft?.mode === 'awaiting_confirm') {
        await ctx.reply(
          '⚠️ Для завершення дії натисніть "✅ Підтвердити" або "❌ Скасувати дію".',
          createAdminScheduleHolidayConfirmKeyboard(),
        );
        return;
      }

      const temporaryDraft = state.scheduleTemporaryDraft;
      if (temporaryDraft?.mode === 'awaiting_period') {
        try {
          const { dateFrom, dateTo } = parseDateRangeInput(text);
          const rangeDays = countInclusiveDays(dateFrom, dateTo);
          if (rangeDays < MIN_TEMPORARY_SCHEDULE_DAYS) {
            throw new ValidationError(
              `Тимчасовий графік можна встановити лише на період від ${MIN_TEMPORARY_SCHEDULE_DAYS} днів`,
            );
          }

          state.scheduleTemporaryDraft = {
            mode: 'configuring_days',
            dateFrom: formatDateSql(dateFrom),
            dateTo: formatDateSql(dateTo),
            dateFromLabel: formatDateLabel(dateFrom),
            dateToLabel: formatDateLabel(dateTo),
            days: [],
            selectedWeekday: null,
            pendingFromTime: null,
          };

          await ctx.reply(
            formatAdminScheduleTemporaryDaysConfigText(
              formatDateLabel(dateFrom),
              formatDateLabel(dateTo),
              [],
            ),
            createAdminScheduleTemporaryDaysConfigKeyboard([]),
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError('Виникла помилка при перевірці періоду');

          await ctx.reply(
            `⚠️ ${err.message}\n\nСпробуйте ще раз у форматі ДД.ММ.РРРР - ДД.ММ.РРРР.`,
            createAdminScheduleTemporaryPeriodInputKeyboard(),
          );
        }
        return;
      }

      if (temporaryDraft?.mode === 'awaiting_day_from') {
        try {
          const weekday = temporaryDraft.selectedWeekday;
          if (!weekday) {
            throw new ValidationError('Спочатку оберіть день тижня кнопкою');
          }

          const fromTime = parseTimeInput(text);
          state.scheduleTemporaryDraft = {
            ...temporaryDraft,
            mode: 'awaiting_day_to',
            pendingFromTime: fromTime,
          };

          await ctx.reply(
            formatAdminScheduleTemporaryDayToInputText(weekday, fromTime),
            createAdminScheduleTemporaryDayInputKeyboard(weekday),
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError('Виникла помилка при перевірці часу початку');
          await ctx.reply(
            `⚠️ ${err.message}\n\nВведіть коректний час у форматі HH:MM.`,
            createAdminScheduleTemporaryDayInputKeyboard(temporaryDraft.selectedWeekday ?? 1),
          );
        }
        return;
      }

      if (temporaryDraft?.mode === 'awaiting_day_to') {
        try {
          const weekday = temporaryDraft.selectedWeekday;
          const fromTime = temporaryDraft.pendingFromTime;
          if (!weekday || !fromTime) {
            throw new ValidationError('Спочатку оберіть день і задайте час початку');
          }

          const toTime = parseTimeInput(text);
          if (timeToMinutes(toTime) <= timeToMinutes(fromTime)) {
            throw new ValidationError('Час завершення має бути пізніше часу початку');
          }

          const updatedDays = upsertTemporaryDay(temporaryDraft.days, {
            weekday,
            isOpen: true,
            openTime: fromTime,
            closeTime: toTime,
          });

          state.scheduleTemporaryDraft = {
            ...temporaryDraft,
            mode: 'configuring_days',
            days: updatedDays,
            selectedWeekday: null,
            pendingFromTime: null,
          };

          await ctx.reply(
            formatAdminScheduleTemporaryDaysConfigText(
              temporaryDraft.dateFromLabel ?? '',
              temporaryDraft.dateToLabel ?? '',
              updatedDays,
            ),
            createAdminScheduleTemporaryDaysConfigKeyboard(updatedDays),
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError('Виникла помилка при перевірці часу завершення');
          await ctx.reply(
            `⚠️ ${err.message}\n\nВведіть коректний час у форматі HH:MM.`,
            createAdminScheduleTemporaryDayInputKeyboard(temporaryDraft.selectedWeekday ?? 1),
          );
        }
        return;
      }

      if (temporaryDraft?.mode === 'awaiting_confirm' || temporaryDraft?.mode === 'configuring_days') {
        await ctx.reply(
          '⚠️ Для завершення дії використовуйте кнопки під повідомленням.',
        );
        return;
      }

      if (state.scheduleCurrentSection) {
        await ctx.reply(
          'ℹ️ Для керування цим розділом використовуйте кнопки під повідомленням.',
        );
        return;
      }

      if (state.settingsCurrentSection) {
        await ctx.reply(
          'ℹ️ Для керування розділом налаштувань використовуйте кнопки під повідомленням.',
        );
        return;
      }

      await renderAdminRoot(ctx, false);
    },
  );

  scene.action(ADMIN_PANEL_ACTION.OPEN_RECORDS, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRecordsActionDrafts(state);
    resetScheduleDrafts(state);
    resetMastersState(state);
    resetServicesState(state);
    resetStatsState(state);
    resetSettingsState(state);
    state.scheduleCurrentSection = null;
    await renderRecordsMenu(ctx);
  });

  scene.action(ADMIN_PANEL_ACTION.OPEN_SCHEDULE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetMastersState(state);
    resetServicesState(state);
    resetStatsState(state);
    resetSettingsState(state);
    state.scheduleCurrentSection = null;
    state.scheduleData = null;
    resetScheduleDrafts(state);
    await renderScheduleMenu(ctx);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_OPEN_OVERVIEW, async (ctx) => {
    await ctx.answerCbQuery();
    resetScheduleDrafts(getSceneState(ctx));
    await renderScheduleSection(ctx, 'overview', true);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_OPEN_DAYS_OFF, async (ctx) => {
    await ctx.answerCbQuery();
    resetScheduleDrafts(getSceneState(ctx));
    await renderScheduleSection(ctx, 'days-off', true);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_OPEN_HOLIDAYS, async (ctx) => {
    await ctx.answerCbQuery();
    resetScheduleDrafts(getSceneState(ctx));
    await renderScheduleSection(ctx, 'holidays', true);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_OPEN_TEMPORARY, async (ctx) => {
    await ctx.answerCbQuery();
    resetScheduleDrafts(getSceneState(ctx));
    await renderScheduleSection(ctx, 'temporary', true);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_REFRESH, async (ctx) => {
    await ctx.answerCbQuery();
    const section = getSceneState(ctx).scheduleCurrentSection ?? 'overview';
    await renderScheduleSection(ctx, section, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.scheduleCurrentSection = null;
    resetScheduleDrafts(state);
    await renderScheduleMenu(ctx);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_BACK, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.scheduleCurrentSection = null;
    state.scheduleData = null;
    resetScheduleDrafts(state);
    await renderAdminRoot(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_DAY_OFF_ADD_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.scheduleCurrentSection = 'days-off';
    state.scheduleDayOffDraft = {
      mode: 'awaiting_date',
      offDate: null,
      offDateLabel: null,
    };
    state.scheduleHolidayDraft = null;
    state.scheduleDeleteDraft = null;

    try {
      await ctx.editMessageText(
        formatAdminScheduleDayOffInputText(),
        createAdminScheduleDayOffInputKeyboard(),
      );
    } catch {
      await ctx.reply(
        formatAdminScheduleDayOffInputText(),
        createAdminScheduleDayOffInputKeyboard(),
      );
    }
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_DAY_OFF_ADD_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.scheduleDayOffDraft;
    if (!access?.studioId || !draft || draft.mode !== 'awaiting_confirm' || !draft.offDate || !draft.offDateLabel) {
      state.scheduleDayOffDraft = {
        mode: 'awaiting_date',
        offDate: null,
        offDateLabel: null,
      };

      await ctx.reply(
        formatAdminScheduleDayOffInputText(),
        createAdminScheduleDayOffInputKeyboard(),
      );
      return;
    }

    try {
      await createAdminStudioDayOff({
        studioId: access.studioId,
        offDate: draft.offDate,
        createdBy: access.userId,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        state.scheduleDayOffDraft = {
          mode: 'awaiting_date',
          offDate: null,
          offDateLabel: null,
        };
        await ctx.reply(
          `⚠️ ${error.message}\n\nВведіть іншу дату у форматі ДД.ММ.РРРР.`,
          createAdminScheduleDayOffInputKeyboard(),
        );
        return;
      }
      throw error;
    }

    state.scheduleDayOffDraft = null;
    await ctx.reply(`✅ Вихідний день на ${draft.offDateLabel} успішно додано.`);
    await renderScheduleSection(ctx, 'days-off', false);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_DAY_OFF_ADD_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.scheduleDayOffDraft = null;
    await renderScheduleSection(ctx, 'days-off', true);
  });

  scene.action(ADMIN_PANEL_SCHEDULE_DAY_OFF_DELETE_REQUEST_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const dayOffId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_SCHEDULE_DAY_OFF_DELETE_REQUEST_ACTION_REGEX,
      'id вихідного дня',
    );

    const data = await loadAdminSchedule(state);
    const target = data.upcomingDaysOff.find((item) => item.id === dayOffId);
    if (!target) {
      state.scheduleDeleteDraft = null;
      await renderScheduleSection(ctx, 'days-off', true);
      return;
    }

    state.scheduleCurrentSection = 'days-off';
    state.scheduleDeleteDraft = {
      type: 'day_off',
      id: dayOffId,
      dateFrom: null,
      dateTo: null,
    };
    state.scheduleDayOffDraft = null;
    state.scheduleHolidayDraft = null;

    try {
      await ctx.editMessageText(
        formatAdminScheduleDeleteDayOffConfirmText(target.offDate),
        createAdminScheduleDeleteConfirmKeyboard(
          makeAdminPanelScheduleDayOffDeleteConfirmAction(dayOffId),
        ),
      );
    } catch {
      await ctx.reply(
        formatAdminScheduleDeleteDayOffConfirmText(target.offDate),
        createAdminScheduleDeleteConfirmKeyboard(
          makeAdminPanelScheduleDayOffDeleteConfirmAction(dayOffId),
        ),
      );
    }
  });

  scene.action(ADMIN_PANEL_SCHEDULE_DAY_OFF_DELETE_CONFIRM_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const dayOffId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_SCHEDULE_DAY_OFF_DELETE_CONFIRM_ACTION_REGEX,
      'id вихідного дня',
    );

    if (!access?.studioId || !state.scheduleDeleteDraft || state.scheduleDeleteDraft.type !== 'day_off' || state.scheduleDeleteDraft.id !== dayOffId) {
      state.scheduleDeleteDraft = null;
      await renderScheduleSection(ctx, 'days-off', true);
      return;
    }

    await deleteAdminStudioDayOff({
      studioId: access.studioId,
      dayOffId,
    });

    state.scheduleDeleteDraft = null;
    await ctx.reply('✅ Вихідний день успішно видалено.');
    await renderScheduleSection(ctx, 'days-off', false);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_HOLIDAY_ADD_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.scheduleCurrentSection = 'holidays';
    state.scheduleHolidayDraft = {
      mode: 'awaiting_date',
      holidayDate: null,
      holidayDateLabel: null,
      holidayName: null,
    };
    state.scheduleDayOffDraft = null;
    state.scheduleDeleteDraft = null;

    try {
      await ctx.editMessageText(
        formatAdminScheduleHolidayDateInputText(),
        createAdminScheduleHolidayInputKeyboard(),
      );
    } catch {
      await ctx.reply(
        formatAdminScheduleHolidayDateInputText(),
        createAdminScheduleHolidayInputKeyboard(),
      );
    }
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_HOLIDAY_ADD_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.scheduleHolidayDraft;
    if (
      !access?.studioId ||
      !draft ||
      draft.mode !== 'awaiting_confirm' ||
      !draft.holidayDate ||
      !draft.holidayDateLabel ||
      !draft.holidayName
    ) {
      state.scheduleHolidayDraft = {
        mode: 'awaiting_date',
        holidayDate: null,
        holidayDateLabel: null,
        holidayName: null,
      };
      await ctx.reply(
        formatAdminScheduleHolidayDateInputText(),
        createAdminScheduleHolidayInputKeyboard(),
      );
      return;
    }

    try {
      await createAdminStudioHoliday({
        studioId: access.studioId,
        holidayDate: draft.holidayDate,
        holidayName: draft.holidayName,
        createdBy: access.userId,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        state.scheduleHolidayDraft = {
          mode: 'awaiting_date',
          holidayDate: null,
          holidayDateLabel: null,
          holidayName: null,
        };
        await ctx.reply(
          `⚠️ ${error.message}\n\nСпробуйте ще раз.`,
          createAdminScheduleHolidayInputKeyboard(),
        );
        return;
      }
      throw error;
    }

    state.scheduleHolidayDraft = null;
    await ctx.reply(`✅ Свято "${draft.holidayName}" на ${draft.holidayDateLabel} успішно додано.`);
    await renderScheduleSection(ctx, 'holidays', false);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_HOLIDAY_ADD_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.scheduleHolidayDraft = null;
    await renderScheduleSection(ctx, 'holidays', true);
  });

  scene.action(ADMIN_PANEL_SCHEDULE_HOLIDAY_DELETE_REQUEST_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const holidayId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_SCHEDULE_HOLIDAY_DELETE_REQUEST_ACTION_REGEX,
      'id святкового дня',
    );

    const data = await loadAdminSchedule(state);
    const target = data.upcomingHolidays.find((item) => item.id === holidayId);
    if (!target) {
      state.scheduleDeleteDraft = null;
      await renderScheduleSection(ctx, 'holidays', true);
      return;
    }

    state.scheduleCurrentSection = 'holidays';
    state.scheduleDeleteDraft = {
      type: 'holiday',
      id: holidayId,
      dateFrom: null,
      dateTo: null,
    };
    state.scheduleDayOffDraft = null;
    state.scheduleHolidayDraft = null;

    try {
      await ctx.editMessageText(
        formatAdminScheduleDeleteHolidayConfirmText(target.holidayDate, target.holidayName),
        createAdminScheduleDeleteConfirmKeyboard(
          makeAdminPanelScheduleHolidayDeleteConfirmAction(holidayId),
        ),
      );
    } catch {
      await ctx.reply(
        formatAdminScheduleDeleteHolidayConfirmText(target.holidayDate, target.holidayName),
        createAdminScheduleDeleteConfirmKeyboard(
          makeAdminPanelScheduleHolidayDeleteConfirmAction(holidayId),
        ),
      );
    }
  });

  scene.action(ADMIN_PANEL_SCHEDULE_HOLIDAY_DELETE_CONFIRM_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const holidayId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_SCHEDULE_HOLIDAY_DELETE_CONFIRM_ACTION_REGEX,
      'id святкового дня',
    );

    if (!access?.studioId || !state.scheduleDeleteDraft || state.scheduleDeleteDraft.type !== 'holiday' || state.scheduleDeleteDraft.id !== holidayId) {
      state.scheduleDeleteDraft = null;
      await renderScheduleSection(ctx, 'holidays', true);
      return;
    }

    await deleteAdminStudioHoliday({
      studioId: access.studioId,
      holidayId,
    });

    state.scheduleDeleteDraft = null;
    await ctx.reply('✅ Святковий день успішно видалено.');
    await renderScheduleSection(ctx, 'holidays', false);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_DELETE_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const section =
      state.scheduleCurrentSection === 'holidays'
        ? 'holidays'
        : state.scheduleCurrentSection === 'temporary'
          ? 'temporary'
          : 'days-off';
    state.scheduleDeleteDraft = null;
    await renderScheduleSection(ctx, section, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_CREATE_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.scheduleCurrentSection = 'temporary';
    state.scheduleTemporaryDraft = {
      mode: 'awaiting_period',
      dateFrom: null,
      dateTo: null,
      dateFromLabel: null,
      dateToLabel: null,
      days: [],
      selectedWeekday: null,
      pendingFromTime: null,
    };
    state.scheduleDayOffDraft = null;
    state.scheduleHolidayDraft = null;
    state.scheduleDeleteDraft = null;

    try {
      await ctx.editMessageText(
        formatAdminScheduleTemporarySetPeriodText(),
        createAdminScheduleTemporaryPeriodInputKeyboard(),
      );
    } catch {
      await ctx.reply(
        formatAdminScheduleTemporarySetPeriodText(),
        createAdminScheduleTemporaryPeriodInputKeyboard(),
      );
    }
  });

  scene.action(ADMIN_PANEL_SCHEDULE_TEMPORARY_DAY_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.scheduleTemporaryDraft;
    if (!draft || draft.mode === 'awaiting_period' || !draft.dateFromLabel || !draft.dateToLabel) {
      await renderScheduleSection(ctx, 'temporary', true);
      return;
    }

    const weekday = Number(
      (
        (ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '')
          .match(ADMIN_PANEL_SCHEDULE_TEMPORARY_DAY_ACTION_REGEX)?.[1] ?? ''
      ),
    );
    if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7) {
      await renderScheduleSection(ctx, 'temporary', true);
      return;
    }

    state.scheduleTemporaryDraft = {
      ...draft,
      mode: 'awaiting_day_from',
      selectedWeekday: weekday,
      pendingFromTime: null,
    };

    try {
      await ctx.editMessageText(
        formatAdminScheduleTemporaryDayFromInputText(weekday),
        createAdminScheduleTemporaryDayInputKeyboard(weekday),
      );
    } catch {
      await ctx.reply(
        formatAdminScheduleTemporaryDayFromInputText(weekday),
        createAdminScheduleTemporaryDayInputKeyboard(weekday),
      );
    }
  });

  scene.action(ADMIN_PANEL_SCHEDULE_TEMPORARY_DAY_OFF_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.scheduleTemporaryDraft;
    if (!draft || !draft.dateFromLabel || !draft.dateToLabel || !draft.dateFrom || !draft.dateTo) {
      await renderScheduleSection(ctx, 'temporary', true);
      return;
    }

    const weekday = Number(
      (
        (ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '')
          .match(ADMIN_PANEL_SCHEDULE_TEMPORARY_DAY_OFF_ACTION_REGEX)?.[1] ?? ''
      ),
    );
    if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7) {
      await renderScheduleSection(ctx, 'temporary', true);
      return;
    }

    const updatedDays = upsertTemporaryDay(draft.days, {
      weekday,
      isOpen: false,
      openTime: null,
      closeTime: null,
    });

    state.scheduleTemporaryDraft = {
      ...draft,
      mode: updatedDays.length === 7 ? 'awaiting_confirm' : 'configuring_days',
      days: updatedDays,
      selectedWeekday: null,
      pendingFromTime: null,
    };

    await ctx.reply(
      formatAdminScheduleTemporaryDaysConfigText(
        draft.dateFromLabel,
        draft.dateToLabel,
        updatedDays,
      ),
      createAdminScheduleTemporaryDaysConfigKeyboard(updatedDays),
    );
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_CREATE_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.scheduleTemporaryDraft;
    if (
      !access?.studioId ||
      !draft ||
      !draft.dateFrom ||
      !draft.dateTo ||
      !draft.dateFromLabel ||
      !draft.dateToLabel
    ) {
      await renderScheduleSection(ctx, 'temporary', true);
      return;
    }

    if (draft.days.length < 7) {
      await ctx.reply(
        `⚠️ Потрібно налаштувати всі 7 днів тижня. Зараз налаштовано: ${draft.days.length}/7.`,
      );
      await ctx.reply(
        formatAdminScheduleTemporaryDaysConfigText(draft.dateFromLabel, draft.dateToLabel, draft.days),
        createAdminScheduleTemporaryDaysConfigKeyboard(draft.days),
      );
      return;
    }

    if (draft.mode !== 'awaiting_confirm') {
      state.scheduleTemporaryDraft = {
        ...draft,
        mode: 'awaiting_confirm',
      };
      await ctx.reply(
        formatAdminScheduleTemporaryConfirmText(draft.dateFromLabel, draft.dateToLabel, draft.days),
        createAdminScheduleTemporaryDaysConfigKeyboard(draft.days),
      );
      return;
    }

    try {
      await createAdminStudioTemporarySchedule({
        studioId: access.studioId,
        dateFrom: draft.dateFrom,
        dateTo: draft.dateTo,
        days: draft.days,
        createdBy: access.userId,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        await ctx.reply(
          `⚠️ ${error.message}`,
          createAdminScheduleTemporaryDaysConfigKeyboard(draft.days),
        );
        return;
      }
      throw error;
    }

    state.scheduleTemporaryDraft = null;
    await ctx.reply(
      `✅ Тимчасовий графік студії успішно встановлено на період ${draft.dateFromLabel} - ${draft.dateToLabel}.`,
    );
    await renderScheduleSection(ctx, 'temporary', false);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_CREATE_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.scheduleTemporaryDraft = null;
    await renderScheduleSection(ctx, 'temporary', true);
  });

  scene.action(ADMIN_PANEL_SCHEDULE_TEMPORARY_DELETE_REQUEST_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const callbackData = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const match = callbackData.match(ADMIN_PANEL_SCHEDULE_TEMPORARY_DELETE_REQUEST_ACTION_REGEX);
    const dateFromCode = match?.[1] ?? '';
    const dateToCode = match?.[2] ?? '';

    let dateFrom: Date;
    let dateTo: Date;
    try {
      dateFrom = parseDateFromCode(dateFromCode);
      dateTo = parseDateFromCode(dateToCode);
    } catch {
      await renderScheduleSection(ctx, 'temporary', true);
      return;
    }

    const dateFromSql = formatDateSql(dateFrom);
    const dateToSql = formatDateSql(dateTo);
    state.scheduleCurrentSection = 'temporary';
    state.scheduleDeleteDraft = {
      type: 'temporary_period',
      id: null,
      dateFrom: dateFromSql,
      dateTo: dateToSql,
    };
    state.scheduleTemporaryDraft = null;
    state.scheduleDayOffDraft = null;
    state.scheduleHolidayDraft = null;

    try {
      await ctx.editMessageText(
        formatAdminScheduleDeleteTemporaryConfirmText(dateFrom, dateTo),
        createAdminScheduleDeleteConfirmKeyboard(
          makeAdminPanelScheduleTemporaryDeleteConfirmAction(dateFromCode, dateToCode),
        ),
      );
    } catch {
      await ctx.reply(
        formatAdminScheduleDeleteTemporaryConfirmText(dateFrom, dateTo),
        createAdminScheduleDeleteConfirmKeyboard(
          makeAdminPanelScheduleTemporaryDeleteConfirmAction(dateFromCode, dateToCode),
        ),
      );
    }
  });

  scene.action(ADMIN_PANEL_SCHEDULE_TEMPORARY_DELETE_CONFIRM_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const callbackData = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const match = callbackData.match(ADMIN_PANEL_SCHEDULE_TEMPORARY_DELETE_CONFIRM_ACTION_REGEX);
    const dateFromCode = match?.[1] ?? '';
    const dateToCode = match?.[2] ?? '';

    let dateFrom: Date;
    let dateTo: Date;
    try {
      dateFrom = parseDateFromCode(dateFromCode);
      dateTo = parseDateFromCode(dateToCode);
    } catch {
      await renderScheduleSection(ctx, 'temporary', true);
      return;
    }

    const dateFromSql = formatDateSql(dateFrom);
    const dateToSql = formatDateSql(dateTo);
    if (
      !access?.studioId ||
      !state.scheduleDeleteDraft ||
      state.scheduleDeleteDraft.type !== 'temporary_period' ||
      state.scheduleDeleteDraft.dateFrom !== dateFromSql ||
      state.scheduleDeleteDraft.dateTo !== dateToSql
    ) {
      state.scheduleDeleteDraft = null;
      await renderScheduleSection(ctx, 'temporary', true);
      return;
    }

    await deleteAdminStudioTemporarySchedulePeriod({
      studioId: access.studioId,
      dateFrom: dateFromSql,
      dateTo: dateToSql,
    });

    state.scheduleDeleteDraft = null;
    await ctx.reply('✅ Тимчасовий графік за обраний період успішно видалено.');
    await renderScheduleSection(ctx, 'temporary', false);
  });

  scene.action(ADMIN_PANEL_ACTION.OPEN_MASTERS, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRecordsActionDrafts(state);
    resetScheduleDrafts(state);
    resetMastersState(state);
    resetServicesState(state);
    resetStatsState(state);
    resetSettingsState(state);
    await renderAdminMastersCatalog(ctx, true);
  });

  scene.action(ADMIN_PANEL_MASTERS_OPEN_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const masterId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_MASTERS_OPEN_ACTION_REGEX,
      'id майстра',
    );
    await renderAdminMasterDetails(ctx, masterId, true);
    state.mastersSelectedMasterId = masterId;
  });

  scene.action(ADMIN_PANEL_MASTERS_OPEN_BOOKINGS_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const masterId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_MASTERS_OPEN_BOOKINGS_ACTION_REGEX,
      'id майстра',
    );
    await renderAdminMasterBookingsList(ctx, masterId, 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_BOOKINGS_PREV_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const feed = state.mastersBookingsFeed;
    const masterId = state.mastersSelectedMasterId;
    if (!feed || !masterId || !feed.hasPrevPage) {
      return;
    }

    const nextOffset = Math.max(0, feed.offset - feed.limit);
    await renderAdminMasterBookingsList(ctx, masterId, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_BOOKINGS_NEXT_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const feed = state.mastersBookingsFeed;
    const masterId = state.mastersSelectedMasterId;
    if (!feed || !masterId || !feed.hasNextPage) {
      return;
    }

    const nextOffset = feed.offset + feed.limit;
    await renderAdminMasterBookingsList(ctx, masterId, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_MASTERS_BOOKINGS_OPEN_CARD_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const masterId = state.mastersSelectedMasterId;
    if (!masterId) {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }

    const appointmentId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_MASTERS_BOOKINGS_OPEN_CARD_ACTION_REGEX,
      'id запису',
    );
    await renderAdminMasterBookingCard(ctx, masterId, appointmentId, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_BOOKINGS_BACK_TO_LIST, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const masterId = state.mastersSelectedMasterId;
    if (!masterId) {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }

    const offset = state.mastersBookingsFeed?.offset ?? 0;
    await renderAdminMasterBookingsList(ctx, masterId, offset, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_BOOKINGS_BACK_TO_MASTER, async (ctx) => {
    await ctx.answerCbQuery();
    const masterId = getSceneState(ctx).mastersSelectedMasterId;
    if (!masterId) {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }
    await renderAdminMasterDetails(ctx, masterId, true);
  });

  scene.action(ADMIN_PANEL_MASTERS_OPEN_STATS_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const studioId = state.access?.studioId;
    if (!studioId) {
      throw new ValidationError('Не вдалося визначити студію адміністратора');
    }

    const masterId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_MASTERS_OPEN_STATS_ACTION_REGEX,
      'id майстра',
    );

    let stats: AdminPanelStatsMasterDetails;
    try {
      stats = await getAdminPanelStatsMasterDetails({ studioId, masterId });
    } catch (error) {
      if (error instanceof ValidationError) {
        await ctx.reply(`⚠️ ${error.message}`);
        await renderAdminMastersCatalog(ctx, false);
        return;
      }
      throw error;
    }
    state.mastersCurrentSection = 'stats';
    state.mastersSelectedMasterId = masterId;

    try {
      await ctx.editMessageText(
        formatAdminStatsMasterDetailsText(stats),
        createAdminMasterDetailsKeyboard(masterId),
      );
    } catch {
      await ctx.reply(
        formatAdminStatsMasterDetailsText(stats),
        createAdminMasterDetailsKeyboard(masterId),
      );
    }
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_BACK_TO_LIST, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminMastersCatalog(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_BACK, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetMastersState(state);
    await renderAdminRoot(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.OPEN_SERVICES, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRecordsActionDrafts(state);
    resetScheduleDrafts(state);
    resetMastersState(state);
    resetServicesState(state);
    resetStatsState(state);
    resetSettingsState(state);
    await renderAdminServicesCatalog(ctx, true);
  });

  scene.action(ADMIN_PANEL_SERVICES_OPEN_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const serviceId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_SERVICES_OPEN_ACTION_REGEX,
      'id послуги',
    );
    await renderAdminServiceDetails(ctx, serviceId, true);
    state.servicesSelectedServiceId = serviceId;
  });

  scene.action(ADMIN_PANEL_SERVICES_OPEN_STATS_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const studioId = state.access?.studioId;
    if (!studioId) {
      throw new ValidationError('Не вдалося визначити студію адміністратора');
    }

    const serviceId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_SERVICES_OPEN_STATS_ACTION_REGEX,
      'id послуги',
    );

    let stats: AdminPanelStatsServiceDetails;
    try {
      stats = await getAdminPanelStatsServiceDetails({ studioId, serviceId });
    } catch (error) {
      if (error instanceof ValidationError) {
        await ctx.reply(`⚠️ ${error.message}`);
        await renderAdminServicesCatalog(ctx, false);
        return;
      }
      throw error;
    }
    state.servicesCurrentSection = 'stats';
    state.servicesSelectedServiceId = serviceId;

    try {
      await ctx.editMessageText(
        formatAdminStatsServiceDetailsText(stats),
        createAdminServiceDetailsKeyboard(serviceId),
      );
    } catch {
      await ctx.reply(
        formatAdminStatsServiceDetailsText(stats),
        createAdminServiceDetailsKeyboard(serviceId),
      );
    }
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_BACK_TO_LIST, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminServicesCatalog(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_BACK, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetServicesState(state);
    await renderAdminRoot(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.OPEN_STATS, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRecordsActionDrafts(state);
    resetScheduleDrafts(state);
    resetMastersState(state);
    resetServicesState(state);
    resetStatsState(state);
    resetSettingsState(state);
    await renderAdminStatsOverview(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_OPEN_MASTERS, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminStatsMastersList(ctx, 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_MASTERS_PREV_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsMastersFeed;
    if (!feed || !feed.hasPrevPage) {
      return;
    }

    const nextOffset = Math.max(0, feed.offset - feed.limit);
    await renderAdminStatsMastersList(ctx, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_MASTERS_NEXT_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsMastersFeed;
    if (!feed || !feed.hasNextPage) {
      return;
    }

    const nextOffset = feed.offset + feed.limit;
    await renderAdminStatsMastersList(ctx, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_STATS_MASTERS_OPEN_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const masterId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_STATS_MASTERS_OPEN_ACTION_REGEX,
      'id майстра',
    );

    try {
      await renderAdminStatsMasterDetails(ctx, masterId, true);
    } catch (error) {
      if (error instanceof ValidationError) {
        await ctx.reply(`⚠️ ${error.message}`);
        const fallbackOffset = state.statsMastersFeed?.offset ?? 0;
        await renderAdminStatsMastersList(ctx, fallbackOffset, false);
        return;
      }
      throw error;
    }
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_MASTERS_BACK_TO_LIST, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsMastersFeed;
    await renderAdminStatsMastersList(ctx, feed?.offset ?? 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_OPEN_SERVICES, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminStatsServicesList(ctx, 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_SERVICES_PREV_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsServicesFeed;
    if (!feed || !feed.hasPrevPage) {
      return;
    }

    const nextOffset = Math.max(0, feed.offset - feed.limit);
    await renderAdminStatsServicesList(ctx, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_SERVICES_NEXT_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsServicesFeed;
    if (!feed || !feed.hasNextPage) {
      return;
    }

    const nextOffset = feed.offset + feed.limit;
    await renderAdminStatsServicesList(ctx, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_STATS_SERVICES_OPEN_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const serviceId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_STATS_SERVICES_OPEN_ACTION_REGEX,
      'id послуги',
    );

    try {
      await renderAdminStatsServiceDetails(ctx, serviceId, true);
    } catch (error) {
      if (error instanceof ValidationError) {
        await ctx.reply(`⚠️ ${error.message}`);
        const fallbackOffset = state.statsServicesFeed?.offset ?? 0;
        await renderAdminStatsServicesList(ctx, fallbackOffset, false);
        return;
      }
      throw error;
    }
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_SERVICES_BACK_TO_LIST, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsServicesFeed;
    await renderAdminStatsServicesList(ctx, feed?.offset ?? 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_OPEN_MONTHLY, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminStatsMonthlyList(ctx, 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_MONTHLY_PREV_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsMonthlyFeed;
    if (!feed || !feed.hasPrevPage) {
      return;
    }

    const nextOffset = Math.max(0, feed.offset - feed.limit);
    await renderAdminStatsMonthlyList(ctx, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_MONTHLY_NEXT_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsMonthlyFeed;
    if (!feed || !feed.hasNextPage) {
      return;
    }

    const nextOffset = feed.offset + feed.limit;
    await renderAdminStatsMonthlyList(ctx, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_STATS_MONTHLY_OPEN_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const monthCode = parseMonthCodeFromAction(ctx, ADMIN_PANEL_STATS_MONTHLY_OPEN_ACTION_REGEX);

    try {
      await renderAdminStatsMonthlyReportDetails(ctx, monthCode, true);
    } catch (error) {
      if (error instanceof ValidationError) {
        await ctx.reply(`⚠️ ${error.message}`);
        const fallbackOffset = state.statsMonthlyFeed?.offset ?? 0;
        await renderAdminStatsMonthlyList(ctx, fallbackOffset, false);
        return;
      }
      throw error;
    }
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_MONTHLY_BACK_TO_LIST, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsMonthlyFeed;
    await renderAdminStatsMonthlyList(ctx, feed?.offset ?? 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_OPEN_CLIENTS, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminStatsClientsList(ctx, 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_CLIENTS_PREV_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsClientsFeed;
    if (!feed || !feed.hasPrevPage) {
      return;
    }

    const nextOffset = Math.max(0, feed.offset - feed.limit);
    await renderAdminStatsClientsList(ctx, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_CLIENTS_NEXT_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsClientsFeed;
    if (!feed || !feed.hasNextPage) {
      return;
    }

    const nextOffset = feed.offset + feed.limit;
    await renderAdminStatsClientsList(ctx, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_STATS_CLIENTS_OPEN_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const clientId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_STATS_CLIENTS_OPEN_ACTION_REGEX,
      'id клієнта',
    );

    try {
      await renderAdminStatsClientDetails(ctx, clientId, true);
    } catch (error) {
      if (error instanceof ValidationError) {
        await ctx.reply(`⚠️ ${error.message}`);
        const fallbackOffset = state.statsClientsFeed?.offset ?? 0;
        await renderAdminStatsClientsList(ctx, fallbackOffset, false);
        return;
      }
      throw error;
    }
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_CLIENTS_BACK_TO_LIST, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsClientsFeed;
    await renderAdminStatsClientsList(ctx, feed?.offset ?? 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_BACK_TO_OVERVIEW, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminStatsOverview(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_BACK, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetStatsState(state);
    await renderAdminRoot(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.OPEN_SETTINGS, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRecordsActionDrafts(state);
    resetScheduleDrafts(state);
    resetMastersState(state);
    resetServicesState(state);
    resetStatsState(state);
    resetSettingsState(state);
    await renderAdminSettingsMenu(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_OPEN_LANGUAGE, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminSettingsSection(ctx, 'language', true);
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_OPEN_ADMINS, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminSettingsSection(ctx, 'admins', true);
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_OPEN_STUDIO, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminSettingsSection(ctx, 'studio', true);
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_OPEN_NOTIFICATIONS, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminSettingsSection(ctx, 'notifications', true);
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_BACK_TO_MENU, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminSettingsMenu(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_BACK, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetSettingsState(state);
    await renderAdminRoot(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_MENU_PENDING, async (ctx) => {
    await ctx.answerCbQuery();
    resetRecordsActionDrafts(getSceneState(ctx));
    await renderRecordsCategoryStub(ctx, 'pending', 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_MENU_TODAY, async (ctx) => {
    await ctx.answerCbQuery();
    resetRecordsActionDrafts(getSceneState(ctx));
    await renderRecordsCategoryStub(ctx, 'today', 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_MENU_TOMORROW, async (ctx) => {
    await ctx.answerCbQuery();
    resetRecordsActionDrafts(getSceneState(ctx));
    await renderRecordsCategoryStub(ctx, 'tomorrow', 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_MENU_ALL, async (ctx) => {
    await ctx.answerCbQuery();
    resetRecordsActionDrafts(getSceneState(ctx));
    await renderRecordsCategoryStub(ctx, 'all', 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_MENU_CANCELED, async (ctx) => {
    await ctx.answerCbQuery();
    resetRecordsActionDrafts(getSceneState(ctx));
    await renderRecordsCategoryStub(ctx, 'canceled', 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_LIST_PREV_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).recordsFeed;
    if (!feed || !feed.hasPrevPage) {
      return;
    }

    const nextOffset = Math.max(0, feed.offset - feed.limit);
    await renderRecordsCategoryStub(ctx, feed.category, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_LIST_NEXT_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).recordsFeed;
    if (!feed || !feed.hasNextPage) {
      return;
    }

    const nextOffset = feed.offset + feed.limit;
    await renderRecordsCategoryStub(ctx, feed.category, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_RECORDS_OPEN_CARD_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRecordsActionDrafts(state);
    const appointmentId = parseAppointmentIdFromAction(ctx, ADMIN_PANEL_RECORDS_OPEN_CARD_ACTION_REGEX);
    const item = await resolveAdminRecordById(state, appointmentId);
    if (!item) {
      if (state.recordsFeed) {
        await renderRecordsCategoryStub(ctx, state.recordsFeed.category, state.recordsFeed.offset, true);
        return;
      }

      await renderRecordsMenu(ctx);
      return;
    }

    await renderAdminBookingCard(ctx, item);
  });

  scene.action(ADMIN_PANEL_RECORDS_CONFIRM_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    if (!access?.studioId) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    const appointmentId = parseAppointmentIdFromAction(ctx, ADMIN_PANEL_RECORDS_CONFIRM_ACTION_REGEX);
    let updated: AdminBookingItem;
    try {
      updated = await confirmAdminPendingBooking({
        studioId: access.studioId,
        actorUserId: access.userId,
        appointmentId,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        await ctx.reply(`⚠️ ${error.message}`);
        const current = await resolveAdminRecordById(state, appointmentId);
        if (current) {
          await renderAdminBookingCard(ctx, current);
          return;
        }
        await renderRecordsFallback(ctx, false);
        return;
      }
      throw error;
    }

    await notifyAdminConfirmedBooking(updated);
    await ctx.reply('✅ Запис підтверджено. Клієнту надіслано сповіщення.');
    resetRecordsActionDrafts(state);
    await renderRecordsFallback(ctx, true);
  });

  scene.action(ADMIN_PANEL_RECORDS_CANCEL_REQUEST_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const appointmentId = parseAppointmentIdFromAction(ctx, ADMIN_PANEL_RECORDS_CANCEL_REQUEST_ACTION_REGEX);
    const item = await resolveAdminRecordById(state, appointmentId);
    if (!item) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    await renderAdminCancelBookingConfirm(ctx, item);
  });

  scene.action(ADMIN_PANEL_RECORDS_CANCEL_CONFIRM_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    if (!access?.studioId) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    const appointmentId = parseAppointmentIdFromAction(ctx, ADMIN_PANEL_RECORDS_CANCEL_CONFIRM_ACTION_REGEX);
    let canceled: AdminBookingItem;
    try {
      canceled = await cancelAdminBooking({
        studioId: access.studioId,
        actorUserId: access.userId,
        appointmentId,
        cancelReason: 'Скасовано адміністратором через Telegram-бота',
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        await ctx.reply(`⚠️ ${error.message}`);
        const current = await resolveAdminRecordById(state, appointmentId);
        if (current) {
          await renderAdminBookingCard(ctx, current);
          return;
        }
        await renderRecordsFallback(ctx, false);
        return;
      }
      throw error;
    }

    await notifyAdminCanceledBooking(canceled);
    await ctx.reply('✅ Запис скасовано. Клієнту надіслано сповіщення.');
    resetRecordsActionDrafts(state);
    await renderRecordsFallback(ctx, true);
  });

  scene.action(ADMIN_PANEL_RECORDS_RESCHEDULE_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const appointmentId = parseAppointmentIdFromAction(ctx, ADMIN_PANEL_RECORDS_RESCHEDULE_ACTION_REGEX);
    const item = await resolveAdminRecordById(state, appointmentId);
    if (!item) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    if (item.status !== 'pending' && item.status !== 'confirmed') {
      await ctx.reply('⚠️ Цей запис уже не можна перенести.');
      await renderAdminBookingCard(ctx, item);
      return;
    }

    state.recordsRescheduleDraft = {
      appointmentId,
      dateCode: null,
      timeCode: null,
    };
    state.recordsChangeMasterDraft = null;
    await renderRescheduleDateStep(ctx, true);
  });

  scene.action(ADMIN_PANEL_RECORDS_RESCHEDULE_DATE_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.recordsRescheduleDraft) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    const callbackData = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const matches = callbackData.match(ADMIN_PANEL_RECORDS_RESCHEDULE_DATE_ACTION_REGEX);
    const dateCode = matches?.[1] ?? '';
    const parsed = bookingDateCodeSchema.safeParse(dateCode);
    if (!parsed.success) {
      await renderRescheduleDateStep(ctx, true);
      return;
    }

    state.recordsRescheduleDraft.dateCode = parsed.data;
    state.recordsRescheduleDraft.timeCode = null;
    await renderRescheduleTimeStep(ctx, true);
  });

  scene.action(ADMIN_PANEL_RECORDS_RESCHEDULE_TIME_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.recordsRescheduleDraft;
    if (!draft?.dateCode) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    const callbackData = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const matches = callbackData.match(ADMIN_PANEL_RECORDS_RESCHEDULE_TIME_ACTION_REGEX);
    const timeCode = matches?.[1] ?? '';
    const parsed = bookingTimeCodeSchema.safeParse(timeCode);
    if (!parsed.success) {
      await renderRescheduleTimeStep(ctx, true);
      return;
    }

    const allowed = new Set(getAvailableRescheduleTimeCodes(draft.dateCode));
    if (!allowed.has(parsed.data)) {
      await renderRescheduleTimeStep(ctx, true);
      return;
    }

    draft.timeCode = parsed.data;
    await renderRescheduleConfirmStep(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_BACK_TO_DATE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.recordsRescheduleDraft) {
      await renderRecordsFallback(ctx, true);
      return;
    }
    state.recordsRescheduleDraft.timeCode = null;
    await renderRescheduleDateStep(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_BACK_TO_TIME, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.recordsRescheduleDraft?.dateCode) {
      await renderRecordsFallback(ctx, true);
      return;
    }
    state.recordsRescheduleDraft.timeCode = null;
    await renderRescheduleTimeStep(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.recordsRescheduleDraft = null;
    await renderRecordsFallback(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.recordsRescheduleDraft;
    if (!access?.studioId || !draft?.dateCode || !draft.timeCode) {
      state.recordsRescheduleDraft = null;
      await renderRecordsFallback(ctx, true);
      return;
    }

    const target = await resolveAdminRecordById(state, draft.appointmentId);
    if (!target) {
      state.recordsRescheduleDraft = null;
      await renderRecordsFallback(ctx, true);
      return;
    }

    const newStartAt = toStartAt(draft.dateCode, draft.timeCode);
    let result: RescheduleAdminBookingResult;
    try {
      result = await rescheduleAdminBooking({
        studioId: access.studioId,
        actorUserId: access.userId,
        appointmentId: draft.appointmentId,
        newStartAt,
        reason: 'Перенесено адміністратором через Telegram-бота',
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        await ctx.reply(`⚠️ ${error.message}`);
        await renderRescheduleTimeStep(ctx, false);
        return;
      }
      throw error;
    }

    await notifyAdminRescheduledBooking(result);
    await ctx.reply('✅ Запис успішно перенесено. Клієнту надіслано сповіщення.');
    state.recordsRescheduleDraft = null;
    await renderRecordsFallback(ctx, true);
  });

  scene.action(ADMIN_PANEL_RECORDS_CHANGE_MASTER_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const appointmentId = parseAppointmentIdFromAction(ctx, ADMIN_PANEL_RECORDS_CHANGE_MASTER_ACTION_REGEX);
    const item = await resolveAdminRecordById(state, appointmentId);
    if (!item) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    if (item.status !== 'pending' && item.status !== 'confirmed') {
      await ctx.reply('⚠️ Для цього запису змінити майстра вже не можна.');
      await renderAdminBookingCard(ctx, item);
      return;
    }

    const candidates = await loadChangeMasterCandidates(item);
    state.recordsChangeMasterDraft = {
      appointmentId,
      selectedMasterId: null,
      selectedMasterName: null,
      candidates,
    };
    state.recordsRescheduleDraft = null;
    await renderChangeMasterSelectStep(ctx, true);
  });

  scene.action(ADMIN_PANEL_RECORDS_CHANGE_MASTER_SELECT_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.recordsChangeMasterDraft;
    if (!draft) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    const callbackData = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const matches = callbackData.match(ADMIN_PANEL_RECORDS_CHANGE_MASTER_SELECT_ACTION_REGEX);
    const appointmentId = matches?.[1] ?? '';
    const masterId = matches?.[2] ?? '';
    if (!appointmentId || !masterId || appointmentId !== draft.appointmentId) {
      await renderChangeMasterSelectStep(ctx, true);
      return;
    }

    const selected = draft.candidates.find((candidate) => candidate.masterId === masterId);
    if (!selected) {
      await renderChangeMasterSelectStep(ctx, true);
      return;
    }

    draft.selectedMasterId = selected.masterId;
    draft.selectedMasterName = selected.displayName;
    await renderChangeMasterConfirmStep(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_CHANGE_MASTER_BACK, async (ctx) => {
    await ctx.answerCbQuery();
    const draft = getSceneState(ctx).recordsChangeMasterDraft;
    if (!draft) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    draft.selectedMasterId = null;
    draft.selectedMasterName = null;
    await renderChangeMasterSelectStep(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_CHANGE_MASTER_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.recordsChangeMasterDraft = null;
    await renderRecordsFallback(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_CHANGE_MASTER_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.recordsChangeMasterDraft;
    if (!access?.studioId || !draft?.selectedMasterId) {
      state.recordsChangeMasterDraft = null;
      await renderRecordsFallback(ctx, true);
      return;
    }

    const previous = await resolveAdminRecordById(state, draft.appointmentId);
    if (!previous) {
      state.recordsChangeMasterDraft = null;
      await renderRecordsFallback(ctx, true);
      return;
    }

    let updated: AdminBookingItem;
    try {
      updated = await reassignAdminBookingMaster({
        studioId: access.studioId,
        actorUserId: access.userId,
        appointmentId: draft.appointmentId,
        newMasterId: draft.selectedMasterId,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        await ctx.reply(`⚠️ ${error.message}`);
        await renderChangeMasterSelectStep(ctx, false);
        return;
      }
      throw error;
    }

    await notifyAdminMasterChangedBooking(previous, updated);
    await ctx.reply('✅ Майстра успішно змінено. Клієнту надіслано сповіщення.');
    state.recordsChangeMasterDraft = null;
    await renderAdminBookingCard(ctx, updated);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_BACK_TO_LIST, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRecordsActionDrafts(state);
    state.recordsOpenedAppointmentId = null;
    const feed = state.recordsFeed;
    if (!feed) {
      await renderRecordsMenu(ctx);
      return;
    }
    await renderRecordsCategoryStub(ctx, feed.category, feed.offset, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_BACK, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRecordsActionDrafts(state);
    state.recordsOpenedAppointmentId = null;
    state.recordsFeed = null;
    state.recordsLastCategory = null;
    await renderAdminRoot(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.BACK_TO_ROOT, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRecordsActionDrafts(state);
    resetScheduleDrafts(state);
    resetMastersState(state);
    resetServicesState(state);
    resetStatsState(state);
    resetSettingsState(state);
    await renderAdminRoot(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.EXIT, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await sendClientMainMenu(ctx);
  });

  scene.action(ADMIN_PANEL_ACTION.HOME, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await sendClientMainMenu(ctx);
  });

  return scene;
}
