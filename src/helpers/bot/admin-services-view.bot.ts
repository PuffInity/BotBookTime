import { Markup } from 'telegraf';
import {
  ADMIN_PANEL_ACTION,
  ADMIN_PANEL_BUTTON_TEXT,
  makeAdminPanelServicesEditOpenAction,
  makeAdminPanelServicesEditStepPickAction,
  makeAdminPanelServicesEditGuaranteePickAction,
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
        ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_OPEN,
        makeAdminPanelServicesEditOpenAction(serviceId),
      ),
    ],
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

function formatOptionalText(value: string | null): string {
  const normalized = value?.trim();
  return normalized ? normalized : 'Не вказано';
}

/**
 * @summary Текст меню редагування послуги.
 */
export function formatAdminServiceEditMenuText(
  serviceName: string,
  durationMinutes: number,
  basePrice: string,
  currencyCode: string,
  description: string | null,
  resultDescription: string | null,
): string {
  return (
    '✏️ Редагування послуги\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Послуга: ${serviceName}\n\n` +
    `⏱ Поточна тривалість: ${durationMinutes} хв\n\n` +
    `💰 Поточна ціна: ${formatPrice(basePrice, currencyCode)}\n\n` +
    `📝 Поточний опис:\n${formatOptionalText(description)}\n\n` +
    `🎯 Поточний результат:\n${formatOptionalText(resultDescription)}\n\n` +
    'Оберіть, що потрібно змінити:'
  );
}

/**
 * @summary Клавіатура меню редагування послуги.
 */
export function createAdminServiceEditMenuKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_NAME, ADMIN_PANEL_ACTION.SERVICES_EDIT_NAME_OPEN)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_DURATION, ADMIN_PANEL_ACTION.SERVICES_EDIT_DURATION_OPEN)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_PRICE, ADMIN_PANEL_ACTION.SERVICES_EDIT_PRICE_OPEN)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_DESCRIPTION, ADMIN_PANEL_ACTION.SERVICES_EDIT_DESCRIPTION_OPEN)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_RESULT, ADMIN_PANEL_ACTION.SERVICES_EDIT_RESULT_OPEN)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_STEP, ADMIN_PANEL_ACTION.SERVICES_EDIT_STEP_OPEN)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_GUARANTEE, ADMIN_PANEL_ACTION.SERVICES_EDIT_GUARANTEE_OPEN)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_DELETE, ADMIN_PANEL_ACTION.SERVICES_EDIT_DELETE_OPEN)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_BACK, ADMIN_PANEL_ACTION.SERVICES_EDIT_BACK)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_BACK_TO_LIST, ADMIN_PANEL_ACTION.SERVICES_BACK_TO_LIST)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_BACK, ADMIN_PANEL_ACTION.SERVICES_BACK)],
  ]);
}

type AdminServiceGuaranteeOption = {
  guaranteeNo: number;
  guaranteeText: string;
};

type AdminServiceStepOption = {
  stepNo: number;
  title: string;
};

function compactText(value: string, max = 64): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1)}…`;
}

/**
 * @summary Текст вибору гарантії для редагування.
 */
export function formatAdminServiceEditGuaranteeSelectText(
  serviceName: string,
  options: AdminServiceGuaranteeOption[],
): string {
  return (
    '🛡 Редагування гарантії послуги\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Послуга: ${serviceName}\n\n` +
    'Оберіть гарантію, яку потрібно змінити:\n\n' +
    options
      .map((item, index) => `${getNumberBadge(index)} №${item.guaranteeNo} — ${compactText(item.guaranteeText, 54)}`)
      .join('\n')
  );
}

/**
 * @summary Клавіатура вибору гарантії послуги.
 */
export function createAdminServiceEditGuaranteeSelectKeyboard(
  options: AdminServiceGuaranteeOption[],
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = options.map((item, index) => [
    Markup.button.callback(
      `${getNumberBadge(index)} Гарантія №${item.guaranteeNo}`,
      makeAdminPanelServicesEditGuaranteePickAction(item.guaranteeNo),
    ),
  ]);

  return Markup.inlineKeyboard([
    ...rows,
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_CANCEL, ADMIN_PANEL_ACTION.SERVICES_EDIT_CANCEL)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_BACK, ADMIN_PANEL_ACTION.SERVICES_EDIT_BACK)],
  ]);
}

/**
 * @summary Текст вибору етапу для редагування.
 */
export function formatAdminServiceEditStepSelectText(
  serviceName: string,
  options: AdminServiceStepOption[],
): string {
  return (
    '🧩 Редагування етапу послуги\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Послуга: ${serviceName}\n\n` +
    'Оберіть етап, назву якого потрібно змінити:\n\n' +
    options
      .map((item, index) => `${getNumberBadge(index)} Етап №${item.stepNo} — ${compactText(item.title, 54)}`)
      .join('\n')
  );
}

