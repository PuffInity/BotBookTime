import { Markup } from 'telegraf';
import type {
  AdminBookingItem,
  AdminBookingsCategory,
  AdminBookingsFeedPage,
} from '../../types/db-helpers/db-admin-bookings.types.js';
import {
  ADMIN_PANEL_ACTION,
  ADMIN_PANEL_BUTTON_TEXT,
  makeAdminPanelRecordsOpenCardAction,
} from '../../types/bot-admin-panel.types.js';

/**
 * @file admin-bookings-view.bot.ts
 * @summary UI/helper-и для блоку "Записи" в адмін-панелі.
 */

function formatDateTimeRange(startAt: Date, endAt: Date): string {
  const date = startAt.toLocaleDateString('uk-UA');
  const startTime = startAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  const endTime = endAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

  return `${date} • ${startTime}–${endTime}`;
}

function formatPrice(price: string, currencyCode: string): string {
  const normalized = price.replace(/[.,]00$/, '').replace(/([.,]\d)0$/, '$1');
  return `${normalized} ${currencyCode}`;
}

function formatClientDisplayName(item: AdminBookingItem): string {
  if (item.attendeeName && item.attendeeName.trim().length > 0) {
    return item.attendeeName;
  }

  const fullName = `${item.clientFirstName}${item.clientLastName ? ` ${item.clientLastName}` : ''}`.trim();
  return fullName || 'Клієнт';
}

function formatBookingStatusLabel(status: AdminBookingItem['status']): string {
  switch (status) {
    case 'pending':
      return '🟡 Очікує підтвердження';
    case 'confirmed':
      return '🟢 Підтверджено';
    case 'completed':
      return '⚪ Завершено';
    case 'canceled':
      return '🔴 Скасовано';
    case 'transferred':
      return '🟣 Перенесено';
    default:
      return status;
  }
}

function categoryTitle(category: AdminBookingsCategory): string {
  switch (category) {
    case 'pending':
      return '🆕 Нові записи (очікують підтвердження)';
    case 'today':
      return '📍 Записи на сьогодні';
    case 'tomorrow':
      return '📆 Записи на завтра';
    case 'all':
      return '🗂 Усі записи';
    case 'canceled':
      return '❌ Скасовані записи';
    default:
      return '📅 Записи';
  }
}

function categoryEmptyText(category: AdminBookingsCategory): string {
  switch (category) {
    case 'pending':
      return '📭 Наразі нових записів, що очікують підтвердження, немає.';
    case 'today':
      return '📭 На сьогодні записів немає.';
    case 'tomorrow':
      return '📭 На завтра записів немає.';
    case 'all':
      return '📭 Записів не знайдено.';
    case 'canceled':
      return '📭 Скасованих записів не знайдено.';
    default:
      return '📭 Записів не знайдено.';
  }
}

function cardIndexLabel(index: number): string {
  return `${index + 1}️⃣`;
}

/**
 * @summary Форматує текст списку записів по категорії.
 */
export function formatAdminBookingsFeedText(page: AdminBookingsFeedPage): string {
  const title = categoryTitle(page.category);
  if (page.items.length === 0) {
    return `${title}\n━━━━━━━━━━━━━━\n\n${categoryEmptyText(page.category)}`;
  }

  const lines = page.items.map((item, index) => {
    return (
      `${cardIndexLabel(index)}\n\n` +
      `👤 ${formatClientDisplayName(item)}\n` +
      `💼 ${item.serviceName}\n` +
      `👩‍🎨 ${item.masterName}\n` +
      `💰 Ціна: ${formatPrice(item.priceAmount, item.currencyCode)}\n` +
      `📅 ${item.startAt.toLocaleDateString('uk-UA')}\n` +
      `⏰ ${item.startAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}` +
      `–${item.endAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}\n` +
      `${formatBookingStatusLabel(item.status)}`
    );
  });

  const pageNumber = Math.floor(page.offset / page.limit) + 1;
  const totalPages = Math.max(1, Math.ceil(page.total / page.limit));

  return `${title}\n━━━━━━━━━━━━━━\n\n${lines.join('\n\n⸻\n\n')}\n\n📄 Сторінка ${pageNumber} з ${totalPages}`;
}

/**
 * @summary Клавіатура списку записів по категорії.
 */
export function createAdminBookingsFeedKeyboard(
  page: AdminBookingsFeedPage,
): ReturnType<typeof Markup.inlineKeyboard> {
  const numberButtons = page.items.map((item, index) =>
    Markup.button.callback(`${index + 1}`, makeAdminPanelRecordsOpenCardAction(item.appointmentId)),
  );

  const numberRows: ReturnType<typeof Markup.button.callback>[][] = [];
  for (let i = 0; i < numberButtons.length; i += 3) {
    numberRows.push(numberButtons.slice(i, i + 3));
  }

  const paginationRow: ReturnType<typeof Markup.button.callback>[] = [];
  if (page.hasPrevPage) {
    paginationRow.push(
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_PREV_PAGE, ADMIN_PANEL_ACTION.RECORDS_LIST_PREV_PAGE),
    );
  }
  if (page.hasNextPage) {
    paginationRow.push(
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_NEXT_PAGE, ADMIN_PANEL_ACTION.RECORDS_LIST_NEXT_PAGE),
    );
  }

  return Markup.inlineKeyboard([
    ...numberRows,
    ...(paginationRow.length > 0 ? [paginationRow] : []),
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK_TO_MENU, ADMIN_PANEL_ACTION.OPEN_RECORDS)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK, ADMIN_PANEL_ACTION.RECORDS_BACK)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.HOME, ADMIN_PANEL_ACTION.HOME)],
  ]);
}

/**
 * @summary Форматує текст детальної картки запису.
 */
export function formatAdminBookingDetailsCardText(item: AdminBookingItem): string {
  const comment = item.clientComment?.trim();
  const commentBlock = comment ? `\n\n📝 Коментар клієнта:\n${comment}` : '';

  return (
    '📄 Картка запису\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👤 Клієнт: ${formatClientDisplayName(item)}\n` +
    `📱 Телефон: ${item.attendeePhoneE164 ?? 'Не вказано'}\n` +
    `✉️ Email: ${item.attendeeEmail ?? 'Не вказано'}\n\n` +
    `💼 Послуга: ${item.serviceName}\n` +
    `👩‍🎨 Майстер: ${item.masterName}\n` +
    `🕒 Час: ${formatDateTimeRange(item.startAt, item.endAt)}\n` +
    `💰 Ціна: ${formatPrice(item.priceAmount, item.currencyCode)}\n` +
    `📌 Статус: ${formatBookingStatusLabel(item.status)}` +
    commentBlock +
    '\n\nℹ️ Дії з карткою (перенести/скасувати/змінити майстра) підключимо у наступному підблоці.'
  );
}

/**
 * @summary Клавіатура детальної картки запису.
 */
export function createAdminBookingDetailsCardKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK_TO_LIST, ADMIN_PANEL_ACTION.RECORDS_BACK_TO_LIST)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK_TO_MENU, ADMIN_PANEL_ACTION.OPEN_RECORDS)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK, ADMIN_PANEL_ACTION.RECORDS_BACK)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.HOME, ADMIN_PANEL_ACTION.HOME)],
  ]);
}
