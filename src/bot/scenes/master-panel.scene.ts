import { Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import type { MasterPanelAccess } from '../../types/db-helpers/db-master-panel.types.js';
import type { MasterOwnProfileData } from '../../types/db-helpers/db-master-profile.types.js';
import type {
  MasterBookingsCategory,
  MasterBookingsFeedPage,
  MasterPendingBookingItem,
} from '../../types/db-helpers/db-master-bookings.types.js';
import type { MasterTemporaryScheduleDayInput } from '../../types/db-helpers/db-master-schedule.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import { resolveBotUiLanguage, tBot, tBotTemplate } from '../../helpers/bot/i18n.bot.js';
import type { BotUiLanguage } from '../../helpers/bot/i18n.bot.js';
import {
  createMasterPanelRootKeyboard,
  formatMasterPanelRootText,
} from '../../helpers/bot/master-panel-view.bot.js';
import {
  createMasterOwnProfileAdditionalKeyboard,
  createMasterOwnProfileCertificateConfirmKeyboard,
  createMasterOwnProfileCertificateDeleteConfirmKeyboard,
  createMasterOwnProfileCertificateDeleteListKeyboard,
  createMasterOwnProfileCertificateInputKeyboard,
  createMasterOwnProfileCertificatesKeyboard,
  createMasterOwnProfileEditConfirmKeyboard,
  createMasterOwnProfileEditInputKeyboard,
  createMasterOwnProfileMainKeyboard,
  createMasterOwnProfileProfessionalKeyboard,
  createMasterOwnProfileServicesAddKeyboard,
  createMasterOwnProfileServicesRemoveKeyboard,
  createMasterOwnProfileServicesKeyboard,
  formatMasterOwnProfileCertificateConfirmText,
  formatMasterOwnProfileCertificateDeleteConfirmText,
  formatMasterOwnProfileCertificateDeleteListText,
  formatMasterOwnProfileCertificateInputText,
  formatMasterOwnProfileCertificatesText,
  formatMasterOwnProfileEditConfirmText,
  formatMasterOwnProfileEditInputText,
  formatMasterOwnProfileEditSuccessText,
  formatMasterOwnProfileAdditionalText,
  formatMasterOwnProfileMainText,
  formatMasterOwnProfileServicesAddText,
  formatMasterOwnProfileServicesRemoveText,
  type MasterOwnProfileEditableField,
  formatMasterOwnProfileProfessionalText,
  formatMasterOwnProfileServicesText,
} from '../../helpers/bot/master-own-profile-view.bot.js';
import {
  createMasterStatsKeyboard,
  formatMasterStatsText,
} from '../../helpers/bot/master-stats-view.bot.js';
import {
  createMasterFinanceKeyboard,
  formatMasterFinanceText,
} from '../../helpers/bot/master-finance-view.bot.js';
import {
  createMasterScheduleConfigureDayInputKeyboard,
  createMasterScheduleConfigureDayKeyboard,
  createMasterScheduleDeleteConfirmKeyboard,
  createMasterScheduleDaysOffListKeyboard,
  createMasterScheduleTemporaryConfirmKeyboard,
  createMasterScheduleTemporaryDayInputKeyboard,
  createMasterScheduleTemporaryDaysConfigKeyboard,
  createMasterScheduleTemporaryHoursListKeyboard,
  createMasterScheduleTemporaryPeriodInputKeyboard,
  createMasterScheduleVacationsListKeyboard,
  createMasterScheduleVacationConfirmKeyboard,
  createMasterScheduleVacationInputKeyboard,
  createMasterScheduleSetDayOffConfirmKeyboard,
  createMasterScheduleSetDayOffInputKeyboard,
  createMasterScheduleSectionKeyboard,
  createMasterScheduleKeyboard,
  formatMasterScheduleConfigureDayFromInputText,
  formatMasterScheduleConfigureDaySuccessText,
  formatMasterScheduleConfigureDayToInputText,
  formatMasterScheduleConfigureDayText,
  formatMasterScheduleDeleteDayOffConfirmText,
  formatMasterScheduleDeleteTemporaryConfirmText,
  formatMasterScheduleDeleteVacationConfirmText,
  formatMasterScheduleDaysOffListText,
  formatMasterScheduleTemporaryDayFromInputText,
  formatMasterScheduleTemporaryDayToInputText,
  formatMasterScheduleTemporaryDaysConfigText,
  formatMasterScheduleTemporaryConfirmText,
  formatMasterScheduleTemporarySetPeriodText,
  formatMasterScheduleTemporarySuccessText,
  formatMasterScheduleVacationConfirmText,
  formatMasterScheduleVacationSetText,
  formatMasterScheduleVacationSuccessText,
  formatMasterScheduleSetDayOffConfirmText,
  formatMasterScheduleSetDayOffSuccessText,
  formatMasterScheduleSetDayOffText,
  formatMasterScheduleText,
  formatMasterScheduleTemporaryHoursText,
  formatMasterScheduleVacationsText,
} from '../../helpers/bot/master-schedule-view.bot.js';
import {
  createMasterBookingDetailsCardKeyboard,
  createMasterBookingsFeedKeyboard,
  createMasterBookingsMenuKeyboard,
  createMasterCancelPendingBookingConfirmKeyboard,
  createMasterPendingBookingCardKeyboard,
  createMasterPendingBookingsEmptyKeyboard,
  createMasterRescheduleConfirmKeyboard,
  createMasterRescheduleDateKeyboard,
  createMasterRescheduleTimeKeyboard,
  formatMasterBookingDetailsCardText,
  formatMasterBookingsFeedText,
  formatMasterBookingsMenuText,
  formatMasterCancelPendingBookingConfirmText,
  formatMasterPendingBookingCardText,
  formatMasterPendingBookingsEmptyText,
  formatMasterRescheduleConfirmText,
  formatMasterRescheduleDateStepText,
  formatMasterRescheduleTimeStepText,
} from '../../helpers/bot/master-bookings-view.bot.js';
import {
  MASTER_PANEL_ACTION,
  MASTER_PANEL_SCHEDULE_DAY_OFF_DELETE_CONFIRM_ACTION_REGEX,
  MASTER_PANEL_SCHEDULE_DAY_OFF_DELETE_REQUEST_ACTION_REGEX,
  MASTER_PANEL_SCHEDULE_TEMPORARY_DELETE_CONFIRM_ACTION_REGEX,
  MASTER_PANEL_SCHEDULE_TEMPORARY_DELETE_REQUEST_ACTION_REGEX,
  MASTER_PANEL_SCHEDULE_VACATION_DELETE_CONFIRM_ACTION_REGEX,
  MASTER_PANEL_SCHEDULE_VACATION_DELETE_REQUEST_ACTION_REGEX,
  MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_OFF_ACTION_REGEX,
  MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_WEEKDAY_ACTION_REGEX,
  MASTER_PANEL_BOOKING_CANCEL_CONFIRM_ACTION_REGEX,
  MASTER_PANEL_BOOKING_CANCEL_REQUEST_ACTION_REGEX,
  MASTER_PANEL_BOOKING_CLIENT_HISTORY_ACTION_REGEX,
  MASTER_PANEL_BOOKING_CONFIRM_ACTION_REGEX,
  MASTER_PANEL_BOOKING_OPEN_CARD_ACTION_REGEX,
  MASTER_PANEL_BOOKING_PROFILE_ACTION_REGEX,
  MASTER_PANEL_BOOKING_RESCHEDULE_DATE_ACTION_REGEX,
  MASTER_PANEL_BOOKING_RESCHEDULE_ACTION_REGEX,
  MASTER_PANEL_BOOKING_RESCHEDULE_TIME_ACTION_REGEX,
  MASTER_PANEL_PROFILE_CERTIFICATE_DELETE_CONFIRM_ACTION_REGEX,
  MASTER_PANEL_PROFILE_CERTIFICATE_DELETE_REQUEST_ACTION_REGEX,
  MASTER_PANEL_PROFILE_SERVICE_ADD_ACTION_REGEX,
  MASTER_PANEL_PROFILE_SERVICE_REMOVE_ACTION_REGEX,
  MASTER_PANEL_PROFILE_SERVICE_TOGGLE_ACTION_REGEX,
  MASTER_PANEL_TEMPORARY_HOURS_DAY_ACTION_REGEX,
  MASTER_PANEL_TEMPORARY_HOURS_DAY_OFF_ACTION_REGEX,
  makeMasterPanelScheduleDayOffDeleteConfirmAction,
  makeMasterPanelScheduleTemporaryDeleteConfirmAction,
  makeMasterPanelScheduleVacationDeleteConfirmAction,
} from '../../types/bot-master-panel.types.js';
import { getMasterPanelAccessByTelegramId } from '../../helpers/db/db-master-panel.helper.js';
import { getOrCreateUser } from '../../helpers/db/db-profile.helper.js';
import {
  addMasterOwnCertificate,
  addMasterOwnService,
  deleteMasterOwnCertificate,
  listMasterOwnCertificatesManage,
  listMasterOwnServicesAddCandidates,
  listMasterOwnServicesRemoveCandidates,
  removeMasterOwnService,
  updateMasterOwnProfileBio,
  updateMasterOwnProfileDisplayName,
  updateMasterOwnProfileEmail,
  updateMasterOwnProfileMaterials,
  updateMasterOwnProfilePhone,
  updateMasterOwnProfileProceduresDoneTotal,
  updateMasterOwnProfileStartedOn,
  getMasterOwnProfile,
  listMasterOwnServicesManage,
  toggleMasterOwnServiceAvailability,
} from '../../helpers/db/db-master-profile.helper.js';
import {
  cancelMasterPendingBooking,
  confirmMasterPendingBooking,
  getMasterBookingCardById,
  listMasterBookingsFeed,
  listMasterPendingBookings,
  rescheduleMasterPendingBooking,
} from '../../helpers/db/db-master-bookings.helper.js';
import {
  getMasterClientProfileByBooking,
  listMasterClientBookingsHistoryByBooking,
} from '../../helpers/db/db-master-clients.helper.js';
import { getMasterPanelStats } from '../../helpers/db/db-master-stats.helper.js';
import { getMasterPanelFinance } from '../../helpers/db/db-master-finance.helper.js';
import {
  createMasterDayOff,
  deleteMasterDayOff,
  deleteMasterTemporarySchedulePeriod,
  deleteMasterVacation,
  createMasterTemporarySchedule,
  createMasterVacation,
  getMasterPanelSchedule,
  upsertMasterWeeklyDay,
} from '../../helpers/db/db-master-schedule.helper.js';
import { dispatchNotification } from '../../helpers/notification/notification-dispatch.helper.js';
import { handleError, ValidationError } from '../../utils/error.utils.js';
import { loggerNotification } from '../../utils/logger/loggers-list.js';
import { bookingDateCodeSchema, bookingTimeCodeSchema } from '../../validator/booking-input.schema.js';
import { buildBookingDateOptions, buildBookingTimeOptions } from '../../helpers/bot/booking-view.bot.js';
import {
  normalizeMasterBio,
  normalizeMasterCertificateTitle,
  normalizeMasterDisplayName,
  normalizeMasterContactEmail,
  normalizeMasterContactPhone,
  normalizeMasterMaterialsInfo,
  normalizeMasterProceduresDoneTotal,
  normalizeMasterStartedOn,
} from '../../utils/db/db-master-profile.js';
import {
  createMasterClientBookingsHistoryKeyboard,
  createMasterClientProfileKeyboard,
  formatMasterClientBookingsHistoryText,
  formatMasterClientProfileText,
} from '../../helpers/bot/master-client-profile-view.bot.js';

/**
 * @file master-panel.scene.ts
 * @summary Панель майстра:
 * - блок 1: доступ + базова навігація
 * - блок 2: черга нових pending-записів (перегляд, підтвердження, скасування)
 */

export const MASTER_PANEL_SCENE_ID = 'master-panel-scene';
const MIN_TEMPORARY_SCHEDULE_DAYS = 7;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

type MasterPanelSceneState = {
  language: BotUiLanguage;
  access: MasterPanelAccess | null;
  ownProfile: MasterOwnProfileData | null;
  pending: MasterPendingBookingItem[];
  pendingCursor: number;
  bookingsFeed: MasterBookingsFeedPage | null;
  scheduleDayOffDraft:
    | {
        mode: 'awaiting_date' | 'awaiting_confirm';
        offDate: string | null;
        offDateLabel: string | null;
      }
    | null;
  scheduleVacationDraft:
    | {
        mode: 'awaiting_range' | 'awaiting_confirm';
        dateFrom: string | null;
        dateTo: string | null;
        dateFromLabel: string | null;
        dateToLabel: string | null;
      }
    | null;
  scheduleTemporaryDraft:
    | {
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
        days: MasterTemporaryScheduleDayInput[];
        selectedWeekday: number | null;
        pendingFromTime: string | null;
      }
    | null;
  scheduleConfigureDayDraft:
    | {
        mode: 'awaiting_from' | 'awaiting_to';
        weekday: number | null;
        fromTime: string | null;
      }
    | null;
  scheduleDeleteDraft:
    | {
        type: 'day_off' | 'vacation' | 'temporary_period';
        dayOffId: string | null;
        vacationId: string | null;
        dateFrom: string | null;
        dateTo: string | null;
      }
    | null;
  profileEditDraft:
    | {
        mode: 'awaiting_value' | 'awaiting_confirm';
        field: MasterOwnProfileEditableField;
        value: string | null;
      }
    | null;
  certificateAddDraft:
    | {
        mode: 'awaiting_title' | 'awaiting_confirm';
        title: string | null;
      }
    | null;
  certificateDeleteDraft:
    | {
        certificateId: string | null;
        title: string | null;
      }
    | null;
  rescheduleDraft:
    | {
        appointmentId: string;
        dateCode: string | null;
        timeCode: string | null;
        sourceItem: MasterPendingBookingItem | null;
      }
    | null;
};

function getSceneState(ctx: MyContext): MasterPanelSceneState {
  return ctx.wizard.state as MasterPanelSceneState;
}

function getMessageText(ctx: MyContext): string | null {
  if (!ctx.message) return null;
  if (!('text' in ctx.message)) return null;
  return ctx.message.text.trim();
}

function parseAppointmentIdFromAction(ctx: MyContext, regex: RegExp): string {
  const callbackData =
    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
  const matches = callbackData.match(regex);

  if (!matches?.[1]) {
    throw new ValidationError('Некоректна callback-дія запису майстра');
  }

  return matches[1];
}

function parseServiceIdFromAction(ctx: MyContext, regex: RegExp): string {
  const callbackData =
    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
  const matches = callbackData.match(regex);

  if (!matches?.[1]) {
    throw new ValidationError('Некоректна callback-дія керування послугою майстра');
  }

  return matches[1];
}

async function getMasterCertificateTitleById(
  masterId: string,
  certificateId: string,
): Promise<string | null> {
  const certificates = await listMasterOwnCertificatesManage(masterId);
  const found = certificates.find((certificate) => certificate.certificateId === certificateId);
  return found?.title ?? null;
}

function getPendingItemById(state: MasterPanelSceneState, appointmentId: string): MasterPendingBookingItem | null {
  return state.pending.find((item) => item.appointmentId === appointmentId) ?? null;
}

function getRescheduleTargetItem(state: MasterPanelSceneState): MasterPendingBookingItem | null {
  if (!state.rescheduleDraft?.appointmentId) return null;
  const fromPending = getPendingItemById(state, state.rescheduleDraft.appointmentId);
  if (fromPending) return fromPending;

  const fromFeed = state.bookingsFeed?.items.find(
    (item) => item.appointmentId === state.rescheduleDraft?.appointmentId,
  );
  if (fromFeed) return fromFeed;

  return state.rescheduleDraft.sourceItem;
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
  const options = buildBookingTimeOptions().map((value) => value.replace(':', ''));

  if (dateCode !== getTodayDateCode()) {
    return options;
  }

  const now = Date.now();
  return options.filter((timeCode) => toStartAt(dateCode, timeCode).getTime() > now);
}

function formatDateCodeLabel(dateCode: string): string {
  const year = Number(dateCode.slice(0, 4));
  const month = Number(dateCode.slice(4, 6));
  const day = Number(dateCode.slice(6, 8));
  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
}

function formatDayOffDateLabel(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatDayOffDateSql(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

function formatDateToCode(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}${month}${day}`;
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

function parseSqlDate(value: string): Date {
  const normalized = value.trim();
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new ValidationError('Некоректна дата');
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

function parseDayOffDateInput(input: string): Date {
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
    throw new ValidationError('Не можна встановити вихідний день у минулому');
  }

  return parsedDay;
}

function parseVacationRangeInput(input: string): { dateFrom: Date; dateTo: Date } {
  const normalized = input.trim();
  const match = normalized.match(
    /^(\d{2}\.\d{2}\.\d{4})\s*[-–—]\s*(\d{2}\.\d{2}\.\d{4})$/,
  );

  if (!match) {
    throw new ValidationError('Період має бути у форматі ДД.ММ.РРРР - ДД.ММ.РРРР');
  }

  const dateFrom = parseDayOffDateInput(match[1]);
  const dateTo = parseDayOffDateInput(match[2]);

  if (dateTo.getTime() < dateFrom.getTime()) {
    throw new ValidationError('Дата завершення відпустки не може бути раніше дати початку');
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
  days: MasterTemporaryScheduleDayInput[],
  day: MasterTemporaryScheduleDayInput,
): MasterTemporaryScheduleDayInput[] {
  const filtered = days.filter((current) => current.weekday !== day.weekday);
  return [...filtered, day].sort((a, b) => a.weekday - b.weekday);
}

function parseWeekdayFromAction(ctx: MyContext, regex: RegExp): number {
  const callbackData =
    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
  const match = callbackData.match(regex);
  const weekday = match?.[1] ? Number(match[1]) : Number.NaN;
  if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7) {
    throw new ValidationError('Некоректний день тижня');
  }
  return weekday;
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

function parseTemporaryPeriodFromAction(ctx: MyContext, regex: RegExp): { dateFrom: string; dateTo: string } {
  const callbackData =
    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
  const match = callbackData.match(regex);
  const dateFromCode = match?.[1] ?? '';
  const dateToCode = match?.[2] ?? '';

  const dateFrom = parseDateFromCode(dateFromCode);
  const dateTo = parseDateFromCode(dateToCode);

  if (dateTo.getTime() < dateFrom.getTime()) {
    throw new ValidationError('Некоректний період тимчасового графіку');
  }

  return {
    dateFrom: formatDayOffDateSql(dateFrom),
    dateTo: formatDayOffDateSql(dateTo),
  };
}

function resetScheduleDayOffDraft(state: MasterPanelSceneState): void {
  state.scheduleDayOffDraft = null;
}

function resetScheduleVacationDraft(state: MasterPanelSceneState): void {
  state.scheduleVacationDraft = null;
}

function resetScheduleTemporaryDraft(state: MasterPanelSceneState): void {
  state.scheduleTemporaryDraft = null;
}

function resetScheduleConfigureDayDraft(state: MasterPanelSceneState): void {
  state.scheduleConfigureDayDraft = null;
}

function resetScheduleDeleteDraft(state: MasterPanelSceneState): void {
  state.scheduleDeleteDraft = null;
}

function resetProfileEditDraft(state: MasterPanelSceneState): void {
  state.profileEditDraft = null;
}

function resetCertificateAddDraft(state: MasterPanelSceneState): void {
  state.certificateAddDraft = null;
}

function resetCertificateDeleteDraft(state: MasterPanelSceneState): void {
  state.certificateDeleteDraft = null;
}

function resetProfileDrafts(state: MasterPanelSceneState): void {
  resetProfileEditDraft(state);
  resetCertificateAddDraft(state);
  resetCertificateDeleteDraft(state);
}

function resetRescheduleDraft(state: MasterPanelSceneState): void {
  state.rescheduleDraft = null;
}

function resetBookingsFeed(state: MasterPanelSceneState): void {
  state.bookingsFeed = null;
}

function normalizeMasterProfileFieldValue(
  field: MasterOwnProfileEditableField,
  value: string,
): string {
  switch (field) {
    case 'bio':
      return normalizeMasterBio(value);
    case 'materials':
      return normalizeMasterMaterialsInfo(value);
    case 'phone':
      return normalizeMasterContactPhone(value);
    case 'email':
      return normalizeMasterContactEmail(value);
    case 'display_name':
      return normalizeMasterDisplayName(value);
    case 'started_on': {
      const sqlDate = normalizeMasterStartedOn(value);
      const [year, month, day] = sqlDate.split('-');
      return `${day}.${month}.${year}`;
    }
    case 'procedures_done_total':
      return String(normalizeMasterProceduresDoneTotal(value));
    default:
      throw new ValidationError('Некоректне поле редагування профілю');
  }
}

async function persistMasterProfileField(
  masterId: string,
  field: MasterOwnProfileEditableField,
  value: string,
): Promise<void> {
  switch (field) {
    case 'bio':
      await updateMasterOwnProfileBio({ masterId, bio: value });
      return;
    case 'materials':
      await updateMasterOwnProfileMaterials({ masterId, materialsInfo: value });
      return;
    case 'phone':
      await updateMasterOwnProfilePhone({ masterId, contactPhoneE164: value });
      return;
    case 'email':
      await updateMasterOwnProfileEmail({ masterId, contactEmail: value });
      return;
    case 'display_name':
      await updateMasterOwnProfileDisplayName({ masterId, displayName: value });
      return;
    case 'started_on':
      await updateMasterOwnProfileStartedOn({ masterId, startedOn: value });
      return;
    case 'procedures_done_total':
      await updateMasterOwnProfileProceduresDoneTotal({
        masterId,
        proceduresDoneTotal: value,
      });
      return;
    default:
      throw new ValidationError('Некоректне поле редагування профілю');
  }
}

function isProfessionalProfileField(field: MasterOwnProfileEditableField): boolean {
  return field === 'display_name' || field === 'started_on' || field === 'procedures_done_total';
}

async function renderMasterProfileSectionByField(
  ctx: MyContext,
  state: MasterPanelSceneState,
  field: MasterOwnProfileEditableField,
  preferEdit: boolean,
): Promise<void> {
  if (!state.ownProfile) {
    await denyMasterPanelAccess(ctx);
    await ctx.scene.leave();
    return;
  }

  if (isProfessionalProfileField(field)) {
    await renderView(
      ctx,
      formatMasterOwnProfileProfessionalText(state.ownProfile, state.language),
      createMasterOwnProfileProfessionalKeyboard(state.language),
      preferEdit,
    );
    return;
  }

  await renderView(
    ctx,
    formatMasterOwnProfileAdditionalText(state.ownProfile, state.language),
    createMasterOwnProfileAdditionalKeyboard(state.language),
    preferEdit,
  );
}

async function renderMasterServicesManage(
  ctx: MyContext,
  language: BotUiLanguage,
  masterId: string,
  preferEdit: boolean,
): Promise<void> {
  const services = await listMasterOwnServicesManage(masterId);
  await renderView(
    ctx,
    formatMasterOwnProfileServicesText(services, language),
    createMasterOwnProfileServicesKeyboard(services, language),
    preferEdit,
  );
}

async function renderMasterServicesAddCandidates(
  ctx: MyContext,
  language: BotUiLanguage,
  masterId: string,
  preferEdit: boolean,
): Promise<void> {
  const services = await listMasterOwnServicesAddCandidates(masterId);
  await renderView(
    ctx,
    formatMasterOwnProfileServicesAddText(services, language),
    createMasterOwnProfileServicesAddKeyboard(services, language),
    preferEdit,
  );
}

async function renderMasterServicesRemoveCandidates(
  ctx: MyContext,
  language: BotUiLanguage,
  masterId: string,
  preferEdit: boolean,
): Promise<void> {
  const services = await listMasterOwnServicesRemoveCandidates(masterId);
  await renderView(
    ctx,
    formatMasterOwnProfileServicesRemoveText(services, language),
    createMasterOwnProfileServicesRemoveKeyboard(services, language),
    preferEdit,
  );
}

async function renderMasterCertificatesManage(
  ctx: MyContext,
  language: BotUiLanguage,
  masterId: string,
  preferEdit: boolean,
): Promise<void> {
  const certificates = await listMasterOwnCertificatesManage(masterId);
  await renderView(
    ctx,
    formatMasterOwnProfileCertificatesText(certificates, language),
    createMasterOwnProfileCertificatesKeyboard(language),
    preferEdit,
  );
}

async function renderMasterCertificatesDeleteList(
  ctx: MyContext,
  language: BotUiLanguage,
  masterId: string,
  preferEdit: boolean,
): Promise<void> {
  const certificates = await listMasterOwnCertificatesManage(masterId);
  await renderView(
    ctx,
    formatMasterOwnProfileCertificateDeleteListText(certificates, language),
    createMasterOwnProfileCertificateDeleteListKeyboard(certificates, language),
    preferEdit,
  );
}

async function loadOwnProfileIntoState(state: MasterPanelSceneState): Promise<MasterOwnProfileData | null> {
  if (!state.access) {
    state.ownProfile = null;
    return null;
  }

  state.ownProfile = await getMasterOwnProfile(state.access.masterId);
  return state.ownProfile;
}

async function loadPendingIntoState(state: MasterPanelSceneState): Promise<void> {
  if (!state.access) {
    state.pending = [];
    state.pendingCursor = 0;
    resetRescheduleDraft(state);
    return;
  }

  state.pending = await listMasterPendingBookings({
    masterId: state.access.masterId,
    limit: 20,
  });

  if (state.pending.length === 0) {
    state.pendingCursor = 0;
    resetRescheduleDraft(state);
    return;
  }

  if (state.pendingCursor < 0 || state.pendingCursor >= state.pending.length) {
    state.pendingCursor = 0;
  }
}

async function loadBookingsFeedIntoState(
  state: MasterPanelSceneState,
  category: MasterBookingsCategory,
  offset: number,
): Promise<void> {
  if (!state.access) {
    resetBookingsFeed(state);
    return;
  }

  state.bookingsFeed = await listMasterBookingsFeed({
    masterId: state.access.masterId,
    category,
    limit: 5,
    offset,
  });
}

async function renderView(
  ctx: MyContext,
  text: string,
  keyboard: ReturnType<typeof createMasterPanelRootKeyboard>,
  preferEdit: boolean,
): Promise<void> {
  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // Якщо редагування не вдалося (старе/видалене повідомлення), шлемо нове.
    }
  }

  await ctx.reply(text, keyboard);
}

async function safeAnswerCbQuery(ctx: MyContext, text?: string): Promise<void> {
  if (ctx.updateType !== 'callback_query') {
    return;
  }

  try {
    if (text) {
      await ctx.answerCbQuery(text);
      return;
    }

    await ctx.answerCbQuery();
  } catch {
    // Ігноруємо помилку answerCbQuery (протермінований callback / вже відповіли раніше).
  }
}

async function renderRoot(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  if (!state.access) {
    return;
  }

  await renderView(
    ctx,
    formatMasterPanelRootText(state.access, state.language),
    createMasterPanelRootKeyboard(state.language),
    preferEdit,
  );
}

async function renderPendingQueue(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);

  if (state.pending.length === 0) {
    await renderView(
      ctx,
      formatMasterPendingBookingsEmptyText(state.language),
      createMasterPendingBookingsEmptyKeyboard(state.language),
      preferEdit,
    );
    return;
  }

  const cursor = state.pendingCursor % state.pending.length;
  const item = state.pending[cursor];
  const hasNext = state.pending.length > 1;

  await renderView(
    ctx,
    formatMasterPendingBookingCardText(item, cursor, state.pending.length, state.language),
    createMasterPendingBookingCardKeyboard(item, hasNext, state.language),
    preferEdit,
  );
}

async function renderBookingsMenu(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  await renderView(
    ctx,
    formatMasterBookingsMenuText(state.language),
    createMasterBookingsMenuKeyboard(state.language),
    preferEdit,
  );
}

async function renderBookingsFeed(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const feed = state.bookingsFeed;

  if (!feed) {
    await renderBookingsMenu(ctx, preferEdit);
    return;
  }

  await renderView(
    ctx,
    formatMasterBookingsFeedText(feed, state.language),
    createMasterBookingsFeedKeyboard(feed, state.language),
    preferEdit,
  );
}

async function renderBookingsContextFallback(
  ctx: MyContext,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  if (state.bookingsFeed) {
    await loadBookingsFeedIntoState(state, state.bookingsFeed.category, state.bookingsFeed.offset);
    await renderBookingsFeed(ctx, preferEdit);
    return;
  }

  await loadPendingIntoState(state);
  await renderPendingQueue(ctx, preferEdit);
}

async function resolveBookingItemById(
  state: MasterPanelSceneState,
  appointmentId: string,
): Promise<MasterPendingBookingItem | null> {
  const fromPending = getPendingItemById(state, appointmentId);
  if (fromPending) return fromPending;

  const fromFeed = state.bookingsFeed?.items.find((item) => item.appointmentId === appointmentId) ?? null;
  if (fromFeed) return fromFeed;

  if (!state.access) return null;
  return getMasterBookingCardById({
    masterId: state.access.masterId,
    appointmentId,
  });
}

async function renderRescheduleDateStep(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const item = getRescheduleTargetItem(state);
  if (!item) {
    await loadPendingIntoState(state);
    await renderPendingQueue(ctx, preferEdit);
    return;
  }

  await renderView(
    ctx,
    formatMasterRescheduleDateStepText(item, state.language),
    createMasterRescheduleDateKeyboard(buildBookingDateOptions(7), state.language),
    preferEdit,
  );
}

async function renderRescheduleTimeStep(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const draft = state.rescheduleDraft;
  const item = getRescheduleTargetItem(state);
  if (!draft || !item || !draft.dateCode) {
    await renderRescheduleDateStep(ctx, preferEdit);
    return;
  }

  const timeCodes = getAvailableRescheduleTimeCodes(draft.dateCode);
  const baseText = formatMasterRescheduleTimeStepText(
    item,
    formatDateCodeLabel(draft.dateCode),
    state.language,
  );
  const text =
    timeCodes.length > 0
      ? baseText
      : `${baseText}\n\n${tBot(state.language, 'MASTER_PANEL_BOOKINGS_RESCHEDULE_NO_TIME_FOR_DATE')}`;

  await renderView(
    ctx,
    text,
    createMasterRescheduleTimeKeyboard(timeCodes, state.language),
    preferEdit,
  );
}

async function renderRescheduleConfirmStep(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const draft = state.rescheduleDraft;
  const item = getRescheduleTargetItem(state);
  if (!draft || !item || !draft.dateCode || !draft.timeCode) {
    await renderRescheduleTimeStep(ctx, preferEdit);
    return;
  }

  const newStartAt = toStartAt(draft.dateCode, draft.timeCode);
  const durationMs = item.endAt.getTime() - item.startAt.getTime();
  const newEndAt = new Date(newStartAt.getTime() + durationMs);

  await renderView(
    ctx,
    formatMasterRescheduleConfirmText(item, newStartAt, newEndAt, state.language),
    createMasterRescheduleConfirmKeyboard(state.language),
    preferEdit,
  );
}

async function denyMasterPanelAccess(ctx: MyContext): Promise<void> {
  await ctx.reply(
    '🔒 Панель майстра недоступна для цього профілю.\n\n' +
      'Якщо доступ має бути відкритий, зверніться до адміністратора салону.',
  );
  await sendClientMainMenu(ctx);
}

async function notifyConfirmedBooking(item: MasterPendingBookingItem): Promise<void> {
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
        message: 'Ваш запис підтверджено майстром.',
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
      metadata: { source: 'master-panel' },
    });
  } catch (error) {
    handleError({
      logger: loggerNotification,
      level: 'warn',
      scope: 'master-panel.scene',
      action: 'Failed to notify client after booking confirm',
      error,
      meta: { appointmentId: item.appointmentId, clientId: item.clientId },
    });
  }
}

async function notifyCanceledBooking(item: MasterPendingBookingItem): Promise<void> {
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
        message: 'Ваш запис було скасовано майстром.',
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
          cancelReason: 'Скасовано майстром через Telegram-бота',
        },
      },
      metadata: { source: 'master-panel' },
    });
  } catch (error) {
    handleError({
      logger: loggerNotification,
      level: 'warn',
      scope: 'master-panel.scene',
      action: 'Failed to notify client after booking cancel',
      error,
      meta: { appointmentId: item.appointmentId, clientId: item.clientId },
    });
  }
}

export function createMasterPanelScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    MASTER_PANEL_SCENE_ID,
    async (ctx) => {
      const state = getSceneState(ctx);
      state.language = 'uk';
      state.access = null;
      state.ownProfile = null;
      state.pending = [];
      state.pendingCursor = 0;
      state.bookingsFeed = null;
      state.scheduleDayOffDraft = null;
      state.scheduleVacationDraft = null;
      state.scheduleTemporaryDraft = null;
      state.scheduleConfigureDayDraft = null;
      state.scheduleDeleteDraft = null;
      state.profileEditDraft = null;
      state.certificateAddDraft = null;
      state.certificateDeleteDraft = null;
      state.rescheduleDraft = null;

      if (!ctx.from?.id) {
        await denyMasterPanelAccess(ctx);
        await ctx.scene.leave();
        return;
      }

      const user = await getOrCreateUser(ctx);
      state.language = resolveBotUiLanguage(user.preferredLanguage);

      const access = await getMasterPanelAccessByTelegramId(ctx.from.id);
      if (!access) {
        await denyMasterPanelAccess(ctx);
        await ctx.scene.leave();
        return;
      }

      state.access = access;
      await renderRoot(ctx, false);
      return ctx.wizard.next();
    },
    async (ctx) => {
      const text = getMessageText(ctx);
      if (!text) {
        return;
      }

      const state = getSceneState(ctx);
      const profileEditDraft = state.profileEditDraft;
      if (profileEditDraft?.mode === 'awaiting_value') {
        try {
          const nextValue = normalizeMasterProfileFieldValue(profileEditDraft.field, text);
          state.profileEditDraft = {
            mode: 'awaiting_confirm',
            field: profileEditDraft.field,
            value: nextValue,
          };

          await renderView(
            ctx,
            formatMasterOwnProfileEditConfirmText(profileEditDraft.field, nextValue, state.language),
            createMasterOwnProfileEditConfirmKeyboard(state.language),
            false,
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError('Виникла помилка при перевірці значення');

          await ctx.reply(
            `⚠️ ${err.message}`,
            createMasterOwnProfileEditInputKeyboard(state.language),
          );
        }
        return;
      }

      if (profileEditDraft?.mode === 'awaiting_confirm') {
        await ctx.reply(
          '⚠️ Щоб завершити редагування, натисніть "✅ Зберегти" або "❌ Скасувати".',
          createMasterOwnProfileEditConfirmKeyboard(state.language),
        );
        return;
      }

      const certificateAddDraft = state.certificateAddDraft;
      if (certificateAddDraft?.mode === 'awaiting_title') {
        try {
          const title = normalizeMasterCertificateTitle(text);
          state.certificateAddDraft = {
            mode: 'awaiting_confirm',
            title,
          };

          await renderView(
            ctx,
            formatMasterOwnProfileCertificateConfirmText(title, state.language),
            createMasterOwnProfileCertificateConfirmKeyboard(state.language),
            false,
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError('Виникла помилка при перевірці назви документа');

          await ctx.reply(
            `⚠️ ${err.message}`,
            createMasterOwnProfileCertificateInputKeyboard(state.language),
          );
        }
        return;
      }

      if (certificateAddDraft?.mode === 'awaiting_confirm') {
        await ctx.reply(
          '⚠️ Для завершення додавання документа натисніть "✅ Додати документ" або "❌ Скасувати дію".',
          createMasterOwnProfileCertificateConfirmKeyboard(state.language),
        );
        return;
      }

      const configureDayDraft = state.scheduleConfigureDayDraft;
      if (configureDayDraft?.mode === 'awaiting_from') {
        try {
          const weekday = configureDayDraft.weekday;
          if (!weekday) {
            throw new ValidationError('Спочатку оберіть день тижня кнопкою');
          }

          const fromTime = parseTimeInput(text);
          state.scheduleConfigureDayDraft = {
            mode: 'awaiting_to',
            weekday,
            fromTime,
          };

          await renderView(
            ctx,
            formatMasterScheduleConfigureDayToInputText(weekday, fromTime),
            createMasterScheduleConfigureDayInputKeyboard(weekday),
            false,
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError('Виникла помилка при перевірці часу початку');

          await ctx.reply(
            `⚠️ ${err.message}\n\nВведіть коректний час у форматі HH:MM.`,
            createMasterScheduleConfigureDayInputKeyboard(configureDayDraft.weekday ?? 1),
          );
        }
        return;
      }

      if (configureDayDraft?.mode === 'awaiting_to') {
        const access = state.access;
        try {
          const weekday = configureDayDraft.weekday;
          const fromTime = configureDayDraft.fromTime;
          if (!access) {
            await denyMasterPanelAccess(ctx);
            await ctx.scene.leave();
            return;
          }
          if (!weekday || !fromTime) {
            throw new ValidationError('Спочатку оберіть день і вкажіть час початку');
          }

          const toTime = parseTimeInput(text);
          if (timeToMinutes(toTime) <= timeToMinutes(fromTime)) {
            throw new ValidationError('Час завершення має бути пізніше часу початку');
          }

          const updated = await upsertMasterWeeklyDay({
            masterId: access.masterId,
            weekday,
            isWorking: true,
            openTime: fromTime,
            closeTime: toTime,
          });

          resetScheduleConfigureDayDraft(state);

          await ctx.reply(
            formatMasterScheduleConfigureDaySuccessText(
              updated.weekday,
              updated.isWorking,
              updated.openTime,
              updated.closeTime,
            ),
            createMasterScheduleSectionKeyboard(),
          );

          const schedule = await getMasterPanelSchedule(access.masterId, 10);
          await renderView(
            ctx,
            formatMasterScheduleConfigureDayText(schedule),
            createMasterScheduleConfigureDayKeyboard(),
            false,
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError('Виникла помилка при перевірці часу завершення');

          await ctx.reply(
            `⚠️ ${err.message}\n\nВведіть коректний час у форматі HH:MM.`,
            createMasterScheduleConfigureDayInputKeyboard(configureDayDraft.weekday ?? 1),
          );
        }
        return;
      }

      const dayOffDraft = state.scheduleDayOffDraft;
      if (dayOffDraft?.mode === 'awaiting_date') {
        try {
          const offDate = parseDayOffDateInput(text);
          const offDateLabel = formatDayOffDateLabel(offDate);
          const offDateSql = formatDayOffDateSql(offDate);

          state.scheduleDayOffDraft = {
            mode: 'awaiting_confirm',
            offDate: offDateSql,
            offDateLabel,
          };

          await renderView(
            ctx,
            formatMasterScheduleSetDayOffConfirmText(offDateLabel),
            createMasterScheduleSetDayOffConfirmKeyboard(),
            false,
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError('Виникла помилка при перевірці дати');

          await ctx.reply(
            `⚠️ ${err.message}\n\nСпробуйте ще раз у форматі ДД.ММ.РРРР (приклад: 12.03.2026).`,
            createMasterScheduleSetDayOffInputKeyboard(),
          );
        }
        return;
      }

      const vacationDraft = state.scheduleVacationDraft;
      if (vacationDraft?.mode === 'awaiting_range') {
        try {
          const { dateFrom, dateTo } = parseVacationRangeInput(text);
          const dateFromLabel = formatDayOffDateLabel(dateFrom);
          const dateToLabel = formatDayOffDateLabel(dateTo);
          const dateFromSql = formatDayOffDateSql(dateFrom);
          const dateToSql = formatDayOffDateSql(dateTo);

          state.scheduleVacationDraft = {
            mode: 'awaiting_confirm',
            dateFrom: dateFromSql,
            dateTo: dateToSql,
            dateFromLabel,
            dateToLabel,
          };

          await renderView(
            ctx,
            formatMasterScheduleVacationConfirmText(dateFromLabel, dateToLabel),
            createMasterScheduleVacationConfirmKeyboard(),
            false,
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError('Виникла помилка при перевірці періоду відпустки');

          await ctx.reply(
            `⚠️ ${err.message}\n\nСпробуйте ще раз у форматі ДД.ММ.РРРР - ДД.ММ.РРРР.`,
            createMasterScheduleVacationInputKeyboard(),
          );
        }
        return;
      }

      const temporaryDraft = state.scheduleTemporaryDraft;
      if (temporaryDraft?.mode === 'awaiting_period') {
        try {
          const { dateFrom, dateTo } = parseVacationRangeInput(text);
          const rangeDays = countInclusiveDays(dateFrom, dateTo);
          if (rangeDays < MIN_TEMPORARY_SCHEDULE_DAYS) {
            throw new ValidationError(
              `Тимчасовий графік можна встановити лише на період від ${MIN_TEMPORARY_SCHEDULE_DAYS} днів`,
            );
          }

          const dateFromLabel = formatDayOffDateLabel(dateFrom);
          const dateToLabel = formatDayOffDateLabel(dateTo);
          const dateFromSql = formatDayOffDateSql(dateFrom);
          const dateToSql = formatDayOffDateSql(dateTo);

          state.scheduleTemporaryDraft = {
            mode: 'configuring_days',
            dateFrom: dateFromSql,
            dateTo: dateToSql,
            dateFromLabel,
            dateToLabel,
            days: [],
            selectedWeekday: null,
            pendingFromTime: null,
          };

          await renderView(
            ctx,
            formatMasterScheduleTemporaryDaysConfigText(dateFromLabel, dateToLabel, []),
            createMasterScheduleTemporaryDaysConfigKeyboard([]),
            false,
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError('Виникла помилка при перевірці періоду тимчасового графіку');

          await ctx.reply(
            `⚠️ ${err.message}\n\nСпробуйте ще раз у форматі ДД.ММ.РРРР - ДД.ММ.РРРР.`,
            createMasterScheduleTemporaryPeriodInputKeyboard(),
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
            mode: 'awaiting_day_to',
            dateFrom: temporaryDraft.dateFrom,
            dateTo: temporaryDraft.dateTo,
            dateFromLabel: temporaryDraft.dateFromLabel,
            dateToLabel: temporaryDraft.dateToLabel,
            days: temporaryDraft.days,
            selectedWeekday: weekday,
            pendingFromTime: fromTime,
          };

          await renderView(
            ctx,
            formatMasterScheduleTemporaryDayToInputText(weekday, fromTime),
            createMasterScheduleTemporaryDayInputKeyboard(weekday),
            false,
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError('Виникла помилка при перевірці часу початку');

          await ctx.reply(
            `⚠️ ${err.message}\n\nВведіть коректний час у форматі HH:MM.`,
            createMasterScheduleTemporaryDayInputKeyboard(temporaryDraft.selectedWeekday ?? 1),
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

          const days = upsertTemporaryDay(temporaryDraft.days, {
            weekday,
            isWorking: true,
            openTime: fromTime,
            closeTime: toTime,
          });

          state.scheduleTemporaryDraft = {
            mode: 'configuring_days',
            dateFrom: temporaryDraft.dateFrom,
            dateTo: temporaryDraft.dateTo,
            dateFromLabel: temporaryDraft.dateFromLabel,
            dateToLabel: temporaryDraft.dateToLabel,
            days,
            selectedWeekday: null,
            pendingFromTime: null,
          };

          await renderView(
            ctx,
            formatMasterScheduleTemporaryDaysConfigText(
              temporaryDraft.dateFromLabel ?? '',
              temporaryDraft.dateToLabel ?? '',
              days,
            ),
            createMasterScheduleTemporaryDaysConfigKeyboard(days),
            false,
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError('Виникла помилка при перевірці часу завершення');

          await ctx.reply(
            `⚠️ ${err.message}\n\nВведіть коректний час у форматі HH:MM.`,
            createMasterScheduleTemporaryDayInputKeyboard(temporaryDraft.selectedWeekday ?? 1),
          );
        }
        return;
      }

      await renderRoot(ctx, false);
    },
  );

  scene.action(MASTER_PANEL_ACTION.OPEN_PROFILE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);
    resetScheduleDeleteDraft(state);
    resetProfileDrafts(state);
    resetBookingsFeed(state);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const ownProfile = await loadOwnProfileIntoState(state);
    if (!ownProfile) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    await renderView(
      ctx,
      formatMasterOwnProfileMainText(ownProfile, state.language),
      createMasterOwnProfileMainKeyboard(state.language),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_PROFILE_SERVICES, async (ctx) => {
    await safeAnswerCbQuery(ctx);
    const state = getSceneState(ctx);
    resetProfileDrafts(state);
    const access = state.access;
    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    await renderMasterServicesManage(ctx, state.language, access.masterId, true);
  });

  scene.action(MASTER_PANEL_ACTION.PROFILE_SERVICE_ADD_OPEN, async (ctx) => {
    await safeAnswerCbQuery(ctx);
    const state = getSceneState(ctx);
    resetProfileDrafts(state);
    const access = state.access;
    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    await renderMasterServicesAddCandidates(ctx, state.language, access.masterId, true);
  });

  scene.action(MASTER_PANEL_ACTION.PROFILE_SERVICE_REMOVE_OPEN, async (ctx) => {
    await safeAnswerCbQuery(ctx);
    const state = getSceneState(ctx);
    resetProfileDrafts(state);
    const access = state.access;
    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    await renderMasterServicesRemoveCandidates(ctx, state.language, access.masterId, true);
  });

  scene.action(MASTER_PANEL_PROFILE_SERVICE_ADD_ACTION_REGEX, async (ctx) => {
    const state = getSceneState(ctx);
    resetProfileDrafts(state);
    const access = state.access;
    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const serviceId = parseServiceIdFromAction(ctx, MASTER_PANEL_PROFILE_SERVICE_ADD_ACTION_REGEX);
    const added = await addMasterOwnService({
      masterId: access.masterId,
      serviceId,
    });

    await safeAnswerCbQuery(
      ctx,
      tBotTemplate(state.language, 'MASTER_PANEL_OWN_PROFILE_CB_SERVICE_ADDED', {
        name: added.serviceName,
      }),
    );
    await renderMasterServicesAddCandidates(ctx, state.language, access.masterId, true);
  });

  scene.action(MASTER_PANEL_PROFILE_SERVICE_REMOVE_ACTION_REGEX, async (ctx) => {
    const state = getSceneState(ctx);
    resetProfileDrafts(state);
    const access = state.access;
    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const serviceId = parseServiceIdFromAction(ctx, MASTER_PANEL_PROFILE_SERVICE_REMOVE_ACTION_REGEX);
    const removed = await removeMasterOwnService({
      masterId: access.masterId,
      serviceId,
    });

    await safeAnswerCbQuery(
      ctx,
      tBotTemplate(state.language, 'MASTER_PANEL_OWN_PROFILE_CB_SERVICE_DISABLED', {
        name: removed.serviceName,
      }),
    );
    await renderMasterServicesRemoveCandidates(ctx, state.language, access.masterId, true);
  });

  scene.action(MASTER_PANEL_PROFILE_SERVICE_TOGGLE_ACTION_REGEX, async (ctx) => {
    const state = getSceneState(ctx);
    resetProfileDrafts(state);
    const access = state.access;
    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const serviceId = parseServiceIdFromAction(ctx, MASTER_PANEL_PROFILE_SERVICE_TOGGLE_ACTION_REGEX);
    const toggled = await toggleMasterOwnServiceAvailability({
      masterId: access.masterId,
      serviceId,
    });
    const services = await listMasterOwnServicesManage(access.masterId);

    await safeAnswerCbQuery(
      ctx,
      toggled.isActive
        ? tBotTemplate(state.language, 'MASTER_PANEL_OWN_PROFILE_CB_SERVICE_ENABLED', {
            name: toggled.serviceName,
          })
        : tBotTemplate(state.language, 'MASTER_PANEL_OWN_PROFILE_CB_SERVICE_DISABLED', {
            name: toggled.serviceName,
          }),
    );
    await renderView(
      ctx,
      formatMasterOwnProfileServicesText(services, state.language),
      createMasterOwnProfileServicesKeyboard(services, state.language),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_PROFILE_PROFESSIONAL, async (ctx) => {
    await safeAnswerCbQuery(ctx);
    const state = getSceneState(ctx);
    resetProfileDrafts(state);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const ownProfile = state.ownProfile ?? (await loadOwnProfileIntoState(state));
    if (!ownProfile) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    await renderView(
      ctx,
      formatMasterOwnProfileProfessionalText(ownProfile, state.language),
      createMasterOwnProfileProfessionalKeyboard(state.language),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_PROFILE_CERTIFICATES, async (ctx) => {
    await safeAnswerCbQuery(ctx);
    const state = getSceneState(ctx);
    resetProfileDrafts(state);
    const access = state.access;
    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    await renderMasterCertificatesManage(ctx, state.language, access.masterId, true);
  });

  scene.action(MASTER_PANEL_ACTION.PROFILE_CERTIFICATE_ADD_OPEN, async (ctx) => {
    await safeAnswerCbQuery(ctx);
    const state = getSceneState(ctx);
    resetProfileDrafts(state);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    state.certificateAddDraft = {
      mode: 'awaiting_title',
      title: null,
    };

    await renderView(
      ctx,
      formatMasterOwnProfileCertificateInputText(state.language),
      createMasterOwnProfileCertificateInputKeyboard(state.language),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.PROFILE_CERTIFICATE_ADD_CONFIRM, async (ctx) => {
    await safeAnswerCbQuery(ctx);
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.certificateAddDraft;
    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    if (!draft || draft.mode !== 'awaiting_confirm' || !draft.title) {
      resetProfileDrafts(state);
      await renderMasterCertificatesManage(ctx, state.language, access.masterId, true);
      return;
    }

    const added = await addMasterOwnCertificate({
      masterId: access.masterId,
      title: draft.title,
    });

    await ctx.reply(
      tBotTemplate(state.language, 'MASTER_PANEL_OWN_PROFILE_CERTS_MSG_ADDED', {
        title: added.title,
      }),
    );
    resetProfileDrafts(state);
    await renderMasterCertificatesManage(ctx, state.language, access.masterId, false);
  });

  scene.action(MASTER_PANEL_ACTION.PROFILE_CERTIFICATE_ADD_CANCEL, async (ctx) => {
    await safeAnswerCbQuery(ctx);
    const state = getSceneState(ctx);
    const access = state.access;
    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    resetProfileDrafts(state);
    await renderMasterCertificatesManage(ctx, state.language, access.masterId, true);
  });

  scene.action(MASTER_PANEL_ACTION.PROFILE_CERTIFICATE_DELETE_OPEN, async (ctx) => {
    await safeAnswerCbQuery(ctx);
    const state = getSceneState(ctx);
    resetProfileDrafts(state);
    const access = state.access;
    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    await renderMasterCertificatesDeleteList(ctx, state.language, access.masterId, true);
  });

  scene.action(MASTER_PANEL_PROFILE_CERTIFICATE_DELETE_REQUEST_ACTION_REGEX, async (ctx) => {
    await safeAnswerCbQuery(ctx);
    const state = getSceneState(ctx);
    resetProfileDrafts(state);
    const access = state.access;
    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const certificateId = parseNumericIdFromAction(
      ctx,
      MASTER_PANEL_PROFILE_CERTIFICATE_DELETE_REQUEST_ACTION_REGEX,
      'certificateId',
    );
    const title = await getMasterCertificateTitleById(access.masterId, certificateId);
    if (!title) {
      await renderMasterCertificatesDeleteList(ctx, state.language, access.masterId, true);
      return;
    }

    state.certificateDeleteDraft = {
      certificateId,
      title,
    };

    await renderView(
      ctx,
      formatMasterOwnProfileCertificateDeleteConfirmText(title, state.language),
      createMasterOwnProfileCertificateDeleteConfirmKeyboard(certificateId, state.language),
      true,
    );
  });

  scene.action(MASTER_PANEL_PROFILE_CERTIFICATE_DELETE_CONFIRM_ACTION_REGEX, async (ctx) => {
    await safeAnswerCbQuery(ctx);
    const state = getSceneState(ctx);
    const access = state.access;
    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const certificateIdFromAction = parseNumericIdFromAction(
      ctx,
      MASTER_PANEL_PROFILE_CERTIFICATE_DELETE_CONFIRM_ACTION_REGEX,
      'certificateId',
    );
    const draft = state.certificateDeleteDraft;
    if (!draft || draft.certificateId !== certificateIdFromAction || !draft.title) {
      resetCertificateDeleteDraft(state);
      await renderMasterCertificatesDeleteList(ctx, state.language, access.masterId, true);
      return;
    }

    const deleted = await deleteMasterOwnCertificate({
      masterId: access.masterId,
      certificateId: draft.certificateId,
    });
    resetCertificateDeleteDraft(state);
    await ctx.reply(
      tBotTemplate(state.language, 'MASTER_PANEL_OWN_PROFILE_CERTS_MSG_DELETED', {
        title: deleted.title,
      }),
    );
    await renderMasterCertificatesDeleteList(ctx, state.language, access.masterId, false);
  });

  scene.action(MASTER_PANEL_ACTION.PROFILE_CERTIFICATE_DELETE_CANCEL, async (ctx) => {
    await safeAnswerCbQuery(ctx);
    const state = getSceneState(ctx);
    const access = state.access;
    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    resetCertificateDeleteDraft(state);
    await renderMasterCertificatesManage(ctx, state.language, access.masterId, true);
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_PROFILE_ADDITIONAL, async (ctx) => {
    await safeAnswerCbQuery(ctx);
    const state = getSceneState(ctx);
    resetProfileDrafts(state);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const ownProfile = state.ownProfile ?? (await loadOwnProfileIntoState(state));
    if (!ownProfile) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    await renderView(
      ctx,
      formatMasterOwnProfileAdditionalText(ownProfile, state.language),
      createMasterOwnProfileAdditionalKeyboard(state.language),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_BIO, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const ownProfile = state.ownProfile ?? (await loadOwnProfileIntoState(state));
    if (!ownProfile) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    state.profileEditDraft = {
      mode: 'awaiting_value',
      field: 'bio',
      value: null,
    };

    await renderView(
      ctx,
      formatMasterOwnProfileEditInputText('bio', ownProfile.bio, state.language),
      createMasterOwnProfileEditInputKeyboard(state.language),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_MATERIALS, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const ownProfile = state.ownProfile ?? (await loadOwnProfileIntoState(state));
    if (!ownProfile) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    state.profileEditDraft = {
      mode: 'awaiting_value',
      field: 'materials',
      value: null,
    };

    await renderView(
      ctx,
      formatMasterOwnProfileEditInputText('materials', ownProfile.materialsInfo, state.language),
      createMasterOwnProfileEditInputKeyboard(state.language),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_PHONE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const ownProfile = state.ownProfile ?? (await loadOwnProfileIntoState(state));
    if (!ownProfile) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    state.profileEditDraft = {
      mode: 'awaiting_value',
      field: 'phone',
      value: null,
    };

    await renderView(
      ctx,
      formatMasterOwnProfileEditInputText('phone', ownProfile.contactPhoneE164, state.language),
      createMasterOwnProfileEditInputKeyboard(state.language),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_EMAIL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const ownProfile = state.ownProfile ?? (await loadOwnProfileIntoState(state));
    if (!ownProfile) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    state.profileEditDraft = {
      mode: 'awaiting_value',
      field: 'email',
      value: null,
    };

    await renderView(
      ctx,
      formatMasterOwnProfileEditInputText('email', ownProfile.contactEmail, state.language),
      createMasterOwnProfileEditInputKeyboard(state.language),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_DISPLAY_NAME, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const ownProfile = state.ownProfile ?? (await loadOwnProfileIntoState(state));
    if (!ownProfile) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    state.profileEditDraft = {
      mode: 'awaiting_value',
      field: 'display_name',
      value: null,
    };

    await renderView(
      ctx,
      formatMasterOwnProfileEditInputText('display_name', ownProfile.displayName, state.language),
      createMasterOwnProfileEditInputKeyboard(state.language),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_STARTED_ON, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const ownProfile = state.ownProfile ?? (await loadOwnProfileIntoState(state));
    if (!ownProfile) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    state.profileEditDraft = {
      mode: 'awaiting_value',
      field: 'started_on',
      value: null,
    };

    await renderView(
      ctx,
      formatMasterOwnProfileEditInputText(
        'started_on',
        ownProfile.startedOn ? formatDayOffDateLabel(ownProfile.startedOn) : null,
        state.language,
      ),
      createMasterOwnProfileEditInputKeyboard(state.language),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_PROCEDURES_DONE_TOTAL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const ownProfile = state.ownProfile ?? (await loadOwnProfileIntoState(state));
    if (!ownProfile) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    state.profileEditDraft = {
      mode: 'awaiting_value',
      field: 'procedures_done_total',
      value: null,
    };

    await renderView(
      ctx,
      formatMasterOwnProfileEditInputText(
        'procedures_done_total',
        String(ownProfile.proceduresDoneTotal),
        state.language,
      ),
      createMasterOwnProfileEditInputKeyboard(state.language),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.profileEditDraft;

    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    if (!draft || draft.mode !== 'awaiting_confirm' || !draft.value) {
      const ownProfile = state.ownProfile ?? (await loadOwnProfileIntoState(state));
      if (!ownProfile) {
        await denyMasterPanelAccess(ctx);
        await ctx.scene.leave();
        return;
      }

      resetProfileDrafts(state);
      await renderView(
        ctx,
        formatMasterOwnProfileMainText(ownProfile, state.language),
        createMasterOwnProfileMainKeyboard(state.language),
        true,
      );
      return;
    }

    const savedField = draft.field;
    await persistMasterProfileField(access.masterId, draft.field, draft.value);
    await loadOwnProfileIntoState(state);
    await ctx.reply(formatMasterOwnProfileEditSuccessText(draft.field, state.language));

    resetProfileDrafts(state);

    if (!state.ownProfile) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    await renderMasterProfileSectionByField(ctx, state, savedField, false);
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const canceledField = state.profileEditDraft?.field ?? 'bio';
    resetProfileDrafts(state);
    const ownProfile = state.ownProfile ?? (await loadOwnProfileIntoState(state));
    if (!ownProfile) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    state.ownProfile = ownProfile;
    await renderMasterProfileSectionByField(ctx, state, canceledField, true);
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_BOOKINGS, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);
    resetScheduleDeleteDraft(state);
    resetProfileDrafts(state);
    state.pending = [];
    state.pendingCursor = 0;
    resetBookingsFeed(state);
    resetRescheduleDraft(state);
    await renderBookingsMenu(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_OPEN_MENU, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetProfileDrafts(state);
    resetRescheduleDraft(state);
    resetBookingsFeed(state);
    await renderBookingsMenu(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_MENU_TODAY, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetProfileDrafts(state);
    resetRescheduleDraft(state);
    await loadBookingsFeedIntoState(state, 'today', 0);
    await renderBookingsFeed(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_MENU_TOMORROW, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetProfileDrafts(state);
    resetRescheduleDraft(state);
    await loadBookingsFeedIntoState(state, 'tomorrow', 0);
    await renderBookingsFeed(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_MENU_ALL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetProfileDrafts(state);
    resetRescheduleDraft(state);
    await loadBookingsFeedIntoState(state, 'all', 0);
    await renderBookingsFeed(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_MENU_CANCELED, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetProfileDrafts(state);
    resetRescheduleDraft(state);
    await loadBookingsFeedIntoState(state, 'canceled', 0);
    await renderBookingsFeed(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_LIST_PREV_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const feed = state.bookingsFeed;
    if (!feed) {
      await renderBookingsMenu(ctx, true);
      return;
    }

    const nextOffset = Math.max(0, feed.offset - feed.limit);
    await loadBookingsFeedIntoState(state, feed.category, nextOffset);
    await renderBookingsFeed(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_LIST_NEXT_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const feed = state.bookingsFeed;
    if (!feed) {
      await renderBookingsMenu(ctx, true);
      return;
    }

    const nextOffset = feed.offset + feed.limit;
    await loadBookingsFeedIntoState(state, feed.category, nextOffset);
    await renderBookingsFeed(ctx, true);
  });

  scene.action(MASTER_PANEL_BOOKING_OPEN_CARD_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;

    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const appointmentId = parseAppointmentIdFromAction(ctx, MASTER_PANEL_BOOKING_OPEN_CARD_ACTION_REGEX);
    const item = await getMasterBookingCardById({
      masterId: access.masterId,
      appointmentId,
    });

    if (!item) {
      await renderBookingsFeed(ctx, true);
      return;
    }

    await renderView(
      ctx,
      formatMasterBookingDetailsCardText(item, state.language),
      createMasterBookingDetailsCardKeyboard(item, state.language),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_BACK_TO_LIST, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const feed = state.bookingsFeed;

    if (!feed) {
      await loadPendingIntoState(state);
      await renderPendingQueue(ctx, true);
      return;
    }

    await loadBookingsFeedIntoState(state, feed.category, feed.offset);
    await renderBookingsFeed(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_SCHEDULE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);
    resetScheduleDeleteDraft(state);
    resetProfileDrafts(state);
    resetBookingsFeed(state);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const schedule = await getMasterPanelSchedule(state.access.masterId, 5);
    await renderView(ctx, formatMasterScheduleText(schedule), createMasterScheduleKeyboard(), true);
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_STATS, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);
    resetScheduleDeleteDraft(state);
    resetProfileDrafts(state);
    resetBookingsFeed(state);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const stats = await getMasterPanelStats(state.access.masterId);
    await renderView(
      ctx,
      formatMasterStatsText(stats, state.language),
      createMasterStatsKeyboard(state.language),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_STATS_FINANCE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);
    resetScheduleDeleteDraft(state);
    resetProfileDrafts(state);
    resetBookingsFeed(state);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const finance = await getMasterPanelFinance(state.access.masterId);
    await renderView(
      ctx,
      formatMasterFinanceText(finance, state.language),
      createMasterFinanceKeyboard(state.language),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_CONFIGURE_DAY, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);
    resetScheduleDeleteDraft(state);
    resetProfileDrafts(state);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const schedule = await getMasterPanelSchedule(state.access.masterId, 10);
    await renderView(
      ctx,
      formatMasterScheduleConfigureDayText(schedule),
      createMasterScheduleConfigureDayKeyboard(),
      true,
    );
  });

  scene.action(MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_WEEKDAY_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);
    resetScheduleDeleteDraft(state);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const weekday = parseWeekdayFromAction(ctx, MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_WEEKDAY_ACTION_REGEX);
    state.scheduleConfigureDayDraft = {
      mode: 'awaiting_from',
      weekday,
      fromTime: null,
    };

    await renderView(
      ctx,
      formatMasterScheduleConfigureDayFromInputText(weekday),
      createMasterScheduleConfigureDayInputKeyboard(weekday),
      true,
    );
  });

  scene.action(MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_OFF_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);
    resetScheduleDeleteDraft(state);

    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const weekday = parseWeekdayFromAction(ctx, MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_OFF_ACTION_REGEX);
    const updated = await upsertMasterWeeklyDay({
      masterId: state.access.masterId,
      weekday,
      isWorking: false,
    });

    resetScheduleConfigureDayDraft(state);

    await ctx.reply(
      formatMasterScheduleConfigureDaySuccessText(
        updated.weekday,
        updated.isWorking,
        updated.openTime,
        updated.closeTime,
      ),
      createMasterScheduleSectionKeyboard(),
    );

    const schedule = await getMasterPanelSchedule(state.access.masterId, 10);
    await renderView(
      ctx,
      formatMasterScheduleConfigureDayText(schedule),
      createMasterScheduleConfigureDayKeyboard(),
      false,
    );
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_SET_DAY_OFF, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);
    resetScheduleDeleteDraft(state);
    state.scheduleDayOffDraft = {
      mode: 'awaiting_date',
      offDate: null,
      offDateLabel: null,
    };

    await renderView(
      ctx,
      formatMasterScheduleSetDayOffText(),
      createMasterScheduleSetDayOffInputKeyboard(),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_SET_DAY_OFF_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.scheduleDayOffDraft;

    if (!access || !draft || draft.mode !== 'awaiting_confirm' || !draft.offDate || !draft.offDateLabel) {
      state.scheduleDayOffDraft = {
        mode: 'awaiting_date',
        offDate: null,
        offDateLabel: null,
      };

      await renderView(
        ctx,
        formatMasterScheduleSetDayOffText(),
        createMasterScheduleSetDayOffInputKeyboard(),
        true,
      );
      return;
    }

    try {
      await createMasterDayOff({
        masterId: access.masterId,
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

        const hint = /формат|некоректн/i.test(error.message)
          ? '\n\nВведіть іншу дату у форматі ДД.ММ.РРРР.'
          : '\n\nОберіть іншу дату або спочатку вирішіть конфлікт із записами.';

        await ctx.reply(
          `⚠️ ${error.message}${hint}`,
          createMasterScheduleSetDayOffInputKeyboard(),
        );
        return;
      }
      throw error;
    }

    const successDate = draft.offDateLabel;
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);

    await ctx.reply(formatMasterScheduleSetDayOffSuccessText(successDate), createMasterScheduleSectionKeyboard());

    const schedule = await getMasterPanelSchedule(access.masterId, 5);
    await renderView(ctx, formatMasterScheduleText(schedule), createMasterScheduleKeyboard(), false);
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_SET_DAY_OFF_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);
    resetScheduleDeleteDraft(state);
    const access = state.access;

    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const schedule = await getMasterPanelSchedule(access.masterId, 5);
    await renderView(ctx, formatMasterScheduleText(schedule), createMasterScheduleKeyboard(), true);
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_LIST_DAYS_OFF, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);
    resetScheduleDeleteDraft(state);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const schedule = await getMasterPanelSchedule(state.access.masterId, 10);
    await renderView(
      ctx,
      formatMasterScheduleDaysOffListText(schedule),
      createMasterScheduleDaysOffListKeyboard(schedule),
      true,
    );
  });

  scene.action(MASTER_PANEL_SCHEDULE_DAY_OFF_DELETE_REQUEST_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);

    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const dayOffId = parseNumericIdFromAction(
      ctx,
      MASTER_PANEL_SCHEDULE_DAY_OFF_DELETE_REQUEST_ACTION_REGEX,
      'id вихідного дня',
    );

    const schedule = await getMasterPanelSchedule(access.masterId, 10);
    const target = schedule.upcomingDaysOff.find((item) => item.id === dayOffId);
    if (!target) {
      resetScheduleDeleteDraft(state);
      await renderView(
        ctx,
        formatMasterScheduleDaysOffListText(schedule),
        createMasterScheduleDaysOffListKeyboard(schedule),
        true,
      );
      return;
    }

    state.scheduleDeleteDraft = {
      type: 'day_off',
      dayOffId,
      vacationId: null,
      dateFrom: null,
      dateTo: null,
    };

    await renderView(
      ctx,
      formatMasterScheduleDeleteDayOffConfirmText(target.offDate),
      createMasterScheduleDeleteConfirmKeyboard(
        makeMasterPanelScheduleDayOffDeleteConfirmAction(dayOffId),
      ),
      true,
    );
  });

  scene.action(MASTER_PANEL_SCHEDULE_DAY_OFF_DELETE_CONFIRM_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.scheduleDeleteDraft;

    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const dayOffId = parseNumericIdFromAction(
      ctx,
      MASTER_PANEL_SCHEDULE_DAY_OFF_DELETE_CONFIRM_ACTION_REGEX,
      'id вихідного дня',
    );

    if (!draft || draft.type !== 'day_off' || draft.dayOffId !== dayOffId) {
      const schedule = await getMasterPanelSchedule(access.masterId, 10);
      resetScheduleDeleteDraft(state);
      await renderView(
        ctx,
        formatMasterScheduleDaysOffListText(schedule),
        createMasterScheduleDaysOffListKeyboard(schedule),
        true,
      );
      return;
    }

    await deleteMasterDayOff({
      masterId: access.masterId,
      dayOffId,
    });

    resetScheduleDeleteDraft(state);
    await ctx.reply('✅ Вихідний день успішно видалено.');

    const schedule = await getMasterPanelSchedule(access.masterId, 10);
    await renderView(
      ctx,
      formatMasterScheduleDaysOffListText(schedule),
      createMasterScheduleDaysOffListKeyboard(schedule),
      false,
    );
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_VACATIONS, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);
    resetScheduleDeleteDraft(state);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const schedule = await getMasterPanelSchedule(state.access.masterId, 10);
    await renderView(
      ctx,
      formatMasterScheduleVacationsText(schedule),
      createMasterScheduleVacationsListKeyboard(schedule),
      true,
    );
  });

  scene.action(MASTER_PANEL_SCHEDULE_VACATION_DELETE_REQUEST_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);

    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const vacationId = parseNumericIdFromAction(
      ctx,
      MASTER_PANEL_SCHEDULE_VACATION_DELETE_REQUEST_ACTION_REGEX,
      'id відпустки',
    );

    const schedule = await getMasterPanelSchedule(access.masterId, 10);
    const target = schedule.upcomingVacations.find((item) => item.id === vacationId);
    if (!target) {
      resetScheduleDeleteDraft(state);
      await renderView(
        ctx,
        formatMasterScheduleVacationsText(schedule),
        createMasterScheduleVacationsListKeyboard(schedule),
        true,
      );
      return;
    }

    state.scheduleDeleteDraft = {
      type: 'vacation',
      dayOffId: null,
      vacationId,
      dateFrom: null,
      dateTo: null,
    };

    await renderView(
      ctx,
      formatMasterScheduleDeleteVacationConfirmText(target.dateFrom, target.dateTo),
      createMasterScheduleDeleteConfirmKeyboard(
        makeMasterPanelScheduleVacationDeleteConfirmAction(vacationId),
      ),
      true,
    );
  });

  scene.action(MASTER_PANEL_SCHEDULE_VACATION_DELETE_CONFIRM_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.scheduleDeleteDraft;

    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const vacationId = parseNumericIdFromAction(
      ctx,
      MASTER_PANEL_SCHEDULE_VACATION_DELETE_CONFIRM_ACTION_REGEX,
      'id відпустки',
    );

    if (!draft || draft.type !== 'vacation' || draft.vacationId !== vacationId) {
      const schedule = await getMasterPanelSchedule(access.masterId, 10);
      resetScheduleDeleteDraft(state);
      await renderView(
        ctx,
        formatMasterScheduleVacationsText(schedule),
        createMasterScheduleVacationsListKeyboard(schedule),
        true,
      );
      return;
    }

    await deleteMasterVacation({
      masterId: access.masterId,
      vacationId,
    });

    resetScheduleDeleteDraft(state);
    await ctx.reply('✅ Період відпустки успішно видалено.');

    const schedule = await getMasterPanelSchedule(access.masterId, 10);
    await renderView(
      ctx,
      formatMasterScheduleVacationsText(schedule),
      createMasterScheduleVacationsListKeyboard(schedule),
      false,
    );
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_VACATIONS_CREATE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleDeleteDraft(state);
    state.scheduleVacationDraft = {
      mode: 'awaiting_range',
      dateFrom: null,
      dateTo: null,
      dateFromLabel: null,
      dateToLabel: null,
    };

    await renderView(
      ctx,
      formatMasterScheduleVacationSetText(),
      createMasterScheduleVacationInputKeyboard(),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_VACATIONS_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.scheduleVacationDraft;

    if (
      !access ||
      !draft ||
      draft.mode !== 'awaiting_confirm' ||
      !draft.dateFrom ||
      !draft.dateTo ||
      !draft.dateFromLabel ||
      !draft.dateToLabel
    ) {
      state.scheduleVacationDraft = {
        mode: 'awaiting_range',
        dateFrom: null,
        dateTo: null,
        dateFromLabel: null,
        dateToLabel: null,
      };

      await renderView(
        ctx,
        formatMasterScheduleVacationSetText(),
        createMasterScheduleVacationInputKeyboard(),
        true,
      );
      return;
    }

    try {
      await createMasterVacation({
        masterId: access.masterId,
        dateFrom: draft.dateFrom,
        dateTo: draft.dateTo,
        createdBy: access.userId,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        state.scheduleVacationDraft = {
          mode: 'awaiting_range',
          dateFrom: null,
          dateTo: null,
          dateFromLabel: null,
          dateToLabel: null,
        };

        await ctx.reply(
          `⚠️ ${error.message}\n\nСпробуйте ще раз у форматі ДД.ММ.РРРР - ДД.ММ.РРРР.`,
          createMasterScheduleVacationInputKeyboard(),
        );
        return;
      }
      throw error;
    }

    const successFrom = draft.dateFromLabel;
    const successTo = draft.dateToLabel;
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);

    await ctx.reply(
      formatMasterScheduleVacationSuccessText(successFrom, successTo),
      createMasterScheduleSectionKeyboard(),
    );

    const schedule = await getMasterPanelSchedule(access.masterId, 10);
    await renderView(
      ctx,
      formatMasterScheduleVacationsText(schedule),
      createMasterScheduleVacationsListKeyboard(schedule),
      false,
    );
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_VACATIONS_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);
    resetScheduleDayOffDraft(state);
    resetScheduleDeleteDraft(state);
    const access = state.access;

    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const schedule = await getMasterPanelSchedule(access.masterId, 10);
    await renderView(
      ctx,
      formatMasterScheduleVacationsText(schedule),
      createMasterScheduleVacationsListKeyboard(schedule),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);
    resetScheduleDeleteDraft(state);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const schedule = await getMasterPanelSchedule(state.access.masterId, 10);
    await renderView(
      ctx,
      formatMasterScheduleTemporaryHoursText(schedule),
      createMasterScheduleTemporaryHoursListKeyboard(schedule),
      true,
    );
  });

  scene.action(MASTER_PANEL_SCHEDULE_TEMPORARY_DELETE_REQUEST_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);

    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const { dateFrom, dateTo } = parseTemporaryPeriodFromAction(
      ctx,
      MASTER_PANEL_SCHEDULE_TEMPORARY_DELETE_REQUEST_ACTION_REGEX,
    );

    state.scheduleDeleteDraft = {
      type: 'temporary_period',
      dayOffId: null,
      vacationId: null,
      dateFrom,
      dateTo,
    };

    await renderView(
      ctx,
      formatMasterScheduleDeleteTemporaryConfirmText(parseSqlDate(dateFrom), parseSqlDate(dateTo)),
      createMasterScheduleDeleteConfirmKeyboard(
        makeMasterPanelScheduleTemporaryDeleteConfirmAction(
          formatDateToCode(parseSqlDate(dateFrom)),
          formatDateToCode(parseSqlDate(dateTo)),
        ),
      ),
      true,
    );
  });

  scene.action(MASTER_PANEL_SCHEDULE_TEMPORARY_DELETE_CONFIRM_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.scheduleDeleteDraft;

    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const parsed = parseTemporaryPeriodFromAction(
      ctx,
      MASTER_PANEL_SCHEDULE_TEMPORARY_DELETE_CONFIRM_ACTION_REGEX,
    );

    if (
      !draft ||
      draft.type !== 'temporary_period' ||
      draft.dateFrom !== parsed.dateFrom ||
      draft.dateTo !== parsed.dateTo
    ) {
      const schedule = await getMasterPanelSchedule(access.masterId, 10);
      resetScheduleDeleteDraft(state);
      await renderView(
        ctx,
        formatMasterScheduleTemporaryHoursText(schedule),
        createMasterScheduleTemporaryHoursListKeyboard(schedule),
        true,
      );
      return;
    }

    await deleteMasterTemporarySchedulePeriod({
      masterId: access.masterId,
      dateFrom: parsed.dateFrom,
      dateTo: parsed.dateTo,
    });

    resetScheduleDeleteDraft(state);
    await ctx.reply('✅ Тимчасову зміну графіку успішно видалено.');

    const schedule = await getMasterPanelSchedule(access.masterId, 10);
    await renderView(
      ctx,
      formatMasterScheduleTemporaryHoursText(schedule),
      createMasterScheduleTemporaryHoursListKeyboard(schedule),
      false,
    );
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_DELETE_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draftType = state.scheduleDeleteDraft?.type;
    resetScheduleDeleteDraft(state);

    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const schedule = await getMasterPanelSchedule(access.masterId, 10);
    if (draftType === 'day_off') {
      await renderView(
        ctx,
        formatMasterScheduleDaysOffListText(schedule),
        createMasterScheduleDaysOffListKeyboard(schedule),
        true,
      );
      return;
    }

    if (draftType === 'vacation') {
      await renderView(
        ctx,
        formatMasterScheduleVacationsText(schedule),
        createMasterScheduleVacationsListKeyboard(schedule),
        true,
      );
      return;
    }

    if (draftType === 'temporary_period') {
      await renderView(
        ctx,
        formatMasterScheduleTemporaryHoursText(schedule),
        createMasterScheduleTemporaryHoursListKeyboard(schedule),
        true,
      );
      return;
    }

    await renderView(ctx, formatMasterScheduleText(schedule), createMasterScheduleKeyboard(), true);
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS_CREATE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleDeleteDraft(state);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const draft = state.scheduleTemporaryDraft;
    if (draft?.dateFrom && draft?.dateTo && draft?.dateFromLabel && draft?.dateToLabel) {
      state.scheduleTemporaryDraft = {
        ...draft,
        mode: 'configuring_days',
        selectedWeekday: null,
        pendingFromTime: null,
      };

      await renderView(
        ctx,
        formatMasterScheduleTemporaryDaysConfigText(
          draft.dateFromLabel,
          draft.dateToLabel,
          draft.days,
        ),
        createMasterScheduleTemporaryDaysConfigKeyboard(draft.days),
        true,
      );
      return;
    }

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

    await renderView(
      ctx,
      formatMasterScheduleTemporarySetPeriodText(),
      createMasterScheduleTemporaryPeriodInputKeyboard(),
      true,
    );
  });

  scene.action(MASTER_PANEL_TEMPORARY_HOURS_DAY_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.scheduleTemporaryDraft;

    if (
      !draft ||
      !draft.dateFrom ||
      !draft.dateTo ||
      !draft.dateFromLabel ||
      !draft.dateToLabel ||
      draft.mode === 'awaiting_period'
    ) {
      await renderView(
        ctx,
        formatMasterScheduleTemporarySetPeriodText(),
        createMasterScheduleTemporaryPeriodInputKeyboard(),
        true,
      );
      return;
    }

    const weekday = parseWeekdayFromAction(ctx, MASTER_PANEL_TEMPORARY_HOURS_DAY_ACTION_REGEX);
    state.scheduleTemporaryDraft = {
      ...draft,
      mode: 'awaiting_day_from',
      selectedWeekday: weekday,
      pendingFromTime: null,
    };

    await renderView(
      ctx,
      formatMasterScheduleTemporaryDayFromInputText(weekday),
      createMasterScheduleTemporaryDayInputKeyboard(weekday),
      true,
    );
  });

  scene.action(MASTER_PANEL_TEMPORARY_HOURS_DAY_OFF_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.scheduleTemporaryDraft;

    if (
      !draft ||
      !draft.dateFrom ||
      !draft.dateTo ||
      !draft.dateFromLabel ||
      !draft.dateToLabel ||
      draft.mode === 'awaiting_period'
    ) {
      await renderView(
        ctx,
        formatMasterScheduleTemporarySetPeriodText(),
        createMasterScheduleTemporaryPeriodInputKeyboard(),
        true,
      );
      return;
    }

    const weekday = parseWeekdayFromAction(ctx, MASTER_PANEL_TEMPORARY_HOURS_DAY_OFF_ACTION_REGEX);
    const days = upsertTemporaryDay(draft.days, {
      weekday,
      isWorking: false,
      openTime: null,
      closeTime: null,
    });

    state.scheduleTemporaryDraft = {
      ...draft,
      mode: 'configuring_days',
      days,
      selectedWeekday: null,
      pendingFromTime: null,
    };

    await renderView(
      ctx,
      formatMasterScheduleTemporaryDaysConfigText(draft.dateFromLabel, draft.dateToLabel, days),
      createMasterScheduleTemporaryDaysConfigKeyboard(days),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.scheduleTemporaryDraft;

    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    if (
      draft &&
      draft.mode === 'configuring_days' &&
      draft.dateFromLabel &&
      draft.dateToLabel
    ) {
      if (draft.days.length < 7) {
        await ctx.reply(
          `⚠️ Потрібно налаштувати всі 7 днів тижня. Зараз налаштовано ${draft.days.length}/7.`,
          createMasterScheduleTemporaryDaysConfigKeyboard(draft.days),
        );
        return;
      }

      state.scheduleTemporaryDraft = {
        ...draft,
        mode: 'awaiting_confirm',
        selectedWeekday: null,
        pendingFromTime: null,
      };

      await renderView(
        ctx,
        formatMasterScheduleTemporaryConfirmText(
          draft.dateFromLabel,
          draft.dateToLabel,
          draft.days,
        ),
        createMasterScheduleTemporaryConfirmKeyboard(),
        true,
      );
      return;
    }

    if (
      !draft ||
      draft.mode !== 'awaiting_confirm' ||
      !draft.dateFrom ||
      !draft.dateTo ||
      !draft.dateFromLabel ||
      !draft.dateToLabel ||
      draft.days.length < 7
    ) {
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

      await renderView(
        ctx,
        formatMasterScheduleTemporarySetPeriodText(),
        createMasterScheduleTemporaryPeriodInputKeyboard(),
        true,
      );
      return;
    }

    try {
      await createMasterTemporarySchedule({
        masterId: access.masterId,
        dateFrom: draft.dateFrom,
        dateTo: draft.dateTo,
        days: draft.days,
        createdBy: access.userId,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        await ctx.reply(
          `⚠️ ${error.message}\n\nСкоригуйте налаштування і підтвердіть ще раз.`,
          createMasterScheduleTemporaryDaysConfigKeyboard(draft.days),
        );
        state.scheduleTemporaryDraft = {
          ...draft,
          mode: 'configuring_days',
          selectedWeekday: null,
          pendingFromTime: null,
        };
        return;
      }
      throw error;
    }

    const successFrom = draft.dateFromLabel;
    const successTo = draft.dateToLabel;
    const successDays = draft.days;
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);

    await ctx.reply(
      formatMasterScheduleTemporarySuccessText(successFrom, successTo, successDays),
      createMasterScheduleSectionKeyboard(),
    );

    const schedule = await getMasterPanelSchedule(access.masterId, 10);
    await renderView(
      ctx,
      formatMasterScheduleTemporaryHoursText(schedule),
      createMasterScheduleTemporaryHoursListKeyboard(schedule),
      false,
    );
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleDeleteDraft(state);
    const access = state.access;

    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const schedule = await getMasterPanelSchedule(access.masterId, 10);
    await renderView(
      ctx,
      formatMasterScheduleTemporaryHoursText(schedule),
      createMasterScheduleTemporaryHoursListKeyboard(schedule),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_SHOW_PENDING, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);
    resetProfileDrafts(state);
    resetBookingsFeed(state);
    resetRescheduleDraft(state);
    await loadPendingIntoState(state);
    await renderPendingQueue(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_NEXT_PENDING, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);
    resetProfileDrafts(state);

    if (state.pending.length === 0) {
      await renderPendingQueue(ctx, true);
      return;
    }

    state.pendingCursor = (state.pendingCursor + 1) % state.pending.length;
    await renderPendingQueue(ctx, true);
  });

  scene.action(MASTER_PANEL_BOOKING_CONFIRM_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const appointmentId = parseAppointmentIdFromAction(ctx, MASTER_PANEL_BOOKING_CONFIRM_ACTION_REGEX);
    const targetItem = getPendingItemById(state, appointmentId);
    if (!targetItem) {
      await loadPendingIntoState(state);
      await renderPendingQueue(ctx, true);
      return;
    }

    const confirmed = await confirmMasterPendingBooking({
      masterId: state.access.masterId,
      appointmentId,
    });

    await notifyConfirmedBooking(confirmed);
    await ctx.reply(
      '✅ Запис підтверджено.\n\n' +
        'Клієнту надіслано оновлення, а слот зафіксовано у вашому розкладі.',
    );

    await loadPendingIntoState(state);
    await renderPendingQueue(ctx, true);
  });

  scene.action(MASTER_PANEL_BOOKING_CANCEL_REQUEST_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const appointmentId = parseAppointmentIdFromAction(ctx, MASTER_PANEL_BOOKING_CANCEL_REQUEST_ACTION_REGEX);
    const targetItem = await resolveBookingItemById(state, appointmentId);

    if (!targetItem || !['pending', 'confirmed'].includes(targetItem.status)) {
      await renderBookingsContextFallback(ctx, true);
      return;
    }

    await renderView(
      ctx,
      formatMasterCancelPendingBookingConfirmText(targetItem, state.language),
      createMasterCancelPendingBookingConfirmKeyboard(targetItem, state.language),
      true,
    );
  });

  scene.action(MASTER_PANEL_BOOKING_CANCEL_CONFIRM_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const appointmentId = parseAppointmentIdFromAction(ctx, MASTER_PANEL_BOOKING_CANCEL_CONFIRM_ACTION_REGEX);
    const targetItem = await resolveBookingItemById(state, appointmentId);
    if (!targetItem || !['pending', 'confirmed'].includes(targetItem.status)) {
      await renderBookingsContextFallback(ctx, true);
      return;
    }

    const canceled = await cancelMasterPendingBooking({
      masterId: state.access.masterId,
      appointmentId,
      cancelReason: 'Скасовано майстром через Telegram-бота',
    });

    await notifyCanceledBooking(canceled);
    await ctx.reply(
      '🔴 Запис скасовано.\n\n' +
        'Клієнту надіслано сповіщення про скасування.',
    );

    if (state.bookingsFeed) {
      await loadBookingsFeedIntoState(state, state.bookingsFeed.category, state.bookingsFeed.offset);
      await renderBookingsFeed(ctx, true);
    } else {
      await loadPendingIntoState(state);
      await renderPendingQueue(ctx, true);
    }
  });

  scene.action(MASTER_PANEL_BOOKING_RESCHEDULE_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const appointmentId = parseAppointmentIdFromAction(ctx, MASTER_PANEL_BOOKING_RESCHEDULE_ACTION_REGEX);
    const targetItem = await resolveBookingItemById(state, appointmentId);

    if (!targetItem || !['pending', 'confirmed'].includes(targetItem.status)) {
      await renderBookingsContextFallback(ctx, true);
      return;
    }

    state.rescheduleDraft = {
      appointmentId,
      dateCode: null,
      timeCode: null,
      sourceItem: targetItem,
    };

    await renderRescheduleDateStep(ctx, true);
  });

  scene.action(MASTER_PANEL_BOOKING_RESCHEDULE_DATE_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.rescheduleDraft) {
      await renderBookingsContextFallback(ctx, true);
      return;
    }

    const callbackData =
      ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const matches = callbackData.match(MASTER_PANEL_BOOKING_RESCHEDULE_DATE_ACTION_REGEX);
    const dateCode = matches?.[1] ?? '';
    const parsed = bookingDateCodeSchema.safeParse(dateCode);

    if (!parsed.success) {
      await renderRescheduleDateStep(ctx, true);
      return;
    }

    state.rescheduleDraft.dateCode = parsed.data;
    state.rescheduleDraft.timeCode = null;
    await renderRescheduleTimeStep(ctx, true);
  });

  scene.action(MASTER_PANEL_BOOKING_RESCHEDULE_TIME_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.rescheduleDraft;
    if (!draft || !draft.dateCode) {
      await renderBookingsContextFallback(ctx, true);
      return;
    }

    const callbackData =
      ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const matches = callbackData.match(MASTER_PANEL_BOOKING_RESCHEDULE_TIME_ACTION_REGEX);
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

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_RESCHEDULE_BACK_TO_DATE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.rescheduleDraft) {
      await renderBookingsContextFallback(ctx, true);
      return;
    }

    state.rescheduleDraft.timeCode = null;
    await renderRescheduleDateStep(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_RESCHEDULE_BACK_TO_TIME, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.rescheduleDraft?.dateCode) {
      await renderBookingsContextFallback(ctx, true);
      return;
    }

    state.rescheduleDraft.timeCode = null;
    await renderRescheduleTimeStep(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_RESCHEDULE_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRescheduleDraft(state);
    await renderBookingsContextFallback(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_RESCHEDULE_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.rescheduleDraft;
    const access = state.access;
    const item = getRescheduleTargetItem(state);

    if (!access || !draft || !draft.dateCode || !draft.timeCode || !item) {
      resetRescheduleDraft(state);
      await renderBookingsContextFallback(ctx, true);
      return;
    }

    const newStartAt = toStartAt(draft.dateCode, draft.timeCode);
    let result;
    try {
      result = await rescheduleMasterPendingBooking({
        masterId: access.masterId,
        appointmentId: draft.appointmentId,
        newStartAt,
        reason: 'Перенесено майстром через Telegram-бота',
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        await ctx.reply(`⚠️ ${error.message}`);
        await renderRescheduleTimeStep(ctx, false);
        return;
      }
      throw error;
    }

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
          message: 'Ваш запис перенесено. Перевірте нову дату та час.',
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
        metadata: { source: 'master-panel' },
      });
    } catch (error) {
      handleError({
        logger: loggerNotification,
        level: 'warn',
        scope: 'master-panel.scene',
        action: 'Failed to notify client after booking reschedule',
        error,
        meta: { appointmentId: result.current.appointmentId, clientId: result.current.clientId },
      });
    }

    await ctx.reply(
      '🟡 Запис успішно перенесено.\n\n' +
        'Клієнту надіслано повідомлення з новою датою та часом.',
    );

    resetRescheduleDraft(state);
    if (state.bookingsFeed) {
      await loadBookingsFeedIntoState(state, state.bookingsFeed.category, state.bookingsFeed.offset);
      await renderBookingsFeed(ctx, true);
    } else {
      await loadPendingIntoState(state);
      await renderPendingQueue(ctx, true);
    }
  });

  scene.action(MASTER_PANEL_BOOKING_PROFILE_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;

    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const appointmentId = parseAppointmentIdFromAction(ctx, MASTER_PANEL_BOOKING_PROFILE_ACTION_REGEX);
    const itemIndex = state.pending.findIndex((item) => item.appointmentId === appointmentId);
    if (itemIndex >= 0) {
      state.pendingCursor = itemIndex;
    }

    const profile = await getMasterClientProfileByBooking({
      masterId: access.masterId,
      appointmentId,
    });

    if (!profile) {
      if (state.bookingsFeed) {
        await loadBookingsFeedIntoState(state, state.bookingsFeed.category, state.bookingsFeed.offset);
        await renderBookingsFeed(ctx, true);
      } else {
        await loadPendingIntoState(state);
        await renderPendingQueue(ctx, true);
      }
      return;
    }

    await renderView(
      ctx,
      formatMasterClientProfileText(profile, state.language),
      createMasterClientProfileKeyboard(appointmentId, state.language),
      true,
    );
  });

  scene.action(MASTER_PANEL_BOOKING_CLIENT_HISTORY_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;

    if (!access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const appointmentId = parseAppointmentIdFromAction(
      ctx,
      MASTER_PANEL_BOOKING_CLIENT_HISTORY_ACTION_REGEX,
    );

    const [profile, history] = await Promise.all([
      getMasterClientProfileByBooking({
        masterId: access.masterId,
        appointmentId,
      }),
      listMasterClientBookingsHistoryByBooking({
        masterId: access.masterId,
        appointmentId,
        limit: 20,
      }),
    ]);

    if (!profile) {
      if (state.bookingsFeed) {
        await loadBookingsFeedIntoState(state, state.bookingsFeed.category, state.bookingsFeed.offset);
        await renderBookingsFeed(ctx, true);
      } else {
        await loadPendingIntoState(state);
        await renderPendingQueue(ctx, true);
      }
      return;
    }

    await renderView(
      ctx,
      formatMasterClientBookingsHistoryText(profile, history, state.language),
      createMasterClientBookingsHistoryKeyboard(appointmentId, state.language),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.BACK_TO_PANEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);
    resetScheduleDeleteDraft(state);
    resetProfileDrafts(state);
    resetBookingsFeed(state);
    resetRescheduleDraft(state);
    await renderRoot(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.HOME, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleConfigureDayDraft(state);
    resetScheduleDeleteDraft(state);
    resetProfileDrafts(state);
    resetBookingsFeed(state);
    resetRescheduleDraft(state);
    await ctx.scene.leave();
    await sendClientMainMenu(ctx);
  });

  return scene;
}
