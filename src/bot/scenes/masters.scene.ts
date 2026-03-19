import { Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import { MASTERS_ACTION, MASTERS_ITEM_ACTION_REGEX } from '../../types/bot-masters.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import {
  createMasterDetailsKeyboard,
  createMastersCatalogKeyboard,
  formatMasterDetailsText,
  formatMastersCatalogText,
} from '../../helpers/bot/masters-view.bot.js';
import {
  getMasterCatalogDetailsById,
  listActiveMastersCatalog,
} from '../../helpers/db/db-masters.helper.js';
import { getOrCreateUser } from '../../helpers/db/db-profile.helper.js';
import type { MasterCatalogItem } from '../../types/db-helpers/db-masters.types.js';

/**
 * @file masters.scene.ts
 * @summary Scene для перегляду каталогу майстрів і детальної картки майстра.
 */

export const MASTERS_SCENE_ID = 'masters-scene';

type MastersSceneState = {
  studioId: string | null;
};

function getSceneState(ctx: MyContext): MastersSceneState {
  return ctx.wizard.state as MastersSceneState;
}

function getMessageText(ctx: MyContext): string | null {
  if (!ctx.message) return null;
  if (!('text' in ctx.message)) return null;
  return ctx.message.text.trim();
}

async function renderView(
  ctx: MyContext,
  text: string,
  keyboard: ReturnType<typeof createMasterDetailsKeyboard>,
  preferEdit: boolean,
): Promise<void> {
  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // Якщо редагувати повідомлення не вдалося (видалене/застаріле) — надсилаємо нове.
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderCatalog(
  ctx: MyContext,
  masters: MasterCatalogItem[],
  preferEdit: boolean,
): Promise<void> {
  await renderView(
    ctx,
    formatMastersCatalogText(masters),
    createMastersCatalogKeyboard(masters),
    preferEdit,
  );
}

async function loadAndRenderCatalog(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const masters = await listActiveMastersCatalog({ studioId: state.studioId });
  await renderCatalog(ctx, masters, preferEdit);
}

export function createMastersScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    MASTERS_SCENE_ID,
    async (ctx) => {
      const user = await getOrCreateUser(ctx);
      const state = getSceneState(ctx);
      state.studioId = user.studioId;

      await loadAndRenderCatalog(ctx, false);
      return ctx.wizard.next();
    },
    async (ctx) => {
      // У цій сцені очікуємо callback-кнопки. Якщо прийшов текст — мʼяко повертаємо до каталогу.
      if (!getMessageText(ctx)) {
        return;
      }

      await loadAndRenderCatalog(ctx, false);
    },
  );

  scene.action(MASTERS_ITEM_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();

    const matches = ctx.match as RegExpExecArray | string[];
    const masterId = String(matches[1]);
    const state = getSceneState(ctx);
    const details = await getMasterCatalogDetailsById({
      masterId,
      studioId: state.studioId,
    });

    if (!details) {
      await loadAndRenderCatalog(ctx, true);
      return;
    }

    await renderView(
      ctx,
      formatMasterDetailsText(details),
      createMasterDetailsKeyboard(),
      true,
    );
  });

  scene.action(MASTERS_ACTION.BACK_TO_LIST, async (ctx) => {
    await ctx.answerCbQuery();
    await loadAndRenderCatalog(ctx, true);
  });

  scene.action(COMMON_NAV_ACTION.HOME, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await sendClientMainMenu(ctx);
  });

  return scene;
}
