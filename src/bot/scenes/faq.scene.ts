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

/**
 * @file faq.scene.ts
 * @summary Scene для перегляду FAQ списку і детальної відповіді.
 */

export const FAQ_SCENE_ID = 'faq-scene';

type FaqSceneState = {
  studioId: string | null;
  language: LanguageCode;
  items: FaqCatalogItem[];
};

function getSceneState(ctx: MyContext): FaqSceneState {
  return ctx.wizard.state as FaqSceneState;
}

function getMessageText(ctx: MyContext): string | null {
  if (!ctx.message) return null;
  if (!('text' in ctx.message)) return null;
  return ctx.message.text.trim();
}

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

async function loadFaqCatalogForState(state: FaqSceneState): Promise<FaqCatalogItem[]> {
  return listFaqCatalog({
    studioId: state.studioId,
    language: state.language,
  });
}

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

    const indexInList = state.items.findIndex((entry) => entry.id === item.id);
    const displayIndex = indexInList >= 0 ? indexInList : item.sortOrder - 1;

    await renderView(
      ctx,
      formatFaqItemText(item, displayIndex, state.language),
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
