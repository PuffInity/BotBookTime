import { Markup } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import type { BotUiLanguage } from './i18n.bot.js';
import type {
  ProfileBookingStatusData,
  ProfileBookingStatusItem,
} from '../../types/db-helpers/db-profile-booking.types.js';
import {
  PROFILE_ACTION,
  makeProfileBookingCancelAction,
  makeProfileBookingCancelConfirmAction,
  makeProfileBookingOpenItemAction,
  makeProfileBookingRescheduleAction,
} from '../../types/bot-profile.types.js';
import { tBot } from './i18n.bot.js';

/**
 * @file profile-booking-status.bot.ts
 * @summary UI/helper-и для блоку "Статус бронювання" в профілі.
 */

// uk: UI константа NUMBER_BADGES / en: UI constant NUMBER_BADGES / cz: UI konstanta NUMBER_BADGES
const NUMBER_BADGES = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

/**
 * uk: Внутрішня bot helper функція getNumberBadge.
 * en: Internal bot helper function getNumberBadge.
 * cz: Interní bot helper funkce getNumberBadge.
 */
function getNumberBadge(index: number): string {
  return NUMBER_BADGES[index] ?? `${index + 1}.`;
}

/**
 * uk: Внутрішня bot helper функція toLocale.
 * en: Internal bot helper function toLocale.
 * cz: Interní bot helper funkce toLocale.
 */
function toLocale(language: BotUiLanguage): string {
  if (language === 'en') return 'en-US';
  if (language === 'cs') return 'cs-CZ';
  return 'uk-UA';
}

/**
 * uk: Внутрішня bot helper функція formatDateTime.
 * en: Internal bot helper function formatDateTime.
 * cz: Interní bot helper funkce formatDateTime.
 */
