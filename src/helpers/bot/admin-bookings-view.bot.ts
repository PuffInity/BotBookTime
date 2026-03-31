import { Markup } from 'telegraf';
import type {
  AdminBookingItem,
  AdminBookingsCategory,
  AdminBookingsFeedPage,
} from '../../types/db-helpers/db-admin-bookings.types.js';
import type { MasterBookingOption } from '../../types/db-helpers/db-masters.types.js';
import {
  ADMIN_PANEL_ACTION,
  ADMIN_PANEL_BUTTON_TEXT,
  makeAdminPanelRecordsCancelConfirmAction,
  makeAdminPanelRecordsCancelRequestAction,
  makeAdminPanelRecordsChangeMasterAction,
  makeAdminPanelRecordsChangeMasterSelectAction,
  makeAdminPanelRecordsConfirmAction,
  makeAdminPanelRecordsContactClientAction,
  makeAdminPanelRecordsHardDeleteConfirmAction,
  makeAdminPanelRecordsHardDeleteRequestAction,
  makeAdminPanelRecordsNextPendingAction,
  makeAdminPanelRecordsOpenCardAction,
  makeAdminPanelRecordsRescheduleAction,
  makeAdminPanelRecordsRescheduleDateAction,
  makeAdminPanelRecordsRescheduleTimeAction,
  makeAdminPanelRecordsViewClientProfileAction,
  makeAdminPanelRecordsViewMasterProfileAction,
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

function formatTelegramHandle(username: string | null): string {
  if (!username) return 'Не вказано';
  return `@${username}`;
}

function buildContactChannelsLines(item: AdminBookingItem): string {
  const lines: string[] = [];
  if (item.clientTelegramUsername) {
    lines.push(`• Telegram: ${formatTelegramHandle(item.clientTelegramUsername)}`);
  }
  if (item.attendeePhoneE164) {
    lines.push(`• Телефон: ${item.attendeePhoneE164}`);
  }
  if (item.attendeeEmail) {
    lines.push(`• Email: ${item.attendeeEmail}`);
  }

  if (lines.length === 0) {
    return '• Контактні дані не вказано';
  }

  return lines.join('\n');
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

function formatDateLabel(date: Date): string {
  const weekday = date.toLocaleDateString('uk-UA', { weekday: 'short' });
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${weekday} ${day}.${month}`;
}

function formatDateCodeLabel(dateCode: string): string {
  const year = Number(dateCode.slice(0, 4));
  const month = Number(dateCode.slice(4, 6));
  const day = Number(dateCode.slice(6, 8));
  return new Date(year, month - 1, day).toLocaleDateString('uk-UA');
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
    ...(page.category === 'canceled' && page.total > 0
      ? [[Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_CLEAR_CANCELED, ADMIN_PANEL_ACTION.RECORDS_CLEAR_CANCELED_REQUEST)]]
      : []),
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
  let stateHint = '';
  if (item.status === 'canceled') {
    stateHint = '\n\n⚠️ Цей запис уже скасований.\nДоступний перегляд або видалення назавжди.';
  } else if (item.status === 'completed') {
    stateHint = '\n\n⚠️ Цей запис уже завершений.\nДоступний перегляд або видалення назавжди.';
  } else if (item.status === 'transferred') {
    stateHint = '\n\n⚠️ Цей запис позначено як перенесений.\nДоступний перегляд або видалення назавжди.';
  } else if (item.status === 'pending') {
    stateHint = '\n\nℹ️ Доступні дії: підтвердити, скасувати, перенести, змінити майстра.';
  } else if (item.status === 'confirmed') {
    stateHint = '\n\nℹ️ Доступні дії: скасувати, перенести, змінити майстра.';
  }

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
    stateHint
  );
}

/**
 * @summary Клавіатура детальної картки запису.
 */
export function createAdminBookingDetailsCardKeyboard(
  item: AdminBookingItem,
): ReturnType<typeof Markup.inlineKeyboard> {
  const actionRows: ReturnType<typeof Markup.button.callback>[][] = [];
  actionRows.push([
    Markup.button.callback(
      ADMIN_PANEL_BUTTON_TEXT.RECORDS_CONTACT_CLIENT,
      makeAdminPanelRecordsContactClientAction(item.appointmentId),
    ),
  ]);
  actionRows.push([
    Markup.button.callback(
      ADMIN_PANEL_BUTTON_TEXT.RECORDS_VIEW_CLIENT_PROFILE,
      makeAdminPanelRecordsViewClientProfileAction(item.appointmentId),
    ),
  ]);
  actionRows.push([
    Markup.button.callback(
      ADMIN_PANEL_BUTTON_TEXT.RECORDS_VIEW_MASTER_PROFILE,
      makeAdminPanelRecordsViewMasterProfileAction(item.appointmentId),
    ),
  ]);
  actionRows.push([
    Markup.button.callback(
      ADMIN_PANEL_BUTTON_TEXT.RECORDS_NEXT_PENDING,
      makeAdminPanelRecordsNextPendingAction(item.appointmentId),
    ),
  ]);

  if (item.status === 'pending') {
    actionRows.push([
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.RECORDS_CONFIRM,
        makeAdminPanelRecordsConfirmAction(item.appointmentId),
      ),
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.RECORDS_CANCEL,
        makeAdminPanelRecordsCancelRequestAction(item.appointmentId),
      ),
    ]);
    actionRows.push([
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.RECORDS_RESCHEDULE,
        makeAdminPanelRecordsRescheduleAction(item.appointmentId),
      ),
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.RECORDS_CHANGE_MASTER,
        makeAdminPanelRecordsChangeMasterAction(item.appointmentId),
      ),
    ]);
  } else if (item.status === 'confirmed') {
    actionRows.push([
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.RECORDS_RESCHEDULE,
        makeAdminPanelRecordsRescheduleAction(item.appointmentId),
      ),
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.RECORDS_CANCEL,
        makeAdminPanelRecordsCancelRequestAction(item.appointmentId),
      ),
    ]);
    actionRows.push([
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.RECORDS_CHANGE_MASTER,
        makeAdminPanelRecordsChangeMasterAction(item.appointmentId),
      ),
    ]);
  }

  if (item.status === 'canceled' || item.status === 'completed' || item.status === 'transferred') {
    actionRows.push([
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.RECORDS_HARD_DELETE,
        makeAdminPanelRecordsHardDeleteRequestAction(item.appointmentId),
      ),
    ]);
  }

  return Markup.inlineKeyboard([
    ...actionRows,
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK_TO_LIST, ADMIN_PANEL_ACTION.RECORDS_BACK_TO_LIST)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK_TO_MENU, ADMIN_PANEL_ACTION.OPEN_RECORDS)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK, ADMIN_PANEL_ACTION.RECORDS_BACK)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.HOME, ADMIN_PANEL_ACTION.HOME)],
  ]);
}

/**
 * @summary Текст підтвердження hard-delete запису.
 */
export function formatAdminHardDeleteBookingConfirmText(item: AdminBookingItem): string {
  return (
    '⚠️ Підтвердження видалення запису\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Ви впевнені, що хочете видалити цей запис назавжди?\n\n' +
    `👤 ${formatClientDisplayName(item)}\n` +
    `💼 ${item.serviceName}\n` +
    `👩‍🎨 ${item.masterName}\n` +
    `🕒 ${formatDateTimeRange(item.startAt, item.endAt)}\n` +
    `📌 ${formatBookingStatusLabel(item.status)}\n\n` +
    'Після видалення запис буде безповоротно стертий із системи.'
  );
}

/**
 * @summary Клавіатура підтвердження hard-delete.
 */
export function createAdminHardDeleteBookingConfirmKeyboard(
  item: AdminBookingItem,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.RECORDS_HARD_DELETE_CONFIRM,
        makeAdminPanelRecordsHardDeleteConfirmAction(item.appointmentId),
      ),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_CANCEL_ACTION, ADMIN_PANEL_ACTION.RECORDS_HARD_DELETE_CANCEL)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK_TO_LIST, ADMIN_PANEL_ACTION.RECORDS_BACK_TO_LIST)],
  ]);
}

/**
 * @summary Текст підтвердження очищення списку скасованих записів.
 */
export function formatAdminClearCanceledBookingsConfirmText(total: number): string {
  return (
    '⚠️ Підтвердження очищення скасованих записів\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `Ви дійсно хочете очистити список скасованих записів?\n` +
    `До видалення: ${total}\n\n` +
    'Після підтвердження всі скасовані записи буде видалено назавжди.'
  );
}

/**
 * @summary Клавіатура підтвердження очищення скасованих записів.
 */
export function createAdminClearCanceledBookingsConfirmKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_CLEAR_CANCELED_CONFIRM, ADMIN_PANEL_ACTION.RECORDS_CLEAR_CANCELED_CONFIRM)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_CANCEL_ACTION, ADMIN_PANEL_ACTION.RECORDS_CLEAR_CANCELED_CANCEL)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK_TO_MENU, ADMIN_PANEL_ACTION.OPEN_RECORDS)],
  ]);
}

/**
 * @summary Текст контактів клієнта для швидкого звʼязку.
 */
export function formatAdminBookingContactClientText(item: AdminBookingItem): string {
  return (
    '📞 Контакти клієнта\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👤 ${formatClientDisplayName(item)}\n` +
    `${buildContactChannelsLines(item)}\n\n` +
    'Використайте один із каналів для звʼязку з клієнтом.'
  );
}

/**
 * @summary Клавіатура екрану контактів клієнта.
 */
export function createAdminBookingContactClientKeyboard(
  item: AdminBookingItem,
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows: ReturnType<typeof Markup.button.callback | typeof Markup.button.url>[][] = [];
  if (item.clientTelegramUsername) {
    rows.push([
      Markup.button.url(
        `💬 ${formatTelegramHandle(item.clientTelegramUsername)}`,
        `https://t.me/${item.clientTelegramUsername}`,
      ),
    ]);
  }
  if (item.attendeePhoneE164) {
    rows.push([
      Markup.button.url(`📱 ${item.attendeePhoneE164}`, `tel:${item.attendeePhoneE164}`),
    ]);
  }
  if (item.attendeeEmail) {
    rows.push([Markup.button.url(`✉️ ${item.attendeeEmail}`, `mailto:${item.attendeeEmail}`)]);
  }

  return Markup.inlineKeyboard([
    ...rows,
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK_TO_LIST, ADMIN_PANEL_ACTION.RECORDS_BACK_TO_LIST)],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.RECORDS_VIEW_CLIENT_PROFILE,
        makeAdminPanelRecordsViewClientProfileAction(item.appointmentId),
      ),
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.RECORDS_NEXT_PENDING,
        makeAdminPanelRecordsNextPendingAction(item.appointmentId),
      ),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK_TO_MENU, ADMIN_PANEL_ACTION.OPEN_RECORDS)],
  ]);
}

