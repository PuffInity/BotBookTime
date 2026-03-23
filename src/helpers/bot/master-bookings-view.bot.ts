import { Markup } from 'telegraf';
import type { MasterPendingBookingItem } from '../../types/db-helpers/db-master-bookings.types.js';
import {
  MASTER_PANEL_ACTION,
  MASTER_PANEL_BUTTON_TEXT,
  makeMasterPanelBookingCancelConfirmAction,
  makeMasterPanelBookingCancelRequestAction,
  makeMasterPanelBookingConfirmAction,
  makeMasterPanelBookingProfileAction,
  makeMasterPanelBookingRescheduleDateAction,
  makeMasterPanelBookingRescheduleAction,
  makeMasterPanelBookingRescheduleTimeAction,
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
