import { Markup } from 'telegraf';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import {
  SERVICES_ACTION,
  SERVICES_BUTTON_TEXT,
  makeServiceItemAction,
} from '../../types/bot-services.types.js';
import type {
  ServicesCatalogDetails,
  ServicesCatalogItem,
} from '../../types/db-helpers/db-services.types.js';

/**
 * @file services-view.bot.ts
 * @summary UI/helper-и для розділу "Послуги" (тексти + inline-клавіатури).
 */

const NUMBER_BADGES = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

function getNumberBadge(index: number): string {
  return NUMBER_BADGES[index] ?? `${index + 1}.`;
}

function formatPrice(price: string, currencyCode: string): string {
  const normalizedPrice = price
    .replace(/[.,]00$/, '')
    .replace(/([.,]\d)0$/, '$1');

  return `${normalizedPrice} ${currencyCode}`;
}

function formatServiceListLine(service: ServicesCatalogItem, index: number): string {
  return (
    `${getNumberBadge(index)} ${service.name}\n` +
    `⏱ ${service.durationMinutes} хв • 💰 ${formatPrice(service.basePrice, service.currencyCode)}`
  );
}

function formatStepsBlock(details: ServicesCatalogDetails): string {
  if (details.steps.length === 0) {
    return '✨ Етапи процедури\nІнформацію буде додано найближчим часом.';
  }

  const lines = details.steps.map(
    (step) => `🔹 ${step.stepNo}. ${step.title}\n${step.description}`,
  );
  return `✨ Як проходить процедура\n${lines.join('\n\n')}`;
}

function formatGuaranteesBlock(details: ServicesCatalogDetails): string {
  if (details.guarantees.length === 0) {
    return '🛡 Гарантії\nІнформацію буде додано найближчим часом.';
  }

  const lines = details.guarantees.map((guarantee) => {
    const validDaysLabel = guarantee.validDays == null ? '' : ` (${guarantee.validDays} дн.)`;
    return `✔ ${guarantee.guaranteeText}${validDaysLabel}`;
  });
  return `🛡 Гарантії\n${lines.join('\n')}`;
}

/**
 * @summary Форматує текст каталогу послуг.
 */
export function formatServicesCatalogText(services: ServicesCatalogItem[]): string {
  if (services.length === 0) {
    return (
      '💼 Послуги\n' +
      '━━━━━━━━━━━━━━\n' +
      'Наразі активних послуг немає.\n' +
      'Спробуйте пізніше або зверніться до адміністратора.'
    );
  }

  const catalogLines = services.map(formatServiceListLine);
  return (
    '💼 Послуги\n' +
    '━━━━━━━━━━━━━━\n' +
    'Оберіть послугу, щоб переглянути детальний опис:\n\n' +
    catalogLines.join('\n\n')
  );
}

/**
 * @summary Форматує текст детального перегляду послуги.
 */
export function formatServiceDetailsText(details: ServicesCatalogDetails): string {
  const { service } = details;
  const descriptionBlock = service.description ? `\n\n${service.description}` : '';
  const resultDescriptionBlock = service.resultDescription
    ? `\n\n🎯 Результат\n${service.resultDescription}`
    : '';

  return (
    '📄 Опис послуги\n' +
    '━━━━━━━━━━━━━━\n' +
    `💼 Послуга: ${service.name}\n` +
    `⏱ Тривалість: ${service.durationMinutes} хв\n` +
    `💰 Вартість: ${formatPrice(service.basePrice, service.currencyCode)}` +
    descriptionBlock +
    resultDescriptionBlock +
    '\n\n' +
    `${formatStepsBlock(details)}\n\n` +
    formatGuaranteesBlock(details)
  );
}

/**
 * @summary Створює inline-клавіатуру каталогу послуг.
 */
export function createServicesCatalogKeyboard(
  services: ServicesCatalogItem[],
): ReturnType<typeof Markup.inlineKeyboard> {
  const serviceRows = services.map((service, index) => [
    Markup.button.callback(`${getNumberBadge(index)} ${service.name}`, makeServiceItemAction(service.id)),
  ]);

  return Markup.inlineKeyboard([
    ...serviceRows,
    [Markup.button.callback(SERVICES_BUTTON_TEXT.HOME, COMMON_NAV_ACTION.HOME)],
  ]);
}

/**
 * @summary Створює inline-клавіатуру детальної картки послуги.
 */
export function createServiceDetailsKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(SERVICES_BUTTON_TEXT.BACK, SERVICES_ACTION.BACK_TO_LIST),
      Markup.button.callback(SERVICES_BUTTON_TEXT.HOME, COMMON_NAV_ACTION.HOME),
    ],
  ]);
}

