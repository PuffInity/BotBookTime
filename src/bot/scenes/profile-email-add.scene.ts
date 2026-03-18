import { Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import { PROFILE_ACTION } from '../../types/bot-profile.types.js';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import {
  sendProfileCard,
  sendProfileEmailAddedMessage,
  sendProfileEmailAddCancelledMessage,
  sendProfileEmailAddPrompt,
  sendProfileEmailAlreadyUsedError,
  sendProfileEmailValidationError,
} from '../../helpers/bot/profile-view.bot.js';
import { getOrCreateUser, updateUserEmailByTelegramId } from '../../helpers/db/db-profile.helper.js';
import { profileEmailSchema } from '../../validator/bot-input.schema.js';

/**
 * @file profile-email-add.scene.ts
 * @summary Scene for "add email" flow in profile settings.
 */

export const PROFILE_EMAIL_ADD_SCENE_ID = 'profile-email-add-scene';

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

export function createProfileEmailAddScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    PROFILE_EMAIL_ADD_SCENE_ID,
    async (ctx) => {
      await sendProfileEmailAddPrompt(ctx);
      return ctx.wizard.next();
    },
    async (ctx) => {
      const telegramId = ctx.from?.id;
      if (!telegramId) {
        await sendProfileEmailValidationError(ctx);
        return;
      }

      const text = getMessageText(ctx);
      if (!text) {
        await sendProfileEmailValidationError(ctx);
        return;
      }

      const parsed = profileEmailSchema.safeParse(text);
      if (!parsed.success) {
        await sendProfileEmailValidationError(ctx);
        return;
      }

      try {
        const updatedUser = await updateUserEmailByTelegramId({
          telegramId,
          email: parsed.data,
        });
        await sendProfileEmailAddedMessage(ctx, updatedUser.email ?? parsed.data);
        await ctx.scene.leave();
        await sendFreshProfileCard(ctx);
      } catch (error) {
        if (isUniqueViolationError(error)) {
          await sendProfileEmailAlreadyUsedError(ctx);
          return;
        }
        throw error;
      }
    },
  );

  scene.action(PROFILE_ACTION.ADD_EMAIL_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await sendProfileEmailAddCancelledMessage(ctx);
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

