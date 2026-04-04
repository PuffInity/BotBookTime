import { Markup } from 'telegraf';
import type {
  MasterOwnProfileCertificateManageItem,
  MasterOwnProfileData,
  MasterOwnProfileServiceManageItem,
} from '../../types/db-helpers/db-master-profile.types.js';
import {
  MASTER_PANEL_ACTION,
  makeMasterPanelProfileCertificateDeleteConfirmAction,
  makeMasterPanelProfileCertificateDeleteRequestAction,
  makeMasterPanelProfileServiceAddAction,
  makeMasterPanelProfileServiceRemoveAction,
} from '../../types/bot-master-panel.types.js';
import { tBot, tBotTemplate, type BotUiLanguage } from './i18n.bot.js';

/**
 * @file master-own-profile-view.bot.ts
 * @summary UI/helper-и блоку "Мій профіль майстра" у master panel.
 */

function localeByLanguage(language: BotUiLanguage): string {
  if (language === 'en') return 'en-US';
  if (language === 'cs') return 'cs-CZ';
  return 'uk-UA';
}

function formatDate(value: Date | string | null, language: BotUiLanguage): string {
  if (!value) return tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_INPUT_NOT_SET');

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_INPUT_NOT_SET');
  }

  return parsed.toLocaleDateString(localeByLanguage(language));
}

function telegramLabel(username: string | null, language: BotUiLanguage): string {
  if (!username) return tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_INPUT_NOT_SET');
  return username.startsWith('@') ? username : `@${username}`;
}

function statusLabel(isBookable: boolean, language: BotUiLanguage): string {
  return isBookable
    ? tBot(language, 'MASTER_PANEL_PROFILE_STATUS_AVAILABLE_SHORT')
    : tBot(language, 'MASTER_PANEL_PROFILE_STATUS_UNAVAILABLE_SHORT');
}

function serviceStatusLabel(isActive: boolean, language: BotUiLanguage): string {
  return isActive
    ? tBot(language, 'MASTER_PANEL_OWN_PROFILE_SERVICE_STATUS_ACTIVE')
    : tBot(language, 'MASTER_PANEL_OWN_PROFILE_SERVICE_STATUS_INACTIVE');
}

function serviceMetaLabel(
  service: MasterOwnProfileServiceManageItem,
  language: BotUiLanguage,
): string {
  return tBotTemplate(language, 'MASTER_PANEL_OWN_PROFILE_SERVICE_META', {
    duration: service.durationMinutes,
    minutes: tBot(language, 'MASTER_PANEL_OWN_PROFILE_MINUTES_SHORT'),
    price: service.priceAmount,
    currency: service.currencyCode,
  });
}

export type MasterOwnProfileEditableField =
  | 'bio'
  | 'materials'
  | 'phone'
  | 'email'
  | 'display_name'
  | 'started_on'
  | 'procedures_done_total';

function editableFieldLabel(field: MasterOwnProfileEditableField, language: BotUiLanguage): string {
  switch (field) {
    case 'bio':
      return tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_BIO');
    case 'materials':
      return tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_MATERIALS');
    case 'phone':
      return tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_PHONE');
    case 'email':
      return tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_EMAIL');
    case 'display_name':
      return tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_DISPLAY_NAME');
    case 'started_on':
      return tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_STARTED_ON');
    case 'procedures_done_total':
      return tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_PROCEDURES_DONE_TOTAL');
    default:
      return tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_DEFAULT');
  }
}

/**
 * @summary Головний екран профілю майстра.
 */
