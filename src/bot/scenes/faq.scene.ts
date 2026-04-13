import { Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import { FAQ_ACTION, FAQ_ITEM_ACTION_REGEX } from '../../types/bot-faq.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import {
  createFaqCatalogKeyboard,
  createFaqItemKeyboard,
  formatFaqCatalogText,
  formatFaqItemText,
} from '../../helpers/bot/faq-view.bot.js';
import { getOrCreateUser } from '../../helpers/db/db-profile.helper.js';
import { getFaqCatalogItemById, listFaqCatalog } from '../../helpers/db/db-faq.helper.js';
import type { FaqCatalogItem } from '../../types/db-helpers/db-faq.types.js';
import type { LanguageCode } from '../../types/db/index.js';
import { resolveBotUiLanguage } from '../../helpers/bot/i18n.bot.js';
import {
  translateFaqCatalogItem,
  translateFaqCatalogItems,
} from '../../helpers/translate/translate-db-content.helper.js';

/**
 * @file faq.scene.ts
 * @summary Scene для перегляду FAQ списку і детальної відповіді.
 */

// uk: Flow/UI константа FAQ_SCENE_ID / en: Flow/UI constant FAQ_SCENE_ID / cz: Flow/UI konstanta FAQ_SCENE_ID
export const FAQ_SCENE_ID = 'faq-scene';

type FaqSceneState = {
  studioId: string | null;
  language: LanguageCode;
  items: FaqCatalogItem[];
};

/**
 * uk: Внутрішня flow-функція getSceneState.
 * en: Internal flow function getSceneState.
 * cz: Interní flow funkce getSceneState.
 */
function getSceneState(ctx: MyContext): FaqSceneState {
  return ctx.wizard.state as FaqSceneState;
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
  keyboard: ReturnType<typeof createFaqItemKeyboard>,
  preferEdit: boolean,
): Promise<void> {
  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // Якщо редагувати старе повідомлення не вийшло — відправляємо нове.
    }
  }

  await ctx.reply(text, keyboard);
}

/**
 * uk: Внутрішня flow-функція loadFaqCatalogForState.
 * en: Internal flow function loadFaqCatalogForState.
 * cz: Interní flow funkce loadFaqCatalogForState.
 */
async function loadFaqCatalogForState(state: FaqSceneState): Promise<FaqCatalogItem[]> {
  const items = await listFaqCatalog({
    studioId: state.studioId,
    language: state.language,
  });

  return translateFaqCatalogItems(items, state.language);
}

/**
 * uk: Внутрішня flow-функція renderCatalog.
 * en: Internal flow function renderCatalog.
 * cz: Interní flow funkce renderCatalog.
 */
async function renderCatalog(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  state.items = await loadFaqCatalogForState(state);

  await renderView(
    ctx,
    formatFaqCatalogText(state.items, state.language),
    createFaqCatalogKeyboard(state.items, state.language),
    preferEdit,
  );
}

/**
 * uk: Публічна flow-функція createFaqScene.
 * en: Public flow function createFaqScene.
 * cz: Veřejná flow funkce createFaqScene.
 */
export function createFaqScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    FAQ_SCENE_ID,
    async (ctx) => {
      const user = await getOrCreateUser(ctx);
      const state = getSceneState(ctx);

      state.studioId = user.studioId;
      state.language = resolveBotUiLanguage(user.preferredLanguage);
      state.items = [];

      await renderCatalog(ctx, false);
      return ctx.wizard.next();
    },
    async (ctx) => {
      // FAQ сцена працює через inline callback-и, тому на текст просто повертаємо каталог.
      if (!getMessageText(ctx)) {
        return;
      }

      await renderCatalog(ctx, false);
    },
  );

  scene.action(FAQ_ITEM_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();

    const matches = ctx.match as RegExpExecArray | string[];
    const faqId = String(matches[1]);
    const state = getSceneState(ctx);

    let item = state.items.find((entry) => entry.id === faqId) ?? null;
    if (!item) {
      item = await getFaqCatalogItemById({
        faqId,
        studioId: state.studioId,
        language: state.language,
      });
    }

    if (!item) {
      await renderCatalog(ctx, true);
      return;
    }

    const translatedItem = await translateFaqCatalogItem(item, state.language);

    const indexInList = state.items.findIndex((entry) => entry.id === item.id);
    const displayIndex = indexInList >= 0 ? indexInList : item.sortOrder - 1;

    await renderView(
      ctx,
      formatFaqItemText(translatedItem, displayIndex, state.language),
      createFaqItemKeyboard(state.language),
      true,
    );
  });

  scene.action(FAQ_ACTION.BACK_TO_LIST, async (ctx) => {
    await ctx.answerCbQuery();
    await renderCatalog(ctx, true);
  });

  scene.action(COMMON_NAV_ACTION.HOME, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await sendClientMainMenu(ctx);
  });

  return scene;
}
