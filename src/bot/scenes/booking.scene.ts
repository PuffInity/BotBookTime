import { Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';

/**
 * @file booking.scene.ts
 * @summary Базовий покроковий сценарій запису (WizardScene).
 */

/** ID сцени. Саме цей рядок використовуємо в `ctx.scene.enter(...)`. */
export const BOOKING_SCENE_ID = 'booking-scene';

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

/**
 * Створює базовий сценарій запису:
 * 1) Запитуємо ім'я
 * 2) Запитуємо телефон
 * 3) Показуємо підтвердження та завершуємо сцену
 */
export function createBookingScene(): Scenes.WizardScene<MyContext> {
  return new Scenes.WizardScene<MyContext>(
    BOOKING_SCENE_ID,
    async (ctx) => {
      // Крок 1: вхід у сцену
      await ctx.reply(
        'Починаємо запис.\n' +
          'Крок 1/2: Введіть, будь ласка, ваше імʼя.\n' +
          'Для скасування в будь-який момент напишіть /cancel',
      );

      return ctx.wizard.next();
    },
    async (ctx) => {
      // Крок 2: чекаємо ім'я
      const text = getMessageText(ctx);

      if (!text) {
        await ctx.reply('Будь ласка, надішліть імʼя саме текстом.');
        return;
      }

      const draft = getDraftState(ctx);
      draft.name = text;

      await ctx.reply('Крок 2/2: Введіть номер телефону (будь-яким зручним форматом).');
      return ctx.wizard.next();
    },
    async (ctx) => {
      // Крок 3: чекаємо телефон та показуємо результат
      const text = getMessageText(ctx);

      if (!text) {
        await ctx.reply('Будь ласка, надішліть номер телефону текстом.');
        return;
      }

      const draft = getDraftState(ctx);
      draft.phone = text;

      // Тут пізніше ти викличеш bookingService.save(...) і запишеш дані в БД.
      await ctx.reply(
        `Дякую! Чернетка запису створена.\nІм'я: ${draft.name}\nТелефон: ${draft.phone}\n\n` +
          'Зараз це базовий приклад сцени. Далі сюди підключимо БД.',
      );

      return ctx.scene.leave();
    },
  );
}