/**
 * @summary Клавіатура вибору етапу послуги.
 */
export function createAdminServiceEditStepSelectKeyboard(
  options: AdminServiceStepOption[],
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = options.map((item, index) => [
    Markup.button.callback(
      `${getNumberBadge(index)} Етап №${item.stepNo}`,
      makeAdminPanelServicesEditStepPickAction(item.stepNo),
    ),
  ]);

  return Markup.inlineKeyboard([
    ...rows,
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_CANCEL, ADMIN_PANEL_ACTION.SERVICES_EDIT_CANCEL)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_BACK, ADMIN_PANEL_ACTION.SERVICES_EDIT_BACK)],
  ]);
}

/**
 * @summary Текст кроку вводу нової назви етапу.
 */
export function formatAdminServiceEditStepInputText(
  serviceName: string,
  stepNo: number,
  currentStepTitle: string,
): string {
  return (
    '✏️ Оновлення назви етапу\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Послуга: ${serviceName}\n` +
    `🧩 Етап №${stepNo}\n\n` +
    `Поточна назва:\n${currentStepTitle}\n\n` +
    'Надішліть нову назву етапу одним повідомленням.\n' +
    'Мінімум 2 символи, максимум 120 символів.'
  );
}

/**
 * @summary Текст підтвердження оновлення назви етапу.
 */
export function formatAdminServiceEditStepConfirmText(
  serviceName: string,
  stepNo: number,
  nextStepTitle: string,
): string {
  return (
    '✅ Підтвердження оновлення\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Послуга: ${serviceName}\n` +
    `🧩 Етап №${stepNo}\n\n` +
    `Нова назва:\n${nextStepTitle}\n\n` +
    'Підтвердьте збереження змін.'
  );
}

/**
 * @summary Текст кроку вводу нового тексту гарантії.
 */
export function formatAdminServiceEditGuaranteeInputText(
  serviceName: string,
  guaranteeNo: number,
  currentGuaranteeText: string,
): string {
  return (
    '✏️ Оновлення гарантії\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Послуга: ${serviceName}\n` +
    `🛡 Гарантія №${guaranteeNo}\n\n` +
    `Поточний текст:\n${currentGuaranteeText}\n\n` +
    'Надішліть новий текст гарантії одним повідомленням.\n' +
    'Мінімум 3 символи, максимум 500 символів.'
  );
}

/**
 * @summary Текст підтвердження оновлення гарантії.
 */
export function formatAdminServiceEditGuaranteeConfirmText(
  serviceName: string,
  guaranteeNo: number,
  nextGuaranteeText: string,
): string {
  return (
    '✅ Підтвердження оновлення\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Послуга: ${serviceName}\n` +
    `🛡 Гарантія №${guaranteeNo}\n\n` +
    `Новий текст:\n${nextGuaranteeText}\n\n` +
    'Підтвердьте збереження змін.'
  );
}

/**
 * @summary Текст кроку вводу нової назви послуги.
 */
export function formatAdminServiceEditNameInputText(
  serviceName: string,
): string {
  return (
    '✏️ Оновлення назви послуги\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Поточна назва: ${serviceName}\n\n` +
    'Надішліть нову назву одним повідомленням.\n' +
    'Мінімум 2 символи, максимум 120 символів.'
  );
}

/**
 * @summary Текст кроку вводу нової тривалості послуги.
 */
export function formatAdminServiceEditDurationInputText(
  serviceName: string,
  currentDurationMinutes: number,
): string {
  return (
    '✏️ Оновлення тривалості послуги\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Послуга: ${serviceName}\n\n` +
    `⏱ Поточна тривалість: ${currentDurationMinutes} хв\n\n` +
    'Надішліть нову тривалість у хвилинах.\n' +
    'Діапазон: 5..720'
  );
}

/**
 * @summary Текст кроку вводу нової ціни послуги.
 */
export function formatAdminServiceEditPriceInputText(
  serviceName: string,
  currentBasePrice: string,
  currencyCode: string,
): string {
  return (
    '✏️ Оновлення ціни послуги\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Послуга: ${serviceName}\n\n` +
    `💰 Поточна ціна: ${formatPrice(currentBasePrice, currencyCode)}\n\n` +
    'Надішліть нову ціну одним повідомленням.\n' +
    'Формат: 750 або 750.50'
  );
}

/**
 * @summary Текст кроку вводу нового опису послуги.
 */
