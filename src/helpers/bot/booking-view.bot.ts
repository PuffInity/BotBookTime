import { Markup } from 'telegraf';
import type { MasterBookingOption } from '../../types/db-helpers/db-masters.types.js';
import type { ServicesCatalogItem } from '../../types/db-helpers/db-services.types.js';
import type { CreatePendingBookingResult } from '../../types/db-helpers/db-booking.types.js';
import {
  BOOKING_ACTION,
  BOOKING_BUTTON_TEXT,
  makeBookingDateAction,
  makeBookingMasterAction,
  makeBookingServiceAction,
  makeBookingTimeAction,
} from '../../types/bot-booking.types.js';

/**
 * @file booking-view.bot.ts
 * @summary UI/helper-и для сцени "Бронювання" (тексти + inline-клавіатури).
 */

const NUMBER_BADGES = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
const WEEKDAY_LABELS = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

function getNumberBadge(index: number): string {
  return NUMBER_BADGES[index] ?? `${index + 1}.`;
}

function formatPrice(price: string, currencyCode: string): string {
  const normalizedPrice = price
    .replace(/[.,]00$/, '')
    .replace(/([.,]\d)0$/, '$1');

  return `${normalizedPrice} ${currencyCode}`;
}

function formatDateLabel(date: Date): string {
  const weekday = WEEKDAY_LABELS[date.getDay()];
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${weekday} ${day}.${month}`;
}

function formatDateTimeLabel(startAt: Date): string {
  const day = String(startAt.getDate()).padStart(2, '0');
  const month = String(startAt.getMonth() + 1).padStart(2, '0');
  const year = startAt.getFullYear();
  const hours = String(startAt.getHours()).padStart(2, '0');
  const minutes = String(startAt.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export function buildBookingDateOptions(days = 7): Date[] {
  const options: Date[] = [];
  const now = new Date();

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(now.getDate() + offset);
    options.push(date);
  }

  return options;
}

export function buildBookingTimeOptions(): string[] {
  const slots: string[] = [];

  for (let hour = 9; hour <= 18; hour += 1) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    if (hour < 18) {
      slots.push(`${String(hour).padStart(2, '0')}:30`);
    }
  }

  return slots;
}

function getDateCode(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function getTimeCode(timeLabel: string): string {
  return timeLabel.replace(':', '');
}

export function formatBookingServiceStepText(services: ServicesCatalogItem[]): string {
  if (services.length === 0) {
    return (
      '📅 Бронювання\n' +
      '━━━━━━━━━━━━━━\n' +
      'Наразі немає активних послуг для запису.\n' +
      'Спробуйте пізніше або зверніться до адміністратора.'
    );
  }

  return (
    '📅 Бронювання — крок 1/5\n' +
    '━━━━━━━━━━━━━━\n' +
    'Оберіть послугу для запису.'
  );
}

export function createBookingServiceKeyboard(
  services: ServicesCatalogItem[],
): ReturnType<typeof Markup.inlineKeyboard> {
  const serviceRows = services.map((service, index) => [
    Markup.button.callback(
      `${getNumberBadge(index)} ${service.name}`,
      makeBookingServiceAction(service.id),
    ),
  ]);

  return Markup.inlineKeyboard([
    ...serviceRows,
    [Markup.button.callback(BOOKING_BUTTON_TEXT.CANCEL_BOOKING, BOOKING_ACTION.CANCEL)],
  ]);
}

export function formatBookingDateStepText(serviceName: string): string {
  return (
    '📅 Бронювання — крок 2/5\n' +
    '━━━━━━━━━━━━━━\n' +
    `💼 Послуга: ${serviceName}\n\n` +
    'Оберіть дату візиту.'
  );
}

export function createBookingDateKeyboard(
  dates: Date[],
): ReturnType<typeof Markup.inlineKeyboard> {
  const dateRows = dates.map((date) => [
    Markup.button.callback(formatDateLabel(date), makeBookingDateAction(getDateCode(date))),
  ]);

  return Markup.inlineKeyboard([
    ...dateRows,
    [
      Markup.button.callback(BOOKING_BUTTON_TEXT.BACK, BOOKING_ACTION.BACK),
      Markup.button.callback(BOOKING_BUTTON_TEXT.CANCEL_BOOKING, BOOKING_ACTION.CANCEL),
    ],
  ]);
}

export function formatBookingTimeStepText(serviceName: string, dateLabel: string): string {
  return (
    '📅 Бронювання — крок 3/5\n' +
    '━━━━━━━━━━━━━━\n' +
    `💼 Послуга: ${serviceName}\n` +
    `📆 Дата: ${dateLabel}\n\n` +
    'Оберіть зручний час.'
  );
}

export function createBookingTimeKeyboard(
  timeLabels: string[],
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows: ReturnType<typeof Markup.button.callback>[][] = [];

  for (let i = 0; i < timeLabels.length; i += 2) {
    const first = timeLabels[i];
    const second = timeLabels[i + 1];

    const row = [Markup.button.callback(first, makeBookingTimeAction(getTimeCode(first)))];
    if (second) {
      row.push(Markup.button.callback(second, makeBookingTimeAction(getTimeCode(second))));
    }

    rows.push(row);
  }

  return Markup.inlineKeyboard([
    ...rows,
    [
      Markup.button.callback(BOOKING_BUTTON_TEXT.BACK, BOOKING_ACTION.BACK),
      Markup.button.callback(BOOKING_BUTTON_TEXT.CANCEL_BOOKING, BOOKING_ACTION.CANCEL),
    ],
  ]);
}

export function formatBookingMasterStepText(
  serviceName: string,
  dateLabel: string,
  timeLabel: string,
  masters: MasterBookingOption[],
): string {
  if (masters.length === 0) {
    return (
      '📅 Бронювання — крок 4/5\n' +
      '━━━━━━━━━━━━━━\n' +
      `💼 Послуга: ${serviceName}\n` +
      `📆 Дата: ${dateLabel}\n` +
      `⏰ Час: ${timeLabel}\n\n` +
      'На жаль, для цієї послуги зараз немає доступних майстрів.'
    );
  }

  return (
    '📅 Бронювання — крок 4/5\n' +
    '━━━━━━━━━━━━━━\n' +
    `💼 Послуга: ${serviceName}\n` +
    `📆 Дата: ${dateLabel}\n` +
    `⏰ Час: ${timeLabel}\n\n` +
    'Оберіть майстра.'
  );
}

export function createBookingMasterKeyboard(
  masters: MasterBookingOption[],
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = masters.map((master, index) => {
    const ratingSuffix = master.ratingCount > 0 ? ` ⭐ ${master.ratingAvg}` : '';
    return [
      Markup.button.callback(
        `${getNumberBadge(index)} ${master.displayName}${ratingSuffix}`,
        makeBookingMasterAction(master.masterId),
      ),
    ];
  });

  return Markup.inlineKeyboard([
    ...rows,
    [
      Markup.button.callback(BOOKING_BUTTON_TEXT.BACK, BOOKING_ACTION.BACK),
      Markup.button.callback(BOOKING_BUTTON_TEXT.CANCEL_BOOKING, BOOKING_ACTION.CANCEL),
    ],
  ]);
}

export function formatBookingPhoneStepText(name: string): string {
  return (
    '📅 Бронювання — крок 5/5\n' +
    '━━━━━━━━━━━━━━\n' +
    `👤 Ім'я з профілю: ${name}\n\n` +
    '📱 Номер у профілі не доданий.\n' +
    'Будь ласка, напишіть ваш номер телефону у форматі +420123456789.'
  );
}

