import { Markup } from 'telegraf';
import type {
  MasterBookingsCategory,
  MasterBookingsFeedPage,
  MasterPendingBookingItem,
} from '../../types/db-helpers/db-master-bookings.types.js';
import {
  MASTER_PANEL_ACTION,
  makeMasterPanelBookingCancelConfirmAction,
  makeMasterPanelBookingCancelRequestAction,
  makeMasterPanelBookingConfirmAction,
  makeMasterPanelBookingOpenCardAction,
  makeMasterPanelBookingProfileAction,
  makeMasterPanelBookingRescheduleDateAction,
  makeMasterPanelBookingRescheduleAction,
  makeMasterPanelBookingRescheduleTimeAction,
} from '../../types/bot-master-panel.types.js';
import type { BotUiLanguage } from './i18n.bot.js';
import { tBot, tBotTemplate } from './i18n.bot.js';

/**
 * @file master-bookings-view.bot.ts
 * @summary UI/helper-и для блоку "Мої записи" у панелі майстра.
 */

function toLocale(language: BotUiLanguage): string {
  if (language === 'en') return 'en-US';
  if (language === 'cs') return 'cs-CZ';
  return 'uk-UA';
}

function formatDateTimeRange(startAt: Date, endAt: Date, language: BotUiLanguage): string {
  const locale = toLocale(language);
  const date = startAt.toLocaleDateString(locale);
  const startTime = startAt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const endTime = endAt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

  return `${date} • ${startTime}–${endTime}`;
}

function formatPrice(price: string, currencyCode: string): string {
  const normalized = price.replace(/[.,]00$/, '').replace(/([.,]\d)0$/, '$1');
  return `${normalized} ${currencyCode}`;
}

function formatClientDisplayName(item: MasterPendingBookingItem, language: BotUiLanguage): string {
  if (item.attendeeName && item.attendeeName.trim().length > 0) {
    return item.attendeeName;
  }

  const fullName = `${item.clientFirstName}${item.clientLastName ? ` ${item.clientLastName}` : ''}`.trim();
  return fullName || tBot(language, 'MASTER_PANEL_BOOKINGS_CLIENT_FALLBACK');
}

function formatBookingStatusLabel(status: MasterPendingBookingItem['status'], language: BotUiLanguage): string {
  switch (status) {
    case 'pending':
      return tBot(language, 'MASTER_PANEL_BOOKINGS_STATUS_PENDING');
    case 'confirmed':
      return tBot(language, 'MASTER_PANEL_BOOKINGS_STATUS_CONFIRMED');
    case 'completed':
      return tBot(language, 'MASTER_PANEL_BOOKINGS_STATUS_COMPLETED');
    case 'canceled':
      return tBot(language, 'MASTER_PANEL_BOOKINGS_STATUS_CANCELED');
    case 'transferred':
      return tBot(language, 'MASTER_PANEL_BOOKINGS_STATUS_TRANSFERRED');
    default:
      return status;
  }
}

function categoryTitle(category: MasterBookingsCategory, language: BotUiLanguage): string {
  switch (category) {
    case 'today':
      return tBot(language, 'MASTER_PANEL_BOOKINGS_CATEGORY_TODAY');
    case 'tomorrow':
      return tBot(language, 'MASTER_PANEL_BOOKINGS_CATEGORY_TOMORROW');
    case 'all':
      return tBot(language, 'MASTER_PANEL_BOOKINGS_CATEGORY_ALL');
    case 'canceled':
      return tBot(language, 'MASTER_PANEL_BOOKINGS_CATEGORY_CANCELED');
    default:
      return tBot(language, 'MASTER_PANEL_BOOKINGS_MENU_TITLE');
  }
}

