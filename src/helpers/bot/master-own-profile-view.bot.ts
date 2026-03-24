import { Markup } from 'telegraf';
import type { MasterOwnProfileData } from '../../types/db-helpers/db-master-profile.types.js';
import { MASTER_PANEL_ACTION } from '../../types/bot-master-panel.types.js';

/**
 * @file master-own-profile-view.bot.ts
 * @summary UI/helper-и блоку "Мій профіль майстра" у master panel.
 */

function formatDate(value: Date | null): string {
  if (!value) return 'Не вказано';
  return value.toLocaleDateString('uk-UA');
}

function telegramLabel(username: string | null): string {
  if (!username) return 'Не вказано';
  return username.startsWith('@') ? username : `@${username}`;
}

function statusLabel(isBookable: boolean): string {
  return isBookable ? '🟢 Доступний для нових записів' : '🟠 Тимчасово недоступний для нових записів';
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
export function formatMasterOwnProfileServicesText(profile: MasterOwnProfileData): string {
  const servicesText =
    profile.services.length > 0
      ? profile.services.map((service, index) => `${index + 1}️⃣ ${service.serviceName}`).join('\n')
      : 'Послуги поки не додані.';

  return (
    '💼 Керування послугами\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Поточні активні послуги майстра:\n\n' +
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
