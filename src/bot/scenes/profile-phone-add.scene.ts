import { Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import { PROFILE_ACTION } from '../../types/bot-profile.types.js';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import {
  sendProfileCard,
  sendProfilePhoneAddedMessage,
  sendProfilePhoneAddCancelledMessage,
  sendProfilePhoneAddPrompt,
  sendProfilePhoneAlreadyUsedError,
  sendProfilePhoneValidationError,
} from '../../helpers/bot/profile-view.bot.js';
import { getOrCreateUser, updateUserPhoneByTelegramId } from '../../helpers/db/db-profile.helper.js';
import { bookingClientPhoneSchema } from '../../validator/booking-input.schema.js';
import { resolveBotUiLanguage } from '../../helpers/bot/i18n.bot.js';
import type { BotUiLanguage } from '../../helpers/bot/i18n.bot.js';

/**
 * @file profile-phone-add.scene.ts
 * @summary Scene for "add/change phone" flow in profile settings.
 */

export const PROFILE_PHONE_ADD_SCENE_ID = 'profile-phone-add-scene';

type ProfilePhoneAddSceneState = {
  language: BotUiLanguage;
};

function getSceneState(ctx: MyContext): ProfilePhoneAddSceneState {
  return ctx.wizard.state as ProfilePhoneAddSceneState;
}

function getMessageText(ctx: MyContext): string | null {
  if (!ctx.message) return null;
  if (!('text' in ctx.message)) return null;
  return ctx.message.text.trim();
}

function isUniqueViolationError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  return (error as { code?: unknown }).code === '23505';
}

async function sendFreshProfileCard(ctx: MyContext): Promise<void> {
  const user = await getOrCreateUser(ctx);
  await sendProfileCard(ctx, user);
}

export function createProfilePhoneAddScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    PROFILE_PHONE_ADD_SCENE_ID,
    async (ctx) => {
      const user = await getOrCreateUser(ctx);
      const state = getSceneState(ctx);
      state.language = resolveBotUiLanguage(user.preferredLanguage);

      await sendProfilePhoneAddPrompt(ctx, state.language);
      return ctx.wizard.next();
    },
    async (ctx) => {
      const state = getSceneState(ctx);
      const telegramId = ctx.from?.id;
      if (!telegramId) {
        await sendProfilePhoneValidationError(ctx, state.language ?? 'uk');
        return;
      }

      const text = getMessageText(ctx);
      if (!text) {
        await sendProfilePhoneValidationError(ctx, state.language);
        return;
      }

      const parsed = bookingClientPhoneSchema.safeParse(text);
      if (!parsed.success) {
        await sendProfilePhoneValidationError(ctx, state.language);
        return;
      }

      try {
        const updatedUser = await updateUserPhoneByTelegramId({
          telegramId,
          phone: parsed.data,
        });
        await sendProfilePhoneAddedMessage(ctx, updatedUser.phoneE164 ?? parsed.data, state.language);
        await ctx.scene.leave();
        await sendFreshProfileCard(ctx);
      } catch (error) {
        if (isUniqueViolationError(error)) {
          await sendProfilePhoneAlreadyUsedError(ctx, state.language);
          return;
        }
        throw error;
      }
    },
  );

  scene.action(PROFILE_ACTION.ADD_PHONE_CANCEL, async (ctx) => {
    const state = getSceneState(ctx);
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await sendProfilePhoneAddCancelledMessage(ctx, state.language);
    await sendFreshProfileCard(ctx);
  });

  scene.action(PROFILE_ACTION.OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await sendFreshProfileCard(ctx);
  });

  scene.action(COMMON_NAV_ACTION.HOME, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await sendClientMainMenu(ctx);
  });

  return scene;
}