function categoryEmptyText(category: MasterBookingsCategory, language: BotUiLanguage): string {
  switch (category) {
    case 'today':
      return tBot(language, 'MASTER_PANEL_BOOKINGS_EMPTY_TODAY');
    case 'tomorrow':
      return tBot(language, 'MASTER_PANEL_BOOKINGS_EMPTY_TOMORROW');
    case 'all':
      return tBot(language, 'MASTER_PANEL_BOOKINGS_EMPTY_ALL');
    case 'canceled':
      return tBot(language, 'MASTER_PANEL_BOOKINGS_EMPTY_CANCELED');
    default:
      return tBot(language, 'MASTER_PANEL_BOOKINGS_EMPTY_ALL');
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
  language: BotUiLanguage,
): string {
  const comment = item.clientComment?.trim();
  const commentBlock = comment
    ? `\n\n${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_COMMENT_TITLE')}:\n${comment}`
    : '';

  return (
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_PENDING_CARD_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBotTemplate(language, 'MASTER_PANEL_BOOKINGS_LABEL_QUEUE_POSITION', {
      index: String(index + 1),
      total: String(total),
    })}\n\n` +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_CLIENT')}: ${formatClientDisplayName(item, language)}\n` +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_PHONE')}: ${item.attendeePhoneE164 ?? tBot(language, 'MASTER_PANEL_BOOKINGS_NOT_SET')}\n` +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_EMAIL')}: ${item.attendeeEmail ?? tBot(language, 'MASTER_PANEL_BOOKINGS_NOT_SET')}\n\n` +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_SERVICE')}: ${item.serviceName}\n` +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_TIME')}: ${formatDateTimeRange(item.startAt, item.endAt, language)}\n` +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_PRICE')}: ${formatPrice(item.priceAmount, item.currencyCode)}\n` +
    tBot(language, 'MASTER_PANEL_BOOKINGS_PENDING_CARD_STATUS_WAITING') +
    commentBlock
  );
}

/**
 * @summary Inline-клавіатура картки pending-запису.
 */
export function createMasterPendingBookingCardKeyboard(
  item: MasterPendingBookingItem,
  hasNext: boolean,
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_CONFIRM'),
        makeMasterPanelBookingConfirmAction(item.appointmentId),
      ),
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_CANCEL'),
        makeMasterPanelBookingCancelRequestAction(item.appointmentId),
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_RESCHEDULE'),
        makeMasterPanelBookingRescheduleAction(item.appointmentId),
      ),
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_CLIENT_PROFILE'),
        makeMasterPanelBookingProfileAction(item.appointmentId),
      ),
    ],
    ...(hasNext
      ? [[Markup.button.callback(tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_NEXT_PENDING'), MASTER_PANEL_ACTION.BOOKINGS_NEXT_PENDING)]]
      : []),
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_PANEL'), MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Текст порожньої pending-черги.
 */
export function formatMasterPendingBookingsEmptyText(language: BotUiLanguage): string {
  return tBot(language, 'MASTER_PANEL_BOOKINGS_EMPTY_PENDING');
}

/**
 * @summary Клавіатура порожньої pending-черги.
 */
export function createMasterPendingBookingsEmptyKeyboard(
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_BACK_TO_BOOKINGS_MENU'), MASTER_PANEL_ACTION.BOOKINGS_OPEN_MENU)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_PANEL'), MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Текст меню категорій блоку "Мої записи".
 */
export function formatMasterBookingsMenuText(language: BotUiLanguage): string {
  return (
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_MENU_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    tBot(language, 'MASTER_PANEL_BOOKINGS_MENU_SUBTITLE')
  );
}

/**
 * @summary Клавіатура меню категорій блоку "Мої записи".
 */
export function createMasterBookingsMenuKeyboard(
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BOOKINGS_CATEGORY_PENDING'), MASTER_PANEL_ACTION.BOOKINGS_SHOW_PENDING)],
    [
      Markup.button.callback(tBot(language, 'MASTER_PANEL_BOOKINGS_CATEGORY_TODAY'), MASTER_PANEL_ACTION.BOOKINGS_MENU_TODAY),
      Markup.button.callback(tBot(language, 'MASTER_PANEL_BOOKINGS_CATEGORY_TOMORROW'), MASTER_PANEL_ACTION.BOOKINGS_MENU_TOMORROW),
    ],
    [
      Markup.button.callback(tBot(language, 'MASTER_PANEL_BOOKINGS_CATEGORY_ALL'), MASTER_PANEL_ACTION.BOOKINGS_MENU_ALL),
      Markup.button.callback(tBot(language, 'MASTER_PANEL_BOOKINGS_CATEGORY_CANCELED'), MASTER_PANEL_ACTION.BOOKINGS_MENU_CANCELED),
    ],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_PANEL'), MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Текст списку записів по категорії.
 */
export function formatMasterBookingsFeedText(page: MasterBookingsFeedPage, language: BotUiLanguage): string {
  const title = categoryTitle(page.category, language);
  if (page.items.length === 0) {
    return `${title}\n━━━━━━━━━━━━━━\n\n${categoryEmptyText(page.category, language)}`;
  }

  const locale = toLocale(language);
  const lines = page.items.map((item, index) => {
    return (
      `${cardIndexLabel(index)}\n\n` +
      `👤 ${formatClientDisplayName(item, language)}\n` +
      `💼 ${item.serviceName}\n` +
      `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_PRICE')}: ${formatPrice(item.priceAmount, item.currencyCode)}\n` +
      `📅 ${item.startAt.toLocaleDateString(locale)}\n` +
      `⏰ ${item.startAt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}` +
      `–${item.endAt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}\n` +
      `${formatBookingStatusLabel(item.status, language)}`
    );
  });

  const pageNumber = Math.floor(page.offset / page.limit) + 1;
  const totalPages = Math.max(1, Math.ceil(page.total / page.limit));

  return (
    `${title}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${lines.join('\n\n⸻\n\n')}\n\n` +
    tBotTemplate(language, 'MASTER_PANEL_BOOKINGS_LABEL_PAGE', {
      page: String(pageNumber),
      total: String(totalPages),
    })
  );
}