function formatDateTime(date: Date, language: BotUiLanguage): string {
  return date.toLocaleString(toLocale(language), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * uk: Внутрішня bot helper функція formatPrice.
 * en: Internal bot helper function formatPrice.
 * cz: Interní bot helper funkce formatPrice.
 */
function formatPrice(price: string, currencyCode: string): string {
  const normalized = price.replace(/[.,]00$/, '').replace(/([.,]\d)0$/, '$1');
  return `${normalized} ${currencyCode}`;
}

/**
 * uk: Внутрішня bot helper функція statusToLabel.
 * en: Internal bot helper function statusToLabel.
 * cz: Interní bot helper funkce statusToLabel.
 */
function statusToLabel(status: ProfileBookingStatusItem['status'], language: BotUiLanguage): string {
  switch (status) {
    case 'pending':
      return tBot(language, 'PROFILE_BOOKING_STATUS_PENDING');
    case 'confirmed':
      return tBot(language, 'PROFILE_BOOKING_STATUS_CONFIRMED');
    case 'canceled':
      return tBot(language, 'PROFILE_BOOKING_STATUS_CANCELED');
    case 'completed':
      return tBot(language, 'PROFILE_BOOKING_STATUS_COMPLETED');
    case 'transferred':
      return tBot(language, 'PROFILE_BOOKING_STATUS_TRANSFERRED');
    default:
      return status;
  }
}

/**
 * uk: Внутрішня bot helper функція formatUpcomingBlock.
 * en: Internal bot helper function formatUpcomingBlock.
 * cz: Interní bot helper funkce formatUpcomingBlock.
 */
function formatUpcomingBlock(item: ProfileBookingStatusItem | null, language: BotUiLanguage): string {
  if (!item) {
    return (
      `${tBot(language, 'PROFILE_BOOKING_UPCOMING_EMPTY')}\n` +
      tBot(language, 'PROFILE_BOOKING_UPCOMING_EMPTY_HINT')
    );
  }

  return (
    `${tBot(language, 'PROFILE_BOOKING_UPCOMING_TITLE')}\n\n` +
    `${tBot(language, 'PROFILE_BOOKING_LABEL_SERVICE')}: ${item.serviceName}\n` +
    `${tBot(language, 'PROFILE_BOOKING_LABEL_MASTER')}: ${item.masterName}\n` +
    `${tBot(language, 'PROFILE_BOOKING_LABEL_TIME')}: ${formatDateTime(item.startAt, language)}\n` +
    `${tBot(language, 'PROFILE_BOOKING_LABEL_PRICE')}: ${formatPrice(item.priceAmount, item.currencyCode)}\n` +
    `${tBot(language, 'PROFILE_BOOKING_LABEL_STATUS')}: ${statusToLabel(item.status, language)}`
  );
}

/**
 * uk: Внутрішня bot helper функція formatRecentItem.
 * en: Internal bot helper function formatRecentItem.
 * cz: Interní bot helper funkce formatRecentItem.
 */
function formatRecentItem(item: ProfileBookingStatusItem, index: number, language: BotUiLanguage): string {
  return (
    `${getNumberBadge(index)} ${item.serviceName}\n` +
    `🕒 ${formatDateTime(item.startAt, language)}\n` +
    `${tBot(language, 'PROFILE_BOOKING_LABEL_MASTER')}: ${item.masterName}\n` +
    `📌 ${statusToLabel(item.status, language)}`
  );
}

/**
 * uk: Внутрішня bot helper функція isBookingActionable.
 * en: Internal bot helper function isBookingActionable.
 * cz: Interní bot helper funkce isBookingActionable.
 */
function isBookingActionable(item: ProfileBookingStatusItem): boolean {
  return item.startAt.getTime() > Date.now() && (item.status === 'pending' || item.status === 'confirmed');
}

/**
 * uk: Публічна bot helper функція getHistoryItems.
 * en: Public bot helper function getHistoryItems.
 * cz: Veřejná bot helper funkce getHistoryItems.
 */
export function getHistoryItems(data: ProfileBookingStatusData): ProfileBookingStatusItem[] {
  return data.recent.filter((item) => !data.upcoming || item.appointmentId !== data.upcoming.appointmentId);
}

/**
 * uk: Публічна bot helper функція formatProfileBookingStatusText.
 * en: Public bot helper function formatProfileBookingStatusText.
 * cz: Veřejná bot helper funkce formatProfileBookingStatusText.
 */
export function formatProfileBookingStatusText(
  data: ProfileBookingStatusData,
  language: BotUiLanguage,
): string {
  return (
    `${tBot(language, 'PROFILE_BOOKING_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      `${formatUpcomingBlock(data.upcoming, language)}`
  );
}

/**
 * uk: Публічна bot helper функція createProfileBookingStatusKeyboard.
 * en: Public bot helper function createProfileBookingStatusKeyboard.
 * cz: Veřejná bot helper funkce createProfileBookingStatusKeyboard.
 */
export function createProfileBookingStatusKeyboard(
  data: ProfileBookingStatusData,
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  if (!data.upcoming) {
    return Markup.inlineKeyboard([
      [Markup.button.callback(tBot(language, 'PROFILE_BOOKING_BTN_CREATE'), PROFILE_ACTION.BOOKING_STATUS_CREATE)],
      [Markup.button.callback(tBot(language, 'BACK_TO_PROFILE'), PROFILE_ACTION.OPEN)],
    ]);
  }

  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'PROFILE_BOOKING_BTN_RESCHEDULE'),
        makeProfileBookingRescheduleAction(data.upcoming.appointmentId),
      ),
      Markup.button.callback(
        tBot(language, 'PROFILE_BOOKING_BTN_CANCEL'),
        makeProfileBookingCancelAction(data.upcoming.appointmentId),
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'PROFILE_BOOKING_BTN_VIEW_ALL'),
        PROFILE_ACTION.BOOKING_STATUS_VIEW_ALL,
      ),
    ],
    [Markup.button.callback(tBot(language, 'BACK_TO_PROFILE'), PROFILE_ACTION.OPEN)],
  ]);
}

/**
 * uk: Публічна bot helper функція formatProfileBookingHistoryText.
 * en: Public bot helper function formatProfileBookingHistoryText.
 * cz: Veřejná bot helper funkce formatProfileBookingHistoryText.
 */
export function formatProfileBookingHistoryText(
  data: ProfileBookingStatusData,
  language: BotUiLanguage,
): string {
  const history = getHistoryItems(data);
  if (history.length === 0) {
    return (
      `${tBot(language, 'PROFILE_BOOKING_HISTORY_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      tBot(language, 'PROFILE_BOOKING_HISTORY_EMPTY')
    );
  }

  return (
    `${tBot(language, 'PROFILE_BOOKING_HISTORY_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    history.slice(0, 10).map((item, index) => formatRecentItem(item, index, language)).join('\n\n')
  );
}

/**
 * uk: Публічна bot helper функція createProfileBookingHistoryKeyboard.
 * en: Public bot helper function createProfileBookingHistoryKeyboard.
 * cz: Veřejná bot helper funkce createProfileBookingHistoryKeyboard.
 */
export function createProfileBookingHistoryKeyboard(
  data: ProfileBookingStatusData,
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  const history = getHistoryItems(data);
  if (history.length === 0) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback(
          tBot(language, 'PROFILE_BOOKING_BTN_CREATE_FIRST'),
          PROFILE_ACTION.BOOKING_STATUS_CREATE,
        ),
      ],
      [Markup.button.callback(tBot(language, 'BACK_TO_PROFILE'), PROFILE_ACTION.OPEN)],
    ]);
  }

  return Markup.inlineKeyboard([
    ...history.slice(0, 10).map((item, index) => [
      Markup.button.callback(`${getNumberBadge(index)} ${item.serviceName}`, makeProfileBookingOpenItemAction(item.appointmentId)),
    ]),
    [Markup.button.callback(tBot(language, 'PROFILE_BOOKING_VIEW_STATUS'), PROFILE_ACTION.BOOKING_STATUS)],
    [Markup.button.callback(tBot(language, 'BACK_TO_PROFILE'), PROFILE_ACTION.OPEN)],
  ]);
}

/**
 * uk: Публічна bot helper функція formatSelectedBookingText.
 * en: Public bot helper function formatSelectedBookingText.
 * cz: Veřejná bot helper funkce formatSelectedBookingText.
 */
export function formatSelectedBookingText(item: ProfileBookingStatusItem, language: BotUiLanguage): string {
  const actionHint = isBookingActionable(item)
    ? tBot(language, 'PROFILE_BOOKING_ACTION_HINT')
    : tBot(language, 'PROFILE_BOOKING_ACTION_DISABLED');

  return (
    `${tBot(language, 'PROFILE_BOOKING_CARD_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'PROFILE_BOOKING_LABEL_SERVICE')}: ${item.serviceName}\n` +
    `${tBot(language, 'PROFILE_BOOKING_LABEL_MASTER')}: ${item.masterName}\n` +
    `${tBot(language, 'PROFILE_BOOKING_LABEL_TIME')}: ${formatDateTime(item.startAt, language)}\n` +
    `${tBot(language, 'PROFILE_BOOKING_LABEL_PRICE')}: ${formatPrice(item.priceAmount, item.currencyCode)}\n` +
    `${tBot(language, 'PROFILE_BOOKING_LABEL_STATUS')}: ${statusToLabel(item.status, language)}\n\n` +
    actionHint
  );
}

/**
 * uk: Публічна bot helper функція createSelectedBookingKeyboard.
 * en: Public bot helper function createSelectedBookingKeyboard.
 * cz: Veřejná bot helper funkce createSelectedBookingKeyboard.
 */
export function createSelectedBookingKeyboard(
  item: ProfileBookingStatusItem,
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  if (isBookingActionable(item)) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback(
          tBot(language, 'PROFILE_BOOKING_BTN_RESCHEDULE'),
          makeProfileBookingRescheduleAction(item.appointmentId),
        ),
        Markup.button.callback(
          tBot(language, 'PROFILE_BOOKING_BTN_CANCEL'),
          makeProfileBookingCancelAction(item.appointmentId),
        ),
      ],
      [Markup.button.callback(tBot(language, 'PROFILE_BOOKING_BTN_BACK_TO_HISTORY'), PROFILE_ACTION.BOOKING_STATUS_VIEW_ALL)],
      [Markup.button.callback(tBot(language, 'BACK_TO_PROFILE'), PROFILE_ACTION.OPEN)],
    ]);
  }

  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'PROFILE_BOOKING_BTN_BACK_TO_HISTORY'), PROFILE_ACTION.BOOKING_STATUS_VIEW_ALL)],
    [Markup.button.callback(tBot(language, 'BACK_TO_PROFILE'), PROFILE_ACTION.OPEN)],
  ]);
}

