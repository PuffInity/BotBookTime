import { Markup, Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import {
  bookingClientNameSchema,
  bookingClientPhoneSchema,
} from '../../validator/booking-input.schema.js';

/**
 * @file booking.scene.ts
 * @summary Базовий покроковий сценарій запису (WizardScene).
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
} as const;

function createBookingNavigationKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(BOOKING_NAV_BUTTON.BACK, BOOKING_NAV_ACTION.BACK),
      Markup.button.callback(BOOKING_NAV_BUTTON.HOME, BOOKING_NAV_ACTION.HOME),
    ],
  ]);
}

/**
 * Тимчасовий стан сценарію (зберігається в сесії на час проходження сцени).
 * Це не основна БД. Після завершення сцени ці дані можна записати в PostgreSQL.
 */
type BookingDraftState = {
  name?: string;
  phone?: string;
};

/**
 * Допоміжна функція:
 * Повертає об'єкт тимчасового стану з `ctx.wizard.state` у зрозумілому типі.
 */
function getDraftState(ctx: MyContext): BookingDraftState {
  return ctx.wizard.state as BookingDraftState;
}

/**
 * Допоміжна функція:
 * Безпечно дістає текст з повідомлення.
 * Якщо користувач надіслав не текст (фото/стікер), повертає null.
 */
function getMessageText(ctx: MyContext): string | null {
  if (!ctx.message) return null;
  if (!('text' in ctx.message)) return null;
  return ctx.message.text.trim();
}

async function sendNameStepPrompt(ctx: MyContext, intro?: string): Promise<void> {
  await ctx.reply(
    `${intro ? `${intro}\n\n` : ''}` +
      "📝 Крок 1/2: Ім'я клієнта\n" +
      "Введіть, будь ласка, ім'я.\n" +
      "Умови: мінімум 2 символи, тільки текст.\n" +
      'Приклад: Анна',
    createBookingNavigationKeyboard(),
  );
}

async function sendPhoneStepPrompt(ctx: MyContext, intro?: string): Promise<void> {
  await ctx.reply(
    `${intro ? `${intro}\n\n` : ''}` +
      '📱 Крок 2/2: Телефон клієнта\n' +
      'Введіть номер у форматі +420123456789\n' +
      'Код країни обов’язковий: +420',
    createBookingNavigationKeyboard(),
  );
}

async function handleGoHome(ctx: MyContext): Promise<void> {
  await ctx.scene.leave();
  await sendClientMainMenu(ctx);
}

/**
 * Створює базовий сценарій запису:
 * 1) Запитуємо ім'я
 * 2) Запитуємо телефон
 * 3) Показуємо підтвердження та завершуємо сцену
 */
export function createBookingScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    BOOKING_SCENE_ID,
    async (ctx) => {
      await sendNameStepPrompt(
        ctx,
        '✨ Починаємо новий запис. Заповнимо коротку анкету у 2 кроки.',
      );
      return ctx.wizard.next();
    },
    async (ctx) => {
      // Крок 2: чекаємо ім'я
      const text = getMessageText(ctx);

      if (!text) {
        await sendNameStepPrompt(ctx, 'Я очікую текстове повідомлення з ім’ям.');
        return;
      }

      if (text === BOOKING_NAV_BUTTON.HOME) {
        await handleGoHome(ctx);
        return;
      }

      if (text === BOOKING_NAV_BUTTON.BACK) {
        await sendNameStepPrompt(
          ctx,
          'Ви вже на першому кроці. Можете ввести ім’я або повернутися в головне меню.',
        );
        return;
      }

      const draft = getDraftState(ctx);
      const parsedName = bookingClientNameSchema.safeParse(text);
      if (!parsedName.success) {
        await sendNameStepPrompt(
          ctx,
          "⚠️ Некоректне ім'я. Використовуйте тільки літери та мінімум 2 символи.",
        );
        return;
      }
      draft.name = parsedName.data;

      await sendPhoneStepPrompt(ctx);
      return ctx.wizard.next();
    },
    async (ctx) => {
      // Крок 3: чекаємо телефон та показуємо результат
      const text = getMessageText(ctx);

      if (!text) {
        await sendPhoneStepPrompt(ctx, 'Я очікую текстове повідомлення з номером телефону.');
        return;
      }

      if (text === BOOKING_NAV_BUTTON.HOME) {
        await handleGoHome(ctx);
        return;
      }

      if (text === BOOKING_NAV_BUTTON.BACK) {
        ctx.wizard.selectStep(1);
        await sendNameStepPrompt(ctx, '⬅️ Повертаємося до попереднього кроку.');
        return;
      }

      const draft = getDraftState(ctx);
      const parsedPhone = bookingClientPhoneSchema.safeParse(text);
      if (!parsedPhone.success) {
        await sendPhoneStepPrompt(
          ctx,
          '⚠️ Некоректний номер. Приклад правильного формату: +420123456789',
        );
        return;
      }
      draft.phone = parsedPhone.data;

      // Тут пізніше ти викличеш bookingService.save(...) і запишеш дані в БД.
      await ctx.reply(
        '✅ Чернетка запису створена!\n' +
          `👤 Ім'я: ${draft.name}\n` +
          `📱 Телефон: ${draft.phone}\n\n` +
          'На наступному етапі підключимо збереження у PostgreSQL.',
      );

      await ctx.scene.leave();
      await sendClientMainMenu(ctx);
      return;
    },
  );

  scene.action(BOOKING_NAV_ACTION.HOME, async (ctx) => {
    await ctx.answerCbQuery();
    await handleGoHome(ctx);
  });

  scene.action(BOOKING_NAV_ACTION.BACK, async (ctx) => {
    await ctx.answerCbQuery();

    if (ctx.wizard.cursor >= 2) {
      ctx.wizard.selectStep(1);
      await sendNameStepPrompt(ctx, '⬅️ Повертаємося до попереднього кроку.');
      return;
    }

    await sendNameStepPrompt(
      ctx,
      'Ви вже на першому кроці. Введіть ім’я або перейдіть у головне меню.',
    );
  });

  return scene;
}