export function formatMasterOwnProfileMainText(
  profile: MasterOwnProfileData,
  language: BotUiLanguage,
): string {
  const fullName = `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ''}`.trim();

  return (
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_MAIN_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_LABEL_DISPLAY_NAME')}: ${profile.displayName}\n` +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_LABEL_FULL_NAME')}: ${fullName}\n` +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_LABEL_TELEGRAM')}: ${telegramLabel(profile.telegramUsername, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_LABEL_STATUS')}: ${statusLabel(profile.isBookable, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_LABEL_STUDIO_ID')}: ${profile.studioId}\n` +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_LABEL_MASTER_ID')}: ${profile.userId}\n\n` +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_MAIN_HINT')}`
  );
}

/**
 * @summary Екран "Керування послугами" (навігаційний блок).
 */
export function formatMasterOwnProfileServicesText(
  services: MasterOwnProfileServiceManageItem[],
  language: BotUiLanguage,
): string {
  const servicesText =
    services.length > 0
      ? services
          .map((service, index) => {
            const status = serviceStatusLabel(service.isActive, language);
            return (
              `${index + 1}️⃣ ${service.serviceName}\n` +
              `   • ${serviceMetaLabel(service, language)}\n` +
              `   • ${status}`
            );
          })
          .join('\n\n')
      : tBot(language, 'MASTER_PANEL_OWN_PROFILE_SERVICES_EMPTY');

  return (
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_SERVICES_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_SERVICES_HINT')}\n\n` +
    `${servicesText}`
  );
}

/**
 * @summary Текст вибору послуги для додавання у профіль майстра.
 */
export function formatMasterOwnProfileServicesAddText(
  services: MasterOwnProfileServiceManageItem[],
  language: BotUiLanguage,
): string {
  const servicesText =
    services.length > 0
      ? services
          .map(
            (service, index) =>
              `${index + 1}️⃣ ${service.serviceName}\n` +
              `   • ${serviceMetaLabel(service, language)}`,
          )
          .join('\n\n')
      : tBot(language, 'MASTER_PANEL_OWN_PROFILE_SERVICES_ADD_EMPTY');

  return (
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_SERVICES_ADD_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_SERVICES_ADD_HINT')}\n\n` +
    `${servicesText}`
  );
}

/**
 * @summary Текст вибору послуги для вимкнення в профілі майстра.
 */
export function formatMasterOwnProfileServicesRemoveText(
  services: MasterOwnProfileServiceManageItem[],
  language: BotUiLanguage,
): string {
  const servicesText =
    services.length > 0
      ? services
          .map(
            (service, index) =>
              `${index + 1}️⃣ ${service.serviceName}\n` +
              `   • ${serviceMetaLabel(service, language)}`,
          )
          .join('\n\n')
      : tBot(language, 'MASTER_PANEL_OWN_PROFILE_SERVICES_REMOVE_EMPTY');

  return (
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_SERVICES_REMOVE_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_SERVICES_REMOVE_HINT')}\n\n` +
    `${servicesText}`
  );
}

/**
 * @summary Екран "Професійна інформація" (навігаційний блок).
 */
export function formatMasterOwnProfileProfessionalText(
  profile: MasterOwnProfileData,
  language: BotUiLanguage,
): string {
  const certificatesText =
    profile.certificates.length > 0
      ? profile.certificates
          .slice(0, 5)
          .map((certificate, index) => {
            const issuer = certificate.issuer ? ` (${certificate.issuer})` : '';
            const issued = certificate.issuedOn
              ? ` • ${formatDate(certificate.issuedOn, language)}`
              : '';
            return `${index + 1}️⃣ ${certificate.title}${issuer}${issued}`;
          })
          .join('\n')
      : tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTIFICATES_EMPTY');

  return (
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_PROFESSIONAL_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_PROFESSIONAL_LABEL_STARTED_ON')}: ${formatDate(profile.startedOn, language)}\n` +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_PROFESSIONAL_LABEL_PROCEDURES_DONE')}: ${profile.proceduresDoneTotal}\n` +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_PROFESSIONAL_LABEL_EXPERIENCE')}: ${profile.experienceYears ?? tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_INPUT_NOT_SET')}\n\n` +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_PROFESSIONAL_LABEL_CERTIFICATES')}:\n` +
    `${certificatesText}`
  );
}

/**
 * @summary Екран "Додаткова інформація" (навігаційний блок).
 */
