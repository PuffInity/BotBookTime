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
  formatMasterCancelPendingBookingConfirmText,
  formatMasterPendingBookingCardText,
  formatMasterPendingBookingsEmptyText,
} from '../../helpers/bot/master-bookings-view.bot.js';
import {
  MASTER_PANEL_ACTION,
  MASTER_PANEL_BOOKING_CANCEL_CONFIRM_ACTION_REGEX,
  MASTER_PANEL_BOOKING_CANCEL_REQUEST_ACTION_REGEX,
  MASTER_PANEL_BOOKING_CONFIRM_ACTION_REGEX,
  MASTER_PANEL_BOOKING_PROFILE_ACTION_REGEX,
  MASTER_PANEL_BOOKING_RESCHEDULE_ACTION_REGEX,
} from '../../types/bot-master-panel.types.js';
import { getMasterPanelAccessByTelegramId } from '../../helpers/db/db-master-panel.helper.js';
import {
  cancelMasterPendingBooking,
  confirmMasterPendingBooking,
  listMasterPendingBookings,
} from '../../helpers/db/db-master-bookings.helper.js';
import { dispatchNotification } from '../../helpers/notification/notification-dispatch.helper.js';
import { handleError, ValidationError } from '../../utils/error.utils.js';
import { loggerNotification } from '../../utils/logger/loggers-list.js';

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

async function loadPendingIntoState(state: MasterPanelSceneState): Promise<void> {
  if (!state.access) {
    state.pending = [];
    state.pendingCursor = 0;
    return;
  }

  state.pending = await listMasterPendingBookings({
    masterId: state.access.masterId,
    limit: 20,
  });

  if (state.pending.length === 0) {
    state.pendingCursor = 0;
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
    await renderSectionStub(ctx, '🔄 Перенесення запису');
  });

  scene.action(MASTER_PANEL_BOOKING_PROFILE_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    await renderSectionStub(ctx, '👤 Профіль клієнта');
  });

  scene.action(MASTER_PANEL_ACTION.BACK_TO_PANEL, async (ctx) => {
    await ctx.answerCbQuery();
    await renderRoot(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.HOME, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await sendClientMainMenu(ctx);
  });

  return scene;
}
