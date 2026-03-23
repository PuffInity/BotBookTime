import { Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import type { MasterPanelAccess } from '../../types/db-helpers/db-master-panel.types.js';
import type { MasterPendingBookingItem } from '../../types/db-helpers/db-master-bookings.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import {
  createMasterPanelRootKeyboard,
  createMasterPanelSectionStubKeyboard,
  formatMasterPanelRootText,
  formatMasterPanelSectionStubText,
} from '../../helpers/bot/master-panel-view.bot.js';
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
} from '../../types/bot-master-panel.types.js';
import { getMasterPanelAccessByTelegramId } from '../../helpers/db/db-master-panel.helper.js';
import {
  cancelMasterPendingBooking,
  confirmMasterPendingBooking,
  listMasterPendingBookings,
  rescheduleMasterPendingBooking,
} from '../../helpers/db/db-master-bookings.helper.js';
import { getMasterClientProfileByBooking } from '../../helpers/db/db-master-clients.helper.js';
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

type MasterPanelSceneState = {
  access: MasterPanelAccess | null;
  pending: MasterPendingBookingItem[];
  pendingCursor: number;
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
      if (!getMessageText(ctx)) {
        return;
      }

      await renderRoot(ctx, false);
    },
  );

  scene.action(MASTER_PANEL_ACTION.OPEN_PROFILE, async (ctx) => {
    await ctx.answerCbQuery();
    await renderSectionStub(ctx, '👤 Мій профіль');
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_BOOKINGS, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.pendingCursor = 0;
    resetRescheduleDraft(state);
    await loadPendingIntoState(state);
    await renderPendingQueue(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_SCHEDULE, async (ctx) => {
    await ctx.answerCbQuery();
    await renderSectionStub(ctx, '🕒 Мій розклад');
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_STATS, async (ctx) => {
    await ctx.answerCbQuery();
    await renderSectionStub(ctx, '📊 Моя статистика');
  });

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_SHOW_PENDING, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRescheduleDraft(state);
    await renderPendingQueue(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.BOOKINGS_NEXT_PENDING, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);

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
    resetRescheduleDraft(state);
    await renderRoot(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.HOME, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await sendClientMainMenu(ctx);
  });

  return scene;
}