/**
 * uk: Публічна bot helper функція formatCancelBookingConfirmText.
 * en: Public bot helper function formatCancelBookingConfirmText.
 * cz: Veřejná bot helper funkce formatCancelBookingConfirmText.
 */
export function formatCancelBookingConfirmText(
  item: ProfileBookingStatusItem,
  language: BotUiLanguage,
): string {
  return (
    `${tBot(language, 'PROFILE_BOOKING_CANCEL_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'PROFILE_BOOKING_CANCEL_CONFIRM_ASK')}\n\n` +
    `💼 ${item.serviceName}\n` +
    `👩‍🎨 ${item.masterName}\n` +
    `🕒 ${formatDateTime(item.startAt, language)}`
  );
}

/**
 * uk: Публічна bot helper функція createCancelBookingConfirmKeyboard.
 * en: Public bot helper function createCancelBookingConfirmKeyboard.
 * cz: Veřejná bot helper funkce createCancelBookingConfirmKeyboard.
 */
export function createCancelBookingConfirmKeyboard(
  item: ProfileBookingStatusItem,
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'PROFILE_BOOKING_BTN_CANCEL_CONFIRM'),
        makeProfileBookingCancelConfirmAction(item.appointmentId),
      ),
      Markup.button.callback(
        tBot(language, 'PROFILE_BOOKING_BTN_CANCEL_ABORT'),
        makeProfileBookingOpenItemAction(item.appointmentId),
      ),
    ],
    [Markup.button.callback(tBot(language, 'PROFILE_BOOKING_BTN_BACK_TO_HISTORY'), PROFILE_ACTION.BOOKING_STATUS_VIEW_ALL)],
  ]);
}

