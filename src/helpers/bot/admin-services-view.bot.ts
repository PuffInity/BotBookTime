import { Markup } from 'telegraf';
import {
  ADMIN_PANEL_ACTION,
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
import type { CreateAdminServiceResult } from '../../types/db-helpers/db-admin-services.types.js';
import { tBot, tBotTemplate } from './i18n.bot.js';
import type { BotUiLanguage } from './i18n.bot.js';

/**
 * @file admin-services-view.bot.ts
 * @summary UI/helper-и блоку "Послуги" у адмін-панелі.
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
  const normalized = price
    .replace(/[.,]00$/, '')
    .replace(/([.,]\d)0$/, '$1');
  return `${normalized} ${currencyCode}`;
}

/**
 * uk: Внутрішня bot helper функція formatServiceLine.
 * en: Internal bot helper function formatServiceLine.
 * cz: Interní bot helper funkce formatServiceLine.
 */
function formatServiceLine(
  service: ServicesCatalogItem,
  index: number,
  language: BotUiLanguage,
): string {
  return (
    `${getNumberBadge(index)} ${service.name}\n` +
    `🪪 ID: ${service.id} • ⏱ ${service.durationMinutes} ${tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_MINUTES_SHORT')} • 💰 ${formatPrice(service.basePrice, service.currencyCode)}`
  );
}

/**
 * uk: Внутрішня bot helper функція formatSteps.
 * en: Internal bot helper function formatSteps.
 * cz: Interní bot helper funkce formatSteps.
 */
function formatSteps(details: ServicesCatalogDetails, language: BotUiLanguage): string {
  if (details.steps.length === 0) {
    return tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_STEP_EMPTY');
  }

  return details.steps
    .map((step) => `• ${step.stepNo}. ${step.title} (≈${step.durationMinutes} ${tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_MINUTES_SHORT')})`)
    .join('\n');
}

/**
 * uk: Внутрішня bot helper функція formatGuarantees.
 * en: Internal bot helper function formatGuarantees.
 * cz: Interní bot helper funkce formatGuarantees.
 */
function formatGuarantees(details: ServicesCatalogDetails, language: BotUiLanguage): string {
  if (details.guarantees.length === 0) {
    return tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_GUARANTEE_EMPTY');
  }

  return details.guarantees
    .map((item) => {
      const validDays = item.validDays == null
        ? ''
        : ` (${item.validDays} ${tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_DAYS_SHORT')})`;
      return `• ${item.guaranteeText}${validDays}`;
    })
    .join('\n');
}

/**
 * @summary Форматує список послуг студії.
 */
export function formatAdminServicesCatalogText(
  services: ServicesCatalogItem[],
  language: BotUiLanguage = 'uk',
): string {
  if (services.length === 0) {
    return (
      `${tBot(language, 'ADMIN_PANEL_SERVICES_CATALOG_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      `${tBot(language, 'ADMIN_PANEL_SERVICES_CATALOG_EMPTY')}\n` +
      tBot(language, 'ADMIN_PANEL_SERVICES_CATALOG_EMPTY_HINT')
    );
  }

  return (
    `${tBot(language, 'ADMIN_PANEL_SERVICES_CATALOG_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'ADMIN_PANEL_SERVICES_CATALOG_PICK')}\n\n` +
    services.map((service, index) => formatServiceLine(service, index, language)).join('\n\n')
  );
}

/**
 * @summary Клавіатура списку послуг.
 */
export function createAdminServicesCatalogKeyboard(
  services: ServicesCatalogItem[],
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = services.map((service, index) => [
    Markup.button.callback(
      `${getNumberBadge(index)} ${service.name}`,
      makeAdminPanelServicesOpenAction(service.id),
    ),
  ]);

  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_CREATE'), ADMIN_PANEL_ACTION.SERVICES_CREATE_OPEN)],
    ...rows,
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_BACK'), ADMIN_PANEL_ACTION.SERVICES_BACK)],
    [Markup.button.callback(tBot(language, 'HOME'), ADMIN_PANEL_ACTION.HOME)],
  ]);
}

type AdminServiceCreateStepPreview = {
  title: string;
  durationMinutes: number;
  description: string;
};

type AdminServiceCreateGuaranteePreview = {
  guaranteeText: string;
  validDays: number | null;
};

type AdminServiceCreatePreview = {
  name: string;
  durationMinutes: number;
  basePrice: string;
  currencyCode: string;
  description: string;
  resultDescription: string;
  steps: AdminServiceCreateStepPreview[];
  guarantees: AdminServiceCreateGuaranteePreview[];
};

/**
 * @summary Текст запуску створення нової послуги.
 */
export function formatAdminServiceCreateStartText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'ADMIN_PANEL_SERVICES_CREATE_START_TEXT');
}

