import { Markup } from 'telegraf';
import type {
  AdminBookingItem,
  AdminBookingsCategory,
  AdminBookingsFeedPage,
} from '../../types/db-helpers/db-admin-bookings.types.js';
import type { MasterBookingOption } from '../../types/db-helpers/db-masters.types.js';
import {
  ADMIN_PANEL_ACTION,
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
import { tBot, tBotTemplate } from './i18n.bot.js';
import type { BotUiLanguage } from './i18n.bot.js';

/**
 * @file admin-bookings-view.bot.ts
 * @summary UI/helper-и для блоку "Записи" в адмін-панелі.
 */

function toSafeDate(value: Date | string): Date | null {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

const DATE_LOCALE_BY_LANGUAGE: Record<BotUiLanguage, string> = {
  uk: 'uk-UA',
  en: 'en-US',
  cs: 'cs-CZ',
};

function formatUiDate(value: Date | string, language: BotUiLanguage): string {
  const parsed = toSafeDate(value);
  if (!parsed) return tBot(language, 'ADMIN_PANEL_RECORDS_EMPTY_VALUE');
  return parsed.toLocaleDateString(DATE_LOCALE_BY_LANGUAGE[language]);
}

function formatUiTime(value: Date | string, language: BotUiLanguage): string {
  const parsed = toSafeDate(value);
  if (!parsed) return tBot(language, 'ADMIN_PANEL_RECORDS_EMPTY_VALUE');
  return parsed.toLocaleTimeString(DATE_LOCALE_BY_LANGUAGE[language], { hour: '2-digit', minute: '2-digit' });
}

function formatDateTimeRange(
  startAt: Date | string,
  endAt: Date | string,
  language: BotUiLanguage,
): string {
  const date = formatUiDate(startAt, language);
  const startTime = formatUiTime(startAt, language);
  const endTime = formatUiTime(endAt, language);
  const emptyValue = tBot(language, 'ADMIN_PANEL_RECORDS_EMPTY_VALUE');
  if (date === emptyValue || startTime === emptyValue || endTime === emptyValue) {
    return tBot(language, 'ADMIN_PANEL_RECORDS_INVALID_DATETIME');
  }
  return `${date} • ${startTime}–${endTime}`;
}

function formatPrice(price: string, currencyCode: string): string {
  const normalized = price.replace(/[.,]00$/, '').replace(/([.,]\d)0$/, '$1');
  return `${normalized} ${currencyCode}`;
}

function formatClientDisplayName(item: AdminBookingItem, language: BotUiLanguage): string {
  if (item.attendeeName && item.attendeeName.trim().length > 0) {
    return item.attendeeName;
  }

  const fullName = `${item.clientFirstName}${item.clientLastName ? ` ${item.clientLastName}` : ''}`.trim();
  return fullName || tBot(language, 'ADMIN_PANEL_RECORDS_CLIENT_FALLBACK');
}

function formatBookingStatusLabel(status: AdminBookingItem['status'], language: BotUiLanguage): string {
  switch (status) {
    case 'pending':
      return tBot(language, 'ADMIN_PANEL_RECORDS_STATUS_PENDING');
    case 'confirmed':
      return tBot(language, 'ADMIN_PANEL_RECORDS_STATUS_CONFIRMED');
    case 'completed':
      return tBot(language, 'ADMIN_PANEL_RECORDS_STATUS_COMPLETED');
    case 'canceled':
      return tBot(language, 'ADMIN_PANEL_RECORDS_STATUS_CANCELED');
    case 'transferred':
      return tBot(language, 'ADMIN_PANEL_RECORDS_STATUS_TRANSFERRED');
    default:
      return status;
  }
}

function formatTelegramHandle(username: string | null, language: BotUiLanguage): string {
  if (!username) return tBot(language, 'ADMIN_PANEL_RECORDS_NOT_SET');
  return `@${username}`;
}

function buildContactChannelsLines(item: AdminBookingItem, language: BotUiLanguage): string {
  const lines: string[] = [];
  if (item.clientTelegramUsername) {
    lines.push(`• Telegram: ${formatTelegramHandle(item.clientTelegramUsername, language)}`);
  }
  if (item.attendeePhoneE164) {
    lines.push(
      tBotTemplate(language, 'ADMIN_PANEL_RECORDS_CONTACT_PHONE_LINE', {
        phone: item.attendeePhoneE164,
      }),
    );
  }
  if (item.attendeeEmail) {
    lines.push(
      tBotTemplate(language, 'ADMIN_PANEL_RECORDS_CONTACT_EMAIL_LINE', {
        email: item.attendeeEmail,
      }),
    );
  }

  if (lines.length === 0) {
    return tBot(language, 'ADMIN_PANEL_RECORDS_CONTACT_EMPTY');
  }

  return lines.join('\n');
}

function categoryTitle(category: AdminBookingsCategory, language: BotUiLanguage): string {
  switch (category) {
    case 'pending':
      return tBot(language, 'ADMIN_PANEL_RECORDS_CATEGORY_PENDING');
    case 'today':
      return tBot(language, 'ADMIN_PANEL_RECORDS_FEED_TITLE_TODAY');
    case 'tomorrow':
      return tBot(language, 'ADMIN_PANEL_RECORDS_FEED_TITLE_TOMORROW');
    case 'all':
      return tBot(language, 'ADMIN_PANEL_RECORDS_FEED_TITLE_ALL');
    case 'canceled':
      return tBot(language, 'ADMIN_PANEL_RECORDS_FEED_TITLE_CANCELED');
    default:
      return tBot(language, 'ADMIN_PANEL_RECORDS_MENU_TITLE');
  }
}

function categoryEmptyText(category: AdminBookingsCategory, language: BotUiLanguage): string {
  switch (category) {
    case 'pending':
      return tBot(language, 'ADMIN_PANEL_RECORDS_EMPTY_PENDING');
    case 'today':
      return tBot(language, 'ADMIN_PANEL_RECORDS_EMPTY_TODAY');
    case 'tomorrow':
      return tBot(language, 'ADMIN_PANEL_RECORDS_EMPTY_TOMORROW');
    case 'all':
      return tBot(language, 'ADMIN_PANEL_RECORDS_EMPTY_ALL');
    case 'canceled':
      return tBot(language, 'ADMIN_PANEL_RECORDS_EMPTY_CANCELED');
    default:
      return tBot(language, 'ADMIN_PANEL_RECORDS_EMPTY_ALL');
  }
}

function cardIndexLabel(index: number): string {
  return `${index + 1}️⃣`;
}

function formatDateLabel(date: Date, language: BotUiLanguage): string {
  const weekday = date.toLocaleDateString(DATE_LOCALE_BY_LANGUAGE[language], { weekday: 'short' });
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${weekday} ${day}.${month}`;
}

function formatDateCodeLabel(dateCode: string, language: BotUiLanguage): string {
  const year = Number(dateCode.slice(0, 4));
  const month = Number(dateCode.slice(4, 6));
  const day = Number(dateCode.slice(6, 8));
  return new Date(year, month - 1, day).toLocaleDateString(DATE_LOCALE_BY_LANGUAGE[language]);
}

/**
 * @summary Форматує текст списку записів по категорії.
 */
export function formatAdminBookingsFeedText(
  page: AdminBookingsFeedPage,
  language: BotUiLanguage = 'uk',
): string {
  const title = categoryTitle(page.category, language);
  if (page.items.length === 0) {
    return `${title}\n━━━━━━━━━━━━━━\n\n${categoryEmptyText(page.category, language)}`;
  }

  const lines = page.items.map((item, index) => {
    const dateLabel = formatUiDate(item.startAt, language);
    const startTime = formatUiTime(item.startAt, language);
    const endTime = formatUiTime(item.endAt, language);
    return (
      `${cardIndexLabel(index)}\n\n` +
      `👤 ${formatClientDisplayName(item, language)}\n` +
      `💼 ${item.serviceName}\n` +
      `👩‍🎨 ${item.masterName}\n` +
      `${tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_PRICE', { price: formatPrice(item.priceAmount, item.currencyCode) })}\n` +
      `📅 ${dateLabel}\n` +
      `⏰ ${startTime}–${endTime}\n` +
      `${formatBookingStatusLabel(item.status, language)}`
    );
  });

  const pageNumber = Math.floor(page.offset / page.limit) + 1;
  const totalPages = Math.max(1, Math.ceil(page.total / page.limit));

  return (
    `${title}\n━━━━━━━━━━━━━━\n\n${lines.join('\n\n⸻\n\n')}\n\n` +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_PAGE', { page: pageNumber, total: totalPages })
  );
}

