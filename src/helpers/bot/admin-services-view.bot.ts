import { Markup } from 'telegraf';
import {
  ADMIN_PANEL_ACTION,
  ADMIN_PANEL_BUTTON_TEXT,
  makeAdminPanelServicesOpenAction,
  makeAdminPanelServicesOpenStatsAction,
} from '../../types/bot-admin-panel.types.js';
import type {
  ServicesCatalogDetails,
  ServicesCatalogItem,
} from '../../types/db-helpers/db-services.types.js';

/**
 * @file admin-services-view.bot.ts
 * @summary UI/helper-и блоку "Послуги" у адмін-панелі.
 */

const NUMBER_BADGES = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

function getNumberBadge(index: number): string {
  return NUMBER_BADGES[index] ?? `${index + 1}.`;
}

function formatPrice(price: string, currencyCode: string): string {
  const normalized = price
    .replace(/[.,]00$/, '')
    .replace(/([.,]\d)0$/, '$1');
  return `${normalized} ${currencyCode}`;
}

function formatServiceLine(service: ServicesCatalogItem, index: number): string {
  return (
    `${getNumberBadge(index)} ${service.name}\n` +
    `🪪 ID: ${service.id} • ⏱ ${service.durationMinutes} хв • 💰 ${formatPrice(service.basePrice, service.currencyCode)}`
  );
}

function formatSteps(details: ServicesCatalogDetails): string {
  if (details.steps.length === 0) {
    return '🔹 Етапи не вказані';
  }

  return details.steps
    .map((step) => `• ${step.stepNo}. ${step.title}`)
    .join('\n');
}

function formatGuarantees(details: ServicesCatalogDetails): string {
  if (details.guarantees.length === 0) {
    return '🔹 Гарантії не вказані';
  }

  return details.guarantees
    .map((item) => {
      const validDays = item.validDays == null ? '' : ` (${item.validDays} дн.)`;
      return `• ${item.guaranteeText}${validDays}`;
    })
    .join('\n');
}

/**
 * @summary Форматує список послуг студії.
 */
export function formatAdminServicesCatalogText(services: ServicesCatalogItem[]): string {
  if (services.length === 0) {
    return (
      '💼 Послуги салону\n' +
      '━━━━━━━━━━━━━━\n\n' +
      'Поки що немає активних послуг.\n' +
      'Додайте послуги у студії, щоб вони зʼявилися в цьому розділі.'
    );
  }

  return (
    '💼 Послуги салону\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Оберіть послугу для перегляду картки:\n\n' +
    services.map(formatServiceLine).join('\n\n')
  );
}

/**
 * @summary Клавіатура списку послуг.
 */
export function createAdminServicesCatalogKeyboard(
  services: ServicesCatalogItem[],
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = services.map((service, index) => [
    Markup.button.callback(
      `${getNumberBadge(index)} ${service.name}`,
      makeAdminPanelServicesOpenAction(service.id),
    ),
  ]);

  return Markup.inlineKeyboard([
    ...rows,
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_BACK, ADMIN_PANEL_ACTION.SERVICES_BACK)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.HOME, ADMIN_PANEL_ACTION.HOME)],
  ]);
}

/**
 * @summary Форматує детальну картку послуги.
 */
export function formatAdminServiceDetailsText(details: ServicesCatalogDetails): string {
  const { service } = details;
  const description = service.description?.trim() ? service.description.trim() : 'Не вказано';
  const result = service.resultDescription?.trim() ? service.resultDescription.trim() : 'Не вказано';

  return (
    '📄 Картка послуги\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Назва: ${service.name}\n` +
    `🪪 ID: ${service.id}\n` +
    `⏱ Тривалість: ${service.durationMinutes} хв\n` +
    `💰 Ціна: ${formatPrice(service.basePrice, service.currencyCode)}\n` +
    `📌 Статус: ${service.isActive ? 'Активна' : 'Неактивна'}\n\n` +
    `📝 Опис\n${description}\n\n` +
    `🎯 Результат\n${result}\n\n` +
    `✨ Етапи процедури\n${formatSteps(details)}\n\n` +
    `🛡 Гарантії\n${formatGuarantees(details)}`
  );
}

/**
 * @summary Клавіатура картки послуги.
 */
export function createAdminServiceDetailsKeyboard(
  serviceId: string,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.SERVICES_OPEN_STATS,
        makeAdminPanelServicesOpenStatsAction(serviceId),
      ),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_BACK_TO_LIST, ADMIN_PANEL_ACTION.SERVICES_BACK_TO_LIST)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_BACK, ADMIN_PANEL_ACTION.SERVICES_BACK)],
  ]);
}

/**
 * @summary Stub-текст підрозділу статистики конкретної послуги.
 */
export function formatAdminServiceStatsStubText(serviceName: string): string {
  return (
    '📊 Статистика послуги\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Послуга: ${serviceName}\n\n` +
    '⚠️ Розділ тимчасово недоступний.\n' +
    'Після підключення тут будуть фінансові та операційні показники послуги.'
  );
}