/**
 * @summary Текст кроку вводу назви нової послуги.
 */
export function formatAdminServiceCreateNameInputText(language: BotUiLanguage = 'uk'): string {
  return tBot(language, 'ADMIN_PANEL_SERVICES_CREATE_NAME_INPUT_TEXT');
}

/**
 * @summary Текст кроку вводу тривалості нової послуги.
 */
export function formatAdminServiceCreateDurationInputText(
  serviceName: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_CREATE_DURATION_INPUT_TEXT', { serviceName });
}

/**
 * @summary Текст кроку вводу ціни нової послуги.
 */
export function formatAdminServiceCreatePriceInputText(
  serviceName: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_CREATE_PRICE_INPUT_TEXT', { serviceName });
}

/**
 * @summary Текст кроку вводу опису нової послуги.
 */
export function formatAdminServiceCreateDescriptionInputText(
  serviceName: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_CREATE_DESCRIPTION_INPUT_TEXT', { serviceName });
}

/**
 * @summary Текст кроку вводу назви етапу.
 */
export function formatAdminServiceCreateStepTitleInputText(
  stepNo: number,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_CREATE_STEP_TITLE_INPUT_TEXT', { stepNo });
}

/**
 * @summary Текст кроку вводу тривалості етапу.
 */
export function formatAdminServiceCreateStepDurationInputText(
  stepNo: number,
  stepTitle: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_CREATE_STEP_DURATION_INPUT_TEXT', {
    stepNo,
    stepTitle,
  });
}

/**
 * @summary Текст кроку вводу опису етапу.
 */
export function formatAdminServiceCreateStepDescriptionInputText(
  stepNo: number,
  stepTitle: string,
  durationMinutes: number,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_CREATE_STEP_DESCRIPTION_INPUT_TEXT', {
    stepNo,
    stepTitle,
    durationMinutes,
    minutesLabel: tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_MINUTES_SHORT'),
  });
}

/**
 * @summary Текст після успішного додавання етапу.
 */
export function formatAdminServiceCreateStepAddedText(
  stepNo: number,
  stepTitle: string,
  durationMinutes: number,
  totalSteps: number,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_CREATE_STEP_ADDED_TEXT', {
    stepNo,
    stepTitle,
    durationMinutes,
    totalSteps,
    minutesLabel: tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_MINUTES_SHORT'),
  });
}

/**
 * @summary Клавіатура дій після додавання етапу.
 */
export function createAdminServiceCreateStepActionsKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_CREATE_ADD_ANOTHER'), ADMIN_PANEL_ACTION.SERVICES_CREATE_STEP_ADD_ANOTHER)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_CREATE_CONTINUE'), ADMIN_PANEL_ACTION.SERVICES_CREATE_STEP_CONTINUE)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_CREATE_CANCEL'), ADMIN_PANEL_ACTION.SERVICES_CREATE_CANCEL)],
  ]);
}

/**
 * @summary Текст кроку вводу гарантії.
 */
export function formatAdminServiceCreateGuaranteeInputText(
  guaranteeNo: number,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_CREATE_GUARANTEE_INPUT_TEXT', {
    guaranteeNo,
  });
}

/**
 * @summary Текст після успішного додавання гарантії.
 */