/**
 * @summary Клавіатура списку записів по категорії.
 */
export function createMasterBookingsFeedKeyboard(
  page: MasterBookingsFeedPage,
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  const numberButtons = page.items.map((item, index) => {
    return Markup.button.callback(`${index + 1}`, makeMasterPanelBookingOpenCardAction(item.appointmentId));
  });

  const numberRows: ReturnType<typeof Markup.button.callback>[][] = [];
  for (let i = 0; i < numberButtons.length; i += 3) {
    numberRows.push(numberButtons.slice(i, i + 3));
  }

  const paginationRow: ReturnType<typeof Markup.button.callback>[] = [];
  if (page.hasPrevPage) {
    paginationRow.push(Markup.button.callback(tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_PREV'), MASTER_PANEL_ACTION.BOOKINGS_LIST_PREV_PAGE));
  }
  if (page.hasNextPage) {
    paginationRow.push(Markup.button.callback(tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_NEXT'), MASTER_PANEL_ACTION.BOOKINGS_LIST_NEXT_PAGE));
  }

  return Markup.inlineKeyboard([
    ...numberRows,
    ...(paginationRow.length > 0 ? [paginationRow] : []),
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_BACK_TO_BOOKINGS_MENU_ALT'), MASTER_PANEL_ACTION.BOOKINGS_OPEN_MENU)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_PANEL'), MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Текст підтвердження скасування pending-запису.
 */
export function formatMasterCancelPendingBookingConfirmText(
  item: MasterPendingBookingItem,
  language: BotUiLanguage,
): string {
  const warning =
    item.status === 'confirmed'
      ? `\n\n${tBot(language, 'MASTER_PANEL_BOOKINGS_CANCEL_CONFIRM_WARNING_CONFIRMED')}`
      : '';

  return (
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_CANCEL_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_CANCEL_CONFIRM_BODY')}\n\n` +
    `👤 ${formatClientDisplayName(item, language)}\n` +
    `💼 ${item.serviceName}\n` +
    `🕒 ${formatDateTimeRange(item.startAt, item.endAt, language)}` +
    warning
  );
}

/**
 * @summary Клавіатура підтвердження скасування pending-запису.
 */
export function createMasterCancelPendingBookingConfirmKeyboard(
  item: MasterPendingBookingItem,
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_CANCEL_CONFIRM'),
        makeMasterPanelBookingCancelConfirmAction(item.appointmentId),
      ),
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_CANCEL_REJECT'),
        MASTER_PANEL_ACTION.BOOKINGS_BACK_TO_LIST,
      ),
    ],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_PANEL'), MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Текст детальної картки запису зі списку.
 */
export function formatMasterBookingDetailsCardText(
  item: MasterPendingBookingItem,
  language: BotUiLanguage,
): string {
  const comment = item.clientComment?.trim();
  const commentBlock = comment
    ? `\n\n${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_COMMENT_TITLE')}:\n${comment}`
    : '';

  let stateHint = '';
  if (item.status === 'canceled') {
    stateHint = `\n\n${tBot(language, 'MASTER_PANEL_BOOKINGS_HINT_CANCELED')}`;
  } else if (item.status === 'completed') {
    stateHint = `\n\n${tBot(language, 'MASTER_PANEL_BOOKINGS_HINT_COMPLETED')}`;
  } else if (item.status === 'transferred') {
    stateHint = `\n\n${tBot(language, 'MASTER_PANEL_BOOKINGS_HINT_TRANSFERRED')}`;
  } else if (item.status === 'pending') {
    stateHint = `\n\n${tBot(language, 'MASTER_PANEL_BOOKINGS_HINT_PENDING')}`;
  } else if (item.status === 'confirmed') {
    stateHint = `\n\n${tBot(language, 'MASTER_PANEL_BOOKINGS_HINT_CONFIRMED')}`;
  }

  return (
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_CARD_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_CLIENT')}: ${formatClientDisplayName(item, language)}\n` +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_PHONE')}: ${item.attendeePhoneE164 ?? tBot(language, 'MASTER_PANEL_BOOKINGS_NOT_SET')}\n` +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_EMAIL')}: ${item.attendeeEmail ?? tBot(language, 'MASTER_PANEL_BOOKINGS_NOT_SET')}\n\n` +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_SERVICE')}: ${item.serviceName}\n` +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_TIME')}: ${formatDateTimeRange(item.startAt, item.endAt, language)}\n` +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_PRICE')}: ${formatPrice(item.priceAmount, item.currencyCode)}\n` +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_STATUS')}: ${formatBookingStatusLabel(item.status, language)}` +
    commentBlock +
    stateHint
  );
}

