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

/**
 * @file profile-name.scene.ts
 * @summary Scene for "change first name" flow in profile settings.
 */

export const PROFILE_NAME_SCENE_ID = 'profile-name-scene';

const MAX_INVALID_NAME_ATTEMPTS = 3;

type ProfileNameSceneState = {
  invalidAttempts: number;
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
      if (!telegramId) {
        await sendProfileNameBlockedMessage(ctx);
        await ctx.scene.leave();
        return;
      }

      if (await isNameChangeBlocked(telegramId)) {
        await sendProfileNameBlockedMessage(ctx);
        await ctx.scene.leave();
        return;
      }

      if (await isNameChangeCooldownActive(telegramId)) {
        await sendProfileNameCooldownMessage(ctx);
        await ctx.scene.leave();
        return;
      }

      const state = getSceneState(ctx);
      state.invalidAttempts = 0;

      await sendProfileNamePrompt(ctx);
      return ctx.wizard.next();
    },
    async (ctx) => {
      const telegramId = ctx.from?.id;
      if (!telegramId) {
        await sendProfileNameBlockedMessage(ctx);
        await ctx.scene.leave();
        return;
      }

      const text = getMessageText(ctx);
      if (!text) {
        await sendProfileNameValidationError(ctx);
        return;
      }

      const parsedName = bookingClientNameSchema.safeParse(text);
      if (!parsedName.success) {
        const state = getSceneState(ctx);
        state.invalidAttempts += 1;

        if (state.invalidAttempts >= MAX_INVALID_NAME_ATTEMPTS) {
          await setNameChangeBlocked(telegramId);
          await sendProfileNameBlockedMessage(ctx);
          await ctx.scene.leave();
          return;
        }

        await sendProfileNameValidationError(ctx);
        return;
      }

      const updatedUser = await updateUserNameByTelegramId({
        telegramId,
        firstName: parsedName.data,
      });

      await setNameChangeCooldown(telegramId);
      await sendProfileNameUpdatedMessage(ctx, updatedUser.firstName);
      await ctx.scene.leave();
      return;
    },
  );

  scene.action(PROFILE_ACTION.EDIT_NAME_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await sendProfileNameCancelledMessage(ctx);
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