export function formatAdminServiceCreateGuaranteeAddedText(
  guaranteeNo: number,
  guaranteeText: string,
  totalGuarantees: number,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_CREATE_GUARANTEE_ADDED_TEXT', {
    guaranteeNo,
    guaranteeText,
    totalGuarantees,
  });
}

/**
 * @summary Клавіатура дій після додавання гарантії.
 */
export function createAdminServiceCreateGuaranteeActionsKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_CREATE_ADD_ANOTHER'), ADMIN_PANEL_ACTION.SERVICES_CREATE_GUARANTEE_ADD_ANOTHER)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_CREATE_CONTINUE'), ADMIN_PANEL_ACTION.SERVICES_CREATE_GUARANTEE_CONTINUE)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_CREATE_CANCEL'), ADMIN_PANEL_ACTION.SERVICES_CREATE_CANCEL)],
  ]);
}

/**
 * @summary Текст кроку вводу результату послуги.
 */
export function formatAdminServiceCreateResultInputText(
  serviceName: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_CREATE_RESULT_INPUT_TEXT', { serviceName });
}

/**
 * @summary Текст попереднього перегляду перед створенням.
 */
export function formatAdminServiceCreatePreviewText(
  draft: AdminServiceCreatePreview,
  language: BotUiLanguage = 'uk',
): string {
  const stepsText = draft.steps
    .map((step, index) => `${getNumberBadge(index)} ${step.title} (${step.durationMinutes} ${tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_MINUTES_SHORT')})\n${step.description}`)
    .join('\n\n');

  const guaranteesText = draft.guarantees
    .map((item) => {
      const suffix = item.validDays == null ? '' : ` (${item.validDays} ${tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_DAYS_SHORT')})`;
      return `• ${item.guaranteeText}${suffix}`;
    })
    .join('\n');

  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_CREATE_PREVIEW_BODY_TEXT', {
    title: tBot(language, 'ADMIN_PANEL_SERVICES_CREATE_PREVIEW_TITLE'),
    name: draft.name,
    durationMinutes: draft.durationMinutes,
    minutesLabel: tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_MINUTES_SHORT'),
    price: formatPrice(draft.basePrice, draft.currencyCode),
    description: draft.description,
    stepsText,
    guaranteesText,
    resultDescription: draft.resultDescription,
    confirmText: tBot(language, 'ADMIN_PANEL_SERVICES_CREATE_PREVIEW_CONFIRM'),
  });
}

/**
 * @summary Клавіатура підтвердження створення послуги.
 */
export function createAdminServiceCreatePreviewKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_CREATE_CONFIRM'), ADMIN_PANEL_ACTION.SERVICES_CREATE_CONFIRM)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_CREATE_CANCEL'), ADMIN_PANEL_ACTION.SERVICES_CREATE_CANCEL)],
  ]);
}

/**
 * @summary Клавіатура для інпут-кроків створення послуги.
 */
export function createAdminServiceCreateInputKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_CREATE_CANCEL'), ADMIN_PANEL_ACTION.SERVICES_CREATE_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_BACK_TO_LIST'), ADMIN_PANEL_ACTION.SERVICES_BACK_TO_LIST)],
  ]);
}

/**
 * @summary Текст успішного створення нової послуги.
 */
export function formatAdminServiceCreateSuccessText(
  result: CreateAdminServiceResult,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_CREATE_SUCCESS_BODY_TEXT', {
    title: tBot(language, 'ADMIN_PANEL_SERVICES_CREATE_SUCCESS_TITLE'),
    name: result.name,
    serviceId: result.serviceId,
    durationMinutes: result.durationMinutes,
    minutesLabel: tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_MINUTES_SHORT'),
    price: formatPrice(result.basePrice, result.currencyCode),
    stepsCount: result.stepsCount,
    guaranteesCount: result.guaranteesCount,
  });
}

/**
 * @summary Форматує детальну картку послуги.
 */