export function formatMasterOwnProfileAdditionalText(
  profile: MasterOwnProfileData,
  language: BotUiLanguage,
): string {
  return (
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_ADDITIONAL_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_ADDITIONAL_LABEL_MATERIALS')}: ${profile.materialsInfo ?? tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_INPUT_NOT_SET')}\n\n` +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_ADDITIONAL_LABEL_PHONE')}: ${profile.contactPhoneE164 ?? tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_INPUT_NOT_SET')}\n` +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_ADDITIONAL_LABEL_EMAIL')}: ${profile.contactEmail ?? tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_INPUT_NOT_SET')}\n\n` +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_ADDITIONAL_LABEL_CREATED_AT')}: ${formatDate(profile.masterCreatedAt, language)}\n\n` +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_ADDITIONAL_LABEL_BIO')}:\n${profile.bio ?? tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_INPUT_NOT_SET')}\n\n` +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_ADDITIONAL_HINT')}`
  );
}

/**
 * @summary Клавіатура головного екрану профілю майстра.
 */
export function createMasterOwnProfileMainKeyboard(
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_BTN_SERVICES'), MASTER_PANEL_ACTION.OPEN_PROFILE_SERVICES)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_BTN_PROFESSIONAL'), MASTER_PANEL_ACTION.OPEN_PROFILE_PROFESSIONAL)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_BTN_ADDITIONAL'), MASTER_PANEL_ACTION.OPEN_PROFILE_ADDITIONAL)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_PANEL'), MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Клавіатура підрозділу профілю майстра.
 */
export function createMasterOwnProfileSectionKeyboard(
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_BTN_BACK_TO_PROFILE'), MASTER_PANEL_ACTION.OPEN_PROFILE)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_PANEL'), MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Клавіатура екрана "Керування послугами" з діями увімкнення/вимкнення.
 */
export function createMasterOwnProfileServicesKeyboard(
  _services: MasterOwnProfileServiceManageItem[],
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_SERVICES_ADD_TITLE'), MASTER_PANEL_ACTION.PROFILE_SERVICE_ADD_OPEN)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_SERVICES_REMOVE_TITLE'), MASTER_PANEL_ACTION.PROFILE_SERVICE_REMOVE_OPEN)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_BTN_BACK_TO_PROFILE'), MASTER_PANEL_ACTION.OPEN_PROFILE)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_PANEL'), MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Клавіатура вибору послуги для додавання.
 */
export function createMasterOwnProfileServicesAddKeyboard(
  services: MasterOwnProfileServiceManageItem[],
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = services.map((service) => [
    Markup.button.callback(
      `➕ ${service.serviceName}`,
      makeMasterPanelProfileServiceAddAction(service.serviceId),
    ),
  ]);

  return Markup.inlineKeyboard([
    ...rows,
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_BTN_BACK_TO_SERVICES'), MASTER_PANEL_ACTION.OPEN_PROFILE_SERVICES)],
  ]);
}

/**
 * @summary Клавіатура вибору послуги для вимкнення.
 */
export function createMasterOwnProfileServicesRemoveKeyboard(
  services: MasterOwnProfileServiceManageItem[],
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = services.map((service) => [
    Markup.button.callback(
      `🗑 ${service.serviceName}`,
      makeMasterPanelProfileServiceRemoveAction(service.serviceId),
    ),
  ]);

  return Markup.inlineKeyboard([
    ...rows,
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_BTN_BACK_TO_SERVICES'), MASTER_PANEL_ACTION.OPEN_PROFILE_SERVICES)],
  ]);
}

/**
 * @summary Клавіатура екрана "Професійна інформація" з діями редагування.
 */
export function createMasterOwnProfileProfessionalKeyboard(
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_BTN_EDIT_DISPLAY_NAME'), MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_DISPLAY_NAME)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_BTN_EDIT_STARTED_ON'), MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_STARTED_ON)],
    [
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_OWN_PROFILE_BTN_EDIT_PROCEDURES_DONE_TOTAL'),
        MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_PROCEDURES_DONE_TOTAL,
      ),
    ],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_TITLE'), MASTER_PANEL_ACTION.OPEN_PROFILE_CERTIFICATES)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_BTN_BACK_TO_PROFILE'), MASTER_PANEL_ACTION.OPEN_PROFILE)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_PANEL'), MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Екран керування дипломами/сертифікатами майстра.
 */
