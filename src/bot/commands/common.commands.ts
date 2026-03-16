import { BOOKING_SCENE_ID } from '../scenes/booking.scene.js';
import type { MyContext } from '../../types/bot.types.js';
import type { Telegraf } from 'telegraf';
import { asyncBotHandler } from '../../utils/error.utils.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import { CLIENT_MAIN_MENU_BUTTON } from '../../types/bot-menu.types.js';

/**
 * @file common.commands.ts
 * @summary Базові команди для старту проєкту.
 */

/**
 * Реєструє прості команди:
 * - /start
 * - /help
 * - /booking (запуск сцени)
 * - /cancel (вихід зі сцени)
 */
export function registerCommonCommands(bot: Telegraf<MyContext>): void {
  bot.start(
    asyncBotHandler(async (ctx) => {
      await sendClientMainMenu(ctx);
    }),
  );

  bot.command(
    'help',
    asyncBotHandler(async (ctx) => {
      await ctx.reply(
        'Список команд:\n' +
          '/start - головне меню\n' +
          '/menu - показати головне меню\n' +
          '/booking - почати сценарій запису\n' +
          '/cancel - вийти зі сценарію',
      );
    }),
  );

  bot.command(
    'menu',
    asyncBotHandler(async (ctx) => {
      await sendClientMainMenu(ctx);
    }),
  );

  bot.command(
    'booking',
    asyncBotHandler(async (ctx) => {
      await ctx.scene.enter(BOOKING_SCENE_ID);
    }),
  );

  bot.command(
    'cancel',
    asyncBotHandler(async (ctx) => {
      // Якщо користувач не в сцені, просто пояснюємо це.
      if (!ctx.scene.current) {
        await ctx.reply('Зараз немає активного сценарію для скасування.');
        return;
      }

      await ctx.scene.leave();
      await ctx.reply('Сценарій скасовано.');
      await sendClientMainMenu(ctx);
    }),
  );

  bot.hears(
    CLIENT_MAIN_MENU_BUTTON.PROFILE,
    asyncBotHandler(async (ctx) => {
      await ctx.reply(
        '👤 Профіль\n' +
          'Блок профілю в MVP зараз у режимі read-only.\n' +
          'На наступному етапі підключимо дані з БД.',
      );
    }),
  );

  bot.hears(
    CLIENT_MAIN_MENU_BUTTON.SERVICES,
    asyncBotHandler(async (ctx) => {
      await ctx.reply(
        '💼 Послуги\n' +
          'На наступному кроці підключимо каталог послуг із PostgreSQL.',
      );
    }),
  );

  bot.hears(
    CLIENT_MAIN_MENU_BUTTON.BOOKING,
    asyncBotHandler(async (ctx) => {
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(BOOKING_SCENE_ID);
    }),
  );

  bot.hears(
    CLIENT_MAIN_MENU_BUTTON.FAQ,
    asyncBotHandler(async (ctx) => {
      await ctx.reply(
        '❓ FAQ\n' +
          'Блок FAQ буде підключено на окремому етапі через контент із БД.',
      );
    }),
  );

  // Додатковий fallback на текст, щоб бачити що бот живий навіть поза сценою.
  bot.on('text', async (ctx, next) => {
    if (ctx.scene.current) {
      // Якщо користувач уже в сцені — не заважаємо сцені обробити повідомлення.
      await next();
      return;
    }

    await ctx.reply('Використайте /menu, щоб відкрити головне меню.');
  });
}
