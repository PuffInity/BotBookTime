import { Markup, Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import type { ServicesCatalogItem } from '../../types/db-helpers/db-services.types.js';
import type { MasterBookingOption } from '../../types/db-helpers/db-masters.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import { listActiveServicesCatalog } from '../../helpers/db/db-services.helper.js';
import { listActiveMastersByService } from '../../helpers/db/db-masters.helper.js';
import { getOrCreateUser } from '../../helpers/db/db-profile.helper.js';
import {
  bookingClientNameSchema,
  bookingClientPhoneSchema,
} from '../../validator/booking-input.schema.js';

/**
 * @file booking.scene.ts
 * @summary Сценарій бронювання: послуга -> майстер -> ім'я -> телефон.
 */

/** ID сцени. Саме цей рядок використовуємо в `ctx.scene.enter(...)`. */
export const BOOKING_SCENE_ID = 'booking-scene';

const BOOKING_NAV_BUTTON = {
  BACK: '⬅️ Назад',
  HOME: '🏠 Головне меню',
} as const;

const BOOKING_NAV_ACTION = {
  BACK: 'booking:back',
  HOME: 'booking:home',
  SERVICE_PREFIX: 'booking:service:',
  MASTER_PREFIX: 'booking:master:',
} as const;

const BOOKING_SERVICE_ACTION_REGEX = /^booking:service:(\d+)$/;
const BOOKING_MASTER_ACTION_REGEX = /^booking:master:(\d+)$/;
const NUMBER_BADGES = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

type BookingDraftState = {
  studioId: string | null;
  serviceId?: string;
  serviceName?: string;
  masterId?: string;
  masterName?: string;
  name?: string;
  phone?: string;
};

function getDraftState(ctx: MyContext): BookingDraftState {
  return ctx.wizard.state as BookingDraftState;
}

function getMessageText(ctx: MyContext): string | null {
  if (!ctx.message) return null;
  if (!('text' in ctx.message)) return null;
  return ctx.message.text.trim();
}

function getNumberBadge(index: number): string {
  return NUMBER_BADGES[index] ?? `${index + 1}.`;
}

function formatPrice(price: string, currencyCode: string): string {
  const normalizedPrice = price
    .replace(/[.,]00$/, '')
    .replace(/([.,]\d)0$/, '$1');

  return `${normalizedPrice} ${currencyCode}`;
}

function createBookingNavigationRow() {
  return [
    Markup.button.callback(BOOKING_NAV_BUTTON.BACK, BOOKING_NAV_ACTION.BACK),
    Markup.button.callback(BOOKING_NAV_BUTTON.HOME, BOOKING_NAV_ACTION.HOME),
  ] as const;
}

function createServiceStepKeyboard(
  services: ServicesCatalogItem[],
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = services.map((service, index) => [
    Markup.button.callback(
      `${getNumberBadge(index)} ${service.name}`,
      `${BOOKING_NAV_ACTION.SERVICE_PREFIX}${service.id}`,
    ),
  ]);

  return Markup.inlineKeyboard([...rows, [...createBookingNavigationRow()]]);
}

function createMasterStepKeyboard(
  masters: MasterBookingOption[],
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = masters.map((master, index) => [
    Markup.button.callback(
      `${getNumberBadge(index)} 👩‍🎨 ${master.displayName}`,
      `${BOOKING_NAV_ACTION.MASTER_PREFIX}${master.userId}`,
    ),
  ]);

  return Markup.inlineKeyboard([...rows, [...createBookingNavigationRow()]]);
}

function createTextStepKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([[...createBookingNavigationRow()]]);
}

async function renderBookingView(
  ctx: MyContext,
  text: string,
  keyboard: ReturnType<typeof Markup.inlineKeyboard>,
  preferEdit: boolean,
): Promise<void> {
  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // Якщо редагувати повідомлення не вдалося (видалене/застаріле) — надсилаємо нове.
    }
  }

  await ctx.reply(text, keyboard);
}

