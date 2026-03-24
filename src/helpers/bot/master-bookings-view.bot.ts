import { Markup } from 'telegraf';
import type {
  MasterBookingsCategory,
  MasterBookingsFeedPage,
  MasterPendingBookingItem,
} from '../../types/db-helpers/db-master-bookings.types.js';
import {
  MASTER_PANEL_ACTION,
  MASTER_PANEL_BUTTON_TEXT,
  makeMasterPanelBookingCancelConfirmAction,
  makeMasterPanelBookingCancelRequestAction,
  makeMasterPanelBookingConfirmAction,
  makeMasterPanelBookingOpenCardAction,
  makeMasterPanelBookingProfileAction,
  makeMasterPanelBookingRescheduleDateAction,
  makeMasterPanelBookingRescheduleAction,
  makeMasterPanelBookingRescheduleTimeAction,
} from '../../types/bot-master-panel.types.js';

/**
 * @file master-bookings-view.bot.ts
 * @summary UI/helper-и для блоку "Мої записи" у панелі майстра.
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

function formatClientDisplayName(item: MasterPendingBookingItem): string {
  if (item.attendeeName && item.attendeeName.trim().length > 0) {
    return item.attendeeName;
  }

  const fullName = `${item.clientFirstName}${item.clientLastName ? ` ${item.clientLastName}` : ''}`.trim();
  return fullName || 'Клієнт';
}

function formatBookingStatusLabel(status: MasterPendingBookingItem['status']): string {
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

function categoryTitle(category: MasterBookingsCategory): string {
  switch (category) {
    case 'today':
      return '📍 Записи на сьогодні';
    case 'tomorrow':
      return '📆 Записи на завтра';
    case 'all':
      return '🗂 Усі записи';
    case 'canceled':
      return '❌ Скасовані записи';
    default:
      return '📅 Мої записи';
  }
}

function categoryEmptyText(category: MasterBookingsCategory): string {
  switch (category) {
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
 * @summary Текст картки pending-запису майстра.
 */
export function formatMasterPendingBookingCardText(
  item: MasterPendingBookingItem,
  index: number,
  total: number,
): string {
  const comment = item.clientComment?.trim();
  const commentBlock = comment
    ? `\n\n📝 Коментар клієнта:\n${comment}`
    : '';

  return (
    '🆕 Новий запис\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `📌 Позиція у черзі: ${index + 1} з ${total}\n\n` +
    `👤 Клієнт: ${formatClientDisplayName(item)}\n` +
    `📱 Телефон: ${item.attendeePhoneE164 ?? 'Не вказано'}\n` +
    `✉️ Email: ${item.attendeeEmail ?? 'Не вказано'}\n\n` +
    `💼 Послуга: ${item.serviceName}\n` +
    `🕒 Час: ${formatDateTimeRange(item.startAt, item.endAt)}\n` +
    `💰 Ціна: ${formatPrice(item.priceAmount, item.currencyCode)}\n` +
    '📌 Статус: ⏳ Очікує підтвердження' +
    commentBlock
  );
}

/**
 * @summary Inline-клавіатура картки pending-запису.
 */
export function createMasterPendingBookingCardKeyboard(
  item: MasterPendingBookingItem,
  hasNext: boolean,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Підтвердити', makeMasterPanelBookingConfirmAction(item.appointmentId)),
      Markup.button.callback('❌ Скасувати', makeMasterPanelBookingCancelRequestAction(item.appointmentId)),
    ],
    [
      Markup.button.callback('🔄 Перенести', makeMasterPanelBookingRescheduleAction(item.appointmentId)),
      Markup.button.callback('👤 Профіль клієнта', makeMasterPanelBookingProfileAction(item.appointmentId)),
    ],
    ...(hasNext
      ? [[Markup.button.callback('🆕 Наступний непідтверджений запис', MASTER_PANEL_ACTION.BOOKINGS_NEXT_PENDING)]]
      : []),
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.BACK_TO_PANEL, MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Текст порожньої pending-черги.
 */