/**
 * @summary Клавіатура детальної картки запису зі списку.
 */
export function createMasterBookingDetailsCardKeyboard(
  item: MasterPendingBookingItem,
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  const actionRows: ReturnType<typeof Markup.button.callback>[][] = [];

  if (item.status === 'confirmed') {
    actionRows.push([
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_RESCHEDULE'),
        makeMasterPanelBookingRescheduleAction(item.appointmentId),
      ),
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_CANCEL'),
        makeMasterPanelBookingCancelRequestAction(item.appointmentId),
      ),
    ]);
  } else if (item.status === 'pending') {
    actionRows.push([
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_OPEN_PENDING_QUEUE'),
        MASTER_PANEL_ACTION.BOOKINGS_SHOW_PENDING,
      ),
    ]);
  }

  return Markup.inlineKeyboard([
    ...actionRows,
    [
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_CLIENT_PROFILE'),
        makeMasterPanelBookingProfileAction(item.appointmentId),
      ),
    ],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_BACK_TO_LIST'), MASTER_PANEL_ACTION.BOOKINGS_BACK_TO_LIST)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_BACK_TO_BOOKINGS_MENU_ALT'), MASTER_PANEL_ACTION.BOOKINGS_OPEN_MENU)],
  ]);
}

function formatDateLabel(date: Date, language: BotUiLanguage): string {
  const locale = toLocale(language);
  const weekday = date.toLocaleDateString(locale, { weekday: 'short' });
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${weekday} ${day}.${month}`;
}

/**
 * @summary Текст кроку вибору нової дати для перенесення.
 */
export function formatMasterRescheduleDateStepText(
  item: MasterPendingBookingItem,
  language: BotUiLanguage,
): string {
  const warning =
    item.status === 'confirmed'
      ? `\n${tBot(language, 'MASTER_PANEL_BOOKINGS_RESCHEDULE_WARNING_CONFIRMED')}\n`
      : '\n';

  return (
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_RESCHEDULE_STEP_1')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_CLIENT')}: ${formatClientDisplayName(item, language)}\n` +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_SERVICE')}: ${item.serviceName}\n` +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_TIME')}: ${formatDateTimeRange(item.startAt, item.endAt, language)}\n` +
    warning +
    tBot(language, 'MASTER_PANEL_BOOKINGS_RESCHEDULE_SELECT_DATE')
  );
}

/**
 * @summary Клавіатура вибору нової дати.
 */
export function createMasterRescheduleDateKeyboard(
  dates: Date[],
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    ...dates.map((date) => {
      const year = String(date.getFullYear());
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const code = `${year}${month}${day}`;
      return [Markup.button.callback(formatDateLabel(date, language), makeMasterPanelBookingRescheduleDateAction(code))];
    }),
    [
      Markup.button.callback(tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_CANCEL_ACTION'), MASTER_PANEL_ACTION.BOOKINGS_RESCHEDULE_CANCEL),
      Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_PANEL'), MASTER_PANEL_ACTION.BACK_TO_PANEL),
    ],
  ]);
}

/**
 * @summary Текст кроку вибору нового часу.
 */
export function formatMasterRescheduleTimeStepText(
  item: MasterPendingBookingItem,
  dateLabel: string,
  language: BotUiLanguage,
): string {
  return (
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_RESCHEDULE_STEP_2')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_CLIENT')}: ${formatClientDisplayName(item, language)}\n` +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_SERVICE')}: ${item.serviceName}\n` +
    `📆 ${dateLabel}\n\n` +
    tBot(language, 'MASTER_PANEL_BOOKINGS_RESCHEDULE_SELECT_TIME')
  );
}

