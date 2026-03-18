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

/**
 * @file services.scene.ts
 * @summary Scene для перегляду каталогу послуг і картки конкретної послуги.
 */

export const SERVICES_SCENE_ID = 'services-scene';

type ServicesSceneState = {
  studioId: string | null;
};

function getSceneState(ctx: MyContext): ServicesSceneState {
  return ctx.wizard.state as ServicesSceneState;
}

function getMessageText(ctx: MyContext): string | null {
  if (!ctx.message) return null;
  if (!('text' in ctx.message)) return null;
  return ctx.message.text.trim();
}

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

async function renderCatalog(
  ctx: MyContext,
  services: ServicesCatalogItem[],
  preferEdit: boolean,
): Promise<void> {
  await renderView(
    ctx,
    formatServicesCatalogText(services),
    createServicesCatalogKeyboard(services),
    preferEdit,
  );
}

async function loadAndRenderCatalog(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const services = await listActiveServicesCatalog({ studioId: state.studioId });
  await renderCatalog(ctx, services, preferEdit);
}

export function createServicesScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    SERVICES_SCENE_ID,
    async (ctx) => {
      const user = await getOrCreateUser(ctx);
      const state = getSceneState(ctx);
      state.studioId = user.studioId;

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

    await renderView(
      ctx,
      formatServiceDetailsText(details),
      createServiceDetailsKeyboard(),
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

