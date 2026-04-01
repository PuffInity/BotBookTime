import { Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import type { LanguageCode } from '../../types/db/dbEnums.type.js';
import {
  PROFILE_ACTION,
  PROFILE_EDIT_LANGUAGE_SELECT_ACTION_REGEX,
} from '../../types/bot-profile.types.js';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import {
  createProfileLanguageKeyboard,
  formatProfileLanguagePromptText,
  sendProfileCard,
  sendProfileLanguageUpdatedMessage,
} from '../../helpers/bot/profile-view.bot.js';
import { canUseLanguageActions, isSelectableLanguage } from '../../helpers/bot/language-feature.bot.js';
import { getOrCreateUser, updateUserLanguageByTelegramId } from '../../helpers/db/db-profile.helper.js';
import { resolveBotUiLanguage } from '../../helpers/bot/i18n.bot.js';
import type { BotUiLanguage } from '../../helpers/bot/i18n.bot.js';

/**
 * @file profile-language.scene.ts
 * @summary Scene for profile language selection flow.
 */

export const PROFILE_LANGUAGE_SCENE_ID = 'profile-language-scene';

type ProfileLanguageSceneState = {
  language: BotUiLanguage;
};

function getSceneState(ctx: MyContext): ProfileLanguageSceneState {
  return ctx.wizard.state as ProfileLanguageSceneState;
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

async function renderLanguagePrompt(
  ctx: MyContext,
  currentLanguage: LanguageCode,
  language: BotUiLanguage,
): Promise<void> {
  await ctx.reply(
    formatProfileLanguagePromptText(currentLanguage, language),
    createProfileLanguageKeyboard(currentLanguage, language),
  );
}

export function createProfileLanguageScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    PROFILE_LANGUAGE_SCENE_ID,
    async (ctx) => {
      if (!canUseLanguageActions()) {
        await ctx.scene.leave();
        return;
      }

      const state = getSceneState(ctx);
      const user = await getOrCreateUser(ctx);
      state.language = resolveBotUiLanguage(user.preferredLanguage);
      await renderLanguagePrompt(ctx, user.preferredLanguage, state.language);
      return ctx.wizard.next();
    },
    async (ctx) => {
      if (!getMessageText(ctx)) {
        return;
      }

      const state = getSceneState(ctx);
      const user = await getOrCreateUser(ctx);
      state.language = resolveBotUiLanguage(user.preferredLanguage);
      await renderLanguagePrompt(ctx, user.preferredLanguage, state.language);
    },
  );

  scene.action(PROFILE_EDIT_LANGUAGE_SELECT_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();

    if (!canUseLanguageActions()) {
      await ctx.scene.leave();
      return;
    }

    const matches = ctx.match as RegExpExecArray | string[];
    const selectedLanguage = matches[1] as LanguageCode;
    if (!isSelectableLanguage(selectedLanguage)) {
      await ctx.scene.leave();
      return;
    }

    const telegramId = ctx.from?.id;
    if (!telegramId) {
      await ctx.scene.leave();
      return;
    }

    const updatedUser = await updateUserLanguageByTelegramId({
      telegramId,
      language: selectedLanguage,
    });

    getSceneState(ctx).language = resolveBotUiLanguage(updatedUser.preferredLanguage);
    await sendProfileLanguageUpdatedMessage(ctx, updatedUser.preferredLanguage);
    await ctx.scene.leave();
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
