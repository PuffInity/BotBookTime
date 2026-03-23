import { Markup } from 'telegraf';
import type { MasterPendingBookingItem } from '../../types/db-helpers/db-master-bookings.types.js';
import {
  MASTER_PANEL_ACTION,
  MASTER_PANEL_BUTTON_TEXT,
  makeMasterPanelBookingCancelConfirmAction,
  makeMasterPanelBookingCancelRequestAction,
  makeMasterPanelBookingConfirmAction,
  makeMasterPanelBookingProfileAction,
  makeMasterPanelBookingRescheduleAction,
} from '../../types/bot-master-panel.types.js';

/**
 * @file master-bookings-view.bot.ts
 * @summary UI/helper-и для pending-записів у панелі майстра.
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
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.HOME, MASTER_PANEL_ACTION.HOME)],
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
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.BACK_TO_PANEL, MASTER_PANEL_ACTION.BACK_TO_PANEL)],
    [Markup.button.callback(MASTER_PANEL_BUTTON_TEXT.HOME, MASTER_PANEL_ACTION.HOME)],
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