/**
 * @summary Текст профілю клієнта з картки запису.
 */
export function formatAdminBookingClientProfileText(item: AdminBookingItem): string {
  return (
    '👤 Профіль клієнта\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `🪪 ID клієнта: ${item.clientId}\n` +
    `👤 Імʼя: ${formatClientDisplayName(item)}\n` +
    `💬 Telegram: ${formatTelegramHandle(item.clientTelegramUsername)}\n` +
    `📱 Телефон: ${item.attendeePhoneE164 ?? 'Не вказано'}\n` +
    `✉️ Email: ${item.attendeeEmail ?? 'Не вказано'}\n\n` +
    `🕒 Найближчий запис: ${formatDateTimeRange(item.startAt, item.endAt)}\n` +
    `📌 Поточний статус: ${formatBookingStatusLabel(item.status)}`
  );
}

/**
 * @summary Клавіатура профілю клієнта з картки запису.
 */
export function createAdminBookingClientProfileKeyboard(
  item: AdminBookingItem,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.RECORDS_CONTACT_CLIENT,
        makeAdminPanelRecordsContactClientAction(item.appointmentId),
      ),
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.RECORDS_NEXT_PENDING,
        makeAdminPanelRecordsNextPendingAction(item.appointmentId),
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.RECORDS_VIEW_MASTER_PROFILE,
        makeAdminPanelRecordsViewMasterProfileAction(item.appointmentId),
      ),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK_TO_LIST, ADMIN_PANEL_ACTION.RECORDS_BACK_TO_LIST)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK_TO_MENU, ADMIN_PANEL_ACTION.OPEN_RECORDS)],
  ]);
}