export function formatMasterOwnProfileCertificatesText(
  certificates: MasterOwnProfileCertificateManageItem[],
  language: BotUiLanguage,
): string {
  const certificatesText =
    certificates.length > 0
      ? certificates
          .map((certificate, index) => {
            const issuer = certificate.issuer ? ` (${certificate.issuer})` : '';
            const issued = certificate.issuedOn ? ` • ${formatDate(certificate.issuedOn, language)}` : '';
            return `${index + 1}️⃣ ${certificate.title}${issuer}${issued}`;
          })
          .join('\n')
      : tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_EMPTY');

  return (
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${certificatesText}`
  );
}

/**
 * @summary Клавіатура екрана керування документами майстра.
 */
export function createMasterOwnProfileCertificatesKeyboard(
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_BTN_ADD'), MASTER_PANEL_ACTION.PROFILE_CERTIFICATE_ADD_OPEN)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_BTN_DELETE'), MASTER_PANEL_ACTION.PROFILE_CERTIFICATE_DELETE_OPEN)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_BTN_BACK'), MASTER_PANEL_ACTION.OPEN_PROFILE_PROFESSIONAL)],
  ]);
}

/**
 * @summary Текст кроку введення назви документа.
 */
export function formatMasterOwnProfileCertificateInputText(language: BotUiLanguage): string {
  return (
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_ADD_INPUT_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_ADD_INPUT_HINT')}`
  );
}

/**
 * @summary Клавіатура кроку введення назви документа.
 */
export function createMasterOwnProfileCertificateInputKeyboard(
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_BTN_CANCEL_ACTION'), MASTER_PANEL_ACTION.PROFILE_CERTIFICATE_ADD_CANCEL)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_BTN_BACK_TO_CERTS'), MASTER_PANEL_ACTION.OPEN_PROFILE_CERTIFICATES)],
  ]);
}

/**
 * @summary Текст підтвердження додавання документа.
 */
export function formatMasterOwnProfileCertificateConfirmText(
  title: string,
  language: BotUiLanguage,
): string {
  return (
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_ADD_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_LABEL_DOCUMENT')}: ${title}\n\n` +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_ADD_CONFIRM_HINT')}`
  );
}

/**
 * @summary Клавіатура підтвердження додавання документа.
 */
export function createMasterOwnProfileCertificateConfirmKeyboard(
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_BTN_CONFIRM_ADD'), MASTER_PANEL_ACTION.PROFILE_CERTIFICATE_ADD_CONFIRM)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_BTN_CANCEL_ACTION'), MASTER_PANEL_ACTION.PROFILE_CERTIFICATE_ADD_CANCEL)],
  ]);
}

/**
 * @summary Текст вибору документа для видалення.
 */
export function formatMasterOwnProfileCertificateDeleteListText(
  certificates: MasterOwnProfileCertificateManageItem[],
  language: BotUiLanguage,
): string {
  const items =
    certificates.length > 0
      ? certificates
          .map((certificate, index) => `${index + 1}️⃣ ${certificate.title}`)
          .join('\n')
      : tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_DELETE_LIST_EMPTY');

  return (
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_DELETE_LIST_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${items}`
  );
}

/**
 * @summary Клавіатура списку документів для видалення.
 */
export function createMasterOwnProfileCertificateDeleteListKeyboard(
  certificates: MasterOwnProfileCertificateManageItem[],
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = certificates.map((certificate) => [
    Markup.button.callback(
      `🗑 ${certificate.title}`,
      makeMasterPanelProfileCertificateDeleteRequestAction(certificate.certificateId),
    ),
  ]);

  return Markup.inlineKeyboard([
    ...rows,
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_BTN_BACK_TO_CERTS'), MASTER_PANEL_ACTION.OPEN_PROFILE_CERTIFICATES)],
  ]);
}

/**
 * @summary Текст підтвердження видалення документа.
 */
