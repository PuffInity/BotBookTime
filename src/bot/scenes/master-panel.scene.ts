import { Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import type { MasterPanelAccess } from '../../types/db-helpers/db-master-panel.types.js';
import type { MasterPendingBookingItem } from '../../types/db-helpers/db-master-bookings.types.js';
import type { MasterTemporaryScheduleDayInput } from '../../types/db-helpers/db-master-schedule.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import {
  createMasterPanelOwnProfileKeyboard,
  createMasterPanelRootKeyboard,
  createMasterPanelSectionStubKeyboard,
  formatMasterPanelOwnProfileText,
  formatMasterPanelRootText,
  formatMasterPanelSectionStubText,
} from '../../helpers/bot/master-panel-view.bot.js';
import {
  createMasterScheduleTemporaryConfirmKeyboard,
  createMasterScheduleTemporaryDayInputKeyboard,
  createMasterScheduleTemporaryDaysConfigKeyboard,
  createMasterScheduleTemporaryHoursKeyboard,
  createMasterScheduleTemporaryPeriodInputKeyboard,
  createMasterScheduleVacationConfirmKeyboard,
  createMasterScheduleVacationInputKeyboard,
  createMasterScheduleVacationsKeyboard,
  createMasterScheduleSetDayOffConfirmKeyboard,
  createMasterScheduleSetDayOffInputKeyboard,
  createMasterScheduleSectionKeyboard,
  createMasterScheduleKeyboard,
  formatMasterScheduleConfigureDayText,
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
  createMasterCancelPendingBookingConfirmKeyboard,
  createMasterPendingBookingCardKeyboard,
  createMasterPendingBookingsEmptyKeyboard,
  createMasterRescheduleConfirmKeyboard,
  createMasterRescheduleDateKeyboard,
  createMasterRescheduleTimeKeyboard,
  formatMasterCancelPendingBookingConfirmText,
  formatMasterPendingBookingCardText,
  formatMasterPendingBookingsEmptyText,
  formatMasterRescheduleConfirmText,
  formatMasterRescheduleDateStepText,
  formatMasterRescheduleTimeStepText,
} from '../../helpers/bot/master-bookings-view.bot.js';
import {
  MASTER_PANEL_ACTION,
  MASTER_PANEL_BOOKING_CANCEL_CONFIRM_ACTION_REGEX,
  MASTER_PANEL_BOOKING_CANCEL_REQUEST_ACTION_REGEX,
  MASTER_PANEL_BOOKING_CONFIRM_ACTION_REGEX,
  MASTER_PANEL_BOOKING_PROFILE_ACTION_REGEX,
  MASTER_PANEL_BOOKING_RESCHEDULE_DATE_ACTION_REGEX,
  MASTER_PANEL_BOOKING_RESCHEDULE_ACTION_REGEX,
  MASTER_PANEL_BOOKING_RESCHEDULE_TIME_ACTION_REGEX,
  MASTER_PANEL_TEMPORARY_HOURS_DAY_ACTION_REGEX,
  MASTER_PANEL_TEMPORARY_HOURS_DAY_OFF_ACTION_REGEX,
} from '../../types/bot-master-panel.types.js';
import { getMasterPanelAccessByTelegramId } from '../../helpers/db/db-master-panel.helper.js';
import {
  cancelMasterPendingBooking,
  confirmMasterPendingBooking,
  listMasterPendingBookings,
  rescheduleMasterPendingBooking,
} from '../../helpers/db/db-master-bookings.helper.js';
import { getMasterClientProfileByBooking } from '../../helpers/db/db-master-clients.helper.js';
import {
  createMasterDayOff,
  createMasterTemporarySchedule,
  createMasterVacation,
  getMasterPanelSchedule,
} from '../../helpers/db/db-master-schedule.helper.js';
import { dispatchNotification } from '../../helpers/notification/notification-dispatch.helper.js';
import { handleError, ValidationError } from '../../utils/error.utils.js';
import { loggerNotification } from '../../utils/logger/loggers-list.js';
import { bookingDateCodeSchema, bookingTimeCodeSchema } from '../../validator/booking-input.schema.js';
import { buildBookingDateOptions, buildBookingTimeOptions } from '../../helpers/bot/booking-view.bot.js';
import {
  createMasterClientProfileKeyboard,
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
  access: MasterPanelAccess | null;
  pending: MasterPendingBookingItem[];
  pendingCursor: number;
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
  rescheduleDraft:
    | {
        appointmentId: string;
        dateCode: string | null;
        timeCode: string | null;
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

function getPendingItemById(state: MasterPanelSceneState, appointmentId: string): MasterPendingBookingItem | null {
  return state.pending.find((item) => item.appointmentId === appointmentId) ?? null;
}

function getRescheduleTargetItem(state: MasterPanelSceneState): MasterPendingBookingItem | null {
  if (!state.rescheduleDraft?.appointmentId) return null;
  return getPendingItemById(state, state.rescheduleDraft.appointmentId);
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

function resetScheduleDayOffDraft(state: MasterPanelSceneState): void {
  state.scheduleDayOffDraft = null;
}

function resetScheduleVacationDraft(state: MasterPanelSceneState): void {
  state.scheduleVacationDraft = null;
}

function resetScheduleTemporaryDraft(state: MasterPanelSceneState): void {
  state.scheduleTemporaryDraft = null;
}

function resetRescheduleDraft(state: MasterPanelSceneState): void {
  state.rescheduleDraft = null;
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

async function renderView(
  ctx: MyContext,
  text: string,
  keyboard: ReturnType<typeof createMasterPanelSectionStubKeyboard>,
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

async function renderRoot(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  if (!state.access) {
    return;
  }

  await renderView(
    ctx,
    formatMasterPanelRootText(state.access),
    createMasterPanelRootKeyboard(),
    preferEdit,
  );
}

async function renderPendingQueue(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);

  if (state.pending.length === 0) {
    await renderView(
      ctx,
      formatMasterPendingBookingsEmptyText(),
      createMasterPendingBookingsEmptyKeyboard(),
      preferEdit,
    );
    return;
  }

  const cursor = state.pendingCursor % state.pending.length;
  const item = state.pending[cursor];
  const hasNext = state.pending.length > 1;

  await renderView(
    ctx,
    formatMasterPendingBookingCardText(item, cursor, state.pending.length),
    createMasterPendingBookingCardKeyboard(item, hasNext),
    preferEdit,
  );
}

async function renderSectionStub(ctx: MyContext, title: string): Promise<void> {
  await renderView(
    ctx,
    formatMasterPanelSectionStubText(title),
    createMasterPanelSectionStubKeyboard(),
    true,
  );
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
    formatMasterRescheduleDateStepText(item),
    createMasterRescheduleDateKeyboard(buildBookingDateOptions(7)),
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
  const baseText = formatMasterRescheduleTimeStepText(item, formatDateCodeLabel(draft.dateCode));
  const text =
    timeCodes.length > 0
      ? baseText
      : `${baseText}\n\n⚠️ На цю дату вже немає доступного часу. Оберіть іншу дату.`;

  await renderView(
    ctx,
    text,
    createMasterRescheduleTimeKeyboard(timeCodes),
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
    formatMasterRescheduleConfirmText(item, newStartAt, newEndAt),
    createMasterRescheduleConfirmKeyboard(),
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
      state.access = null;
      state.pending = [];
      state.pendingCursor = 0;
      state.scheduleDayOffDraft = null;
      state.scheduleVacationDraft = null;
      state.scheduleTemporaryDraft = null;
      state.rescheduleDraft = null;

      if (!ctx.from?.id) {
        await denyMasterPanelAccess(ctx);
        await ctx.scene.leave();
        return;
      }

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
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    await renderView(
      ctx,
      formatMasterPanelOwnProfileText(state.access),
      createMasterPanelOwnProfileKeyboard(),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_BOOKINGS, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    state.pendingCursor = 0;
    resetRescheduleDraft(state);
    await loadPendingIntoState(state);
    await renderPendingQueue(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_SCHEDULE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
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
    await renderSectionStub(ctx, '📊 Моя статистика');
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_CONFIGURE_DAY, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    await renderView(
      ctx,
      formatMasterScheduleConfigureDayText(),
      createMasterScheduleSectionKeyboard(),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_SET_DAY_OFF, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
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
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const schedule = await getMasterPanelSchedule(state.access.masterId, 10);
    await renderView(
      ctx,
      formatMasterScheduleDaysOffListText(schedule),
      createMasterScheduleSectionKeyboard(),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_VACATIONS, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const schedule = await getMasterPanelSchedule(state.access.masterId, 10);
    await renderView(
      ctx,
      formatMasterScheduleVacationsText(schedule),
      createMasterScheduleVacationsKeyboard(),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_VACATIONS_CREATE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
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

    await ctx.reply(
      formatMasterScheduleVacationSuccessText(successFrom, successTo),
      createMasterScheduleSectionKeyboard(),
    );

    const schedule = await getMasterPanelSchedule(access.masterId, 10);
    await renderView(
      ctx,
      formatMasterScheduleVacationsText(schedule),
      createMasterScheduleVacationsKeyboard(),
      false,
    );
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_VACATIONS_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetScheduleDayOffDraft(state);
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
      createMasterScheduleVacationsKeyboard(),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    if (!state.access) {
      await denyMasterPanelAccess(ctx);
      await ctx.scene.leave();
      return;
    }

    const schedule = await getMasterPanelSchedule(state.access.masterId, 10);
    await renderView(
      ctx,
      formatMasterScheduleTemporaryHoursText(schedule),
      createMasterScheduleTemporaryHoursKeyboard(),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS_CREATE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
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

    await ctx.reply(
      formatMasterScheduleTemporarySuccessText(successFrom, successTo, successDays),
      createMasterScheduleSectionKeyboard(),
    );

    const schedule = await getMasterPanelSchedule(access.masterId, 10);
    await renderView(
      ctx,
      formatMasterScheduleTemporaryHoursText(schedule),
      createMasterScheduleTemporaryHoursKeyboard(),
      false,
    );
  });

  scene.action(MASTER_PANEL_ACTION.SCHEDULE_TEMPORARY_HOURS_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleTemporaryDraft(state);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
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
      createMasterScheduleTemporaryHoursKeyboard(),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_SHOW_PENDING, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetRescheduleDraft(state);
    await renderPendingQueue(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_NEXT_PENDING, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);

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
    const targetItem = getPendingItemById(state, appointmentId);

    if (!targetItem) {
      await loadPendingIntoState(state);
      await renderPendingQueue(ctx, true);
      return;
    }

    await renderView(
      ctx,
      formatMasterCancelPendingBookingConfirmText(targetItem),
      createMasterCancelPendingBookingConfirmKeyboard(targetItem),
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
    const targetItem = getPendingItemById(state, appointmentId);
    if (!targetItem) {
      await loadPendingIntoState(state);
      await renderPendingQueue(ctx, true);
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

    await loadPendingIntoState(state);
    await renderPendingQueue(ctx, true);
  });

  scene.action(MASTER_PANEL_BOOKING_RESCHEDULE_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const appointmentId = parseAppointmentIdFromAction(ctx, MASTER_PANEL_BOOKING_RESCHEDULE_ACTION_REGEX);
    const targetItem = getPendingItemById(state, appointmentId);

    if (!targetItem) {
      await loadPendingIntoState(state);
      await renderPendingQueue(ctx, true);
      return;
    }

    state.rescheduleDraft = {
      appointmentId,
      dateCode: null,
      timeCode: null,
    };

    await renderRescheduleDateStep(ctx, true);
  });

  scene.action(MASTER_PANEL_BOOKING_RESCHEDULE_DATE_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.rescheduleDraft) {
      await renderPendingQueue(ctx, true);
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
      await renderRescheduleDateStep(ctx, true);
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
      await renderPendingQueue(ctx, true);
      return;
    }

    state.rescheduleDraft.timeCode = null;
    await renderRescheduleDateStep(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_RESCHEDULE_BACK_TO_TIME, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.rescheduleDraft?.dateCode) {
      await renderPendingQueue(ctx, true);
      return;
    }

    state.rescheduleDraft.timeCode = null;
    await renderRescheduleTimeStep(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_RESCHEDULE_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRescheduleDraft(state);
    await renderPendingQueue(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_RESCHEDULE_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.rescheduleDraft;
    const access = state.access;
    const item = getRescheduleTargetItem(state);

    if (!access || !draft || !draft.dateCode || !draft.timeCode || !item) {
      resetRescheduleDraft(state);
      await loadPendingIntoState(state);
      await renderPendingQueue(ctx, true);
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
    await loadPendingIntoState(state);
    await renderPendingQueue(ctx, true);
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
      await loadPendingIntoState(state);
      await renderPendingQueue(ctx, true);
      return;
    }

    await renderView(
      ctx,
      formatMasterClientProfileText(profile),
      createMasterClientProfileKeyboard(),
      true,
    );
  });

  scene.action(MASTER_PANEL_ACTION.BACK_TO_PANEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetRescheduleDraft(state);
    await renderRoot(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.HOME, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetScheduleDayOffDraft(state);
    resetScheduleVacationDraft(state);
    resetScheduleTemporaryDraft(state);
    resetRescheduleDraft(state);
    await ctx.scene.leave();
    await sendClientMainMenu(ctx);
  });

  return scene;
}
