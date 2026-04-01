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

const NUMBER_BADGES = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

function getNumberBadge(index: number): string {
  return NUMBER_BADGES[index] ?? `${index + 1}.`;
}

function toLocale(language: BotUiLanguage): string {
  if (language === 'en') return 'en-US';
  if (language === 'cs') return 'cs-CZ';
  return 'uk-UA';
}

function formatDateTime(date: Date, language: BotUiLanguage): string {
  return date.toLocaleString(toLocale(language), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(price: string, currencyCode: string): string {
  const normalized = price.replace(/[.,]00$/, '').replace(/([.,]\d)0$/, '$1');
  return `${normalized} ${currencyCode}`;
}

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

function formatRecentItem(item: ProfileBookingStatusItem, index: number, language: BotUiLanguage): string {
  return (
    `${getNumberBadge(index)} ${item.serviceName}\n` +
    `🕒 ${formatDateTime(item.startAt, language)}\n` +
    `${tBot(language, 'PROFILE_BOOKING_LABEL_MASTER')}: ${item.masterName}\n` +
    `📌 ${statusToLabel(item.status, language)}`
  );
}

function isBookingActionable(item: ProfileBookingStatusItem): boolean {
  return item.startAt.getTime() > Date.now() && (item.status === 'pending' || item.status === 'confirmed');
}

export function getHistoryItems(data: ProfileBookingStatusData): ProfileBookingStatusItem[] {
  return data.recent.filter((item) => !data.upcoming || item.appointmentId !== data.upcoming.appointmentId);
}

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

export async function sendSelectedBookingDetails(
  ctx: MyContext,
  item: ProfileBookingStatusItem,
  language: BotUiLanguage,
): Promise<void> {
  await ctx.reply(formatSelectedBookingText(item, language), createSelectedBookingKeyboard(item, language));
}

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
