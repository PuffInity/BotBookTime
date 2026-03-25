import { Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import type { AdminPanelAccess } from '../../types/db-helpers/db-admin-panel.types.js';
import type {
  AdminBookingItem,
  AdminBookingsCategory,
  AdminBookingsFeedPage,
  RescheduleAdminBookingResult,
} from '../../types/db-helpers/db-admin-bookings.types.js';
import type { MasterBookingOption } from '../../types/db-helpers/db-masters.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import {
  createAdminRecordsMenuKeyboard,
  createAdminPanelRootKeyboard,
  createAdminPanelSectionStubKeyboard,
  formatAdminRecordsMenuText,
  formatAdminPanelRootText,
  formatAdminPanelSectionStubText,
} from '../../helpers/bot/admin-panel-view.bot.js';
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
  ADMIN_PANEL_ACTION,
  ADMIN_PANEL_RECORDS_CANCEL_CONFIRM_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_CANCEL_REQUEST_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_CHANGE_MASTER_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_CHANGE_MASTER_SELECT_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_CONFIRM_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_OPEN_CARD_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_RESCHEDULE_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_RESCHEDULE_DATE_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_RESCHEDULE_TIME_ACTION_REGEX,
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
import { listActiveMastersByService } from '../../helpers/db/db-masters.helper.js';
import { buildBookingDateOptions, buildBookingTimeOptions } from '../../helpers/bot/booking-view.bot.js';
import { bookingDateCodeSchema, bookingTimeCodeSchema } from '../../validator/booking-input.schema.js';
import { dispatchNotification } from '../../helpers/notification/notification-dispatch.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerNotification } from '../../utils/logger/loggers-list.js';

/**
 * @file admin-panel.scene.ts
 * @summary Skeleton адмін-панелі:
 * - перевірка доступу
 * - кореневе меню розділів
 * - заглушки для неготових блоків
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

type AdminPanelSceneState = {
  access: AdminPanelAccess | null;
  recordsFeed: AdminBookingsFeedPage | null;
  recordsLastCategory: AdminBookingsCategory | null;
  recordsOpenedAppointmentId: string | null;
  recordsRescheduleDraft: AdminRescheduleDraft | null;
  recordsChangeMasterDraft: AdminChangeMasterDraft | null;
};

function getSceneState(ctx: MyContext): AdminPanelSceneState {
  return ctx.wizard.state as AdminPanelSceneState;
}

function resetRecordsActionDrafts(state: AdminPanelSceneState): void {
  state.recordsRescheduleDraft = null;
  state.recordsChangeMasterDraft = null;
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

async function renderStubSection(
  ctx: MyContext,
  title: string,
  blockNumber: number,
): Promise<void> {
  const text = formatAdminPanelSectionStubText(title, blockNumber);
  const keyboard = createAdminPanelSectionStubKeyboard();

  try {
    await ctx.editMessageText(text, keyboard);
  } catch {
    await ctx.reply(text, keyboard);
  }
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
      // Адмін-панель працює через inline callback-и.
      if (ctx.message && 'text' in ctx.message) {
        await renderAdminRoot(ctx, false);
      }
    },
  );

  scene.action(ADMIN_PANEL_ACTION.OPEN_RECORDS, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRecordsActionDrafts(state);
    await renderRecordsMenu(ctx);
  });

  scene.action(ADMIN_PANEL_ACTION.OPEN_SCHEDULE, async (ctx) => {
    await ctx.answerCbQuery();
    await renderStubSection(ctx, '🕒 Розклад', 2);
  });

  scene.action(ADMIN_PANEL_ACTION.OPEN_MASTERS, async (ctx) => {
    await ctx.answerCbQuery();
    await renderStubSection(ctx, '👩‍🎨 Майстри', 3);
  });

  scene.action(ADMIN_PANEL_ACTION.OPEN_SERVICES, async (ctx) => {
    await ctx.answerCbQuery();
    await renderStubSection(ctx, '💼 Послуги', 4);
  });

  scene.action(ADMIN_PANEL_ACTION.OPEN_STATS, async (ctx) => {
    await ctx.answerCbQuery();
    await renderStubSection(ctx, '📊 Статистика', 5);
  });

  scene.action(ADMIN_PANEL_ACTION.OPEN_SETTINGS, async (ctx) => {
    await ctx.answerCbQuery();
    await renderStubSection(ctx, '⚙️ Налаштування', 6);
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