export function formatBookingPhoneUnverifiedStepText(input: {
  name: string;
  phone: string;
}): string {
  return (
    '📅 Бронювання — крок 5/5\n' +
    '━━━━━━━━━━━━━━\n' +
    `👤 Ім'я з профілю: ${input.name}\n` +
    `📱 Телефон у профілі: ${input.phone}\n\n` +
    '⚠️ Ваш номер телефону доданий, але не підтверджений.\n' +
    'Оберіть дію: перейти в профіль або використати непідтверджений номер.'
  );
}

export function createBookingPhoneUnverifiedKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(BOOKING_BUTTON_TEXT.GO_PROFILE, BOOKING_ACTION.PHONE_GO_PROFILE),
      Markup.button.callback(
        BOOKING_BUTTON_TEXT.USE_UNVERIFIED_PHONE,
        BOOKING_ACTION.PHONE_USE_UNVERIFIED,
      ),
    ],
    [
      Markup.button.callback(BOOKING_BUTTON_TEXT.BACK, BOOKING_ACTION.BACK),
      Markup.button.callback(BOOKING_BUTTON_TEXT.CANCEL_BOOKING, BOOKING_ACTION.CANCEL),
    ],
  ]);
}

export function formatBookingConfirmStepText(input: {
  serviceName: string;
  masterName: string;
  startAt: Date;
  attendeeName: string;
  attendeePhone: string;
}): string {
  return (
    '✅ Підтвердження бронювання\n' +
    '━━━━━━━━━━━━━━\n' +
    `💼 Послуга: ${input.serviceName}\n` +
    `👩‍🎨 Майстер: ${input.masterName}\n` +
    `📆 Дата та час: ${formatDateTimeLabel(input.startAt)}\n` +
    `👤 Клієнт: ${input.attendeeName}\n` +
    `📱 Телефон: ${input.attendeePhone}\n\n` +
    'Підтвердити створення запису?'
  );
}

export function createBookingConfirmKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(BOOKING_BUTTON_TEXT.CONFIRM, BOOKING_ACTION.CONFIRM)],
    [
      Markup.button.callback(BOOKING_BUTTON_TEXT.CHANGE, BOOKING_ACTION.CHANGE),
      Markup.button.callback(BOOKING_BUTTON_TEXT.CANCEL, BOOKING_ACTION.CANCEL),
    ],
  ]);
}

export function formatBookingSuccessText(result: CreatePendingBookingResult): string {
  const startLabel = formatDateTimeLabel(result.appointment.startAt);
  const priceLabel = formatPrice(result.meta.priceAmount, result.meta.currencyCode);

  return (
    '🎉 Ваш запис успішно створено\n' +
    '━━━━━━━━━━━━━━\n' +
    `💼 Послуга: ${result.meta.serviceName}\n` +
    `👩‍🎨 Майстер: ${result.meta.masterDisplayName}\n` +
    `📆 Дата та час: ${startLabel}\n` +
    `💰 Вартість: ${priceLabel}\n` +
    `🆔 Номер запису: ${result.appointment.id}\n\n` +
    'Статус: 🟡 Очікує підтвердження майстром.'
  );
}