/**
 * @summary Клавіатура списку записів по категорії.
 */
export function createAdminBookingsFeedKeyboard(
  page: AdminBookingsFeedPage,
  language: BotUiLanguage = 'uk',
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
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_BTN_PREV'), ADMIN_PANEL_ACTION.RECORDS_LIST_PREV_PAGE),
    );
  }
  if (page.hasNextPage) {
    paginationRow.push(
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_BTN_NEXT'), ADMIN_PANEL_ACTION.RECORDS_LIST_NEXT_PAGE),
    );
  }

  return Markup.inlineKeyboard([
    ...numberRows,
    ...(paginationRow.length > 0 ? [paginationRow] : []),
    ...(page.category === 'canceled' && page.total > 0
      ? [[Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_CLEAR_CANCELED'), ADMIN_PANEL_ACTION.RECORDS_CLEAR_CANCELED_REQUEST)]]
      : []),
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK_TO_MENU'), ADMIN_PANEL_ACTION.OPEN_RECORDS)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK'), ADMIN_PANEL_ACTION.RECORDS_BACK)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_HOME'), ADMIN_PANEL_ACTION.HOME)],
  ]);
}

/**
 * @summary Форматує текст детальної картки запису.
 */
export function formatAdminBookingDetailsCardText(
  item: AdminBookingItem,
  language: BotUiLanguage = 'uk',
): string {
  const comment = item.clientComment?.trim();
  const commentBlock = comment ? `\n\n${tBot(language, 'ADMIN_PANEL_RECORDS_LABEL_COMMENT')}\n${comment}` : '';
  let stateHint = '';
  if (item.status === 'canceled') {
    stateHint = `\n\n${tBot(language, 'ADMIN_PANEL_RECORDS_HINT_CANCELED')}`;
  } else if (item.status === 'completed') {
    stateHint = `\n\n${tBot(language, 'ADMIN_PANEL_RECORDS_HINT_COMPLETED')}`;
  } else if (item.status === 'transferred') {
    stateHint = `\n\n${tBot(language, 'ADMIN_PANEL_RECORDS_HINT_TRANSFERRED')}`;
  } else if (item.status === 'pending') {
    stateHint = `\n\n${tBot(language, 'ADMIN_PANEL_RECORDS_HINT_PENDING')}`;
  } else if (item.status === 'confirmed') {
    stateHint = `\n\n${tBot(language, 'ADMIN_PANEL_RECORDS_HINT_CONFIRMED')}`;
  }

  return (
    `${tBot(language, 'ADMIN_PANEL_RECORDS_CARD_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_CLIENT', {
      client: formatClientDisplayName(item, language),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_PHONE', {
      phone: item.attendeePhoneE164 ?? tBot(language, 'ADMIN_PANEL_RECORDS_NOT_SET'),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_EMAIL', {
      email: item.attendeeEmail ?? tBot(language, 'ADMIN_PANEL_RECORDS_NOT_SET'),
    }) + '\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_SERVICE', { service: item.serviceName }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_MASTER', { master: item.masterName }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_TIME', { time: formatDateTimeRange(item.startAt, item.endAt, language) }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_PRICE', { price: formatPrice(item.priceAmount, item.currencyCode) }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_STATUS', { status: formatBookingStatusLabel(item.status, language) }) +
    commentBlock +
    stateHint
  );
}

/**
 * @summary Клавіатура детальної картки запису.
 */
export function createAdminBookingDetailsCardKeyboard(
  item: AdminBookingItem,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const actionRows: ReturnType<typeof Markup.button.callback>[][] = [];
  actionRows.push([
    Markup.button.callback(
      tBot(language, 'ADMIN_PANEL_RECORDS_BTN_CONTACT_CLIENT'),
      makeAdminPanelRecordsContactClientAction(item.appointmentId),
    ),
  ]);
  actionRows.push([
    Markup.button.callback(
      tBot(language, 'ADMIN_PANEL_RECORDS_BTN_VIEW_CLIENT_PROFILE'),
      makeAdminPanelRecordsViewClientProfileAction(item.appointmentId),
    ),
  ]);
  actionRows.push([
    Markup.button.callback(
      tBot(language, 'ADMIN_PANEL_RECORDS_BTN_VIEW_MASTER_PROFILE'),
      makeAdminPanelRecordsViewMasterProfileAction(item.appointmentId),
    ),
  ]);
  actionRows.push([
    Markup.button.callback(
      tBot(language, 'ADMIN_PANEL_RECORDS_BTN_NEXT_PENDING'),
      makeAdminPanelRecordsNextPendingAction(item.appointmentId),
    ),
  ]);

  if (item.status === 'pending') {
    actionRows.push([
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_RECORDS_BTN_CONFIRM'),
        makeAdminPanelRecordsConfirmAction(item.appointmentId),
      ),
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_RECORDS_BTN_CANCEL'),
        makeAdminPanelRecordsCancelRequestAction(item.appointmentId),
      ),
    ]);
    actionRows.push([
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_RECORDS_BTN_RESCHEDULE'),
        makeAdminPanelRecordsRescheduleAction(item.appointmentId),
      ),
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_RECORDS_BTN_CHANGE_MASTER'),
        makeAdminPanelRecordsChangeMasterAction(item.appointmentId),
      ),
    ]);
  } else if (item.status === 'confirmed') {
    actionRows.push([
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_RECORDS_BTN_RESCHEDULE'),
        makeAdminPanelRecordsRescheduleAction(item.appointmentId),
      ),
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_RECORDS_BTN_CANCEL'),
        makeAdminPanelRecordsCancelRequestAction(item.appointmentId),
      ),
    ]);
    actionRows.push([
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_RECORDS_BTN_CHANGE_MASTER'),
        makeAdminPanelRecordsChangeMasterAction(item.appointmentId),
      ),
    ]);
  }

  if (item.status === 'canceled' || item.status === 'completed' || item.status === 'transferred') {
    actionRows.push([
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_RECORDS_BTN_HARD_DELETE'),
        makeAdminPanelRecordsHardDeleteRequestAction(item.appointmentId),
      ),
    ]);
  }

  return Markup.inlineKeyboard([
    ...actionRows,
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK_TO_LIST'), ADMIN_PANEL_ACTION.RECORDS_BACK_TO_LIST)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK_TO_MENU'), ADMIN_PANEL_ACTION.OPEN_RECORDS)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK'), ADMIN_PANEL_ACTION.RECORDS_BACK)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_HOME'), ADMIN_PANEL_ACTION.HOME)],
  ]);
}

/**
 * @summary Текст підтвердження видалення запису назавжди.
 */
export function formatAdminHardDeleteBookingConfirmText(
  item: AdminBookingItem,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_RECORDS_HARD_DELETE_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'ADMIN_PANEL_RECORDS_HARD_DELETE_CONFIRM_BODY')}\n\n` +
    `👤 ${formatClientDisplayName(item, language)}\n` +
    `💼 ${item.serviceName}\n` +
    `👩‍🎨 ${item.masterName}\n` +
    `🕒 ${formatDateTimeRange(item.startAt, item.endAt, language)}\n` +
    `📌 ${formatBookingStatusLabel(item.status, language)}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_RECORDS_HARD_DELETE_CONFIRM_HINT')}`
  );
}