export function formatMasterPendingBookingsEmptyText(): string {
  return (
    '📭 Нових записів, що очікують підтвердження, немає.\n\n' +
    'Усі запити оброблено. Нові записи з’являться тут автоматично.'
  );
}

/**
 * @summary Клавіатура порожньої pending-черги.
 */
export function createMasterPendingBookingsEmptyKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📅 До меню записів', MASTER_PANEL_ACTION.BOOKINGS_OPEN_MENU)],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.BACK_TO_PANEL, MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Текст меню категорій блоку "Мої записи".
 */
export function formatMasterBookingsMenuText(): string {
  return (
    '📅 Мої записи\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Керування записами.\n' +
    'Оберіть категорію для перегляду:'
  );
}

/**
 * @summary Клавіатура меню категорій блоку "Мої записи".
 */
export function createMasterBookingsMenuKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🆕 Нові записи (очікують підтвердження)', MASTER_PANEL_ACTION.BOOKINGS_SHOW_PENDING)],
    [
      Markup.button.callback('📍 Сьогодні', MASTER_PANEL_ACTION.BOOKINGS_MENU_TODAY),
      Markup.button.callback('📆 Завтра', MASTER_PANEL_ACTION.BOOKINGS_MENU_TOMORROW),
    ],
    [
      Markup.button.callback('🗂 Усі записи', MASTER_PANEL_ACTION.BOOKINGS_MENU_ALL),
      Markup.button.callback('❌ Скасовані', MASTER_PANEL_ACTION.BOOKINGS_MENU_CANCELED),
    ],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.BACK_TO_PANEL, MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Текст списку записів по категорії.
 */
