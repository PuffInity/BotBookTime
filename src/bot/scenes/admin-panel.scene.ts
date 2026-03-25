import { Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import type { AdminPanelAccess } from '../../types/db-helpers/db-admin-panel.types.js';
import type {
  AdminBookingItem,
  AdminBookingsCategory,
  AdminBookingsFeedPage,
} from '../../types/db-helpers/db-admin-bookings.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import {
  createAdminRecordsMenuKeyboard,
  createAdminPanelRootKeyboard,
  createAdminPanelSectionStubKeyboard,
  formatAdminRecordsMenuText,
  formatAdminPanelRootText,
  formatAdminPanelSectionStubText,
} from '../../helpers/bot/admin-panel-view.bot.js';
import {
  createAdminBookingDetailsCardKeyboard,
  createAdminBookingsFeedKeyboard,
  formatAdminBookingDetailsCardText,
  formatAdminBookingsFeedText,
} from '../../helpers/bot/admin-bookings-view.bot.js';
import {
  ADMIN_PANEL_ACTION,
  ADMIN_PANEL_RECORDS_OPEN_CARD_ACTION_REGEX,
} from '../../types/bot-admin-panel.types.js';
import { getAdminPanelAccessByTelegramId } from '../../helpers/db/db-admin-panel.helper.js';
import { getAdminBookingCardById, listAdminBookingsFeed } from '../../helpers/db/db-admin-bookings.helper.js';
import { ValidationError } from '../../utils/error.utils.js';

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
  recordsFeed: AdminBookingsFeedPage | null;
  recordsLastCategory: AdminBookingsCategory | null;
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
  category: AdminBookingsCategory,
  offset: number,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError('Не вдалося визначити студію адміністратора');
  }

  state.recordsFeed = await listAdminBookingsFeed({
    studioId,
    category,
    limit: 5,
    offset,
  });
  state.recordsLastCategory = category;

  const text = formatAdminBookingsFeedText(state.recordsFeed);
  const keyboard = createAdminBookingsFeedKeyboard(state.recordsFeed);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // Якщо редагування не вдалося — надсилаємо нове повідомлення.
    }
  }

  await ctx.reply(text, keyboard);
}

function parseAppointmentIdFromAction(ctx: MyContext, regex: RegExp): string {
  const callbackData =
    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
  const matches = callbackData.match(regex);
  const appointmentId = matches?.[1];
  if (!appointmentId) {
    throw new ValidationError('Некоректна callback-дія для запису');
  }

  return appointmentId;
}

async function resolveAdminRecordById(
  state: AdminPanelSceneState,
  appointmentId: string,
): Promise<AdminBookingItem | null> {
  const fromFeed = state.recordsFeed?.items.find((item) => item.appointmentId === appointmentId) ?? null;
  if (fromFeed) return fromFeed;

  const studioId = state.access?.studioId;
  if (!studioId) return null;
  return getAdminBookingCardById({
    studioId,
    appointmentId,
  });
}

async function renderAdminBookingCard(ctx: MyContext, item: AdminBookingItem): Promise<void> {
  const text = formatAdminBookingDetailsCardText(item);
  const keyboard = createAdminBookingDetailsCardKeyboard();

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
      state.recordsFeed = null;
      state.recordsLastCategory = null;

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
    await renderRecordsCategoryStub(ctx, 'pending', 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_MENU_TODAY, async (ctx) => {
    await ctx.answerCbQuery();
    await renderRecordsCategoryStub(ctx, 'today', 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_MENU_TOMORROW, async (ctx) => {
    await ctx.answerCbQuery();
    await renderRecordsCategoryStub(ctx, 'tomorrow', 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_MENU_ALL, async (ctx) => {
    await ctx.answerCbQuery();
    await renderRecordsCategoryStub(ctx, 'all', 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_MENU_CANCELED, async (ctx) => {
    await ctx.answerCbQuery();
    await renderRecordsCategoryStub(ctx, 'canceled', 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_LIST_PREV_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).recordsFeed;
    if (!feed || !feed.hasPrevPage) {
      return;
    }

    const nextOffset = Math.max(0, feed.offset - feed.limit);
    await renderRecordsCategoryStub(ctx, feed.category, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_LIST_NEXT_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).recordsFeed;
    if (!feed || !feed.hasNextPage) {
      return;
    }

    const nextOffset = feed.offset + feed.limit;
    await renderRecordsCategoryStub(ctx, feed.category, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_RECORDS_OPEN_CARD_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const appointmentId = parseAppointmentIdFromAction(ctx, ADMIN_PANEL_RECORDS_OPEN_CARD_ACTION_REGEX);
    const item = await resolveAdminRecordById(state, appointmentId);
    if (!item) {
      if (state.recordsFeed) {
        await renderRecordsCategoryStub(ctx, state.recordsFeed.category, state.recordsFeed.offset, true);
        return;
      }

      await renderRecordsMenu(ctx);
      return;
    }

    await renderAdminBookingCard(ctx, item);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_BACK_TO_LIST, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).recordsFeed;
    if (!feed) {
      await renderRecordsMenu(ctx);
      return;
    }
    await renderRecordsCategoryStub(ctx, feed.category, feed.offset, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_BACK, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.recordsFeed = null;
    state.recordsLastCategory = null;
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