export function formatAdminServiceDetailsText(
  details: ServicesCatalogDetails,
  language: BotUiLanguage = 'uk',
): string {
  const { service } = details;
  const description = service.description?.trim() ? service.description.trim() : tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_NOT_SPECIFIED');
  const result = service.resultDescription?.trim() ? service.resultDescription.trim() : tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_NOT_SPECIFIED');

  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_DETAILS_BODY_TEXT', {
    title: tBot(language, 'ADMIN_PANEL_SERVICES_DETAILS_TITLE'),
    name: service.name,
    serviceId: service.id,
    durationMinutes: service.durationMinutes,
    minutesLabel: tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_MINUTES_SHORT'),
    price: formatPrice(service.basePrice, service.currencyCode),
    status: service.isActive
      ? tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_ACTIVE')
      : tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_INACTIVE'),
    description,
    result,
    stepsText: formatSteps(details, language),
    guaranteesText: formatGuarantees(details, language),
  });
}

/**
 * @summary Клавіатура картки послуги.
 */
export function createAdminServiceDetailsKeyboard(
  serviceId: string,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_OPEN'),
        makeAdminPanelServicesEditOpenAction(serviceId),
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_SERVICES_BTN_OPEN_STATS'),
        makeAdminPanelServicesOpenStatsAction(serviceId),
      ),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_BACK_TO_LIST'), ADMIN_PANEL_ACTION.SERVICES_BACK_TO_LIST)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_BACK'), ADMIN_PANEL_ACTION.SERVICES_BACK)],
  ]);
}

/**
 * uk: Внутрішня bot helper функція formatOptionalText.
 * en: Internal bot helper function formatOptionalText.
 * cz: Interní bot helper funkce formatOptionalText.
 */
function formatOptionalText(value: string | null, language: BotUiLanguage): string {
  const normalized = value?.trim();
  return normalized ? normalized : tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_NOT_SPECIFIED');
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
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_MENU_BODY_TEXT', {
    title: tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_MENU_TITLE'),
    serviceName,
    durationMinutes,
    minutesLabel: tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_MINUTES_SHORT'),
    price: formatPrice(basePrice, currencyCode),
    description: formatOptionalText(description, language),
    resultDescription: formatOptionalText(resultDescription, language),
    pickText: tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_MENU_PICK'),
  });
}

/**
 * @summary Клавіатура меню редагування послуги.
 */
export function createAdminServiceEditMenuKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_NAME'), ADMIN_PANEL_ACTION.SERVICES_EDIT_NAME_OPEN)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_DURATION'), ADMIN_PANEL_ACTION.SERVICES_EDIT_DURATION_OPEN)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_PRICE'), ADMIN_PANEL_ACTION.SERVICES_EDIT_PRICE_OPEN)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_DESCRIPTION'), ADMIN_PANEL_ACTION.SERVICES_EDIT_DESCRIPTION_OPEN)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_RESULT'), ADMIN_PANEL_ACTION.SERVICES_EDIT_RESULT_OPEN)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_STEP'), ADMIN_PANEL_ACTION.SERVICES_EDIT_STEP_OPEN)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_STEP_DESCRIPTION'), ADMIN_PANEL_ACTION.SERVICES_EDIT_STEP_DESCRIPTION_OPEN)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_STEP_DURATION'), ADMIN_PANEL_ACTION.SERVICES_EDIT_STEP_DURATION_OPEN)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_GUARANTEE'), ADMIN_PANEL_ACTION.SERVICES_EDIT_GUARANTEE_OPEN)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_DELETE'), ADMIN_PANEL_ACTION.SERVICES_EDIT_DELETE_OPEN)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_BACK'), ADMIN_PANEL_ACTION.SERVICES_EDIT_BACK)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_BACK_TO_LIST'), ADMIN_PANEL_ACTION.SERVICES_BACK_TO_LIST)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_BACK'), ADMIN_PANEL_ACTION.SERVICES_BACK)],
  ]);
}

type AdminServiceGuaranteeOption = {
  guaranteeNo: number;
  guaranteeText: string;
};

type AdminServiceStepOption = {
  stepNo: number;
  durationMinutes: number;
  title: string;
};