async function loadServiceOptions(draft: BookingDraftState): Promise<ServicesCatalogItem[]> {
  return listActiveServicesCatalog({
    studioId: draft.studioId,
  });
}

async function loadMasterOptions(draft: BookingDraftState): Promise<MasterBookingOption[]> {
  if (!draft.serviceId) {
    return [];
  }

  return listActiveMastersByService({
    serviceId: draft.serviceId,
    studioId: draft.studioId,
  });
}

async function sendServiceStepPrompt(
  ctx: MyContext,
  draft: BookingDraftState,
  intro?: string,
  preferEdit = false,
): Promise<void> {
  const services = await loadServiceOptions(draft);

  const text =
    `${intro ? `${intro}\n\n` : ''}` +
    '💼 Крок 1/4: Вибір послуги\n' +
    'Оберіть послугу зі списку нижче.' +
    (services.length === 0
      ? '\n\n⚠️ Наразі немає доступних послуг для бронювання.'
      : `\n\nДоступно послуг: ${services.length}`);

  await renderBookingView(ctx, text, createServiceStepKeyboard(services), preferEdit);
}

async function sendMasterStepPrompt(
  ctx: MyContext,
  draft: BookingDraftState,
  intro?: string,
  preferEdit = false,
): Promise<void> {
  if (!draft.serviceId || !draft.serviceName) {
    await sendServiceStepPrompt(
      ctx,
      draft,
      '⚠️ Спочатку оберіть послугу, щоб перейти до вибору майстра.',
      preferEdit,
    );
    return;
  }

  const masters = await loadMasterOptions(draft);
  const text =
    `${intro ? `${intro}\n\n` : ''}` +
    '👩‍🎨 Крок 2/4: Вибір майстра\n' +
    `Обрана послуга: ${draft.serviceName}\n` +
    'Оберіть майстра зі списку нижче.' +
    (masters.length === 0
      ? '\n\n⚠️ Для цієї послуги зараз немає доступних майстрів. Оберіть іншу послугу.'
      : `\n\nДоступно майстрів: ${masters.length}`);

  await renderBookingView(ctx, text, createMasterStepKeyboard(masters), preferEdit);
}

async function sendNameStepPrompt(
  ctx: MyContext,
  draft: BookingDraftState,
  intro?: string,
  preferEdit = false,
): Promise<void> {
  const text =
    `${intro ? `${intro}\n\n` : ''}` +
    "📝 Крок 3/4: Ім'я клієнта\n" +
    `Послуга: ${draft.serviceName ?? '—'}\n` +
    `Майстер: ${draft.masterName ?? '—'}\n\n` +
    "Введіть, будь ласка, ім'я.\n" +
    'Умови: мінімум 2 символи, тільки текст.\n' +
    'Приклад: Анна';

  await renderBookingView(ctx, text, createTextStepKeyboard(), preferEdit);
}

async function sendPhoneStepPrompt(
  ctx: MyContext,
  draft: BookingDraftState,
  intro?: string,
  preferEdit = false,
): Promise<void> {
  const text =
    `${intro ? `${intro}\n\n` : ''}` +
    '📱 Крок 4/4: Телефон клієнта\n' +
    `Послуга: ${draft.serviceName ?? '—'}\n` +
    `Майстер: ${draft.masterName ?? '—'}\n` +
    `Ім'я: ${draft.name ?? '—'}\n\n` +
    'Введіть номер у форматі +420123456789\n' +
    'Код країни обов’язковий: +420';

  await renderBookingView(ctx, text, createTextStepKeyboard(), preferEdit);
}

async function handleGoHome(ctx: MyContext): Promise<void> {
  await ctx.scene.leave();
  await sendClientMainMenu(ctx);
}

