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
import { resolveBotUiLanguage } from '../../helpers/bot/i18n.bot.js';
import type { BotUiLanguage } from '../../helpers/bot/i18n.bot.js';
import { translateMasterCatalogDetails } from '../../helpers/translate/translate-db-content.helper.js';

/**
 * @file masters.scene.ts
 * @summary Scene для перегляду каталогу майстрів і детальної картки майстра.
 */

// uk: Flow/UI константа MASTERS_SCENE_ID / en: Flow/UI constant MASTERS_SCENE_ID / cz: Flow/UI konstanta MASTERS_SCENE_ID
export const MASTERS_SCENE_ID = 'masters-scene';

type MastersSceneState = {
  studioId: string | null;
  language: BotUiLanguage;
};

/**
 * uk: Внутрішня flow-функція getSceneState.
 * en: Internal flow function getSceneState.
 * cz: Interní flow funkce getSceneState.
 */
function getSceneState(ctx: MyContext): MastersSceneState {
  return ctx.wizard.state as MastersSceneState;
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
 * uk: Внутрішня flow-функція renderView.
 * en: Internal flow function renderView.
 * cz: Interní flow funkce renderView.
 */
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

/**
 * uk: Внутрішня flow-функція renderCatalog.
 * en: Internal flow function renderCatalog.
 * cz: Interní flow funkce renderCatalog.
 */
async function renderCatalog(
  ctx: MyContext,
  masters: MasterCatalogItem[],
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  await renderView(
    ctx,
    formatMastersCatalogText(masters, state.language),
    createMastersCatalogKeyboard(masters, state.language),
    preferEdit,
  );
}

/**
 * uk: Внутрішня flow-функція loadAndRenderCatalog.
 * en: Internal flow function loadAndRenderCatalog.
 * cz: Interní flow funkce loadAndRenderCatalog.
 */
async function loadAndRenderCatalog(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const masters = await listActiveMastersCatalog({ studioId: state.studioId });
  await renderCatalog(ctx, masters, preferEdit);
}

/**
 * uk: Публічна flow-функція createMastersScene.
 * en: Public flow function createMastersScene.
 * cz: Veřejná flow funkce createMastersScene.
 */
export function createMastersScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    MASTERS_SCENE_ID,
    async (ctx) => {
      const user = await getOrCreateUser(ctx);
      const state = getSceneState(ctx);
      state.studioId = user.studioId;
      state.language = resolveBotUiLanguage(user.preferredLanguage);

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

    const translatedDetails = await translateMasterCatalogDetails(details, state.language);

    await renderView(
      ctx,
      formatMasterDetailsText(translatedDetails, state.language),
      createMasterDetailsKeyboard(state.language),
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
