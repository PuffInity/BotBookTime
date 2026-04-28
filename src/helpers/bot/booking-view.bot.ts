import { Markup } from 'telegraf';
import type { MasterBookingOption } from '../../types/db-helpers/db-masters.types.js';
import type { ServicesCatalogItem } from '../../types/db-helpers/db-services.types.js';
import type { CreatePendingBookingResult } from '../../types/db-helpers/db-booking.types.js';
import {
  BOOKING_ACTION,
  makeBookingDateAction,
  makeBookingMasterAction,
  makeBookingServiceAction,
  makeBookingTimeAction,
} from '../../types/bot-booking.types.js';
import { tBot } from './i18n.bot.js';
import type { BotUiLanguage } from './i18n.bot.js';

/**
 * @file booking-view.bot.ts
 * @summary UI/helper-и для сцени "Бронювання" (тексти + inline-клавіатури).
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
 * uk: Внутрішня bot helper функція formatPrice.
 * en: Internal bot helper function formatPrice.
 * cz: Interní bot helper funkce formatPrice.
 */
function formatPrice(price: string, currencyCode: string): string {
  const normalizedPrice = price
    .replace(/[.,]00$/, '')
    .replace(/([.,]\d)0$/, '$1');

  return `${normalizedPrice} ${currencyCode}`;
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
 * uk: Внутрішня bot helper функція formatDateLabel.
 * en: Internal bot helper function formatDateLabel.
 * cz: Interní bot helper funkce formatDateLabel.
 */
function formatDateLabel(date: Date, language: BotUiLanguage): string {
  const weekday = new Intl.DateTimeFormat(toLocale(language), { weekday: 'short' }).format(date);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${weekday} ${day}.${month}`;
}

/**
 * uk: Внутрішня bot helper функція formatDateTimeLabel.
 * en: Internal bot helper function formatDateTimeLabel.
 * cz: Interní bot helper funkce formatDateTimeLabel.
 */
function formatDateTimeLabel(startAt: Date, language: BotUiLanguage): string {
  return new Intl.DateTimeFormat(toLocale(language), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Prague',
  }).format(startAt);
}

/**
 * uk: Публічна bot helper функція buildBookingDateOptions.
 * en: Public bot helper function buildBookingDateOptions.
 * cz: Veřejná bot helper funkce buildBookingDateOptions.
 */
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

/**
 * uk: Публічна bot helper функція buildBookingTimeOptions.
 * en: Public bot helper function buildBookingTimeOptions.
 * cz: Veřejná bot helper funkce buildBookingTimeOptions.
 */
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

/**
 * uk: Внутрішня bot helper функція getDateCode.
 * en: Internal bot helper function getDateCode.
 * cz: Interní bot helper funkce getDateCode.
 */
function getDateCode(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * uk: Внутрішня bot helper функція getTimeCode.
 * en: Internal bot helper function getTimeCode.
 * cz: Interní bot helper funkce getTimeCode.
 */
function getTimeCode(timeLabel: string): string {
  return timeLabel.replace(':', '');
}

/**
 * uk: Публічна bot helper функція formatBookingServiceStepText.
 * en: Public bot helper function formatBookingServiceStepText.
 * cz: Veřejná bot helper funkce formatBookingServiceStepText.
 */
export function formatBookingServiceStepText(
  services: ServicesCatalogItem[],
  language: BotUiLanguage,
): string {
  if (services.length === 0) {
    return (
      `${tBot(language, 'BOOKING_STEP_1_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n' +
      `${tBot(language, 'BOOKING_NO_SERVICES')}\n` +
      tBot(language, 'BOOKING_NO_SERVICES_HINT')
    );
  }

  return (
    `${tBot(language, 'BOOKING_STEP_1_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n' +
    tBot(language, 'BOOKING_SELECT_SERVICE')
  );
}

/**
 * uk: Публічна bot helper функція createBookingServiceKeyboard.
 * en: Public bot helper function createBookingServiceKeyboard.
 * cz: Veřejná bot helper funkce createBookingServiceKeyboard.
 */
export function createBookingServiceKeyboard(
  services: ServicesCatalogItem[],
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  const serviceRows = services.map((service, index) => [
    Markup.button.callback(
      `${getNumberBadge(index)} ${service.name}`,
      makeBookingServiceAction(service.id),
    ),
  ]);

  return Markup.inlineKeyboard([
    ...serviceRows,
    [Markup.button.callback(tBot(language, 'BOOKING_BTN_CANCEL'), BOOKING_ACTION.CANCEL)],
  ]);
}

/**
 * uk: Публічна bot helper функція formatBookingDateStepText.
 * en: Public bot helper function formatBookingDateStepText.
 * cz: Veřejná bot helper funkce formatBookingDateStepText.
 */
export function formatBookingDateStepText(serviceName: string, language: BotUiLanguage): string {
  return (
    `${tBot(language, 'BOOKING_STEP_2_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n' +
    `${tBot(language, 'BOOKING_LABEL_SERVICE')}: ${serviceName}\n\n` +
    tBot(language, 'BOOKING_SELECT_DATE')
  );
}

/**
 * uk: Публічна bot helper функція createBookingDateKeyboard.
 * en: Public bot helper function createBookingDateKeyboard.
 * cz: Veřejná bot helper funkce createBookingDateKeyboard.
 */
export function createBookingDateKeyboard(
  dates: Date[],
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  const dateRows = dates.map((date) => [
    Markup.button.callback(formatDateLabel(date, language), makeBookingDateAction(getDateCode(date))),
  ]);

  return Markup.inlineKeyboard([
    ...dateRows,
    [
      Markup.button.callback(tBot(language, 'COMMON_BACK'), BOOKING_ACTION.BACK),
      Markup.button.callback(tBot(language, 'BOOKING_BTN_CANCEL'), BOOKING_ACTION.CANCEL),
    ],
  ]);
}

/**
 * uk: Публічна bot helper функція formatBookingTimeStepText.
 * en: Public bot helper function formatBookingTimeStepText.
 * cz: Veřejná bot helper funkce formatBookingTimeStepText.
 */
export function formatBookingTimeStepText(
  serviceName: string,
  dateLabel: string,
  language: BotUiLanguage,
): string {
  return (
    `${tBot(language, 'BOOKING_STEP_3_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n' +
    `${tBot(language, 'BOOKING_LABEL_SERVICE')}: ${serviceName}\n` +
    `${tBot(language, 'BOOKING_LABEL_DATE')}: ${dateLabel}\n\n` +
    tBot(language, 'BOOKING_SELECT_TIME')
  );
}

/**
 * uk: Публічна bot helper функція createBookingTimeKeyboard.
 * en: Public bot helper function createBookingTimeKeyboard.
 * cz: Veřejná bot helper funkce createBookingTimeKeyboard.
 */
export function createBookingTimeKeyboard(
  timeLabels: string[],
  language: BotUiLanguage,
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
      Markup.button.callback(tBot(language, 'COMMON_BACK'), BOOKING_ACTION.BACK),
      Markup.button.callback(tBot(language, 'BOOKING_BTN_CANCEL'), BOOKING_ACTION.CANCEL),
    ],
  ]);
}

/**
 * uk: Публічна bot helper функція formatBookingMasterStepText.
 * en: Public bot helper function formatBookingMasterStepText.
 * cz: Veřejná bot helper funkce formatBookingMasterStepText.
 */
export function formatBookingMasterStepText(
  serviceName: string,
  dateLabel: string,
  timeLabel: string,
  masters: MasterBookingOption[],
  language: BotUiLanguage,
): string {
  if (masters.length === 0) {
    return (
      `${tBot(language, 'BOOKING_STEP_4_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n' +
      `${tBot(language, 'BOOKING_LABEL_SERVICE')}: ${serviceName}\n` +
      `${tBot(language, 'BOOKING_LABEL_DATE')}: ${dateLabel}\n` +
      `${tBot(language, 'BOOKING_LABEL_TIME')}: ${timeLabel}\n\n` +
      tBot(language, 'BOOKING_NO_MASTERS')
    );
  }

  return (
    `${tBot(language, 'BOOKING_STEP_4_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n' +
    `${tBot(language, 'BOOKING_LABEL_SERVICE')}: ${serviceName}\n` +
    `${tBot(language, 'BOOKING_LABEL_DATE')}: ${dateLabel}\n` +
    `${tBot(language, 'BOOKING_LABEL_TIME')}: ${timeLabel}\n\n` +
    tBot(language, 'BOOKING_SELECT_MASTER')
  );
}

/**
 * uk: Публічна bot helper функція createBookingMasterKeyboard.
 * en: Public bot helper function createBookingMasterKeyboard.
 * cz: Veřejná bot helper funkce createBookingMasterKeyboard.
 */
export function createBookingMasterKeyboard(
  masters: MasterBookingOption[],
  language: BotUiLanguage,
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
      Markup.button.callback(tBot(language, 'COMMON_BACK'), BOOKING_ACTION.BACK),
      Markup.button.callback(tBot(language, 'BOOKING_BTN_CANCEL'), BOOKING_ACTION.CANCEL),
    ],
  ]);
}

/**
 * uk: Публічна bot helper функція formatBookingPhoneStepText.
 * en: Public bot helper function formatBookingPhoneStepText.
 * cz: Veřejná bot helper funkce formatBookingPhoneStepText.
 */
export function formatBookingPhoneStepText(name: string, language: BotUiLanguage): string {
  return (
    `${tBot(language, 'BOOKING_STEP_5_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n' +
    `${tBot(language, 'BOOKING_PROFILE_NAME')}: ${name}\n\n` +
    `${tBot(language, 'BOOKING_PHONE_MISSING')}\n` +
    tBot(language, 'BOOKING_PHONE_ENTER')
  );
}

/**
 * uk: Публічна bot helper функція formatBookingPhoneUnverifiedStepText.
 * en: Public bot helper function formatBookingPhoneUnverifiedStepText.
 * cz: Veřejná bot helper funkce formatBookingPhoneUnverifiedStepText.
 */
export function formatBookingPhoneUnverifiedStepText(input: {
  name: string;
  phone: string;
}, language: BotUiLanguage): string {
  return (
    `${tBot(language, 'BOOKING_STEP_5_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n' +
    `${tBot(language, 'BOOKING_PROFILE_NAME')}: ${input.name}\n` +
    `${tBot(language, 'BOOKING_PROFILE_PHONE')}: ${input.phone}\n\n` +
    tBot(language, 'BOOKING_PHONE_UNVERIFIED')
  );
}

/**
 * uk: Публічна bot helper функція createBookingPhoneUnverifiedKeyboard.
 * en: Public bot helper function createBookingPhoneUnverifiedKeyboard.
 * cz: Veřejná bot helper funkce createBookingPhoneUnverifiedKeyboard.
 */
export function createBookingPhoneUnverifiedKeyboard(
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(tBot(language, 'BOOKING_BTN_GO_PROFILE'), BOOKING_ACTION.PHONE_GO_PROFILE),
      Markup.button.callback(
        tBot(language, 'BOOKING_BTN_USE_UNVERIFIED'),
        BOOKING_ACTION.PHONE_USE_UNVERIFIED,
      ),
    ],
    [
      Markup.button.callback(tBot(language, 'COMMON_BACK'), BOOKING_ACTION.BACK),
      Markup.button.callback(tBot(language, 'BOOKING_BTN_CANCEL'), BOOKING_ACTION.CANCEL),
    ],
  ]);
}

/**
 * uk: Публічна bot helper функція formatBookingConfirmStepText.
 * en: Public bot helper function formatBookingConfirmStepText.
 * cz: Veřejná bot helper funkce formatBookingConfirmStepText.
 */
export function formatBookingConfirmStepText(input: {
  serviceName: string;
  masterName: string;
  startAt: Date;
  attendeeName: string;
  attendeePhone: string;
}, language: BotUiLanguage): string {
  return (
    `${tBot(language, 'BOOKING_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n' +
    `${tBot(language, 'BOOKING_LABEL_SERVICE')}: ${input.serviceName}\n` +
    `${tBot(language, 'BOOKING_LABEL_MASTER')}: ${input.masterName}\n` +
    `${tBot(language, 'BOOKING_LABEL_DATETIME')}: ${formatDateTimeLabel(input.startAt, language)}\n` +
    `${tBot(language, 'BOOKING_LABEL_CLIENT')}: ${input.attendeeName}\n` +
    `${tBot(language, 'BOOKING_LABEL_PHONE')}: ${input.attendeePhone}\n\n` +
    tBot(language, 'BOOKING_CONFIRM_ASK')
  );
}

/**
 * uk: Публічна bot helper функція createBookingConfirmKeyboard.
 * en: Public bot helper function createBookingConfirmKeyboard.
 * cz: Veřejná bot helper funkce createBookingConfirmKeyboard.
 */
export function createBookingConfirmKeyboard(language: BotUiLanguage): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'BOOKING_BTN_CONFIRM'), BOOKING_ACTION.CONFIRM)],
    [
      Markup.button.callback(tBot(language, 'BOOKING_BTN_CHANGE'), BOOKING_ACTION.CHANGE),
      Markup.button.callback(tBot(language, 'BOOKING_BTN_CANCEL'), BOOKING_ACTION.CANCEL),
    ],
  ]);
}

/**
 * uk: Публічна bot helper функція formatBookingSuccessText.
 * en: Public bot helper function formatBookingSuccessText.
 * cz: Veřejná bot helper funkce formatBookingSuccessText.
 */
export function formatBookingSuccessText(
  result: CreatePendingBookingResult,
  language: BotUiLanguage,
): string {
  const startLabel = formatDateTimeLabel(result.appointment.startAt, language);
  const priceLabel = formatPrice(result.meta.priceAmount, result.meta.currencyCode);

  return (
    `${tBot(language, 'BOOKING_SUCCESS_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n' +
    `${tBot(language, 'BOOKING_LABEL_SERVICE')}: ${result.meta.serviceName}\n` +
    `${tBot(language, 'BOOKING_LABEL_MASTER')}: ${result.meta.masterDisplayName}\n` +
    `${tBot(language, 'BOOKING_LABEL_DATETIME')}: ${startLabel}\n` +
    `${tBot(language, 'SERVICES_LABEL_PRICE')}: ${priceLabel}\n` +
    `${tBot(language, 'BOOKING_RECORD_ID')}: ${result.appointment.id}\n\n` +
    tBot(language, 'BOOKING_STATUS_PENDING')
  );
}