/**
 * uk: Внутрішня bot helper функція compactText.
 * en: Internal bot helper function compactText.
 * cz: Interní bot helper funkce compactText.
 */
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
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_GUARANTEE_SELECT_TEXT', {
    serviceName,
    list: options
      .map((item, index) => `${getNumberBadge(index)} №${item.guaranteeNo} — ${compactText(item.guaranteeText, 54)}`)
      .join('\n'),
  });
}

/**
 * @summary Клавіатура вибору гарантії послуги.
 */
export function createAdminServiceEditGuaranteeSelectKeyboard(
  options: AdminServiceGuaranteeOption[],
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = options.map((item, index) => [
    Markup.button.callback(
      tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_GUARANTEE_BUTTON_LABEL', {
        badge: getNumberBadge(index),
        guaranteeNo: item.guaranteeNo,
      }),
      makeAdminPanelServicesEditGuaranteePickAction(item.guaranteeNo),
    ),
  ]);

  return Markup.inlineKeyboard([
    ...rows,
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_CANCEL'), ADMIN_PANEL_ACTION.SERVICES_EDIT_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_BACK'), ADMIN_PANEL_ACTION.SERVICES_EDIT_BACK)],
  ]);
}

/**
 * @summary Текст вибору етапу для редагування.
 */
export function formatAdminServiceEditStepSelectText(
  serviceName: string,
  options: AdminServiceStepOption[],
  mode: 'title' | 'description' | 'duration' = 'title',
  language: BotUiLanguage = 'uk',
): string {
  const modeText =
    mode === 'description'
      ? tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_STEP_SELECT_PICK_DESCRIPTION')
      : mode === 'duration'
      ? tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_STEP_SELECT_PICK_DURATION')
      : tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_STEP_SELECT_PICK_TITLE');

  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_STEP_SELECT_TEXT', {
    serviceName,
    modeText,
    list: options
      .map((item, index) =>
        tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_STEP_SELECT_ROW_TEXT', {
          badge: getNumberBadge(index),
          stepNo: item.stepNo,
          durationMinutes: item.durationMinutes,
          minutesLabel: tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_MINUTES_SHORT'),
          title: compactText(item.title, 54),
        }),
      )
      .join('\n'),
  });
}

/**
 * @summary Клавіатура вибору етапу послуги.
 */
export function createAdminServiceEditStepSelectKeyboard(
  options: AdminServiceStepOption[],
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = options.map((item, index) => [
    Markup.button.callback(
      tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_STEP_BUTTON_LABEL', {
        badge: getNumberBadge(index),
        stepNo: item.stepNo,
      }),
      makeAdminPanelServicesEditStepPickAction(item.stepNo),
    ),
  ]);

  return Markup.inlineKeyboard([
    ...rows,
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_CANCEL'), ADMIN_PANEL_ACTION.SERVICES_EDIT_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_BACK'), ADMIN_PANEL_ACTION.SERVICES_EDIT_BACK)],
  ]);
}

/**
 * @summary Текст кроку вводу нової назви етапу.
 */
export function formatAdminServiceEditStepInputText(
  serviceName: string,
  stepNo: number,
  currentStepTitle: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_STEP_INPUT_TEXT', {
    serviceName,
    stepNo,
    currentStepTitle,
  });
}

/**
 * @summary Текст підтвердження оновлення назви етапу.
 */
export function formatAdminServiceEditStepConfirmText(
  serviceName: string,
  stepNo: number,
  nextStepTitle: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_STEP_CONFIRM_TEXT', {
    confirmTitle: tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_CONFIRM_TITLE'),
    serviceName,
    stepNo,
    nextStepTitle,
    confirmText: tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_CONFIRM_SAVE'),
  });
}

/**
 * @summary Текст кроку вводу нового опису етапу.
 */
export function formatAdminServiceEditStepDescriptionInputText(
  serviceName: string,
  stepNo: number,
  currentStepDescription: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_STEP_DESCRIPTION_INPUT_TEXT', {
    serviceName,
    stepNo,
    currentStepDescription,
  });
}

/**
 * @summary Текст підтвердження оновлення опису етапу.
 */