/**
 * @summary Клавіатура підтвердження видалення запису назавжди.
 */
export function createAdminHardDeleteBookingConfirmKeyboard(
  item: AdminBookingItem,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_RECORDS_BTN_HARD_DELETE_CONFIRM'),
        makeAdminPanelRecordsHardDeleteConfirmAction(item.appointmentId),
      ),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_CANCEL_ACTION'), ADMIN_PANEL_ACTION.RECORDS_HARD_DELETE_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK_TO_LIST'), ADMIN_PANEL_ACTION.RECORDS_BACK_TO_LIST)],
  ]);
}

/**
 * @summary Текст підтвердження очищення списку скасованих записів.
 */
export function formatAdminClearCanceledBookingsConfirmText(
  total: number,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_RECORDS_CLEAR_CANCELED_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_CLEAR_CANCELED_CONFIRM_BODY', {
      total,
    })
  );
}

/**
 * @summary Клавіатура підтвердження очищення скасованих записів.
 */
export function createAdminClearCanceledBookingsConfirmKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_CLEAR_CANCELED_CONFIRM'), ADMIN_PANEL_ACTION.RECORDS_CLEAR_CANCELED_CONFIRM)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_CANCEL_ACTION'), ADMIN_PANEL_ACTION.RECORDS_CLEAR_CANCELED_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK_TO_MENU'), ADMIN_PANEL_ACTION.OPEN_RECORDS)],
  ]);
}

