import { Markup } from 'telegraf';
import type {
  MasterOwnProfileData,
  MasterOwnProfileServiceManageItem,
} from '../../types/db-helpers/db-master-profile.types.js';
import {
  MASTER_PANEL_ACTION,
  makeMasterPanelProfileServiceToggleAction,
} from '../../types/bot-master-panel.types.js';

/**
 * @file master-own-profile-view.bot.ts
 * @summary UI/helper-и блоку "Мій профіль майстра" у master panel.
 */

function formatDate(value: Date | string | null): string {
  if (!value) return 'Не вказано';

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Не вказано';
  }

  return parsed.toLocaleDateString('uk-UA');
}

function telegramLabel(username: string | null): string {
  if (!username) return 'Не вказано';
  return username.startsWith('@') ? username : `@${username}`;
}

function statusLabel(isBookable: boolean): string {
  return isBookable ? '🟢 Доступний для нових записів' : '🟠 Тимчасово недоступний для нових записів';
}

export type MasterOwnProfileEditableField =
  | 'bio'
  | 'materials'
  | 'phone'
  | 'email'
  | 'display_name'
  | 'started_on'
  | 'procedures_done_total';

function editableFieldLabel(field: MasterOwnProfileEditableField): string {
  switch (field) {
    case 'bio':
      return 'опис профілю';
    case 'materials':
      return 'матеріали';
    case 'phone':
      return 'контактний телефон';
    case 'email':
      return 'контактний email';
    case 'display_name':
      return 'ім’я майстра в профілі';
    case 'started_on':
      return 'дата початку роботи';
    case 'procedures_done_total':
      return 'кількість виконаних процедур';
    default:
      return 'поле профілю';
  }
}

/**
 * @summary Головний екран профілю майстра.
 */
export function formatMasterOwnProfileMainText(profile: MasterOwnProfileData): string {
  const fullName = `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ''}`.trim();

  return (
    '👤 Ваш профіль майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👩‍🎨 Ім’я в профілі: ${profile.displayName}\n` +
    `🧾 Повне ім’я: ${fullName}\n` +
    `💬 Telegram: ${telegramLabel(profile.telegramUsername)}\n\n` +
    `📌 Статус: ${statusLabel(profile.isBookable)}\n\n` +
    `🏢 ID студії: ${profile.studioId}\n` +
    `🪪 ID майстра: ${profile.userId}\n\n` +
    'Оберіть підрозділ профілю кнопками нижче.'
  );
}

/**
 * @summary Екран "Керування послугами" (навігаційний блок).
 */
export function formatMasterOwnProfileServicesText(services: MasterOwnProfileServiceManageItem[]): string {
  const servicesText =
    services.length > 0
      ? services
          .map((service, index) => {
            const status = service.isActive ? '🟢 Активна' : '⚪️ Вимкнена';
            return (
              `${index + 1}️⃣ ${service.serviceName}\n` +
              `   • ${service.durationMinutes} хв • ${service.priceAmount} ${service.currencyCode}\n` +
              `   • ${status}`
            );
          })
          .join('\n\n')
      : 'Послуги поки не додані.';

  return (
    '💼 Керування послугами\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Натисніть на послугу нижче, щоб увімкнути або вимкнути її для запису.\n\n' +
    `${servicesText}`
  );
}

/**
 * @summary Екран "Професійна інформація" (навігаційний блок).
 */
export function formatMasterOwnProfileProfessionalText(profile: MasterOwnProfileData): string {
  const certificatesText =
    profile.certificates.length > 0
      ? profile.certificates
          .slice(0, 5)
          .map((certificate, index) => {
            const issuer = certificate.issuer ? ` (${certificate.issuer})` : '';
            const issued = certificate.issuedOn ? ` • ${formatDate(certificate.issuedOn)}` : '';
            return `${index + 1}️⃣ ${certificate.title}${issuer}${issued}`;
          })
          .join('\n')
      : 'Сертифікати поки не додані.';

  return (
    '🎓 Професійна інформація\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `📅 Дата початку роботи: ${formatDate(profile.startedOn)}\n` +
    `📈 Виконано процедур: ${profile.proceduresDoneTotal}\n` +
    `⏳ Досвід (років): ${profile.experienceYears ?? 'Не вказано'}\n\n` +
    '📜 Сертифікати:\n' +
    `${certificatesText}`
  );
}