/**
 * @summary Клавіатура профілю майстра, відкритого з картки запису.
 */
export function createAdminBookingMasterProfileKeyboard(
  item: AdminBookingItem,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.RECORDS_VIEW_CLIENT_PROFILE,
        makeAdminPanelRecordsViewClientProfileAction(item.appointmentId),
      ),
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.RECORDS_NEXT_PENDING,
        makeAdminPanelRecordsNextPendingAction(item.appointmentId),
      ),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK_TO_LIST, ADMIN_PANEL_ACTION.RECORDS_BACK_TO_LIST)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK_TO_MENU, ADMIN_PANEL_ACTION.OPEN_RECORDS)],
  ]);
}

/**
 * @summary Текст підтвердження скасування запису адміністратором.
 */
export function formatAdminCancelBookingConfirmText(item: AdminBookingItem): string {
  const warning =
    item.status === 'confirmed'
      ? '\n\n⚠️ Ви скасовуєте вже підтверджений запис.\nПереконайтесь, що все узгоджено з клієнтом.'
      : '';

  return (
    '⚠️ Підтвердження скасування\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Ви дійсно хочете скасувати цей запис?\n\n' +
    `👤 ${formatClientDisplayName(item)}\n` +
    `💼 ${item.serviceName}\n` +
    `👩‍🎨 ${item.masterName}\n` +
    `🕒 ${formatDateTimeRange(item.startAt, item.endAt)}` +
    warning
  );
}

