import { Markup } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import type {
  ProfileBookingStatusData,
  ProfileBookingStatusItem,
} from '../../types/db-helpers/db-profile-booking.types.js';
import {
  PROFILE_ACTION,
  PROFILE_BUTTON_TEXT,
  makeProfileBookingCancelAction,
  makeProfileBookingCancelConfirmAction,
  makeProfileBookingOpenItemAction,
  makeProfileBookingRescheduleAction,
} from '../../types/bot-profile.types.js';

/**
 * @file profile-booking-status.bot.ts
 * @summary UI/helper-и для блоку "Статус бронювання" в профілі.
 */

const NUMBER_BADGES = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

function getNumberBadge(index: number): string {
  return NUMBER_BADGES[index] ?? `${index + 1}.`;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('uk-UA', {
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

function statusToLabel(status: ProfileBookingStatusItem['status']): string {
  switch (status) {
    case 'pending':
      return '🟡 Очікує підтвердження';
    case 'confirmed':
      return '🟢 Підтверджено';
    case 'canceled':
      return '🔴 Скасовано';
    case 'completed':
      return '🟢 Відвідано';
    case 'transferred':
      return '🟣 Перенесено';
    default:
      return status;
  }
}

function formatUpcomingBlock(item: ProfileBookingStatusItem | null): string {
  if (!item) {
    return (
      '📭 У вас наразі немає активних записів.\n' +
      'Нове бронювання можна створити через кнопку «📅 Бронювання».'
    );
  }

  return (
    '📅 Ваш найближчий запис:\n\n' +
    `💼 Послуга: ${item.serviceName}\n` +
    `👩‍🎨 Майстер: ${item.masterName}\n` +
    `🕒 Час: ${formatDateTime(item.startAt)}\n` +
    `💰 Вартість: ${formatPrice(item.priceAmount, item.currencyCode)}\n` +
    `📌 Статус: ${statusToLabel(item.status)}`
  );
}

function formatRecentItem(item: ProfileBookingStatusItem, index: number): string {
  return (
    `${getNumberBadge(index)} ${item.serviceName}\n` +
    `🕒 ${formatDateTime(item.startAt)}\n` +
    `👩‍🎨 Майстер: ${item.masterName}\n` +
    `📌 ${statusToLabel(item.status)}`
  );
}

function isBookingActionable(item: ProfileBookingStatusItem): boolean {
  return item.startAt.getTime() > Date.now() && (item.status === 'pending' || item.status === 'confirmed');
}

export function getHistoryItems(data: ProfileBookingStatusData): ProfileBookingStatusItem[] {
  return data.recent.filter((item) => !data.upcoming || item.appointmentId !== data.upcoming.appointmentId);
}

export function formatProfileBookingStatusText(data: ProfileBookingStatusData): string {
  return (
    '📅 Статус бронювання\n' +
      '━━━━━━━━━━━━━━\n\n' +
      `${formatUpcomingBlock(data.upcoming)}`
  );
}

export function createProfileBookingStatusKeyboard(
  data: ProfileBookingStatusData,
): ReturnType<typeof Markup.inlineKeyboard> {
  if (!data.upcoming) {
    return Markup.inlineKeyboard([
      [Markup.button.callback(PROFILE_BUTTON_TEXT.BOOKING_STATUS_CREATE, PROFILE_ACTION.BOOKING_STATUS_CREATE)],
      [Markup.button.callback(PROFILE_BUTTON_TEXT.BACK_TO_PROFILE, PROFILE_ACTION.OPEN)],
    ]);
  }

  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        PROFILE_BUTTON_TEXT.BOOKING_STATUS_RESCHEDULE,
        makeProfileBookingRescheduleAction(data.upcoming.appointmentId),
      ),
      Markup.button.callback(
        PROFILE_BUTTON_TEXT.BOOKING_STATUS_CANCEL,
        makeProfileBookingCancelAction(data.upcoming.appointmentId),
      ),
    ],
    [
      Markup.button.callback(
        PROFILE_BUTTON_TEXT.BOOKING_STATUS_VIEW_ALL,
        PROFILE_ACTION.BOOKING_STATUS_VIEW_ALL,
      ),
    ],
    [Markup.button.callback(PROFILE_BUTTON_TEXT.BACK_TO_PROFILE, PROFILE_ACTION.OPEN)],
  ]);
}

export function formatProfileBookingHistoryText(data: ProfileBookingStatusData): string {
  const history = getHistoryItems(data);
  if (history.length === 0) {
    return (
      '📖 Історія ваших записів\n' +
      '━━━━━━━━━━━━━━\n\n' +
      '📭 У вас поки що немає завершених записів.'
    );
  }

  return (
    '📖 Історія ваших записів\n' +
    '━━━━━━━━━━━━━━\n\n' +
    history.slice(0, 10).map(formatRecentItem).join('\n\n')
  );
}

export function createProfileBookingHistoryKeyboard(
  data: ProfileBookingStatusData,
): ReturnType<typeof Markup.inlineKeyboard> {
  const history = getHistoryItems(data);
  if (history.length === 0) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback(
          PROFILE_BUTTON_TEXT.BOOKING_STATUS_CREATE_FIRST,
          PROFILE_ACTION.BOOKING_STATUS_CREATE,
        ),
      ],
      [Markup.button.callback(PROFILE_BUTTON_TEXT.BACK_TO_PROFILE, PROFILE_ACTION.OPEN)],
    ]);
  }

  return Markup.inlineKeyboard([
    ...history.slice(0, 10).map((item, index) => [
      Markup.button.callback(`${getNumberBadge(index)} ${item.serviceName}`, makeProfileBookingOpenItemAction(item.appointmentId)),
    ]),
    [Markup.button.callback('📅 Переглянути статус', PROFILE_ACTION.BOOKING_STATUS)],
    [Markup.button.callback(PROFILE_BUTTON_TEXT.BACK_TO_PROFILE, PROFILE_ACTION.OPEN)],
  ]);
}

