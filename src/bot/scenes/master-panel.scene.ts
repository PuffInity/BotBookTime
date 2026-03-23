import { Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import type { MasterPanelAccess } from '../../types/db-helpers/db-master-panel.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import {
  createMasterPanelRootKeyboard,
  createMasterPanelSectionStubKeyboard,
  formatMasterPanelRootText,
  formatMasterPanelSectionStubText,
} from '../../helpers/bot/master-panel-view.bot.js';
import { MASTER_PANEL_ACTION } from '../../types/bot-master-panel.types.js';
import { getMasterPanelAccessByTelegramId } from '../../helpers/db/db-master-panel.helper.js';

/**
 * @file master-panel.scene.ts
 * @summary Skeleton сцена панелі майстра (блок 1): доступ + базова навігація.
 */

export const MASTER_PANEL_SCENE_ID = 'master-panel-scene';

type MasterPanelSceneState = {
  access: MasterPanelAccess | null;
};

function getSceneState(ctx: MyContext): MasterPanelSceneState {
  return ctx.wizard.state as MasterPanelSceneState;
}

function getMessageText(ctx: MyContext): string | null {
  if (!ctx.message) return null;
  if (!('text' in ctx.message)) return null;
  return ctx.message.text.trim();
}

async function renderView(
  ctx: MyContext,
  text: string,
  keyboard: ReturnType<typeof createMasterPanelSectionStubKeyboard>,
  preferEdit: boolean,
): Promise<void> {
  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // Якщо редагування не вдалося (старе/видалене повідомлення), шлемо нове.
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderRoot(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  if (!state.access) {
    return;
  }

  await renderView(
    ctx,
    formatMasterPanelRootText(state.access),
    createMasterPanelRootKeyboard(),
    preferEdit,
  );
}

async function renderSectionStub(ctx: MyContext, title: string): Promise<void> {
  await renderView(
    ctx,
    formatMasterPanelSectionStubText(title),
    createMasterPanelSectionStubKeyboard(),
    true,
  );
}

async function denyMasterPanelAccess(ctx: MyContext): Promise<void> {
  await ctx.reply(
    '🔒 Панель майстра недоступна для цього профілю.\n\n' +
      'Якщо доступ має бути відкритий, зверніться до адміністратора салону.',
  );
  await sendClientMainMenu(ctx);
}

export function createMasterPanelScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    MASTER_PANEL_SCENE_ID,
    async (ctx) => {
      const state = getSceneState(ctx);
      state.access = null;

      if (!ctx.from?.id) {
        await denyMasterPanelAccess(ctx);
        await ctx.scene.leave();
        return;
      }

      const access = await getMasterPanelAccessByTelegramId(ctx.from.id);
      if (!access) {
        await denyMasterPanelAccess(ctx);
        await ctx.scene.leave();
        return;
      }

      state.access = access;
      await renderRoot(ctx, false);
      return ctx.wizard.next();
    },
    async (ctx) => {
      if (!getMessageText(ctx)) {
        return;
      }

      await renderRoot(ctx, false);
    },
  );

  scene.action(MASTER_PANEL_ACTION.OPEN_PROFILE, async (ctx) => {
    await ctx.answerCbQuery();
    await renderSectionStub(ctx, '👤 Мій профіль');
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_BOOKINGS, async (ctx) => {
    await ctx.answerCbQuery();
    await renderSectionStub(ctx, '📅 Мої записи');
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_SCHEDULE, async (ctx) => {
    await ctx.answerCbQuery();
    await renderSectionStub(ctx, '🕒 Мій розклад');
  });

  scene.action(MASTER_PANEL_ACTION.OPEN_STATS, async (ctx) => {
    await ctx.answerCbQuery();
    await renderSectionStub(ctx, '📊 Моя статистика');
  });

  scene.action(MASTER_PANEL_ACTION.BACK_TO_PANEL, async (ctx) => {
    await ctx.answerCbQuery();
    await renderRoot(ctx, true);
  });

  scene.action(MASTER_PANEL_ACTION.HOME, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await sendClientMainMenu(ctx);
  });

  return scene;
}

