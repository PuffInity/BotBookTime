import { Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import { PROFILE_ACTION } from '../../types/bot-profile.types.js';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import {
  getOrCreateUser,
  updateUserNameByTelegramId,
} from '../../helpers/db/db-profile.helper.js';
import {
  isNameChangeBlocked,
  isNameChangeCooldownActive,
  setNameChangeBlocked,
  setNameChangeCooldown,
} from '../../helpers/redis/profile-name.redis.helper.js';
import {
  sendProfileCard,
  sendProfileNameBlockedMessage,
  sendProfileNameCancelledMessage,
  sendProfileNameCooldownMessage,
  sendProfileNamePrompt,
  sendProfileNameUpdatedMessage,
  sendProfileNameValidationError,
} from '../../helpers/bot/profile-view.bot.js';
import { bookingClientNameSchema } from '../../validator/booking-input.schema.js';
import { resolveBotUiLanguage } from '../../helpers/bot/i18n.bot.js';
import type { BotUiLanguage } from '../../helpers/bot/i18n.bot.js';

/**
 * @file profile-name.scene.ts
 * @summary Scene for "change first name" flow in profile settings.
 */

export const PROFILE_NAME_SCENE_ID = 'profile-name-scene';

const MAX_INVALID_NAME_ATTEMPTS = 3;

type ProfileNameSceneState = {
  invalidAttempts: number;
  language: BotUiLanguage;
};

function getSceneState(ctx: MyContext): ProfileNameSceneState {
  return ctx.wizard.state as ProfileNameSceneState;
}

function getMessageText(ctx: MyContext): string | null {
  if (!ctx.message) return null;
  if (!('text' in ctx.message)) return null;
  return ctx.message.text.trim();
}

async function sendFreshProfileCard(ctx: MyContext): Promise<void> {
  const user = await getOrCreateUser(ctx);
  await sendProfileCard(ctx, user);
}

export function createProfileNameScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    PROFILE_NAME_SCENE_ID,
    async (ctx) => {
      const telegramId = ctx.from?.id;
      const state = getSceneState(ctx);
      if (!telegramId) {
        await sendProfileNameBlockedMessage(ctx);
        await ctx.scene.leave();
        return;
      }

      const user = await getOrCreateUser(ctx);
      state.language = resolveBotUiLanguage(user.preferredLanguage);

      if (await isNameChangeBlocked(telegramId)) {
        await sendProfileNameBlockedMessage(ctx, state.language);
        await ctx.scene.leave();
        return;
      }

      if (await isNameChangeCooldownActive(telegramId)) {
        await sendProfileNameCooldownMessage(ctx, state.language);
        await ctx.scene.leave();
        return;
      }

      state.invalidAttempts = 0;

      await sendProfileNamePrompt(ctx, state.language);
      return ctx.wizard.next();
    },
    async (ctx) => {
      const telegramId = ctx.from?.id;
      const state = getSceneState(ctx);
      if (!telegramId) {
        await sendProfileNameBlockedMessage(ctx, state.language ?? 'uk');
        await ctx.scene.leave();
        return;
      }

      const text = getMessageText(ctx);
      if (!text) {
        await sendProfileNameValidationError(ctx, state.language);
        return;
      }

      const parsedName = bookingClientNameSchema.safeParse(text);
      if (!parsedName.success) {
        state.invalidAttempts += 1;

        if (state.invalidAttempts >= MAX_INVALID_NAME_ATTEMPTS) {
          await setNameChangeBlocked(telegramId);
          await sendProfileNameBlockedMessage(ctx, state.language);
          await ctx.scene.leave();
          return;
        }

        await sendProfileNameValidationError(ctx, state.language);
        return;
      }

      const updatedUser = await updateUserNameByTelegramId({
        telegramId,
        firstName: parsedName.data,
      });

      await setNameChangeCooldown(telegramId);
      await sendProfileNameUpdatedMessage(ctx, updatedUser.firstName, state.language);
      await ctx.scene.leave();
      return;
    },
  );

  scene.action(PROFILE_ACTION.EDIT_NAME_CANCEL, async (ctx) => {
    const state = getSceneState(ctx);
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await sendProfileNameCancelledMessage(ctx, state.language);
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