/**
 * @summary Клавіатура вибору нового часу.
 */
export function createMasterRescheduleTimeKeyboard(
  timeCodes: string[],
  language: BotUiLanguage,
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
      Markup.button.callback(tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_RESCHEDULE_BACK_TO_DATE'), MASTER_PANEL_ACTION.BOOKINGS_RESCHEDULE_BACK_TO_DATE),
      Markup.button.callback(tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_CANCEL_ACTION'), MASTER_PANEL_ACTION.BOOKINGS_RESCHEDULE_CANCEL),
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
  language: BotUiLanguage,
): string {
  return (
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_RESCHEDULE_STEP_3')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_CLIENT')}: ${formatClientDisplayName(item, language)}\n` +
    `${tBot(language, 'MASTER_PANEL_BOOKINGS_LABEL_SERVICE')}: ${item.serviceName}\n\n` +
    `🕒 ${tBot(language, 'MASTER_PANEL_BOOKINGS_RESCHEDULE_LABEL_WAS')}: ${formatDateTimeRange(item.startAt, item.endAt, language)}\n` +
    `🕒 ${tBot(language, 'MASTER_PANEL_BOOKINGS_RESCHEDULE_LABEL_WILL_BE')}: ${formatDateTimeRange(newStartAt, newEndAt, language)}\n\n` +
    tBot(language, 'MASTER_PANEL_BOOKINGS_RESCHEDULE_CONFIRM')
  );
}

/**
 * @summary Клавіатура підтвердження перенесення.
 */
export function createMasterRescheduleConfirmKeyboard(
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_RESCHEDULE_CONFIRM'), MASTER_PANEL_ACTION.BOOKINGS_RESCHEDULE_CONFIRM)],
    [
      Markup.button.callback(tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_RESCHEDULE_BACK_TO_TIME'), MASTER_PANEL_ACTION.BOOKINGS_RESCHEDULE_BACK_TO_TIME),
      Markup.button.callback(tBot(language, 'MASTER_PANEL_BOOKINGS_BTN_CANCEL_ACTION'), MASTER_PANEL_ACTION.BOOKINGS_RESCHEDULE_CANCEL),
    ],
  ]);
}