export function formatMasterBookingsFeedText(page: MasterBookingsFeedPage): string {
  const title = categoryTitle(page.category);
  if (page.items.length === 0) {
    return (
      `${title}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      `${categoryEmptyText(page.category)}`
    );
  }

  const lines = page.items.map((item, index) => {
    return (
      `${cardIndexLabel(index)}\n\n` +
      `👤 ${formatClientDisplayName(item)}\n` +
      `💼 ${item.serviceName}\n` +
      `💰 Ціна: ${formatPrice(item.priceAmount, item.currencyCode)}\n` +
      `📅 ${item.startAt.toLocaleDateString('uk-UA')}\n` +
      `⏰ ${item.startAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}` +
      `–${item.endAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}\n` +
      `${formatBookingStatusLabel(item.status)}`
    );
  });

  const pageNumber = Math.floor(page.offset / page.limit) + 1;
  const totalPages = Math.max(1, Math.ceil(page.total / page.limit));

  return (
    `${title}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${lines.join('\n\n⸻\n\n')}\n\n` +
    `📄 Сторінка ${pageNumber} з ${totalPages}`
  );
}

/**
 * @summary Клавіатура списку записів по категорії.
 */
export function createMasterBookingsFeedKeyboard(
  page: MasterBookingsFeedPage,
): ReturnType<typeof Markup.inlineKeyboard> {
  const numberButtons = page.items.map((item, index) => {
    return Markup.button.callback(
      `${index + 1}`,
      makeMasterPanelBookingOpenCardAction(item.appointmentId),
    );
  });

  const numberRows: ReturnType<typeof Markup.button.callback>[][] = [];
  for (let i = 0; i < numberButtons.length; i += 3) {
    numberRows.push(numberButtons.slice(i, i + 3));
  }

  const paginationRow: ReturnType<typeof Markup.button.callback>[] = [];
  if (page.hasPrevPage) {
    paginationRow.push(Markup.button.callback('⬅️ Попередня', MASTER_PANEL_ACTION.BOOKINGS_LIST_PREV_PAGE));
  }
  if (page.hasNextPage) {
    paginationRow.push(Markup.button.callback('➡️ Наступна', MASTER_PANEL_ACTION.BOOKINGS_LIST_NEXT_PAGE));
  }

  return Markup.inlineKeyboard([
    ...numberRows,
    ...(paginationRow.length > 0 ? [paginationRow] : []),
    [Markup.button.callback('⬅️ До меню записів', MASTER_PANEL_ACTION.BOOKINGS_OPEN_MENU)],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.BACK_TO_PANEL, MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Текст підтвердження скасування pending-запису.
 */
export function formatMasterCancelPendingBookingConfirmText(item: MasterPendingBookingItem): string {
  return (
    '⚠️ Підтвердження скасування\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Ви дійсно хочете скасувати цей запис?\n\n' +
    `👤 ${formatClientDisplayName(item)}\n` +
    `💼 ${item.serviceName}\n` +
    `🕒 ${formatDateTimeRange(item.startAt, item.endAt)}`
  );
}

/**
 * @summary Клавіатура підтвердження скасування pending-запису.
 */
export function createMasterCancelPendingBookingConfirmKeyboard(
  item: MasterPendingBookingItem,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        '✅ Так, скасувати',
        makeMasterPanelBookingCancelConfirmAction(item.appointmentId),
      ),
      Markup.button.callback(
        '↩️ Ні, повернутись',
        MASTER_PANEL_ACTION.BOOKINGS_SHOW_PENDING,
      ),
    ],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.BACK_TO_PANEL, MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Текст детальної картки запису зі списку.
 */
export function formatMasterBookingDetailsCardText(item: MasterPendingBookingItem): string {
  const comment = item.clientComment?.trim();
  const commentBlock = comment
    ? `\n\n📝 Коментар клієнта:\n${comment}`
    : '';

  let stateHint = '';
  if (item.status === 'canceled') {
    stateHint =
      '\n\n⚠️ Цей запис уже скасований.\n' +
      'Доступний лише перегляд інформації.';
  } else if (item.status === 'completed') {
    stateHint =
      '\n\n⚠️ Цей запис уже завершений.\n' +
      'Доступний лише перегляд інформації.';
  } else if (item.status === 'transferred') {
    stateHint =
      '\n\n⚠️ Цей запис позначено як перенесений.\n' +
      'Доступний лише перегляд інформації.';
  } else if (item.status === 'pending') {
    stateHint =
      '\n\nℹ️ Для обробки pending-запису використайте розділ:\n' +
      '«🆕 Нові записи (очікують підтвердження)».';
  }

  return (
    '📄 Картка запису\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👤 Клієнт: ${formatClientDisplayName(item)}\n` +
    `📱 Телефон: ${item.attendeePhoneE164 ?? 'Не вказано'}\n` +
    `✉️ Email: ${item.attendeeEmail ?? 'Не вказано'}\n\n` +
    `💼 Послуга: ${item.serviceName}\n` +
    `🕒 Час: ${formatDateTimeRange(item.startAt, item.endAt)}\n` +
    `💰 Ціна: ${formatPrice(item.priceAmount, item.currencyCode)}\n` +
    `📌 Статус: ${formatBookingStatusLabel(item.status)}` +
    commentBlock +
    stateHint
  );
}

/**
 * @summary Клавіатура детальної картки запису зі списку.
 */
export function createMasterBookingDetailsCardKeyboard(
  item: MasterPendingBookingItem,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback('👤 Профіль клієнта', makeMasterPanelBookingProfileAction(item.appointmentId))],
    ...(item.status === 'pending'
      ? [[Markup.button.callback('🆕 До черги pending', MASTER_PANEL_ACTION.BOOKINGS_SHOW_PENDING)]]
      : []),
    [Markup.button.callback('⬅️ До списку', MASTER_PANEL_ACTION.BOOKINGS_BACK_TO_LIST)],
    [Markup.button.callback('⬅️ До меню записів', MASTER_PANEL_ACTION.BOOKINGS_OPEN_MENU)],
  ]);
}

function formatDateLabel(date: Date): string {
  const weekday = date.toLocaleDateString('uk-UA', { weekday: 'short' });
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${weekday} ${day}.${month}`;
}

/**
 * @summary Текст кроку вибору нової дати для перенесення.
 */
export function formatMasterRescheduleDateStepText(item: MasterPendingBookingItem): string {
  return (
    '🔄 Перенесення запису — крок 1/3\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👤 Клієнт: ${formatClientDisplayName(item)}\n` +
    `💼 Послуга: ${item.serviceName}\n` +
    `🕒 Поточний час: ${formatDateTimeRange(item.startAt, item.endAt)}\n\n` +
    'Оберіть нову дату для перенесення.'
  );
}

