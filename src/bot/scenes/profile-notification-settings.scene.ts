import { Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import type { NotificationType } from '../../types/db/dbEnums.type.js';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import { PROFILE_ACTION } from '../../types/bot-profile.types.js';
import type { BotUiLanguage } from '../../helpers/bot/i18n.bot.js';
import { resolveBotUiLanguage } from '../../helpers/bot/i18n.bot.js';
import {
  NOTIFICATION_SETTINGS_ACTION,
  NOTIFICATION_SETTINGS_TOGGLE_ACTION_REGEX,
} from '../../types/bot-notification-settings.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import { getOrCreateUser } from '../../helpers/db/db-profile.helper.js';
import {
  getUserNotificationSettingsState,
  setAllUserNotificationSettings,
  upsertUserNotificationSetting,
} from '../../helpers/db/db-notification-settings.helper.js';
import {
  createNotificationSettingsKeyboard,
  formatNotificationSettingsText,
  notificationSettingsUpdatedText,
} from '../../helpers/bot/profile-notification-view.bot.js';
import { sendProfileCard } from '../../helpers/bot/profile-view.bot.js';

/**
 * @file profile-notification-settings.scene.ts
 * @summary Scene для керування налаштуваннями сповіщень користувача у профілі.
 */

// uk: Flow/UI константа PROFILE_NOTIFICATION_SETTINGS_SCENE_ID / en: Flow/UI constant PROFILE_NOTIFICATION_SETTINGS_SCENE_ID / cz: Flow/UI konstanta PROFILE_NOTIFICATION_SETTINGS_SCENE_ID
export const PROFILE_NOTIFICATION_SETTINGS_SCENE_ID = 'profile-notification-settings-scene';

type ProfileNotificationSettingsSceneState = {
  userId: string | null;
  language: BotUiLanguage;
};

/**
 * uk: Внутрішня flow-функція getSceneState.
 * en: Internal flow function getSceneState.
 * cz: Interní flow funkce getSceneState.
 */
function getSceneState(ctx: MyContext): ProfileNotificationSettingsSceneState {
  return ctx.wizard.state as ProfileNotificationSettingsSceneState;
}

/**
 * uk: Внутрішня flow-функція getMessageText.
 * en: Internal flow function getMessageText.
 * cz: Interní flow funkce getMessageText.
 */
function getMessageText(ctx: MyContext): string | null {
  if (!ctx.message) return null;
  if (!('text' in ctx.message)) return null;
  return ctx.message.text.trim();
}

/**
 * uk: Внутрішня flow-функція renderSettingsView.
 * en: Internal flow function renderSettingsView.
 * cz: Interní flow funkce renderSettingsView.
 */
async function renderSettingsView(
  ctx: MyContext,
  userId: string,
  language: BotUiLanguage,
  preferEdit: boolean,
): Promise<void> {
  const settings = await getUserNotificationSettingsState(userId);
  const text = formatNotificationSettingsText(settings, language);
  const keyboard = createNotificationSettingsKeyboard(settings, language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // Якщо редагування старого повідомлення не вдалось, відправляємо нове.
    }
  }

  await ctx.reply(text, keyboard);
}

/**
 * uk: Внутрішня flow-функція sendFreshProfileCard.
 * en: Internal flow function sendFreshProfileCard.
 * cz: Interní flow funkce sendFreshProfileCard.
 */
async function sendFreshProfileCard(ctx: MyContext): Promise<void> {
  const user = await getOrCreateUser(ctx);
  await sendProfileCard(ctx, user);
}

/**
 * uk: Публічна flow-функція createProfileNotificationSettingsScene.
 * en: Public flow function createProfileNotificationSettingsScene.
 * cz: Veřejná flow funkce createProfileNotificationSettingsScene.
 */
export function createProfileNotificationSettingsScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    PROFILE_NOTIFICATION_SETTINGS_SCENE_ID,
    async (ctx) => {
      const user = await getOrCreateUser(ctx);
      const state = getSceneState(ctx);
      state.userId = user.id;
      state.language = resolveBotUiLanguage(user.preferredLanguage);

      await renderSettingsView(ctx, user.id, state.language, false);
      return ctx.wizard.next();
    },
    async (ctx) => {
      // Сцена працює через inline callback-и. На текст просто перевідмальовуємо поточний стан.
      if (!getMessageText(ctx)) {
        return;
      }

      const state = getSceneState(ctx);
      if (!state.userId) {
        const user = await getOrCreateUser(ctx);
        state.userId = user.id;
        state.language = resolveBotUiLanguage(user.preferredLanguage);
      }

      await renderSettingsView(ctx, state.userId, state.language, false);
    },
  );

  scene.action(NOTIFICATION_SETTINGS_TOGGLE_ACTION_REGEX, async (ctx) => {
    const state = getSceneState(ctx);
    if (!state.userId) {
      const user = await getOrCreateUser(ctx);
      state.userId = user.id;
      state.language = resolveBotUiLanguage(user.preferredLanguage);
    }

    const matches = ctx.match as RegExpExecArray | string[];
    const notificationType = String(matches[1]) as NotificationType;

    const currentSettings = await getUserNotificationSettingsState(state.userId);
    const currentEnabled = currentSettings[notificationType] ?? true;

    await upsertUserNotificationSetting({
      userId: state.userId,
      notificationType,
      enabled: !currentEnabled,
    });

    await ctx.answerCbQuery(notificationSettingsUpdatedText(state.language));
    await renderSettingsView(ctx, state.userId, state.language, true);
  });

  scene.action(NOTIFICATION_SETTINGS_ACTION.TOGGLE_ALL_ON, async (ctx) => {
    const state = getSceneState(ctx);
    if (!state.userId) {
      const user = await getOrCreateUser(ctx);
      state.userId = user.id;
      state.language = resolveBotUiLanguage(user.preferredLanguage);
    }

    await setAllUserNotificationSettings({
      userId: state.userId,
      enabled: true,
    });

    await ctx.answerCbQuery(notificationSettingsUpdatedText(state.language));
    await renderSettingsView(ctx, state.userId, state.language, true);
  });

  scene.action(NOTIFICATION_SETTINGS_ACTION.TOGGLE_ALL_OFF, async (ctx) => {
    const state = getSceneState(ctx);
    if (!state.userId) {
      const user = await getOrCreateUser(ctx);
      state.userId = user.id;
      state.language = resolveBotUiLanguage(user.preferredLanguage);
    }

    await setAllUserNotificationSettings({
      userId: state.userId,
      enabled: false,
    });

    await ctx.answerCbQuery(notificationSettingsUpdatedText(state.language));
    await renderSettingsView(ctx, state.userId, state.language, true);
  });

  scene.action(NOTIFICATION_SETTINGS_ACTION.BACK_TO_PROFILE, async (ctx) => {
    await ctx.answerCbQuery();
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