/**
 * @summary Клавіатура підтвердження скасування.
 */
export function createAdminCancelBookingConfirmKeyboard(
  item: AdminBookingItem,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.RECORDS_CONFIRM_CANCEL,
        makeAdminPanelRecordsCancelConfirmAction(item.appointmentId),
      ),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK_TO_LIST, ADMIN_PANEL_ACTION.RECORDS_BACK_TO_LIST)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK, ADMIN_PANEL_ACTION.RECORDS_BACK)],
  ]);
}

/**
 * @summary Текст кроку вибору дати для перенесення.
 */
export function formatAdminRescheduleDateStepText(item: AdminBookingItem): string {
  return (
    '🔄 Перенесення запису — крок 1/3\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👤 Клієнт: ${formatClientDisplayName(item)}\n` +
    `💼 Послуга: ${item.serviceName}\n` +
    `👩‍🎨 Майстер: ${item.masterName}\n` +
    `🕒 Поточний час: ${formatDateTimeRange(item.startAt, item.endAt)}\n\n` +
    'Оберіть нову дату для перенесення.'
  );
}

/**
 * @summary Клавіатура кроку вибору дати.
 */
export function createAdminRescheduleDateKeyboard(
  dates: Date[],
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    ...dates.map((date) => {
      const year = String(date.getFullYear());
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const code = `${year}${month}${day}`;
      return [
        Markup.button.callback(
          formatDateLabel(date),
          makeAdminPanelRecordsRescheduleDateAction(code),
        ),
      ];
    }),
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_CANCEL_ACTION, ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_CANCEL)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK, ADMIN_PANEL_ACTION.RECORDS_BACK)],
  ]);
}

/**
 * @summary Текст кроку вибору часу для перенесення.
 */
export function formatAdminRescheduleTimeStepText(
  item: AdminBookingItem,
  dateCode: string,
): string {
  return (
    '🔄 Перенесення запису — крок 2/3\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👤 Клієнт: ${formatClientDisplayName(item)}\n` +
    `💼 Послуга: ${item.serviceName}\n` +
    `👩‍🎨 Майстер: ${item.masterName}\n` +
    `📆 Нова дата: ${formatDateCodeLabel(dateCode)}\n\n` +
    'Оберіть новий час.'
  );
}

/**
 * @summary Клавіатура кроку вибору часу.
 */
export function createAdminRescheduleTimeKeyboard(
  timeCodes: string[],
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows: ReturnType<typeof Markup.button.callback>[][] = [];

  for (let i = 0; i < timeCodes.length; i += 2) {
    const first = timeCodes[i];
    const second = timeCodes[i + 1];
    const firstLabel = `${first.slice(0, 2)}:${first.slice(2, 4)}`;

    const row = [Markup.button.callback(firstLabel, makeAdminPanelRecordsRescheduleTimeAction(first))];
    if (second) {
      const secondLabel = `${second.slice(0, 2)}:${second.slice(2, 4)}`;
      row.push(Markup.button.callback(secondLabel, makeAdminPanelRecordsRescheduleTimeAction(second)));
    }

    rows.push(row);
  }

  return Markup.inlineKeyboard([
    ...rows,
    [
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK_TO_DATE, ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_BACK_TO_DATE),
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_CANCEL_ACTION, ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_CANCEL),
    ],
  ]);
}

