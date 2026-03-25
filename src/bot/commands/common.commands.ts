import { BOOKING_SCENE_ID } from '../scenes/booking.scene.js';
import { PROFILE_NAME_SCENE_ID } from '../scenes/profile-name.scene.js';
import { PROFILE_EMAIL_VERIFY_SCENE_ID } from '../scenes/profile-email-verify.scene.js';
import { PROFILE_EMAIL_ADD_SCENE_ID } from '../scenes/profile-email-add.scene.js';
import { PROFILE_NOTIFICATION_SETTINGS_SCENE_ID } from '../scenes/profile-notification-settings.scene.js';
import { MASTERS_SCENE_ID } from '../scenes/masters.scene.js';
import { SERVICES_SCENE_ID } from '../scenes/services.scene.js';
import { FAQ_SCENE_ID } from '../scenes/faq.scene.js';
import { MASTER_PANEL_SCENE_ID } from '../scenes/master-panel.scene.js';
import { ADMIN_PANEL_SCENE_ID } from '../scenes/admin-panel.scene.js';
import type { MyContext } from '../../types/bot.types.js';
import type { Telegraf } from 'telegraf';
import { ValidationError, asyncBotHandler } from '../../utils/error.utils.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import {
  CLIENT_MAIN_MENU_BUTTON,
  COMMON_NAV_ACTION,
  MAIN_MENU_ACTION,
} from '../../types/bot-menu.types.js';
import { getOrCreateUser } from '../../helpers/db/db-profile.helper.js';
import {
  PROFILE_ACTION,
  PROFILE_BOOKING_CANCEL_ACTION_REGEX,
  PROFILE_BOOKING_CANCEL_CONFIRM_ACTION_REGEX,
  PROFILE_BOOKING_OPEN_ITEM_ACTION_REGEX,
  PROFILE_BOOKING_RESCHEDULE_ACTION_REGEX,
} from '../../types/bot-profile.types.js';
import {
  getEmailProfileActionTitle,
  getPhoneProfileActionTitle,
  sendProfileCard,
  sendProfileFeatureStub,
} from '../../helpers/bot/profile-view.bot.js';
import {
  cancelProfileBookingById,
  getProfileBookingStatus,
} from '../../helpers/db/db-profile-booking.helper.js';
import { sendClientBookingCancelledEmail } from '../../helpers/email/booking-email.helper.js';
import {
  getHistoryItems,
  sendCancelBookingConfirm,
  sendCancelBookingSuccess,
  sendSelectedBookingDetails,
  sendProfileBookingActionStub,
  sendProfileBookingHistory,
  sendProfileBookingStatus,
} from '../../helpers/bot/profile-booking-status.bot.js';
import type { ProfileBookingStatusItem } from '../../types/db-helpers/db-profile-booking.types.js';

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
  function getActionIdFromCallbackData(ctx: MyContext, regex: RegExp): string {
    const callbackData =
      ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const matches = callbackData.match(regex);

    if (!matches?.[1]) {
      throw new ValidationError('Некоректна callback-дія для статусу бронювання');
    }

    return matches[1];
  }

  async function findBookingForProfileAction(
    ctx: MyContext,
    regex: RegExp,
  ): Promise<{
    userId: string;
    userEmail: string | null;
    userFirstName: string;
    item: ProfileBookingStatusItem | null;
  }> {
    const appointmentId = getActionIdFromCallbackData(ctx, regex);
    const user = await getOrCreateUser(ctx);
    const bookingStatus = await getProfileBookingStatus(user.id, 20);
    const available = [bookingStatus.upcoming, ...getHistoryItems(bookingStatus)].filter(
      (item): item is ProfileBookingStatusItem => Boolean(item),
    );
    const selected = available.find((item) => item.appointmentId === appointmentId) ?? null;

    if (!selected) {
      await sendProfileBookingActionStub(ctx, '⚠️ Запис не знайдено');
      return { userId: user.id, userEmail: user.email, userFirstName: user.firstName, item: null };
    }

    return { userId: user.id, userEmail: user.email, userFirstName: user.firstName, item: selected };
  }

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
          '/master - відкрити панель майстра\n' +
          '/admin - відкрити адмін-панель\n' +
          '/booking - почати сценарій запису\n' +
          '/cancel - вийти зі сценарію',
      );
    }),
  );

  bot.command(
    'master',
    asyncBotHandler(async (ctx) => {
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(MASTER_PANEL_SCENE_ID);
    }),
  );

  bot.command(
    'admin',
    asyncBotHandler(async (ctx) => {
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(ADMIN_PANEL_SCENE_ID);
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
    MAIN_MENU_ACTION.PROFILE,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
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
      const user = await getOrCreateUser(ctx);
      if (!user.email) {
        if (ctx.scene.current) {
          await ctx.scene.leave();
        }
        await ctx.scene.enter(PROFILE_EMAIL_ADD_SCENE_ID);
        return;
      }
      await sendProfileFeatureStub(ctx, getEmailProfileActionTitle(user));
    }),
  );

  bot.action(
    PROFILE_ACTION.VERIFY_EMAIL,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(PROFILE_EMAIL_VERIFY_SCENE_ID);
    }),
  );

  bot.action(
    PROFILE_ACTION.EDIT_PHONE,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      const user = await getOrCreateUser(ctx);
      await sendProfileFeatureStub(ctx, getPhoneProfileActionTitle(user));
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
      const user = await getOrCreateUser(ctx);
      const bookingStatus = await getProfileBookingStatus(user.id);
      await sendProfileBookingStatus(ctx, bookingStatus);
    }),
  );

  bot.action(
    PROFILE_ACTION.BOOKING_STATUS_VIEW_ALL,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      const user = await getOrCreateUser(ctx);
      const bookingStatus = await getProfileBookingStatus(user.id, 20);
      await sendProfileBookingHistory(ctx, bookingStatus);
    }),
  );

  bot.action(
    PROFILE_ACTION.BOOKING_STATUS_CREATE,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(BOOKING_SCENE_ID);
    }),
  );

  bot.action(
    PROFILE_BOOKING_OPEN_ITEM_ACTION_REGEX,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      const { item } = await findBookingForProfileAction(ctx, PROFILE_BOOKING_OPEN_ITEM_ACTION_REGEX);
      if (!item) return;

      await sendSelectedBookingDetails(ctx, item);
    }),
  );

  bot.action(
    PROFILE_BOOKING_RESCHEDULE_ACTION_REGEX,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      const { item } = await findBookingForProfileAction(ctx, PROFILE_BOOKING_RESCHEDULE_ACTION_REGEX);
      if (!item) return;

      if (ctx.scene.current) {
        await ctx.scene.leave();
      }

      await ctx.reply(
        '🔄 Перенесення запису\n\n' +
          `Обраний запис: ${item.serviceName} (${item.startAt.toLocaleString('uk-UA')}).\n` +
          'Оберіть нову дату та час у сценарії бронювання.',
      );
      await ctx.scene.enter(BOOKING_SCENE_ID);
    }),
  );

  bot.action(
    PROFILE_BOOKING_CANCEL_ACTION_REGEX,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      const { item } = await findBookingForProfileAction(ctx, PROFILE_BOOKING_CANCEL_ACTION_REGEX);
      if (!item) return;

      await sendCancelBookingConfirm(ctx, item);
    }),
  );

  bot.action(
    PROFILE_BOOKING_CANCEL_CONFIRM_ACTION_REGEX,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      const { userId, userEmail, userFirstName, item } = await findBookingForProfileAction(
        ctx,
        PROFILE_BOOKING_CANCEL_CONFIRM_ACTION_REGEX,
      );
      if (!item) return;

      await cancelProfileBookingById(userId, item.appointmentId);
      if (userEmail) {
        await sendClientBookingCancelledEmail({
          to: userEmail,
          recipientName: userFirstName,
          bookingId: item.appointmentId,
          studioName: item.studioName,
          serviceName: item.serviceName,
          masterName: item.masterName,
          startAt: item.startAt,
          cancelReason: 'Скасовано через Telegram-бота',
        });
      }
      await sendCancelBookingSuccess(ctx, item);
    }),
  );

  bot.action(
    PROFILE_ACTION.NOTIFICATION_SETTINGS,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(PROFILE_NOTIFICATION_SETTINGS_SCENE_ID);
    }),
  );

  bot.hears(
    CLIENT_MAIN_MENU_BUTTON.SERVICES,
    asyncBotHandler(async (ctx) => {
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(SERVICES_SCENE_ID);
    }),
  );

  bot.action(
    MAIN_MENU_ACTION.SERVICES,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(SERVICES_SCENE_ID);
    }),
  );

  bot.hears(
    CLIENT_MAIN_MENU_BUTTON.MASTERS,
    asyncBotHandler(async (ctx) => {
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(MASTERS_SCENE_ID);
    }),
  );

  bot.action(
    MAIN_MENU_ACTION.MASTERS,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(MASTERS_SCENE_ID);
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

  bot.action(
    MAIN_MENU_ACTION.BOOKING,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(BOOKING_SCENE_ID);
    }),
  );

  bot.hears(
    CLIENT_MAIN_MENU_BUTTON.FAQ,
    asyncBotHandler(async (ctx) => {
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(FAQ_SCENE_ID);
    }),
  );

  bot.action(
    MAIN_MENU_ACTION.FAQ,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(FAQ_SCENE_ID);
    }),
  );

  bot.action(
    MAIN_MENU_ACTION.MASTER_PANEL,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(MASTER_PANEL_SCENE_ID);
    }),
  );

  bot.hears(
    CLIENT_MAIN_MENU_BUTTON.ADMIN_PANEL,
    asyncBotHandler(async (ctx) => {
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(ADMIN_PANEL_SCENE_ID);
    }),
  );

  bot.action(
    MAIN_MENU_ACTION.ADMIN_PANEL,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(ADMIN_PANEL_SCENE_ID);
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