export function createBookingScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    BOOKING_SCENE_ID,
    async (ctx) => {
      const user = await getOrCreateUser(ctx);
      const draft = getDraftState(ctx);

      draft.studioId = user.studioId;
      draft.serviceId = undefined;
      draft.serviceName = undefined;
      draft.masterId = undefined;
      draft.masterName = undefined;
      draft.name = undefined;
      draft.phone = undefined;

      await sendServiceStepPrompt(
        ctx,
        draft,
        '✨ Починаємо новий запис. Пройдемо 4 кроки: послуга, майстер, імʼя, телефон.',
      );
      return ctx.wizard.next();
    },
    async (ctx) => {
      const text = getMessageText(ctx);
      if (!text) return;

      if (text === BOOKING_NAV_BUTTON.HOME) {
        await handleGoHome(ctx);
        return;
      }

      if (text === BOOKING_NAV_BUTTON.BACK) {
        await sendServiceStepPrompt(
          ctx,
          getDraftState(ctx),
          'Ви вже на першому кроці. Оберіть послугу або перейдіть у головне меню.',
        );
        return;
      }

      await sendServiceStepPrompt(
        ctx,
        getDraftState(ctx),
        'Оберіть послугу кнопкою нижче, щоб продовжити бронювання.',
      );
    },
    async (ctx) => {
      const text = getMessageText(ctx);
      if (!text) return;

      if (text === BOOKING_NAV_BUTTON.HOME) {
        await handleGoHome(ctx);
        return;
      }

      if (text === BOOKING_NAV_BUTTON.BACK) {
        ctx.wizard.selectStep(1);
        await sendServiceStepPrompt(
          ctx,
          getDraftState(ctx),
          '⬅️ Повертаємося до вибору послуги.',
        );
        return;
      }

      await sendMasterStepPrompt(
        ctx,
        getDraftState(ctx),
        'Оберіть майстра кнопкою нижче, щоб продовжити бронювання.',
      );
    },
    async (ctx) => {
      const text = getMessageText(ctx);

      if (!text) {
        await sendNameStepPrompt(ctx, getDraftState(ctx), 'Я очікую текстове повідомлення з імʼям.');
        return;
      }

      if (text === BOOKING_NAV_BUTTON.HOME) {
        await handleGoHome(ctx);
        return;
      }

      if (text === BOOKING_NAV_BUTTON.BACK) {
        ctx.wizard.selectStep(2);
        await sendMasterStepPrompt(
          ctx,
          getDraftState(ctx),
          '⬅️ Повертаємося до вибору майстра.',
        );
        return;
      }

      const draft = getDraftState(ctx);
      const parsedName = bookingClientNameSchema.safeParse(text);
      if (!parsedName.success) {
        await sendNameStepPrompt(
          ctx,
          draft,
          "⚠️ Некоректне ім'я. Використовуйте тільки літери та мінімум 2 символи.",
        );
        return;
      }

      draft.name = parsedName.data;
      await sendPhoneStepPrompt(ctx, draft);
      return ctx.wizard.next();
    },
    async (ctx) => {
      const text = getMessageText(ctx);

      if (!text) {
        await sendPhoneStepPrompt(
          ctx,
          getDraftState(ctx),
          'Я очікую текстове повідомлення з номером телефону.',
        );
        return;
      }

      if (text === BOOKING_NAV_BUTTON.HOME) {
        await handleGoHome(ctx);
        return;
      }

      if (text === BOOKING_NAV_BUTTON.BACK) {
        ctx.wizard.selectStep(3);
        await sendNameStepPrompt(
          ctx,
          getDraftState(ctx),
          '⬅️ Повертаємося до введення імені.',
        );
        return;
      }

      const draft = getDraftState(ctx);
      const parsedPhone = bookingClientPhoneSchema.safeParse(text);
      if (!parsedPhone.success) {
        await sendPhoneStepPrompt(
          ctx,
          draft,
          '⚠️ Некоректний номер. Приклад правильного формату: +420123456789',
        );
        return;
      }

      draft.phone = parsedPhone.data;

      await ctx.reply(
        '✅ Чернетка запису створена!\n' +
          `💼 Послуга: ${draft.serviceName}\n` +
          `👩‍🎨 Майстер: ${draft.masterName}\n` +
          `👤 Ім'я: ${draft.name}\n` +
          `📱 Телефон: ${draft.phone}\n\n` +
          'На наступному етапі підключимо збереження у PostgreSQL.',
      );

      await ctx.scene.leave();
      await sendClientMainMenu(ctx);
    },
  );

  scene.action(BOOKING_SERVICE_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();

    const draft = getDraftState(ctx);
    const matches = ctx.match as RegExpExecArray | string[];
    const serviceId = String(matches[1]);

    const services = await loadServiceOptions(draft);
    const selectedService = services.find((service) => service.id === serviceId) ?? null;

    if (!selectedService) {
      await sendServiceStepPrompt(
        ctx,
        draft,
        '⚠️ Не вдалося знайти цю послугу. Спробуйте обрати ще раз.',
        true,
      );
      return;
    }

    draft.serviceId = selectedService.id;
    draft.serviceName = selectedService.name;
    draft.masterId = undefined;
    draft.masterName = undefined;

    const masters = await loadMasterOptions(draft);
    if (masters.length === 0) {
      ctx.wizard.selectStep(1);
      await sendServiceStepPrompt(
        ctx,
        draft,
        '⚠️ Для цієї послуги зараз немає доступних майстрів. Оберіть іншу послугу.',
        true,
      );
      return;
    }

    ctx.wizard.selectStep(2);
    await sendMasterStepPrompt(ctx, draft, undefined, true);
  });

  scene.action(BOOKING_MASTER_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();

    const draft = getDraftState(ctx);
    if (!draft.serviceId || !draft.serviceName) {
      ctx.wizard.selectStep(1);
      await sendServiceStepPrompt(
        ctx,
        draft,
        '⚠️ Спочатку оберіть послугу, потім майстра.',
        true,
      );
      return;
    }

    const matches = ctx.match as RegExpExecArray | string[];
    const masterId = String(matches[1]);
    const masters = await loadMasterOptions(draft);
    const selectedMaster = masters.find((master) => master.userId === masterId) ?? null;

    if (!selectedMaster) {
      await sendMasterStepPrompt(
        ctx,
        draft,
        '⚠️ Не вдалося знайти цього майстра. Спробуйте обрати ще раз.',
        true,
      );
      return;
    }

    draft.masterId = selectedMaster.userId;
    draft.masterName = selectedMaster.displayName;

    ctx.wizard.selectStep(3);
    await sendNameStepPrompt(ctx, draft, undefined, true);
  });

  scene.action(BOOKING_NAV_ACTION.HOME, async (ctx) => {
    await ctx.answerCbQuery();
    await handleGoHome(ctx);
  });

  scene.action(BOOKING_NAV_ACTION.BACK, async (ctx) => {
    await ctx.answerCbQuery();

    const draft = getDraftState(ctx);

    if (ctx.wizard.cursor >= 4) {
      ctx.wizard.selectStep(3);
      await sendNameStepPrompt(ctx, draft, '⬅️ Повертаємося до попереднього кроку.', true);
      return;
    }

    if (ctx.wizard.cursor === 3) {
      ctx.wizard.selectStep(2);
      await sendMasterStepPrompt(ctx, draft, '⬅️ Повертаємося до попереднього кроку.', true);
      return;
    }

    if (ctx.wizard.cursor === 2) {
      ctx.wizard.selectStep(1);
      await sendServiceStepPrompt(ctx, draft, '⬅️ Повертаємося до попереднього кроку.', true);
      return;
    }

    await sendServiceStepPrompt(
      ctx,
      draft,
      'Ви вже на першому кроці. Оберіть послугу або перейдіть у головне меню.',
      true,
    );
  });

  return scene;
}
