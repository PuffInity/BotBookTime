import { Markup, Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import {
  bookingClientPhoneSchema,
  bookingDateCodeSchema,
  bookingTimeCodeSchema,
} from '../../validator/booking-input.schema.js';
import { listActiveServicesCatalog } from '../../helpers/db/db-services.helper.js';
import { getOrCreateUser } from '../../helpers/db/db-profile.helper.js';
import { listActiveMastersByService } from '../../helpers/db/db-masters.helper.js';
import { createPendingBooking } from '../../helpers/db/db-booking.helper.js';
import { sendProfileCard } from '../../helpers/bot/profile-view.bot.js';
import { sendClientBookingCreatedEmail } from '../../helpers/email/booking-email.helper.js';
import {
  BOOKING_ACTION,
  BOOKING_BUTTON_TEXT,
  BOOKING_DATE_ACTION_REGEX,
  BOOKING_MASTER_ACTION_REGEX,
  BOOKING_SERVICE_ACTION_REGEX,
  BOOKING_TIME_ACTION_REGEX,
} from '../../types/bot-booking.types.js';
import type { ServicesCatalogItem } from '../../types/db-helpers/db-services.types.js';
import type { MasterBookingOption } from '../../types/db-helpers/db-masters.types.js';
import { ValidationError } from '../../utils/error.utils.js';
import {
  buildBookingDateOptions,
  buildBookingTimeOptions,
  createBookingConfirmKeyboard,
  createBookingDateKeyboard,
  createBookingMasterKeyboard,
  createBookingPhoneUnverifiedKeyboard,
  createBookingServiceKeyboard,
  createBookingTimeKeyboard,
  formatBookingConfirmStepText,
  formatBookingDateStepText,
  formatBookingMasterStepText,
  formatBookingPhoneStepText,
  formatBookingPhoneUnverifiedStepText,
  formatBookingServiceStepText,
  formatBookingSuccessText,
  formatBookingTimeStepText,
} from '../../helpers/bot/booking-view.bot.js';

/**
 * @file booking.scene.ts
 * @summary Покроковий сценарій бронювання клієнта (service → date → time → master → phone → confirm).
 */

export const BOOKING_SCENE_ID = 'booking-scene';

type BookingSceneState = {
  clientId: string | null;
  studioId: string | null;
  profileName: string;
  profileEmail: string | null;
  profilePhone: string | null;
  isProfilePhoneVerified: boolean;
  services: ServicesCatalogItem[];
  masters: MasterBookingOption[];
  serviceId: string | null;
  serviceName: string | null;
  dateCode: string | null;
  timeCode: string | null;
  masterId: string | null;
  masterName: string | null;
  attendeeName: string | null;
  attendeePhone: string | null;
};

const BOOKING_TIME_OPTIONS = buildBookingTimeOptions();

function getSceneState(ctx: MyContext): BookingSceneState {
  return ctx.wizard.state as BookingSceneState;
}

function getMessageText(ctx: MyContext): string | null {
  if (!ctx.message) return null;
  if (!('text' in ctx.message)) return null;
  return ctx.message.text.trim();
}

function formatProfileName(firstName: string, lastName?: string | null): string {
  const fullName = `${firstName}${lastName ? ` ${lastName}` : ''}`.trim();
  return fullName.length > 0 ? fullName : 'Клієнт';
}

function formatDateCodeLabel(dateCode: string): string {
  const year = Number(dateCode.slice(0, 4));
  const month = Number(dateCode.slice(4, 6));
  const day = Number(dateCode.slice(6, 8));
  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
}

function formatTimeCodeLabel(timeCode: string): string {
  return `${timeCode.slice(0, 2)}:${timeCode.slice(2, 4)}`;
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

function getAvailableTimeOptions(dateCode: string): string[] {
  if (dateCode !== getTodayDateCode()) {
    return BOOKING_TIME_OPTIONS;
  }

  const now = Date.now();
  return BOOKING_TIME_OPTIONS.filter((timeLabel) => {
    const timeCode = timeLabel.replace(':', '');
    const startAt = toStartAt(dateCode, timeCode);
    return startAt.getTime() > now;
  });
}

function createTextStepNavKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(BOOKING_BUTTON_TEXT.BACK, BOOKING_ACTION.BACK),
      Markup.button.callback(BOOKING_BUTTON_TEXT.CANCEL_BOOKING, BOOKING_ACTION.CANCEL),
    ],
  ]);
}

function resetBookingDraft(state: BookingSceneState): void {
  state.masters = [];
  state.serviceId = null;
  state.serviceName = null;
  state.dateCode = null;
  state.timeCode = null;
  state.masterId = null;
  state.masterName = null;
  state.attendeeName = state.profileName;
  state.attendeePhone = null;
}