/**
 * @summary Клавіатура вибору нової дати.
 */
export function createMasterRescheduleDateKeyboard(
  dates: Date[],
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    ...dates.map((date) => {
      const year = String(date.getFullYear());
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const code = `${year}${month}${day}`;
      return [Markup.button.callback(formatDateLabel(date), makeMasterPanelBookingRescheduleDateAction(code))];
    }),
    [
      Markup.button.callback('❌ Скасувати дію', MASTER_PANEL_ACTION.BOOKINGS_RESCHEDULE_CANCEL),
      Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.BACK_TO_PANEL, MASTER_PANEL_ACTION.BACK_TO_PANEL),
    ],
  ]);
}

/**
 * @summary Текст кроку вибору нового часу.
 */
export function formatMasterRescheduleTimeStepText(item: MasterPendingBookingItem, dateLabel: string): string {
  return (
    '🔄 Перенесення запису — крок 2/3\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👤 Клієнт: ${formatClientDisplayName(item)}\n` +
    `💼 Послуга: ${item.serviceName}\n` +
    `📆 Нова дата: ${dateLabel}\n\n` +
    'Оберіть новий час.'
  );
}

/**
 * @summary Клавіатура вибору нового часу.
 */
export function createMasterRescheduleTimeKeyboard(
  timeCodes: string[],
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows: ReturnType<typeof Markup.button.callback>[][] = [];

  for (let i = 0; i < timeCodes.length; i += 2) {
    const first = timeCodes[i];
    const second = timeCodes[i + 1];
    const firstLabel = `${first.slice(0, 2)}:${first.slice(2, 4)}`;

    const row = [Markup.button.callback(firstLabel, makeMasterPanelBookingRescheduleTimeAction(first))];
    if (second) {
      const secondLabel = `${second.slice(0, 2)}:${second.slice(2, 4)}`;
      row.push(Markup.button.callback(secondLabel, makeMasterPanelBookingRescheduleTimeAction(second)));
    }

    rows.push(row);
  }

  return Markup.inlineKeyboard([
    ...rows,
    [
      Markup.button.callback('⬅️ До вибору дати', MASTER_PANEL_ACTION.BOOKINGS_RESCHEDULE_BACK_TO_DATE),
      Markup.button.callback('❌ Скасувати дію', MASTER_PANEL_ACTION.BOOKINGS_RESCHEDULE_CANCEL),
    ],
  ]);
}

/**
 * @summary Текст підтвердження перенесення.
 */
export function formatMasterRescheduleConfirmText(
  item: MasterPendingBookingItem,
  newStartAt: Date,
  newEndAt: Date,
): string {
  return (
    '🔄 Перенесення запису — крок 3/3\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👤 Клієнт: ${formatClientDisplayName(item)}\n` +
    `💼 Послуга: ${item.serviceName}\n\n` +
    `🕒 Було: ${formatDateTimeRange(item.startAt, item.endAt)}\n` +
    `🕒 Стане: ${formatDateTimeRange(newStartAt, newEndAt)}\n\n` +
    'Підтвердіть перенесення запису.'
  );
}

/**
 * @summary Клавіатура підтвердження перенесення.
 */
export function createMasterRescheduleConfirmKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback('✅ Підтвердити перенесення', MASTER_PANEL_ACTION.BOOKINGS_RESCHEDULE_CONFIRM)],
    [
      Markup.button.callback('⬅️ До вибору часу', MASTER_PANEL_ACTION.BOOKINGS_RESCHEDULE_BACK_TO_TIME),
      Markup.button.callback('❌ Скасувати дію', MASTER_PANEL_ACTION.BOOKINGS_RESCHEDULE_CANCEL),
    ],
  ]);
}