/**
 * @summary Текст контактів клієнта для швидкого звʼязку.
 */
export function formatAdminBookingContactClientText(
  item: AdminBookingItem,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_RECORDS_CONTACT_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `👤 ${formatClientDisplayName(item, language)}\n` +
    `${buildContactChannelsLines(item, language)}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_RECORDS_CONTACT_HINT')}`
  );
}

/**
 * @summary Клавіатура екрану контактів клієнта.
 */
export function createAdminBookingContactClientKeyboard(
  item: AdminBookingItem,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows: Array<
    Array<ReturnType<typeof Markup.button.callback> | ReturnType<typeof Markup.button.url>>
  > = [];
  if (item.clientTelegramUsername) {
    rows.push([
      Markup.button.url(
        `💬 ${formatTelegramHandle(item.clientTelegramUsername, language)}`,
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
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK_TO_LIST'), ADMIN_PANEL_ACTION.RECORDS_BACK_TO_LIST)],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_RECORDS_BTN_VIEW_CLIENT_PROFILE'),
        makeAdminPanelRecordsViewClientProfileAction(item.appointmentId),
      ),
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_RECORDS_BTN_NEXT_PENDING'),
        makeAdminPanelRecordsNextPendingAction(item.appointmentId),
      ),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK_TO_MENU'), ADMIN_PANEL_ACTION.OPEN_RECORDS)],
  ]);
}