/**
 * uk: Публічна bot helper функція sendProfileBookingStatus.
 * en: Public bot helper function sendProfileBookingStatus.
 * cz: Veřejná bot helper funkce sendProfileBookingStatus.
 */
export async function sendProfileBookingStatus(
  ctx: MyContext,
  data: ProfileBookingStatusData,
  language: BotUiLanguage,
): Promise<void> {
  await ctx.reply(
    formatProfileBookingStatusText(data, language),
    createProfileBookingStatusKeyboard(data, language),
  );
}

/**
 * uk: Публічна bot helper функція sendProfileBookingHistory.
 * en: Public bot helper function sendProfileBookingHistory.
 * cz: Veřejná bot helper funkce sendProfileBookingHistory.
 */
export async function sendProfileBookingHistory(
  ctx: MyContext,
  data: ProfileBookingStatusData,
  language: BotUiLanguage,
): Promise<void> {
  await ctx.reply(
    formatProfileBookingHistoryText(data, language),
    createProfileBookingHistoryKeyboard(data, language),
  );
}

/**
 * uk: Публічна bot helper функція sendSelectedBookingDetails.
 * en: Public bot helper function sendSelectedBookingDetails.
 * cz: Veřejná bot helper funkce sendSelectedBookingDetails.
 */
export async function sendSelectedBookingDetails(
  ctx: MyContext,
  item: ProfileBookingStatusItem,
  language: BotUiLanguage,
): Promise<void> {
  await ctx.reply(formatSelectedBookingText(item, language), createSelectedBookingKeyboard(item, language));
}

/**
 * uk: Публічна bot helper функція sendCancelBookingConfirm.
 * en: Public bot helper function sendCancelBookingConfirm.
 * cz: Veřejná bot helper funkce sendCancelBookingConfirm.
 */
export async function sendCancelBookingConfirm(
  ctx: MyContext,
  item: ProfileBookingStatusItem,
  language: BotUiLanguage,
): Promise<void> {
  await ctx.reply(
    formatCancelBookingConfirmText(item, language),
    createCancelBookingConfirmKeyboard(item, language),
  );
}

/**
 * uk: Публічна bot helper функція sendCancelBookingSuccess.
 * en: Public bot helper function sendCancelBookingSuccess.
 * cz: Veřejná bot helper funkce sendCancelBookingSuccess.
 */
export async function sendCancelBookingSuccess(
  ctx: MyContext,
  item: ProfileBookingStatusItem,
  language: BotUiLanguage,
): Promise<void> {
  await ctx.reply(
    `${tBot(language, 'PROFILE_BOOKING_CANCEL_SUCCESS')}\n\n` +
      `💼 ${item.serviceName}\n` +
      `🕒 ${formatDateTime(item.startAt, language)}\n\n` +
      tBot(language, 'PROFILE_BOOKING_CANCEL_SUCCESS_HINT'),
    Markup.inlineKeyboard([
      [Markup.button.callback(tBot(language, 'PROFILE_BOOKING_VIEW_STATUS'), PROFILE_ACTION.BOOKING_STATUS)],
      [Markup.button.callback(tBot(language, 'BACK_TO_PROFILE'), PROFILE_ACTION.OPEN)],
    ]),
  );
}

/**
 * uk: Публічна bot helper функція sendProfileBookingActionStub.
 * en: Public bot helper function sendProfileBookingActionStub.
 * cz: Veřejná bot helper funkce sendProfileBookingActionStub.
 */
export async function sendProfileBookingActionStub(
  ctx: MyContext,
  title: string,
  language: BotUiLanguage,
): Promise<void> {
  await ctx.reply(
    `${title}\n\n` +
      tBot(language, 'PROFILE_BOOKING_ACTION_STUB'),
    Markup.inlineKeyboard([
      [Markup.button.callback(tBot(language, 'PROFILE_BOOKING_VIEW_STATUS'), PROFILE_ACTION.BOOKING_STATUS)],
      [Markup.button.callback(tBot(language, 'BACK_TO_PROFILE'), PROFILE_ACTION.OPEN)],
    ]),
  );
}