export function formatAdminServiceEditStepDescriptionConfirmText(
  serviceName: string,
  stepNo: number,
  nextStepDescription: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_STEP_DESCRIPTION_CONFIRM_TEXT', {
    confirmTitle: tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_CONFIRM_TITLE'),
    serviceName,
    stepNo,
    nextStepDescription,
    confirmText: tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_CONFIRM_SAVE'),
  });
}

/**
 * @summary Текст кроку вводу нового часу етапу.
 */
export function formatAdminServiceEditStepDurationInputText(
  serviceName: string,
  stepNo: number,
  currentStepDurationMinutes: number,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_STEP_DURATION_INPUT_TEXT', {
    serviceName,
    stepNo,
    currentStepDurationMinutes,
    minutesLabel: tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_MINUTES_SHORT'),
  });
}

/**
 * @summary Текст підтвердження оновлення часу етапу.
 */
export function formatAdminServiceEditStepDurationConfirmText(
  serviceName: string,
  stepNo: number,
  nextStepDurationMinutes: number,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_STEP_DURATION_CONFIRM_TEXT', {
    confirmTitle: tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_CONFIRM_TITLE'),
    serviceName,
    stepNo,
    nextStepDurationMinutes,
    minutesLabel: tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_MINUTES_SHORT'),
    confirmText: tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_CONFIRM_SAVE'),
  });
}

/**
 * @summary Текст кроку вводу нового тексту гарантії.
 */
export function formatAdminServiceEditGuaranteeInputText(
  serviceName: string,
  guaranteeNo: number,
  currentGuaranteeText: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_GUARANTEE_INPUT_TEXT', {
    serviceName,
    guaranteeNo,
    currentGuaranteeText,
  });
}

/**
 * @summary Текст підтвердження оновлення гарантії.
 */
export function formatAdminServiceEditGuaranteeConfirmText(
  serviceName: string,
  guaranteeNo: number,
  nextGuaranteeText: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_GUARANTEE_CONFIRM_TEXT', {
    confirmTitle: tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_CONFIRM_TITLE'),
    serviceName,
    guaranteeNo,
    nextGuaranteeText,
    confirmText: tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_CONFIRM_SAVE'),
  });
}

/**
 * @summary Текст кроку вводу нової назви послуги.
 */
export function formatAdminServiceEditNameInputText(
  serviceName: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_NAME_INPUT_TEXT', {
    serviceName,
  });
}

/**
 * @summary Текст кроку вводу нової тривалості послуги.
 */
export function formatAdminServiceEditDurationInputText(
  serviceName: string,
  currentDurationMinutes: number,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_DURATION_INPUT_TEXT', {
    serviceName,
    currentDurationMinutes,
    minutesLabel: tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_MINUTES_SHORT'),
  });
}

/**
 * @summary Текст кроку вводу нової ціни послуги.
 */
export function formatAdminServiceEditPriceInputText(
  serviceName: string,
  currentBasePrice: string,
  currencyCode: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_PRICE_INPUT_TEXT', {
    serviceName,
    currentPrice: formatPrice(currentBasePrice, currencyCode),
  });
}

/**
 * @summary Текст кроку вводу нового опису послуги.
 */
export function formatAdminServiceEditDescriptionInputText(
  serviceName: string,
  currentDescription: string | null,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_DESCRIPTION_INPUT_TEXT', {
    serviceName,
    currentDescription: formatOptionalText(currentDescription, language),
  });
}

/**
 * @summary Текст кроку вводу нового результату послуги.
 */
export function formatAdminServiceEditResultInputText(
  serviceName: string,
  currentResultDescription: string | null,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_RESULT_INPUT_TEXT', {
    serviceName,
    currentResultDescription: formatOptionalText(currentResultDescription, language),
  });
}

/**
 * @summary Клавіатура кроку вводу нового результату.
 */
export function createAdminServiceEditInputKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_CANCEL'), ADMIN_PANEL_ACTION.SERVICES_EDIT_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_BACK'), ADMIN_PANEL_ACTION.SERVICES_EDIT_BACK)],
  ]);
}

/**
 * @summary Текст підтвердження оновлення результату послуги.
 */