/**
 * @summary Текст профілю клієнта з картки запису.
 */
export function formatAdminBookingClientProfileText(
  item: AdminBookingItem,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_RECORDS_CLIENT_PROFILE_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_CLIENT_PROFILE_ID', { id: item.clientId }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_CLIENT_PROFILE_NAME', {
      name: formatClientDisplayName(item, language),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_CLIENT_PROFILE_TELEGRAM', {
      telegram: formatTelegramHandle(item.clientTelegramUsername, language),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_PHONE', {
      phone: item.attendeePhoneE164 ?? tBot(language, 'ADMIN_PANEL_RECORDS_NOT_SET'),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_EMAIL', {
      email: item.attendeeEmail ?? tBot(language, 'ADMIN_PANEL_RECORDS_NOT_SET'),
    }) + '\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_CLIENT_PROFILE_NEAREST', {
      time: formatDateTimeRange(item.startAt, item.endAt, language),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_CLIENT_PROFILE_STATUS', {
      status: formatBookingStatusLabel(item.status, language),
    })
  );
}

/**
 * @summary Клавіатура профілю клієнта з картки запису.
 */
export function createAdminBookingClientProfileKeyboard(
  item: AdminBookingItem,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_RECORDS_BTN_CONTACT_CLIENT'),
        makeAdminPanelRecordsContactClientAction(item.appointmentId),
      ),
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_RECORDS_BTN_NEXT_PENDING'),
        makeAdminPanelRecordsNextPendingAction(item.appointmentId),
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_RECORDS_BTN_VIEW_MASTER_PROFILE'),
        makeAdminPanelRecordsViewMasterProfileAction(item.appointmentId),
      ),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK_TO_LIST'), ADMIN_PANEL_ACTION.RECORDS_BACK_TO_LIST)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK_TO_MENU'), ADMIN_PANEL_ACTION.OPEN_RECORDS)],
  ]);
}

/**
 * @summary Клавіатура профілю майстра, відкритого з картки запису.
 */