export function formatSelectedBookingText(item: ProfileBookingStatusItem): string {
  const actionHint = isBookingActionable(item)
    ? 'Оберіть дію для цього запису нижче.'
    : '⚠️ Для цього запису зміна або скасування недоступні.';

  return (
    '📄 Картка запису\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Послуга: ${item.serviceName}\n` +
    `👩‍🎨 Майстер: ${item.masterName}\n` +
    `🕒 Час: ${formatDateTime(item.startAt)}\n` +
    `💰 Вартість: ${formatPrice(item.priceAmount, item.currencyCode)}\n` +
    `📌 Статус: ${statusToLabel(item.status)}\n\n` +
    actionHint
  );
}

export function createSelectedBookingKeyboard(
  item: ProfileBookingStatusItem,
): ReturnType<typeof Markup.inlineKeyboard> {
  if (isBookingActionable(item)) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback(
          PROFILE_BUTTON_TEXT.BOOKING_STATUS_RESCHEDULE,
          makeProfileBookingRescheduleAction(item.appointmentId),
        ),
        Markup.button.callback(
          PROFILE_BUTTON_TEXT.BOOKING_STATUS_CANCEL,
          makeProfileBookingCancelAction(item.appointmentId),
        ),
      ],
      [Markup.button.callback(PROFILE_BUTTON_TEXT.BACK_TO_BOOKING_HISTORY, PROFILE_ACTION.BOOKING_STATUS_VIEW_ALL)],
      [Markup.button.callback(PROFILE_BUTTON_TEXT.BACK_TO_PROFILE, PROFILE_ACTION.OPEN)],
    ]);
  }

  return Markup.inlineKeyboard([
    [Markup.button.callback(PROFILE_BUTTON_TEXT.BACK_TO_BOOKING_HISTORY, PROFILE_ACTION.BOOKING_STATUS_VIEW_ALL)],
    [Markup.button.callback(PROFILE_BUTTON_TEXT.BACK_TO_PROFILE, PROFILE_ACTION.OPEN)],
  ]);
}

export function formatCancelBookingConfirmText(item: ProfileBookingStatusItem): string {
  return (
    '⚠️ Підтвердження скасування\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Ви дійсно хочете скасувати цей запис?\n\n' +
    `💼 ${item.serviceName}\n` +
    `👩‍🎨 ${item.masterName}\n` +
    `🕒 ${formatDateTime(item.startAt)}`
  );
}

export function createCancelBookingConfirmKeyboard(
  item: ProfileBookingStatusItem,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        PROFILE_BUTTON_TEXT.BOOKING_STATUS_CANCEL_CONFIRM,
        makeProfileBookingCancelConfirmAction(item.appointmentId),
      ),
      Markup.button.callback(
        PROFILE_BUTTON_TEXT.BOOKING_STATUS_CANCEL_ABORT,
        makeProfileBookingOpenItemAction(item.appointmentId),
      ),
    ],
    [Markup.button.callback(PROFILE_BUTTON_TEXT.BACK_TO_BOOKING_HISTORY, PROFILE_ACTION.BOOKING_STATUS_VIEW_ALL)],
  ]);
}

export async function sendProfileBookingStatus(
  ctx: MyContext,
  data: ProfileBookingStatusData,
): Promise<void> {
  await ctx.reply(formatProfileBookingStatusText(data), createProfileBookingStatusKeyboard(data));
}

export async function sendProfileBookingHistory(ctx: MyContext, data: ProfileBookingStatusData): Promise<void> {
  await ctx.reply(formatProfileBookingHistoryText(data), createProfileBookingHistoryKeyboard(data));
}

export async function sendSelectedBookingDetails(
  ctx: MyContext,
  item: ProfileBookingStatusItem,
): Promise<void> {
  await ctx.reply(formatSelectedBookingText(item), createSelectedBookingKeyboard(item));
}

export async function sendCancelBookingConfirm(
  ctx: MyContext,
  item: ProfileBookingStatusItem,
): Promise<void> {
  await ctx.reply(formatCancelBookingConfirmText(item), createCancelBookingConfirmKeyboard(item));
}

export async function sendCancelBookingSuccess(
  ctx: MyContext,
  item: ProfileBookingStatusItem,
): Promise<void> {
  await ctx.reply(
    '✅ Запис успішно скасовано.\n\n' +
      `💼 ${item.serviceName}\n` +
      `🕒 ${formatDateTime(item.startAt)}\n\n` +
      'Оновлений статус доступний у розділі «📅 Статус бронювання».',
    Markup.inlineKeyboard([
      [Markup.button.callback('📅 Переглянути статус', PROFILE_ACTION.BOOKING_STATUS)],
      [Markup.button.callback(PROFILE_BUTTON_TEXT.BACK_TO_PROFILE, PROFILE_ACTION.OPEN)],
    ]),
  );
}

export async function sendProfileBookingActionStub(ctx: MyContext, title: string): Promise<void> {
  await ctx.reply(
    `${title}\n\n` +
      'Цю дію вже винесено в окремий етап.\n' +
      'На наступному кроці підключимо повну робочу реалізацію.',
    Markup.inlineKeyboard([
      [Markup.button.callback('📅 Переглянути статус', PROFILE_ACTION.BOOKING_STATUS)],
      [Markup.button.callback(PROFILE_BUTTON_TEXT.BACK_TO_PROFILE, PROFILE_ACTION.OPEN)],
    ]),
  );
}