export function formatAdminServiceEditResultConfirmText(
  serviceName: string,
  nextResultDescription: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_RESULT_CONFIRM_TEXT', {
    confirmTitle: tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_CONFIRM_TITLE'),
    serviceName,
    nextResultDescription,
    confirmText: tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_CONFIRM_SAVE'),
  });
}

/**
 * @summary Текст підтвердження оновлення опису послуги.
 */
export function formatAdminServiceEditDescriptionConfirmText(
  serviceName: string,
  nextDescription: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_DESCRIPTION_CONFIRM_TEXT', {
    confirmTitle: tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_CONFIRM_TITLE'),
    serviceName,
    nextDescription,
    confirmText: tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_CONFIRM_SAVE'),
  });
}

/**
 * @summary Текст підтвердження оновлення тривалості послуги.
 */
export function formatAdminServiceEditDurationConfirmText(
  serviceName: string,
  nextDurationMinutes: number,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_DURATION_CONFIRM_TEXT', {
    confirmTitle: tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_CONFIRM_TITLE'),
    serviceName,
    nextDurationMinutes,
    minutesLabel: tBot(language, 'ADMIN_PANEL_SERVICES_LABEL_MINUTES_SHORT'),
    confirmText: tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_CONFIRM_SAVE'),
  });
}

/**
 * @summary Текст підтвердження оновлення ціни послуги.
 */
export function formatAdminServiceEditPriceConfirmText(
  serviceName: string,
  nextBasePrice: string,
  currencyCode: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_PRICE_CONFIRM_TEXT', {
    confirmTitle: tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_CONFIRM_TITLE'),
    serviceName,
    nextPrice: formatPrice(nextBasePrice, currencyCode),
    confirmText: tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_CONFIRM_SAVE'),
  });
}

/**
 * @summary Текст підтвердження оновлення назви послуги.
 */
export function formatAdminServiceEditNameConfirmText(
  serviceName: string,
  nextServiceName: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_EDIT_NAME_CONFIRM_TEXT', {
    confirmTitle: tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_CONFIRM_TITLE'),
    serviceName,
    nextServiceName,
    confirmText: tBot(language, 'ADMIN_PANEL_SERVICES_EDIT_CONFIRM_SAVE'),
  });
}

/**
 * @summary Клавіатура підтвердження оновлення результату послуги.
 */
export function createAdminServiceEditConfirmKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_CONFIRM'), ADMIN_PANEL_ACTION.SERVICES_EDIT_CONFIRM)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_CANCEL'), ADMIN_PANEL_ACTION.SERVICES_EDIT_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_BACK'), ADMIN_PANEL_ACTION.SERVICES_EDIT_BACK)],
  ]);
}

/**
 * @summary Текст підтвердження видалення (деактивації) послуги.
 */
export function formatAdminServiceDeleteConfirmText(
  serviceName: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_DELETE_CONFIRM_TEXT', {
    deleteTitle: tBot(language, 'ADMIN_PANEL_SERVICES_DELETE_CONFIRM_TITLE'),
    serviceName,
    deleteBody: tBot(language, 'ADMIN_PANEL_SERVICES_DELETE_CONFIRM_BODY'),
  });
}

/**
 * @summary Клавіатура підтвердження видалення (деактивації) послуги.
 */
export function createAdminServiceDeleteConfirmKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_CONFIRM_DELETE'), ADMIN_PANEL_ACTION.SERVICES_EDIT_CONFIRM)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_CANCEL'), ADMIN_PANEL_ACTION.SERVICES_EDIT_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_SERVICES_BTN_EDIT_BACK'), ADMIN_PANEL_ACTION.SERVICES_EDIT_BACK)],
  ]);
}

/**
 * @summary Stub-текст підрозділу статистики конкретної послуги.
 */
export function formatAdminServiceStatsStubText(
  serviceName: string,
  language: BotUiLanguage = 'uk',
): string {
  return tBotTemplate(language, 'ADMIN_PANEL_SERVICES_STATS_STUB_TEXT', {
    serviceName,
  });
}