function resetAfterService(state: BookingSceneState): void {
  state.masters = [];
  state.dateCode = null;
  state.timeCode = null;
  state.masterId = null;
  state.masterName = null;
  state.attendeeName = state.profileName;
  state.attendeePhone = null;
}

function resetAfterDate(state: BookingSceneState): void {
  state.timeCode = null;
  state.masterId = null;
  state.masterName = null;
  state.attendeeName = state.profileName;
  state.attendeePhone = null;
}

function resetAfterTime(state: BookingSceneState): void {
  state.masterId = null;
  state.masterName = null;
  state.attendeeName = state.profileName;
  state.attendeePhone = null;
}

function isPhoneStepRequired(state: BookingSceneState): boolean {
  return !state.profilePhone || !state.isProfilePhoneVerified;
}

async function renderView(
  ctx: MyContext,
  text: string,
  keyboard: ReturnType<typeof createBookingConfirmKeyboard>,
  preferEdit: boolean,
): Promise<void> {
  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // Якщо старе повідомлення не можна відредагувати — відправляємо нове.
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderServiceStep(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  state.services = await listActiveServicesCatalog({ studioId: state.studioId });

  await renderView(
    ctx,
    formatBookingServiceStepText(state.services),
    createBookingServiceKeyboard(state.services),
    preferEdit,
  );
}

async function renderDateStep(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  if (!state.serviceName) {
    await renderServiceStep(ctx, preferEdit);
    return;
  }

  await renderView(
    ctx,
    formatBookingDateStepText(state.serviceName),
    createBookingDateKeyboard(buildBookingDateOptions(7)),
    preferEdit,
  );
}

async function renderTimeStep(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  if (!state.serviceName || !state.dateCode) {
    await renderDateStep(ctx, preferEdit);
    return;
  }

  const availableTimeOptions = getAvailableTimeOptions(state.dateCode);
  const text =
    availableTimeOptions.length > 0
      ? formatBookingTimeStepText(state.serviceName, formatDateCodeLabel(state.dateCode))
      : formatBookingTimeStepText(state.serviceName, formatDateCodeLabel(state.dateCode)) +
        '\n\n⚠️ На цю дату вже немає доступних слотів. Оберіть іншу дату.';

  await renderView(ctx, text, createBookingTimeKeyboard(availableTimeOptions), preferEdit);
}

async function renderMasterStep(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  if (!state.serviceId || !state.serviceName || !state.timeCode || !state.dateCode || !state.studioId) {
    await renderTimeStep(ctx, preferEdit);
    return;
  }

  state.masters = await listActiveMastersByService({
    studioId: state.studioId,
    serviceId: state.serviceId,
  });

  await renderView(
    ctx,
    formatBookingMasterStepText(
      state.serviceName,
      formatDateCodeLabel(state.dateCode),
      formatTimeCodeLabel(state.timeCode),
      state.masters,
    ),
    createBookingMasterKeyboard(state.masters),
    preferEdit,
  );
}

async function renderPhoneStep(ctx: MyContext, intro?: string): Promise<void> {
  const state = getSceneState(ctx);

  if (!state.attendeeName) {
    state.attendeeName = state.profileName;
  }

  if (!state.profilePhone) {
    await ctx.reply(
      `${intro ? `${intro}\n\n` : ''}${formatBookingPhoneStepText(state.attendeeName)}`,
      createTextStepNavKeyboard(),
    );
    return;
  }

  if (!state.isProfilePhoneVerified) {
    await renderView(
      ctx,
      `${intro ? `${intro}\n\n` : ''}` +
        formatBookingPhoneUnverifiedStepText({
          name: state.attendeeName,
          phone: state.profilePhone,
        }),
      createBookingPhoneUnverifiedKeyboard(),
      ctx.updateType === 'callback_query',
    );
    return;
  }

  state.attendeePhone = state.profilePhone;
  await renderConfirmStep(ctx, false);
}

async function renderConfirmStep(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  if (
    !state.serviceName ||
    !state.masterName ||
    !state.dateCode ||
    !state.timeCode ||
    !state.attendeeName ||
    !state.attendeePhone
  ) {
    await renderPhoneStep(ctx);
    return;
  }

  await renderView(
    ctx,
    formatBookingConfirmStepText({
      serviceName: state.serviceName,
      masterName: state.masterName,
      startAt: toStartAt(state.dateCode, state.timeCode),
      attendeeName: state.attendeeName,
      attendeePhone: state.attendeePhone,
    }),
    createBookingConfirmKeyboard(),
    preferEdit,
  );
}

async function handleCancel(ctx: MyContext): Promise<void> {
  await ctx.scene.leave();
  await ctx.reply('Бронювання скасовано.');
  await sendClientMainMenu(ctx);
}

export function createBookingScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    BOOKING_SCENE_ID,
    async (ctx) => {
      const state = getSceneState(ctx);
      const user = await getOrCreateUser(ctx);

      state.clientId = user.id;
      state.studioId = user.studioId;
      state.profileName = formatProfileName(user.firstName, user.lastName);
      state.profileEmail = user.email;
      state.profilePhone = user.phoneE164;
      state.isProfilePhoneVerified = Boolean(user.phoneE164 && user.phoneVerifiedAt);
      state.services = [];
      resetBookingDraft(state);

      await renderServiceStep(ctx, false);
      return ctx.wizard.next();
    },
    async (ctx) => {
      const text = getMessageText(ctx);
      if (!text) return;
      await renderServiceStep(ctx, false);
    },
    async (ctx) => {
      const text = getMessageText(ctx);
      if (!text) return;
      await renderDateStep(ctx, false);
    },
    async (ctx) => {
      const text = getMessageText(ctx);
      if (!text) return;
      await renderTimeStep(ctx, false);
    },
    async (ctx) => {
      const text = getMessageText(ctx);
      if (!text) return;
      await renderMasterStep(ctx, false);
    },
    async (ctx) => {
      const state = getSceneState(ctx);
      const text = getMessageText(ctx);

      if (state.profilePhone && !state.isProfilePhoneVerified) {
        await renderPhoneStep(
          ctx,
          text ? 'Використайте кнопки нижче, щоб продовжити.' : undefined,
        );
        return;
      }

      if (!text) {
        await renderPhoneStep(ctx, 'Я очікую текстове повідомлення з номером телефону.');
        return;
      }

      const parsedPhone = bookingClientPhoneSchema.safeParse(text);
      if (!parsedPhone.success) {
        await renderPhoneStep(ctx, '⚠️ Некоректний номер. Приклад: +420123456789');
        return;
      }

      state.attendeePhone = parsedPhone.data;
      await renderConfirmStep(ctx, false);
      return ctx.wizard.next();
    },
    async (ctx) => {
      const text = getMessageText(ctx);
      if (!text) return;
      await renderConfirmStep(ctx, false);
    },
  );

  scene.action(BOOKING_SERVICE_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();

    const state = getSceneState(ctx);
    const matches = ctx.match as RegExpExecArray | string[];
    const serviceId = String(matches[1]);
    const service = state.services.find((item) => item.id === serviceId);
    if (!service) {
      await renderServiceStep(ctx, true);
      return;
    }

    state.studioId = service.studioId;
    state.serviceId = service.id;
    state.serviceName = service.name;
    resetAfterService(state);

    ctx.wizard.selectStep(2);
    await renderDateStep(ctx, true);
  });

  scene.action(BOOKING_DATE_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();

    const state = getSceneState(ctx);
    const matches = ctx.match as RegExpExecArray | string[];
    const dateCode = String(matches[1]);
    const parsed = bookingDateCodeSchema.safeParse(dateCode);
    if (!parsed.success) {
      await renderDateStep(ctx, true);
      return;
    }

    state.dateCode = parsed.data;
    resetAfterDate(state);

    ctx.wizard.selectStep(3);
    await renderTimeStep(ctx, true);
  });

  scene.action(BOOKING_TIME_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();

    const state = getSceneState(ctx);
    const matches = ctx.match as RegExpExecArray | string[];
    const timeCode = String(matches[1]);
    const parsed = bookingTimeCodeSchema.safeParse(timeCode);
    if (!parsed.success) {
      await renderTimeStep(ctx, true);
      return;
    }

    if (!state.dateCode) {
      await renderDateStep(ctx, true);
      return;
    }

    const allowedTimeCodes = new Set(
      getAvailableTimeOptions(state.dateCode).map((item) => item.replace(':', '')),
    );
    if (!allowedTimeCodes.has(parsed.data)) {
      await renderTimeStep(ctx, true);
      return;
    }

    state.timeCode = parsed.data;
    resetAfterTime(state);

    ctx.wizard.selectStep(4);
    await renderMasterStep(ctx, true);
  });

  scene.action(BOOKING_MASTER_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();

    const state = getSceneState(ctx);
    const matches = ctx.match as RegExpExecArray | string[];
    const masterId = String(matches[1]);

    const selectedMaster = state.masters.find((master) => master.masterId === masterId) ?? null;
    if (!selectedMaster) {
      await renderMasterStep(ctx, true);
      return;
    }

    state.masterId = selectedMaster.masterId;
    state.masterName = selectedMaster.displayName;
    state.attendeeName = state.profileName;
    state.attendeePhone = null;

    if (state.profilePhone && state.isProfilePhoneVerified) {
      state.attendeePhone = state.profilePhone;
      ctx.wizard.selectStep(6);
      await renderConfirmStep(ctx, true);
      return;
    }

    ctx.wizard.selectStep(5);
    await renderPhoneStep(ctx);
  });

  scene.action(BOOKING_ACTION.PHONE_USE_UNVERIFIED, async (ctx) => {
    await ctx.answerCbQuery();

    const state = getSceneState(ctx);
    if (!state.profilePhone) {
      await renderPhoneStep(ctx, 'У профілі немає номера телефону.');
      return;
    }

    state.attendeePhone = state.profilePhone;
    ctx.wizard.selectStep(6);
    await renderConfirmStep(ctx, true);
  });

  scene.action(BOOKING_ACTION.PHONE_GO_PROFILE, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    const user = await getOrCreateUser(ctx);
    await sendProfileCard(ctx, user);
  });

  scene.action(BOOKING_ACTION.CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();

    const state = getSceneState(ctx);
    if (
      !state.clientId ||
      !state.studioId ||
      !state.serviceId ||
      !state.masterId ||
      !state.dateCode ||
      !state.timeCode ||
      !state.attendeeName ||
      !state.attendeePhone
    ) {
      await renderServiceStep(ctx, true);
      ctx.wizard.selectStep(1);
      return;
    }

    try {
      const result = await createPendingBooking({
        clientId: state.clientId,
        studioId: state.studioId,
        serviceId: state.serviceId,
        masterId: state.masterId,
        attendeeName: state.attendeeName,
        attendeePhoneE164: state.attendeePhone,
        startAt: toStartAt(state.dateCode, state.timeCode),
      });

      await ctx.scene.leave();
      await ctx.reply(formatBookingSuccessText(result));

      if (state.profileEmail) {
        const emailSent = await sendClientBookingCreatedEmail({
          to: state.profileEmail,
          recipientName: state.profileName,
          bookingId: result.appointment.id,
          studioName: result.meta.studioName,
          serviceName: result.meta.serviceName,
          masterName: result.meta.masterDisplayName,
          startAt: result.appointment.startAt,
        });

        if (emailSent) {
          await ctx.reply(
            '📧 Ми надіслали лист на ваш email: запис створено і очікує підтвердження.\n' +
              'Після підтвердження майстром ви отримаєте ще один лист.',
          );
        }
      }

      await sendClientMainMenu(ctx);
    } catch (error) {
      if (!(error instanceof ValidationError)) {
        throw error;
      }

      const message = error.message.toLowerCase();
      if (message.includes('час') || message.includes('слот')) {
        ctx.wizard.selectStep(3);
        await ctx.reply(`⚠️ ${error.message}`);
        await renderTimeStep(ctx, false);
        return;
      }

      if (message.includes('майстра') || message.includes('послуга')) {
        ctx.wizard.selectStep(4);
        await ctx.reply(`⚠️ ${error.message}`);
        await renderMasterStep(ctx, false);
        return;
      }

      await ctx.reply(`⚠️ ${error.message}`);
      await renderConfirmStep(ctx, true);
    }
  });

  scene.action(BOOKING_ACTION.CHANGE, async (ctx) => {
    await ctx.answerCbQuery();

    const state = getSceneState(ctx);
    resetBookingDraft(state);

    ctx.wizard.selectStep(1);
    await renderServiceStep(ctx, true);
  });

  scene.action(BOOKING_ACTION.CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    await handleCancel(ctx);
  });

  scene.action(BOOKING_ACTION.HOME, async (ctx) => {
    await ctx.answerCbQuery();
    await handleCancel(ctx);
  });

  scene.action(BOOKING_ACTION.BACK, async (ctx) => {
    await ctx.answerCbQuery();

    const cursor = ctx.wizard.cursor;
    if (cursor <= 1) {
      await renderServiceStep(ctx, true);
      return;
    }

    if (cursor === 2) {
      ctx.wizard.selectStep(1);
      await renderServiceStep(ctx, true);
      return;
    }

    if (cursor === 3) {
      ctx.wizard.selectStep(2);
      await renderDateStep(ctx, true);
      return;
    }

    if (cursor === 4) {
      ctx.wizard.selectStep(3);
      await renderTimeStep(ctx, true);
      return;
    }

    if (cursor === 5) {
      ctx.wizard.selectStep(4);
      await renderMasterStep(ctx, true);
      return;
    }

    if (isPhoneStepRequired(getSceneState(ctx))) {
      ctx.wizard.selectStep(5);
      await renderPhoneStep(ctx, '⬅️ Повертаємося до попереднього кроку.');
      return;
    }

    ctx.wizard.selectStep(4);
    await renderMasterStep(ctx, true);
  });

  return scene;
}