export function formatAdminServiceEditDescriptionInputText(
  serviceName: string,
  currentDescription: string | null,
): string {
  return (
    '✏️ Оновлення опису послуги\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Послуга: ${serviceName}\n\n` +
    `📝 Поточний опис:\n${formatOptionalText(currentDescription)}\n\n` +
    'Надішліть новий опис одним повідомленням.\n' +
    'Мінімум 10 символів, максимум 1600 символів.'
  );
}

/**
 * @summary Текст кроку вводу нового результату послуги.
 */
export function formatAdminServiceEditResultInputText(
  serviceName: string,
  currentResultDescription: string | null,
): string {
  return (
    '✏️ Оновлення результату послуги\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Послуга: ${serviceName}\n\n` +
    `🎯 Поточний результат:\n${formatOptionalText(currentResultDescription)}\n\n` +
    'Надішліть новий текст результату одним повідомленням.\n' +
    'Мінімум 10 символів, максимум 1200 символів.'
  );
}

/**
 * @summary Клавіатура кроку вводу нового результату.
 */
export function createAdminServiceEditInputKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_CANCEL, ADMIN_PANEL_ACTION.SERVICES_EDIT_CANCEL)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_BACK, ADMIN_PANEL_ACTION.SERVICES_EDIT_BACK)],
  ]);
}

/**
 * @summary Текст підтвердження оновлення результату послуги.
 */
export function formatAdminServiceEditResultConfirmText(serviceName: string, nextResultDescription: string): string {
  return (
    '✅ Підтвердження оновлення\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Послуга: ${serviceName}\n\n` +
    `🎯 Новий результат:\n${nextResultDescription}\n\n` +
    'Підтвердьте збереження змін.'
  );
}

/**
 * @summary Текст підтвердження оновлення опису послуги.
 */
export function formatAdminServiceEditDescriptionConfirmText(
  serviceName: string,
  nextDescription: string,
): string {
  return (
    '✅ Підтвердження оновлення\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Послуга: ${serviceName}\n\n` +
    `📝 Новий опис:\n${nextDescription}\n\n` +
    'Підтвердьте збереження змін.'
  );
}

/**
 * @summary Текст підтвердження оновлення тривалості послуги.
 */
export function formatAdminServiceEditDurationConfirmText(
  serviceName: string,
  nextDurationMinutes: number,
): string {
  return (
    '✅ Підтвердження оновлення\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Послуга: ${serviceName}\n\n` +
    `⏱ Нова тривалість: ${nextDurationMinutes} хв\n\n` +
    'Підтвердьте збереження змін.'
  );
}

/**
 * @summary Текст підтвердження оновлення ціни послуги.
 */
export function formatAdminServiceEditPriceConfirmText(
  serviceName: string,
  nextBasePrice: string,
  currencyCode: string,
): string {
  return (
    '✅ Підтвердження оновлення\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Послуга: ${serviceName}\n\n` +
    `💰 Нова ціна: ${formatPrice(nextBasePrice, currencyCode)}\n\n` +
    'Підтвердьте збереження змін.'
  );
}

/**
 * @summary Текст підтвердження оновлення назви послуги.
 */
export function formatAdminServiceEditNameConfirmText(
  serviceName: string,
  nextServiceName: string,
): string {
  return (
    '✅ Підтвердження оновлення\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Послуга: ${serviceName}\n\n` +
    `🪪 Нова назва: ${nextServiceName}\n\n` +
    'Підтвердьте збереження змін.'
  );
}

/**
 * @summary Клавіатура підтвердження оновлення результату послуги.
 */
export function createAdminServiceEditConfirmKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_CONFIRM, ADMIN_PANEL_ACTION.SERVICES_EDIT_CONFIRM)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_CANCEL, ADMIN_PANEL_ACTION.SERVICES_EDIT_CANCEL)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_BACK, ADMIN_PANEL_ACTION.SERVICES_EDIT_BACK)],
  ]);
}

/**
 * @summary Текст підтвердження видалення (деактивації) послуги.
 */
export function formatAdminServiceDeleteConfirmText(
  serviceName: string,
): string {
  return (
    '⚠️ Підтвердження видалення послуги\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `💼 Послуга: ${serviceName}\n\n` +
    'Після підтвердження послуга буде прихована для клієнтів та майстрів.\n' +
    'Записи в історії залишаться, але нові бронювання для цієї послуги стануть недоступні.\n\n' +
    'Підтвердьте дію.'
  );
}

/**
 * @summary Клавіатура підтвердження видалення (деактивації) послуги.
 */
export function createAdminServiceDeleteConfirmKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_CONFIRM_DELETE, ADMIN_PANEL_ACTION.SERVICES_EDIT_CONFIRM)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_CANCEL, ADMIN_PANEL_ACTION.SERVICES_EDIT_CANCEL)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.SERVICES_EDIT_BACK, ADMIN_PANEL_ACTION.SERVICES_EDIT_BACK)],
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
