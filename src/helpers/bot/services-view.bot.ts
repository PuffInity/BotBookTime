import { Markup } from 'telegraf';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import {
  SERVICES_ACTION,
  makeServiceItemAction,
} from '../../types/bot-services.types.js';
import type {
  ServicesCatalogDetails,
  ServicesCatalogItem,
} from '../../types/db-helpers/db-services.types.js';
import { tBot } from './i18n.bot.js';
import type { BotUiLanguage } from './i18n.bot.js';

/**
 * @file services-view.bot.ts
 * @summary UI/helper-и для розділу "Послуги" (тексти + inline-клавіатури).
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
 * uk: Внутрішня bot helper функція getMinutesUnit.
 * en: Internal bot helper function getMinutesUnit.
 * cz: Interní bot helper funkce getMinutesUnit.
 */
function getMinutesUnit(language: BotUiLanguage): string {
  return language === 'uk' ? 'хв' : 'min';
}

/**
 * uk: Внутрішня bot helper функція getDaysUnit.
 * en: Internal bot helper function getDaysUnit.
 * cz: Interní bot helper funkce getDaysUnit.
 */
function getDaysUnit(language: BotUiLanguage): string {
  if (language === 'en') return 'days';
  if (language === 'cs') return 'dnů';
  return 'дн.';
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
 * uk: Внутрішня bot helper функція formatServiceListLine.
 * en: Internal bot helper function formatServiceListLine.
 * cz: Interní bot helper funkce formatServiceListLine.
 */
function formatServiceListLine(
  service: ServicesCatalogItem,
  index: number,
  language: BotUiLanguage,
): string {
  return (
    `${getNumberBadge(index)} ${service.name}\n` +
    `⏱ ${service.durationMinutes} ${getMinutesUnit(language)} • 💰 ${formatPrice(service.basePrice, service.currencyCode)}`
  );
}

/**
 * uk: Внутрішня bot helper функція formatStepsBlock.
 * en: Internal bot helper function formatStepsBlock.
 * cz: Interní bot helper funkce formatStepsBlock.
 */
function formatStepsBlock(details: ServicesCatalogDetails, language: BotUiLanguage): string {
  if (details.steps.length === 0) {
    return `${tBot(language, 'SERVICES_STEPS_TITLE')}\n${tBot(language, 'SERVICES_STEPS_EMPTY')}`;
  }

  const lines = details.steps.map(
    (step) =>
      `🔹 ${step.stepNo}. ${step.title} (≈${step.durationMinutes} ${getMinutesUnit(language)})\n${step.description}`,
  );
  return `${tBot(language, 'SERVICES_STEPS_TITLE')}\n${lines.join('\n\n')}`;
}

/**
 * uk: Внутрішня bot helper функція formatGuaranteesBlock.
 * en: Internal bot helper function formatGuaranteesBlock.
 * cz: Interní bot helper funkce formatGuaranteesBlock.
 */
function formatGuaranteesBlock(details: ServicesCatalogDetails, language: BotUiLanguage): string {
  if (details.guarantees.length === 0) {
    return `${tBot(language, 'SERVICES_GUARANTEES_TITLE')}\n${tBot(language, 'SERVICES_GUARANTEES_EMPTY')}`;
  }

  const lines = details.guarantees.map((guarantee) => {
    const validDaysLabel =
      guarantee.validDays == null ? '' : ` (${guarantee.validDays} ${getDaysUnit(language)})`;
    return `✔ ${guarantee.guaranteeText}${validDaysLabel}`;
  });
  return `${tBot(language, 'SERVICES_GUARANTEES_TITLE')}\n${lines.join('\n')}`;
}

/**
 * @summary Форматує текст каталогу послуг.
 */
export function formatServicesCatalogText(
  services: ServicesCatalogItem[],
  language: BotUiLanguage,
): string {
  if (services.length === 0) {
    return (
      `${tBot(language, 'SERVICES_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n' +
      `${tBot(language, 'SERVICES_EMPTY')}\n` +
      tBot(language, 'SERVICES_EMPTY_HINT')
    );
  }

  const catalogLines = services.map((service, index) => formatServiceListLine(service, index, language));
  return (
    `${tBot(language, 'SERVICES_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n' +
    `${tBot(language, 'SERVICES_SELECT')}\n\n` +
    catalogLines.join('\n\n')
  );
}

/**
 * @summary Форматує текст детального перегляду послуги.
 */
export function formatServiceDetailsText(
  details: ServicesCatalogDetails,
  language: BotUiLanguage,
): string {
  const { service } = details;
  const descriptionBlock = service.description ? `\n\n${service.description}` : '';
  const resultDescriptionBlock = service.resultDescription
    ? `\n\n🎯 ${tBot(language, 'SERVICES_RESULT_TITLE')}\n${service.resultDescription}`
    : '';

  return (
    `${tBot(language, 'SERVICES_DETAILS_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n' +
    `${tBot(language, 'SERVICES_LABEL_SERVICE')}: ${service.name}\n` +
    `${tBot(language, 'SERVICES_LABEL_DURATION')}: ${service.durationMinutes} ${getMinutesUnit(language)}\n` +
    `${tBot(language, 'SERVICES_LABEL_PRICE')}: ${formatPrice(service.basePrice, service.currencyCode)}` +
    descriptionBlock +
    resultDescriptionBlock +
    '\n\n' +
    `${formatStepsBlock(details, language)}\n\n` +
    formatGuaranteesBlock(details, language)
  );
}

/**
 * @summary Створює inline-клавіатуру каталогу послуг.
 */
export function createServicesCatalogKeyboard(
  services: ServicesCatalogItem[],
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  const serviceRows = services.map((service, index) => [
    Markup.button.callback(`${getNumberBadge(index)} ${service.name}`, makeServiceItemAction(service.id)),
  ]);

  return Markup.inlineKeyboard([
    ...serviceRows,
    [Markup.button.callback(tBot(language, 'HOME'), COMMON_NAV_ACTION.HOME)],
  ]);
}

/**
 * @summary Створює inline-клавіатуру детальної картки послуги.
 */
export function createServiceDetailsKeyboard(
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(tBot(language, 'COMMON_BACK'), SERVICES_ACTION.BACK_TO_LIST),
      Markup.button.callback(tBot(language, 'HOME'), COMMON_NAV_ACTION.HOME),
    ],
  ]);
}
