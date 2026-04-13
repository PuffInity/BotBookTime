import { BOOKING_SCENE_ID } from '../scenes/booking.scene.js';
import { PROFILE_NAME_SCENE_ID } from '../scenes/profile-name.scene.js';
import { PROFILE_LANGUAGE_SCENE_ID } from '../scenes/profile-language.scene.js';
import { PROFILE_EMAIL_VERIFY_SCENE_ID } from '../scenes/profile-email-verify.scene.js';
import { PROFILE_EMAIL_ADD_SCENE_ID } from '../scenes/profile-email-add.scene.js';
import { PROFILE_PHONE_ADD_SCENE_ID } from '../scenes/profile-phone-add.scene.js';
import { PROFILE_PHONE_VERIFY_SCENE_ID } from '../scenes/profile-phone-verify.scene.js';
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
import { canUseLanguageActions } from '../../helpers/bot/language-feature.bot.js';
import {
  sendProfileCard,
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
import { resolveBotUiLanguage, tBot, tBotTemplate } from '../../helpers/bot/i18n.bot.js';
import type { BotUiLanguage } from '../../helpers/bot/i18n.bot.js';
import { translateProfileBookingStatusData } from '../../helpers/translate/translate-db-content.helper.js';
import { isTwilioConfigured } from '../../config/twilio.config.js';

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
  /**
   * uk: Внутрішня flow-функція getActionIdFromCallbackData.
   * en: Internal flow function getActionIdFromCallbackData.
   * cz: Interní flow funkce getActionIdFromCallbackData.
   */
  function getActionIdFromCallbackData(
    ctx: MyContext,
    regex: RegExp,
    language: BotUiLanguage,
  ): string {
    const callbackData =
      ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const matches = callbackData.match(regex);

    if (!matches?.[1]) {
      throw new ValidationError(tBot(language, 'MAIN_PANEL_MSG_INVALID_BOOKING_STATUS_CALLBACK'));
    }

    return matches[1];
  }

  /**
   * uk: Внутрішня flow-функція findBookingForProfileAction.
   * en: Internal flow function findBookingForProfileAction.
   * cz: Interní flow funkce findBookingForProfileAction.
   */
  async function findBookingForProfileAction(
    ctx: MyContext,
    regex: RegExp,
  ): Promise<{
    userId: string;
    userEmail: string | null;
    userFirstName: string;
    language: 'uk' | 'en' | 'cs';
    item: ProfileBookingStatusItem | null;
  }> {
    const user = await getOrCreateUser(ctx);
    const language = resolveBotUiLanguage(user.preferredLanguage);
    const appointmentId = getActionIdFromCallbackData(ctx, regex, language);
    const bookingStatusRaw = await getProfileBookingStatus(user.id, 20);
    const bookingStatus = await translateProfileBookingStatusData(bookingStatusRaw, language);
    const available = [bookingStatus.upcoming, ...getHistoryItems(bookingStatus)].filter(
      (item): item is ProfileBookingStatusItem => Boolean(item),
    );
    const selected = available.find((item) => item.appointmentId === appointmentId) ?? null;

    if (!selected) {
      await sendProfileBookingActionStub(ctx, tBot(language, 'PROFILE_BOOKING_NOT_FOUND'), language);
      return {
        userId: user.id,
        userEmail: user.email,
        userFirstName: user.firstName,
        language,
        item: null,
      };
    }

    return {
      userId: user.id,
      userEmail: user.email,
      userFirstName: user.firstName,
      language,
      item: selected,
    };
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
      const user = await getOrCreateUser(ctx);
      const language = resolveBotUiLanguage(user.preferredLanguage);
      await ctx.reply(tBot(language, 'HELP_TEXT'));
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
        const user = await getOrCreateUser(ctx);
        const language = resolveBotUiLanguage(user.preferredLanguage);
        await ctx.reply(tBot(language, 'NO_ACTIVE_SCENARIO'));
        return;
      }

      await ctx.scene.leave();
      const user = await getOrCreateUser(ctx);
      const language = resolveBotUiLanguage(user.preferredLanguage);
      await ctx.reply(tBot(language, 'SCENARIO_CANCELLED'));
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

  bot.hears(
    CLIENT_MAIN_MENU_BUTTON.LANGUAGE,
    asyncBotHandler(async (ctx) => {
      if (!canUseLanguageActions()) return;
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(PROFILE_LANGUAGE_SCENE_ID);
    }),
  );

  bot.action(
    MAIN_MENU_ACTION.LANGUAGE,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      if (!canUseLanguageActions()) {
        return;
      }
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(PROFILE_LANGUAGE_SCENE_ID);
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
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(PROFILE_EMAIL_ADD_SCENE_ID);
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
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(PROFILE_PHONE_ADD_SCENE_ID);
    }),
  );

  bot.action(
    PROFILE_ACTION.VERIFY_PHONE,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      const user = await getOrCreateUser(ctx);
      const language = resolveBotUiLanguage(user.preferredLanguage);
      if (!isTwilioConfigured()) {
        await ctx.reply(tBot(language, 'BOT_PHONE_VERIFY_UNAVAILABLE'));
        return;
      }
      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(PROFILE_PHONE_VERIFY_SCENE_ID);
    }),
  );

  bot.action(
    PROFILE_ACTION.EDIT_LANGUAGE,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      if (!canUseLanguageActions()) {
        return;
      }

      if (ctx.scene.current) {
        await ctx.scene.leave();
      }
      await ctx.scene.enter(PROFILE_LANGUAGE_SCENE_ID);
    }),
  );

  bot.action(
    PROFILE_ACTION.BOOKING_STATUS,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      const user = await getOrCreateUser(ctx);
      const language = resolveBotUiLanguage(user.preferredLanguage);
      const bookingStatusRaw = await getProfileBookingStatus(user.id);
      const bookingStatus = await translateProfileBookingStatusData(bookingStatusRaw, language);
      await sendProfileBookingStatus(ctx, bookingStatus, language);
    }),
  );

  bot.action(
    PROFILE_ACTION.BOOKING_STATUS_VIEW_ALL,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      const user = await getOrCreateUser(ctx);
      const language = resolveBotUiLanguage(user.preferredLanguage);
      const bookingStatusRaw = await getProfileBookingStatus(user.id, 20);
      const bookingStatus = await translateProfileBookingStatusData(bookingStatusRaw, language);
      await sendProfileBookingHistory(ctx, bookingStatus, language);
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
      const { item, language } = await findBookingForProfileAction(
        ctx,
        PROFILE_BOOKING_OPEN_ITEM_ACTION_REGEX,
      );
      if (!item) return;

      await sendSelectedBookingDetails(ctx, item, language);
    }),
  );

  bot.action(
    PROFILE_BOOKING_RESCHEDULE_ACTION_REGEX,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      const { item, language } = await findBookingForProfileAction(
        ctx,
        PROFILE_BOOKING_RESCHEDULE_ACTION_REGEX,
      );
      if (!item) return;

      if (ctx.scene.current) {
        await ctx.scene.leave();
      }

      await ctx.reply(
        tBotTemplate(language, 'BOOKING_RESCHEDULE_TEXT', {
          serviceName: item.serviceName,
          dateTime: item.startAt.toLocaleString(
            language === 'en' ? 'en-US' : language === 'cs' ? 'cs-CZ' : 'uk-UA',
          ),
        }),
      );
      await ctx.scene.enter(BOOKING_SCENE_ID);
    }),
  );

  bot.action(
    PROFILE_BOOKING_CANCEL_ACTION_REGEX,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      const { item, language } = await findBookingForProfileAction(
        ctx,
        PROFILE_BOOKING_CANCEL_ACTION_REGEX,
      );
      if (!item) return;

      await sendCancelBookingConfirm(ctx, item, language);
    }),
  );

  bot.action(
    PROFILE_BOOKING_CANCEL_CONFIRM_ACTION_REGEX,
    asyncBotHandler(async (ctx) => {
      await ctx.answerCbQuery();
      const { userId, userEmail, userFirstName, language, item } = await findBookingForProfileAction(
        ctx,
        PROFILE_BOOKING_CANCEL_CONFIRM_ACTION_REGEX,
      );
      if (!item) return;

      await cancelProfileBookingById(userId, item.appointmentId);
      if (userEmail) {
        await sendClientBookingCancelledEmail({
          to: userEmail,
          language,
          recipientName: userFirstName,
          bookingId: item.appointmentId,
          studioName: item.studioName,
          serviceName: item.serviceName,
          masterName: item.masterName,
          startAt: item.startAt,
          cancelReason: tBot(language, 'BOOKING_CANCEL_REASON_PROFILE'),
        });
      }
      await sendCancelBookingSuccess(ctx, item, language);
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

    const user = await getOrCreateUser(ctx);
    const language = resolveBotUiLanguage(user.preferredLanguage);
    await ctx.reply(tBot(language, 'FALLBACK_USE_MENU'));
  });
}