/**
 * @summary Текст підтвердження перенесення.
 */
export function formatAdminRescheduleConfirmText(
  item: AdminBookingItem,
  newStartAt: Date,
  newEndAt: Date,
): string {
  return (
    '🔄 Перенесення запису — крок 3/3\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👤 Клієнт: ${formatClientDisplayName(item)}\n` +
    `💼 Послуга: ${item.serviceName}\n` +
    `👩‍🎨 Майстер: ${item.masterName}\n\n` +
    `🕒 Було: ${formatDateTimeRange(item.startAt, item.endAt)}\n` +
    `🕒 Стане: ${formatDateTimeRange(newStartAt, newEndAt)}\n\n` +
    'Підтвердіть перенесення запису.'
  );
}

/**
 * @summary Клавіатура підтвердження перенесення.
 */
export function createAdminRescheduleConfirmKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_CONFIRM_RESCHEDULE, ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_CONFIRM)],
    [
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK_TO_TIME, ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_BACK_TO_TIME),
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_CANCEL_ACTION, ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_CANCEL),
    ],
  ]);
}

/**
 * @summary Текст кроку вибору нового майстра.
 */
export function formatAdminChangeMasterStepText(
  item: AdminBookingItem,
  masters: MasterBookingOption[],
): string {
  const emptyHint =
    masters.length === 0
      ? '\n\n⚠️ Немає доступних майстрів для цієї послуги.'
      : '\n\nОберіть нового майстра:';

  return (
    '👩‍🎨 Зміна майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👤 Клієнт: ${formatClientDisplayName(item)}\n` +
    `💼 Послуга: ${item.serviceName}\n` +
    `👩‍🎨 Поточний майстер: ${item.masterName}\n` +
    `🕒 Час: ${formatDateTimeRange(item.startAt, item.endAt)}` +
    emptyHint
  );
}

/**
 * @summary Клавіатура вибору нового майстра.
 */
export function createAdminChangeMasterSelectKeyboard(
  item: AdminBookingItem,
  masters: MasterBookingOption[],
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = masters.map((master, index) => {
    const ratingSuffix = master.ratingCount > 0 ? ` ⭐ ${master.ratingAvg}` : '';
    return [
      Markup.button.callback(
        `${index + 1}. ${master.displayName}${ratingSuffix}`,
        makeAdminPanelRecordsChangeMasterSelectAction(item.appointmentId, master.masterId),
      ),
    ];
  });

  return Markup.inlineKeyboard([
    ...rows,
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK_TO_LIST, ADMIN_PANEL_ACTION.RECORDS_BACK_TO_LIST)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_CANCEL_ACTION, ADMIN_PANEL_ACTION.RECORDS_CHANGE_MASTER_CANCEL)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK, ADMIN_PANEL_ACTION.RECORDS_BACK)],
  ]);
}

/**
 * @summary Текст підтвердження зміни майстра.
 */
export function formatAdminChangeMasterConfirmText(
  item: AdminBookingItem,
  newMasterDisplayName: string,
): string {
  return (
    '👩‍🎨 Підтвердження зміни майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👤 Клієнт: ${formatClientDisplayName(item)}\n` +
    `💼 Послуга: ${item.serviceName}\n` +
    `🕒 Час: ${formatDateTimeRange(item.startAt, item.endAt)}\n\n` +
    `👩‍🎨 Було: ${item.masterName}\n` +
    `👩‍🎨 Стане: ${newMasterDisplayName}\n\n` +
    'Підтвердіть зміну майстра.'
  );
}

/**
 * @summary Клавіатура підтвердження зміни майстра.
 */
export function createAdminChangeMasterConfirmKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_CONFIRM_CHANGE_MASTER, ADMIN_PANEL_ACTION.RECORDS_CHANGE_MASTER_CONFIRM)],
    [
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_CHANGE_MASTER, ADMIN_PANEL_ACTION.RECORDS_CHANGE_MASTER_BACK),
      Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.RECORDS_CANCEL_ACTION, ADMIN_PANEL_ACTION.RECORDS_CHANGE_MASTER_CANCEL),
    ],
  ]);
}
