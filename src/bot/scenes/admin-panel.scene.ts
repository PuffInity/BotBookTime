import { Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import type { AdminPanelAccess } from '../../types/db-helpers/db-admin-panel.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import {
  createAdminRecordsMenuKeyboard,
  createAdminPanelRootKeyboard,
  createAdminPanelSectionStubKeyboard,
  formatAdminRecordsCategoryStubText,
  formatAdminRecordsMenuText,
  formatAdminPanelRootText,
  formatAdminPanelSectionStubText,
} from '../../helpers/bot/admin-panel-view.bot.js';
import { ADMIN_PANEL_ACTION } from '../../types/bot-admin-panel.types.js';
import { getAdminPanelAccessByTelegramId } from '../../helpers/db/db-admin-panel.helper.js';

/**
 * @file admin-panel.scene.ts
 * @summary Skeleton адмін-панелі:
 * - перевірка доступу
 * - кореневе меню розділів
 * - заглушки для неготових блоків
 */

export const ADMIN_PANEL_SCENE_ID = 'admin-panel-scene';

type AdminPanelSceneState = {
  access: AdminPanelAccess | null;
};

function getSceneState(ctx: MyContext): AdminPanelSceneState {
  return ctx.wizard.state as AdminPanelSceneState;
}

async function renderAdminRoot(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  if (!state.access) return;

  const text = formatAdminPanelRootText(state.access);
  const keyboard = createAdminPanelRootKeyboard();

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // Якщо редагувати не вдалося — надсилаємо нове повідомлення.
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderStubSection(
  ctx: MyContext,
  title: string,
  blockNumber: number,
): Promise<void> {
  const text = formatAdminPanelSectionStubText(title, blockNumber);
  const keyboard = createAdminPanelSectionStubKeyboard();

  try {
    await ctx.editMessageText(text, keyboard);
  } catch {
    await ctx.reply(text, keyboard);
  }
}

async function renderRecordsMenu(ctx: MyContext): Promise<void> {
  const text = formatAdminRecordsMenuText();
  const keyboard = createAdminRecordsMenuKeyboard();

  try {
    await ctx.editMessageText(text, keyboard);
  } catch {
    await ctx.reply(text, keyboard);
  }
}

async function renderRecordsCategoryStub(
  ctx: MyContext,
  title: string,
  categoryCode: string,
): Promise<void> {
  const text = formatAdminRecordsCategoryStubText(title, categoryCode);
  const keyboard = createAdminRecordsMenuKeyboard();

  try {
    await ctx.editMessageText(text, keyboard);
  } catch {
    await ctx.reply(text, keyboard);
  }
}

export function createAdminPanelScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    ADMIN_PANEL_SCENE_ID,
    async (ctx) => {
      const telegramId = ctx.from?.id;
      const state = getSceneState(ctx);

      state.access = telegramId ? await getAdminPanelAccessByTelegramId(telegramId) : null;

      if (!state.access) {
        await ctx.reply(
          '🚫 Доступ до адмін-панелі відсутній.\n\n' +
            'Якщо доступ має бути відкритий, зверніться до власника салону.',
        );
        await ctx.scene.leave();
        await sendClientMainMenu(ctx);
        return;
      }

      await renderAdminRoot(ctx, false);
      return ctx.wizard.next();
    },
    async (ctx) => {
      // Адмін-панель працює через inline callback-и.
      if (ctx.message && 'text' in ctx.message) {
        await renderAdminRoot(ctx, false);
      }
    },
  );

  scene.action(ADMIN_PANEL_ACTION.OPEN_RECORDS, async (ctx) => {
    await ctx.answerCbQuery();
    await renderRecordsMenu(ctx);
  });

  scene.action(ADMIN_PANEL_ACTION.OPEN_SCHEDULE, async (ctx) => {
    await ctx.answerCbQuery();
    await renderStubSection(ctx, '🕒 Розклад', 2);
  });

  scene.action(ADMIN_PANEL_ACTION.OPEN_MASTERS, async (ctx) => {
    await ctx.answerCbQuery();
    await renderStubSection(ctx, '👩‍🎨 Майстри', 3);
  });

  scene.action(ADMIN_PANEL_ACTION.OPEN_SERVICES, async (ctx) => {
    await ctx.answerCbQuery();
    await renderStubSection(ctx, '💼 Послуги', 4);
  });

  scene.action(ADMIN_PANEL_ACTION.OPEN_STATS, async (ctx) => {
    await ctx.answerCbQuery();
    await renderStubSection(ctx, '📊 Статистика', 5);
  });

  scene.action(ADMIN_PANEL_ACTION.OPEN_SETTINGS, async (ctx) => {
    await ctx.answerCbQuery();
    await renderStubSection(ctx, '⚙️ Налаштування', 6);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_MENU_PENDING, async (ctx) => {
    await ctx.answerCbQuery();
    await renderRecordsCategoryStub(ctx, '🆕 Нові записи (очікують підтвердження)', 'pending');
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_MENU_TODAY, async (ctx) => {
    await ctx.answerCbQuery();
    await renderRecordsCategoryStub(ctx, '📍 Записи на сьогодні', 'today');
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_MENU_TOMORROW, async (ctx) => {
    await ctx.answerCbQuery();
    await renderRecordsCategoryStub(ctx, '📆 Записи на завтра', 'tomorrow');
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_MENU_ALL, async (ctx) => {
    await ctx.answerCbQuery();
    await renderRecordsCategoryStub(ctx, '🗂 Усі записи', 'all');
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_MENU_CANCELED, async (ctx) => {
    await ctx.answerCbQuery();
    await renderRecordsCategoryStub(ctx, '❌ Скасовані записи', 'canceled');
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_BACK, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminRoot(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.BACK_TO_ROOT, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminRoot(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.EXIT, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await sendClientMainMenu(ctx);
  });

  scene.action(ADMIN_PANEL_ACTION.HOME, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await sendClientMainMenu(ctx);
  });

  return scene;
}