export function createAdminBookingMasterProfileKeyboard(
  item: AdminBookingItem,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_RECORDS_BTN_VIEW_CLIENT_PROFILE'),
        makeAdminPanelRecordsViewClientProfileAction(item.appointmentId),
      ),
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_RECORDS_BTN_NEXT_PENDING'),
        makeAdminPanelRecordsNextPendingAction(item.appointmentId),
      ),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK_TO_LIST'), ADMIN_PANEL_ACTION.RECORDS_BACK_TO_LIST)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK_TO_MENU'), ADMIN_PANEL_ACTION.OPEN_RECORDS)],
  ]);
}

/**
 * @summary Текст підтвердження скасування запису адміністратором.
 */
export function formatAdminCancelBookingConfirmText(
  item: AdminBookingItem,
  language: BotUiLanguage = 'uk',
): string {
  const warning =
    item.status === 'confirmed'
      ? `\n\n${tBot(language, 'ADMIN_PANEL_RECORDS_CANCEL_CONFIRM_WARNING_CONFIRMED')}`
      : '';

  return (
    `${tBot(language, 'ADMIN_PANEL_RECORDS_CANCEL_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'ADMIN_PANEL_RECORDS_CANCEL_CONFIRM_ASK')}\n\n` +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_CLIENT', {
      client: formatClientDisplayName(item, language),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_SERVICE', { service: item.serviceName }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_MASTER', { master: item.masterName }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_TIME', {
      time: formatDateTimeRange(item.startAt, item.endAt, language),
    }) +
    warning
  );
}

/**
 * @summary Клавіатура підтвердження скасування.
 */
export function createAdminCancelBookingConfirmKeyboard(
  item: AdminBookingItem,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_RECORDS_BTN_CONFIRM_CANCEL'),
        makeAdminPanelRecordsCancelConfirmAction(item.appointmentId),
      ),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK_TO_LIST'), ADMIN_PANEL_ACTION.RECORDS_BACK_TO_LIST)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK'), ADMIN_PANEL_ACTION.RECORDS_BACK)],
  ]);
}

/**
 * @summary Текст кроку вибору дати для перенесення.
 */
export function formatAdminRescheduleDateStepText(
  item: AdminBookingItem,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_RECORDS_RESCHEDULE_STEP_DATE_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_CLIENT', {
      client: formatClientDisplayName(item, language),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_SERVICE', { service: item.serviceName }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_MASTER', { master: item.masterName }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_TIME', {
      time: formatDateTimeRange(item.startAt, item.endAt, language),
    }) + '\n\n' +
    tBot(language, 'ADMIN_PANEL_RECORDS_RESCHEDULE_SELECT_DATE')
  );
}

/**
 * @summary Клавіатура кроку вибору дати.
 */
export function createAdminRescheduleDateKeyboard(
  dates: Date[],
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    ...dates.map((date) => {
      const year = String(date.getFullYear());
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const code = `${year}${month}${day}`;
      return [
        Markup.button.callback(
          formatDateLabel(date, language),
          makeAdminPanelRecordsRescheduleDateAction(code),
        ),
      ];
    }),
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_CANCEL_ACTION'), ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK'), ADMIN_PANEL_ACTION.RECORDS_BACK)],
  ]);
}

/**
 * @summary Текст кроку вибору часу для перенесення.
 */
export function formatAdminRescheduleTimeStepText(
  item: AdminBookingItem,
  dateCode: string,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_RECORDS_RESCHEDULE_STEP_TIME_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_CLIENT', {
      client: formatClientDisplayName(item, language),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_SERVICE', { service: item.serviceName }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_MASTER', { master: item.masterName }) + '\n' +
    `📆 ${formatDateCodeLabel(dateCode, language)}\n\n` +
    tBot(language, 'ADMIN_PANEL_RECORDS_RESCHEDULE_SELECT_TIME')
  );
}

/**
 * @summary Клавіатура кроку вибору часу.
 */
