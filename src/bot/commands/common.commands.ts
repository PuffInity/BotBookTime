import { BOOKING_SCENE_ID } from '../scenes/booking.scene.js';
import { PROFILE_NAME_SCENE_ID } from '../scenes/profile-name.scene.js';
import type { MyContext } from '../../types/bot.types.js';
import type { Telegraf } from 'telegraf';
import { asyncBotHandler } from '../../utils/error.utils.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import { CLIENT_MAIN_MENU_BUTTON, COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import { createBackHomeInlineKeyboard } from '../../helpers/bot/navigation.bot.js';
import { getOrCreateUser } from '../../helpers/db/db-profile.helper.js';
import { PROFILE_ACTION } from '../../types/bot-profile.types.js';
import {
  sendProfileCard,
  sendProfileFeatureStub,
} from '../../helpers/bot/profile-view.bot.js';

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
      await getOrCreateUser(ctx);
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
      const user = await getOrCreateUser(ctx);
      await sendProfileCard(ctx, user);
    }),
  );

  bot.action(
    PROFILE_ACTION.OPEN,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      const user = await getOrCreateUser(ctx);
      await sendProfileCard(ctx, user);
    }),
  );

  bot.action(
    PROFILE_ACTION.EDIT_NAME,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(PROFILE_NAME_SCENE_ID);
    }),
  );

  bot.action(
    PROFILE_ACTION.EDIT_EMAIL,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      await sendProfileFeatureStub(ctx, '✉️ Зміна email');
    }),
  );

  bot.action(
    PROFILE_ACTION.EDIT_PHONE,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      await sendProfileFeatureStub(ctx, '📱 Зміна телефону');
    }),
  );

  bot.action(
    PROFILE_ACTION.EDIT_LANGUAGE,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      await sendProfileFeatureStub(ctx, '🌐 Зміна мови');
    }),
  );

  bot.action(
    PROFILE_ACTION.BOOKING_STATUS,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      await sendProfileFeatureStub(ctx, '📅 Статус бронювання');
    }),
  );

  bot.action(
    PROFILE_ACTION.NOTIFICATION_SETTINGS,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      await sendProfileFeatureStub(ctx, '🔔 Налаштування сповіщень');
    }),
  );

  bot.hears(
    CLIENT_MAIN_MENU_BUTTON.SERVICES,
    asyncBotHandler(async (ctx) => {
      await ctx.reply(
        '💼 Послуги\n' +
          'Каталог послуг тимчасово у режимі заглушки.\n' +
          'Як тільки база буде наповнена, тут відобразиться актуальний список.',
        createBackHomeInlineKeyboard(),
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
        createBackHomeInlineKeyboard(),
      );
    }),
  );

  bot.action(
    COMMON_NAV_ACTION.BACK,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      await sendClientMainMenu(ctx);
    }),
  );

  bot.action(
    COMMON_NAV_ACTION.HOME,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      await sendClientMainMenu(ctx);
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