export function formatMasterOwnProfileCertificateDeleteConfirmText(
  title: string,
  language: BotUiLanguage,
): string {
  return (
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_DELETE_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_LABEL_DOCUMENT')}: ${title}\n\n` +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_DELETE_CONFIRM_HINT')}`
  );
}

/**
 * @summary Клавіатура підтвердження видалення документа.
 */
export function createMasterOwnProfileCertificateDeleteConfirmKeyboard(
  certificateId: string,
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_BTN_CONFIRM_DELETE'),
        makeMasterPanelProfileCertificateDeleteConfirmAction(certificateId),
      ),
    ],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_CERTS_BTN_CANCEL_ACTION'), MASTER_PANEL_ACTION.PROFILE_CERTIFICATE_DELETE_CANCEL)],
  ]);
}

/**
 * @summary Клавіатура екрана "Додаткова інформація" з діями редагування.
 */
export function createMasterOwnProfileAdditionalKeyboard(
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_BTN_EDIT_BIO'), MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_BIO)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_BTN_EDIT_MATERIALS'), MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_MATERIALS)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_BTN_EDIT_PHONE'), MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_PHONE)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_BTN_EDIT_EMAIL'), MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_EMAIL)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_BTN_BACK_TO_PROFILE'), MASTER_PANEL_ACTION.OPEN_PROFILE)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_BTN_BACK_TO_PANEL'), MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Підказка для введення нового значення поля профілю майстра.
 */
export function formatMasterOwnProfileEditInputText(
  field: MasterOwnProfileEditableField,
  currentValue: string | null,
  language: BotUiLanguage,
): string {
  const current = currentValue?.trim().length
    ? currentValue
    : tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_INPUT_NOT_SET');

  if (field === 'bio') {
    return (
      `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_BIO_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_CURRENT_VALUE')}:\n${current}\n\n` +
      `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_BIO_HINT')}`
    );
  }

  if (field === 'materials') {
    return (
      `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_MATERIALS_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_CURRENT_VALUE')}:\n${current}\n\n` +
      `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_MATERIALS_HINT')}`
    );
  }

  if (field === 'phone') {
    return (
      `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_PHONE_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_CURRENT_VALUE')}: ${current}\n\n` +
      `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_PHONE_HINT')}`
    );
  }

  if (field === 'display_name') {
    return (
      `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_DISPLAY_NAME_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_CURRENT_VALUE')}: ${current}\n\n` +
      `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_DISPLAY_NAME_HINT')}`
    );
  }

  if (field === 'started_on') {
    return (
      `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_STARTED_ON_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_CURRENT_VALUE')}: ${current}\n\n` +
      `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_STARTED_ON_HINT')}`
    );
  }

  if (field === 'procedures_done_total') {
    return (
      `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_PROCEDURES_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_CURRENT_VALUE')}: ${current}\n\n` +
      `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_PROCEDURES_HINT')}`
    );
  }

  return (
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_EMAIL_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_CURRENT_VALUE')}: ${current}\n\n` +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_EMAIL_HINT')}`
  );
}

/**
 * @summary Текст підтвердження перед збереженням поля профілю майстра.
 */
export function formatMasterOwnProfileEditConfirmText(
  field: MasterOwnProfileEditableField,
  value: string,
  language: BotUiLanguage,
): string {
  return (
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_CONFIRM_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_FIELD')}: ${editableFieldLabel(field, language)}\n` +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_NEW_VALUE')}:\n${value}\n\n` +
    `${tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_CONFIRM_HINT')}`
  );
}

/**
 * @summary Повідомлення про успішне оновлення поля профілю майстра.
 */
export function formatMasterOwnProfileEditSuccessText(
  field: MasterOwnProfileEditableField,
  language: BotUiLanguage,
): string {
  return tBotTemplate(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_SUCCESS', {
    field: editableFieldLabel(field, language),
  });
}

/**
 * @summary Клавіатура для кроку введення нового значення.
 */
export function createMasterOwnProfileEditInputKeyboard(
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_BTN_CANCEL'), MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_CANCEL)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_BTN_BACK_TO_PROFILE'), MASTER_PANEL_ACTION.OPEN_PROFILE)],
  ]);
}

/**
 * @summary Клавіатура для кроку підтвердження змін.
 */
export function createMasterOwnProfileEditConfirmKeyboard(
  language: BotUiLanguage,
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_BTN_SAVE'), MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_CONFIRM)],
    [Markup.button.callback(tBot(language, 'MASTER_PANEL_OWN_PROFILE_EDIT_BTN_CANCEL'), MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_CANCEL)],
  ]);
}