export function createAdminRescheduleTimeKeyboard(
  timeCodes: string[],
  language: BotUiLanguage = 'uk',
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
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK_TO_DATE'), ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_BACK_TO_DATE),
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_CANCEL_ACTION'), ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_CANCEL),
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
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_RECORDS_RESCHEDULE_STEP_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_CLIENT', {
      client: formatClientDisplayName(item, language),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_SERVICE', { service: item.serviceName }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_MASTER', { master: item.masterName }) + '\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_RESCHEDULE_PREVIOUS_TIME', {
      time: formatDateTimeRange(item.startAt, item.endAt, language),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_RESCHEDULE_NEW_TIME', {
      time: formatDateTimeRange(newStartAt, newEndAt, language),
    }) + '\n\n' +
    tBot(language, 'ADMIN_PANEL_RECORDS_RESCHEDULE_CONFIRM_ASK')
  );
}

/**
 * @summary Клавіатура підтвердження перенесення.
 */
export function createAdminRescheduleConfirmKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_CONFIRM_RESCHEDULE'), ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_CONFIRM)],
    [
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK_TO_TIME'), ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_BACK_TO_TIME),
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_CANCEL_ACTION'), ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_CANCEL),
    ],
  ]);
}

/**
 * @summary Текст кроку вибору нового майстра.
 */
export function formatAdminChangeMasterStepText(
  item: AdminBookingItem,
  masters: MasterBookingOption[],
  language: BotUiLanguage = 'uk',
): string {
  const emptyHint =
    masters.length === 0
      ? `\n\n${tBot(language, 'ADMIN_PANEL_RECORDS_CHANGE_MASTER_NO_CANDIDATES')}`
      : `\n\n${tBot(language, 'ADMIN_PANEL_RECORDS_CHANGE_MASTER_PICK')}`;

  return (
    `${tBot(language, 'ADMIN_PANEL_RECORDS_CHANGE_MASTER_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_CLIENT', {
      client: formatClientDisplayName(item, language),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_SERVICE', { service: item.serviceName }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_MASTER', { master: item.masterName }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_TIME', {
      time: formatDateTimeRange(item.startAt, item.endAt, language),
    }) +
    emptyHint
  );
}

/**
 * @summary Клавіатура вибору нового майстра.
 */
export function createAdminChangeMasterSelectKeyboard(
  item: AdminBookingItem,
  masters: MasterBookingOption[],
  language: BotUiLanguage = 'uk',
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
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK_TO_LIST'), ADMIN_PANEL_ACTION.RECORDS_BACK_TO_LIST)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_CANCEL_ACTION'), ADMIN_PANEL_ACTION.RECORDS_CHANGE_MASTER_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_BACK'), ADMIN_PANEL_ACTION.RECORDS_BACK)],
  ]);
}

/**
 * @summary Текст підтвердження зміни майстра.
 */
export function formatAdminChangeMasterConfirmText(
  item: AdminBookingItem,
  newMasterDisplayName: string,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `${tBot(language, 'ADMIN_PANEL_RECORDS_CHANGE_MASTER_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_CLIENT', {
      client: formatClientDisplayName(item, language),
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_SERVICE', { service: item.serviceName }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_LABEL_TIME', {
      time: formatDateTimeRange(item.startAt, item.endAt, language),
    }) + '\n\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_CHANGE_MASTER_PREVIOUS', {
      master: item.masterName,
    }) + '\n' +
    tBotTemplate(language, 'ADMIN_PANEL_RECORDS_CHANGE_MASTER_NEW', {
      master: newMasterDisplayName,
    }) + '\n\n' +
    tBot(language, 'ADMIN_PANEL_RECORDS_CHANGE_MASTER_CONFIRM_ASK')
  );
}

/**
 * @summary Клавіатура підтвердження зміни майстра.
 */
export function createAdminChangeMasterConfirmKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_CONFIRM_CHANGE_MASTER'), ADMIN_PANEL_ACTION.RECORDS_CHANGE_MASTER_CONFIRM)],
    [
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_CHANGE_MASTER'), ADMIN_PANEL_ACTION.RECORDS_CHANGE_MASTER_BACK),
      Markup.button.callback(tBot(language, 'ADMIN_PANEL_RECORDS_BTN_CANCEL_ACTION'), ADMIN_PANEL_ACTION.RECORDS_CHANGE_MASTER_CANCEL),
    ],
  ]);
}
