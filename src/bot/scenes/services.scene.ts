import { Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import { SERVICES_ACTION, SERVICES_ITEM_ACTION_REGEX } from '../../types/bot-services.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import {
  createServiceDetailsKeyboard,
  createServicesCatalogKeyboard,
  formatServiceDetailsText,
  formatServicesCatalogText,
} from '../../helpers/bot/services-view.bot.js';
import {
  getServiceCatalogDetailsById,
  listActiveServicesCatalog,
} from '../../helpers/db/db-services.helper.js';
import { getOrCreateUser } from '../../helpers/db/db-profile.helper.js';
import type { ServicesCatalogItem } from '../../types/db-helpers/db-services.types.js';
import { resolveBotUiLanguage } from '../../helpers/bot/i18n.bot.js';
import type { BotUiLanguage } from '../../helpers/bot/i18n.bot.js';
import {
  translateServicesCatalogDetails,
  translateServicesCatalogItems,
} from '../../helpers/translate/translate-db-content.helper.js';

/**
 * @file services.scene.ts
 * @summary Scene для перегляду каталогу послуг і картки конкретної послуги.
 */

// uk: Flow/UI константа SERVICES_SCENE_ID / en: Flow/UI constant SERVICES_SCENE_ID / cz: Flow/UI konstanta SERVICES_SCENE_ID
export const SERVICES_SCENE_ID = 'services-scene';

type ServicesSceneState = {
  studioId: string | null;
  language: BotUiLanguage;
};

/**
 * uk: Внутрішня flow-функція getSceneState.
 * en: Internal flow function getSceneState.
 * cz: Interní flow funkce getSceneState.
 */
function getSceneState(ctx: MyContext): ServicesSceneState {
  return ctx.wizard.state as ServicesSceneState;
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
  keyboard: ReturnType<typeof createServiceDetailsKeyboard>,
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
  services: ServicesCatalogItem[],
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  await renderView(
    ctx,
    formatServicesCatalogText(services, state.language),
    createServicesCatalogKeyboard(services, state.language),
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
  const servicesRaw = await listActiveServicesCatalog({ studioId: state.studioId });
  const services = await translateServicesCatalogItems(servicesRaw, state.language);
  await renderCatalog(ctx, services, preferEdit);
}

/**
 * uk: Публічна flow-функція createServicesScene.
 * en: Public flow function createServicesScene.
 * cz: Veřejná flow funkce createServicesScene.
 */
export function createServicesScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    SERVICES_SCENE_ID,
    async (ctx) => {
      const user = await getOrCreateUser(ctx);
      const state = getSceneState(ctx);
      state.studioId = user.studioId;
      state.language = resolveBotUiLanguage(user.preferredLanguage);

      await loadAndRenderCatalog(ctx, false);
      return ctx.wizard.next();
    },
    async (ctx) => {
      // У цій сцені очікуємо callback-кнопки. Якщо прийшов текст — м’яко повертаємо до каталогу.
      if (!getMessageText(ctx)) {
        return;
      }

      await loadAndRenderCatalog(ctx, false);
    },
  );

  scene.action(SERVICES_ITEM_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();

    const matches = ctx.match as RegExpExecArray | string[];
    const serviceId = String(matches[1]);
    const state = getSceneState(ctx);
    const details = await getServiceCatalogDetailsById({
      serviceId,
      studioId: state.studioId,
    });

    if (!details) {
      await loadAndRenderCatalog(ctx, true);
      return;
    }

    const translatedDetails = await translateServicesCatalogDetails(details, state.language);

    await renderView(
      ctx,
      formatServiceDetailsText(translatedDetails, state.language),
      createServiceDetailsKeyboard(state.language),
      true,
    );
  });

  scene.action(SERVICES_ACTION.BACK_TO_LIST, async (ctx) => {
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