/**
 * @summary Екран "Додаткова інформація" (навігаційний блок).
 */
export function formatMasterOwnProfileAdditionalText(profile: MasterOwnProfileData): string {
  return (
    'ℹ️ Додаткова інформація\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `🧴 Матеріали: ${profile.materialsInfo ?? 'Не вказано'}\n\n` +
    `📞 Контактний телефон: ${profile.contactPhoneE164 ?? 'Не вказано'}\n` +
    `✉️ Контактний email: ${profile.contactEmail ?? 'Не вказано'}\n\n` +
    `🗓 Профіль створено: ${formatDate(profile.masterCreatedAt)}\n\n` +
    `📝 Опис профілю:\n${profile.bio ?? 'Не вказано'}\n\n` +
    'Дані відображаються клієнтам у вашому профілі.'
  );
}

/**
 * @summary Клавіатура головного екрану профілю майстра.
 */
export function createMasterOwnProfileMainKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback('💼 Керування послугами', MASTER_PANEL_ACTION.OPEN_PROFILE_SERVICES)],
    [Markup.button.callback('🎓 Професійна інформація', MASTER_PANEL_ACTION.OPEN_PROFILE_PROFESSIONAL)],
    [Markup.button.callback('ℹ️ Додаткова інформація', MASTER_PANEL_ACTION.OPEN_PROFILE_ADDITIONAL)],
    [Markup.button.callback('⬅️ До панелі майстра', MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Клавіатура підрозділу профілю майстра.
 */
export function createMasterOwnProfileSectionKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback('👤 До профілю майстра', MASTER_PANEL_ACTION.OPEN_PROFILE)],
    [Markup.button.callback('⬅️ До панелі майстра', MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Клавіатура екрана "Керування послугами" з діями увімкнення/вимкнення.
 */
export function createMasterOwnProfileServicesKeyboard(
  services: MasterOwnProfileServiceManageItem[],
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = services.map((service) => {
    const status = service.isActive ? '🟢' : '⚪️';
    return [
      Markup.button.callback(
        `${status} ${service.serviceName}`,
        makeMasterPanelProfileServiceToggleAction(service.serviceId),
      ),
    ];
  });

  return Markup.inlineKeyboard([
    ...rows,
    [Markup.button.callback('👤 До профілю майстра', MASTER_PANEL_ACTION.OPEN_PROFILE)],
    [Markup.button.callback('⬅️ До панелі майстра', MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Клавіатура екрана "Професійна інформація" з діями редагування.
 */
export function createMasterOwnProfileProfessionalKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback('👩‍🎨 Змінити імʼя', MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_DISPLAY_NAME)],
    [Markup.button.callback('📅 Змінити дату початку роботи', MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_STARTED_ON)],
    [
      Markup.button.callback(
        '📈 Оновити кількість процедур',
        MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_PROCEDURES_DONE_TOTAL,
      ),
    ],
    [Markup.button.callback('👤 До профілю майстра', MASTER_PANEL_ACTION.OPEN_PROFILE)],
    [Markup.button.callback('⬅️ До панелі майстра', MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Клавіатура екрана "Додаткова інформація" з діями редагування.
 */
export function createMasterOwnProfileAdditionalKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📝 Змінити опис', MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_BIO)],
    [Markup.button.callback('🧴 Змінити матеріали', MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_MATERIALS)],
    [Markup.button.callback('📞 Змінити телефон', MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_PHONE)],
    [Markup.button.callback('✉️ Змінити email', MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_EMAIL)],
    [Markup.button.callback('👤 До профілю майстра', MASTER_PANEL_ACTION.OPEN_PROFILE)],
    [Markup.button.callback('⬅️ До панелі майстра', MASTER_PANEL_ACTION.BACK_TO_PANEL)],
  ]);
}

/**
 * @summary Підказка для введення нового значення поля профілю майстра.
 */
export function formatMasterOwnProfileEditInputText(
  field: MasterOwnProfileEditableField,
  currentValue: string | null,
): string {
  const label = editableFieldLabel(field);
  const current = currentValue?.trim().length ? currentValue : 'Не вказано';

  if (field === 'bio') {
    return (
      '📝 Редагування опису профілю\n' +
      '━━━━━━━━━━━━━━\n\n' +
      `Поточне значення:\n${current}\n\n` +
      'Введіть новий опис (мінімум 10 символів).'
    );
  }

  if (field === 'materials') {
    return (
      '🧴 Редагування матеріалів\n' +
      '━━━━━━━━━━━━━━\n\n' +
      `Поточне значення:\n${current}\n\n` +
      'Введіть матеріали, з якими ви працюєте.'
    );
  }

  if (field === 'phone') {
    return (
      '📞 Редагування контактного телефону\n' +
      '━━━━━━━━━━━━━━\n\n' +
      `Поточне значення: ${current}\n\n` +
      'Введіть телефон у форматі +420123456789.'
    );
  }

  if (field === 'display_name') {
    return (
      '👩‍🎨 Редагування імені майстра\n' +
      '━━━━━━━━━━━━━━\n\n' +
      `Поточне значення: ${current}\n\n` +
      'Введіть нове імʼя для відображення у профілі.\n' +
      'Приклад: Анна В.'
    );
  }

  if (field === 'started_on') {
    return (
      '📅 Редагування дати початку роботи\n' +
      '━━━━━━━━━━━━━━\n\n' +
      `Поточне значення: ${current}\n\n` +
      'Введіть нову дату у форматі ДД.ММ.РРРР.\n' +
      'Приклад: 12.04.2019'
    );
  }

  if (field === 'procedures_done_total') {
    return (
      '📈 Редагування кількості процедур\n' +
      '━━━━━━━━━━━━━━\n\n' +
      `Поточне значення: ${current}\n\n` +
      'Введіть число від 0 до 100000.'
    );
  }

  return (
    '✉️ Редагування контактного email\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `Поточне значення: ${current}\n\n` +
    'Введіть новий email (приклад: name@example.com).'
  );
}

/**
 * @summary Текст підтвердження перед збереженням поля профілю майстра.
 */
export function formatMasterOwnProfileEditConfirmText(
  field: MasterOwnProfileEditableField,
  value: string,
): string {
  return (
    '⚠️ Підтвердження оновлення\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `Поле: ${editableFieldLabel(field)}\n` +
    `Нове значення:\n${value}\n\n` +
    'Підтвердіть, щоб зберегти зміни.'
  );
}

/**
 * @summary Повідомлення про успішне оновлення поля профілю майстра.
 */
export function formatMasterOwnProfileEditSuccessText(field: MasterOwnProfileEditableField): string {
  return `✅ Поле "${editableFieldLabel(field)}" оновлено.`;
}

/**
 * @summary Клавіатура для кроку введення нового значення.
 */
export function createMasterOwnProfileEditInputKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback('❌ Скасувати', MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_CANCEL)],
    [Markup.button.callback('👤 До профілю майстра', MASTER_PANEL_ACTION.OPEN_PROFILE)],
  ]);
}

/**
 * @summary Клавіатура для кроку підтвердження змін.
 */
export function createMasterOwnProfileEditConfirmKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback('✅ Зберегти', MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_CONFIRM)],
    [Markup.button.callback('❌ Скасувати', MASTER_PANEL_ACTION.OPEN_PROFILE_EDIT_CANCEL)],
  ]);
}
