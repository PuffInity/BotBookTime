import { Markup } from 'telegraf';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import {
  MASTERS_ACTION,
  MASTERS_BUTTON_TEXT,
  makeMasterItemAction,
} from '../../types/bot-masters.types.js';
import type {
  MasterCatalogDetails,
  MasterCatalogItem,
  MasterCatalogCertificate,
  MasterSpecializationItem,
} from '../../types/db-helpers/db-masters.types.js';

/**
 * @file masters-view.bot.ts
 * @summary UI/helper-и для розділу "Майстри" (тексти + inline-клавіатури).
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

function formatDate(value: Date | null): string | null {
  if (!value) return null;

  return new Intl.DateTimeFormat('uk-UA', {
    timeZone: 'Europe/Prague',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(value);
}

function formatMasterListLine(master: MasterCatalogItem, index: number): string {
  const experienceLabel =
    master.experienceYears == null ? 'Досвід не вказано' : `${master.experienceYears} років досвіду`;

  return (
    `${getNumberBadge(index)} 👩‍🎨 ${master.displayName}\n` +
    `⭐ ${master.ratingAvg} (${master.ratingCount}) • ${experienceLabel}`
  );
}

function formatSpecializationLine(item: MasterSpecializationItem): string {
  return (
    `• ${item.serviceName}\n` +
    `  ⏱ ${item.durationMinutes} хв • 💰 ${formatPrice(item.priceAmount, item.currencyCode)}`
  );
}

function formatCertificateLine(certificate: MasterCatalogCertificate): string {
  const issuer = certificate.issuer ? ` (${certificate.issuer})` : '';
  const issuedOn = formatDate(certificate.issuedOn);
  const dateLabel = issuedOn ? ` — ${issuedOn}` : '';
  return `• ${certificate.title}${issuer}${dateLabel}`;
}

function formatSpecializationsBlock(details: MasterCatalogDetails): string {
  if (details.specializations.length === 0) {
    return '💼 Спеціалізація\nІнформацію буде додано найближчим часом.';
  }

  const lines = details.specializations.map(formatSpecializationLine);
  return `💼 Спеціалізація\n${lines.join('\n\n')}`;
}

function formatCertificatesBlock(details: MasterCatalogDetails): string {
  if (details.certificates.length === 0) {
    return '🎓 Сертифікати\nІнформацію буде додано найближчим часом.';
  }

  const lines = details.certificates.map(formatCertificateLine);
  return `🎓 Сертифікати\n${lines.join('\n')}`;
}

function formatContactsBlock(details: MasterCatalogDetails): string {
  return (
    '📌 Контакти\n' +
    `📱 Телефон: ${details.contactPhoneE164 ?? 'Не вказано'}\n` +
    `✉️ Email: ${details.contactEmail ?? 'Не вказано'}`
  );
}

/**
 * @summary Форматує текст каталогу майстрів.
 */
export function formatMastersCatalogText(masters: MasterCatalogItem[]): string {
  if (masters.length === 0) {
    return (
      '👩‍🎨 Майстри\n' +
      '━━━━━━━━━━━━━━\n' +
      'Наразі активних майстрів немає.\n' +
      'Спробуйте пізніше або зверніться до адміністратора.'
    );
  }

  const lines = masters.map(formatMasterListLine);
  return (
    '👩‍🎨 Майстри\n' +
    '━━━━━━━━━━━━━━\n' +
    'Оберіть майстра, щоб переглянути детальний профіль:\n\n' +
    lines.join('\n\n')
  );
}

/**
 * @summary Форматує текст детального профілю майстра.
 */
export function formatMasterDetailsText(details: MasterCatalogDetails): string {
  const bioBlock = details.master.bio
    ? `📝 Про майстра\n${details.master.bio}`
    : '📝 Про майстра\nІнформацію буде додано найближчим часом.';

  const materialsBlock = details.materialsInfo
    ? `🧴 Додаткова інформація\n${details.materialsInfo}`
    : '🧴 Додаткова інформація\nНе вказано.';

  return (
    '👩‍🎨 Профіль майстра\n' +
    '━━━━━━━━━━━━━━\n' +
    `👤 ${details.master.displayName}\n` +
    `⭐ Рейтинг: ${details.master.ratingAvg} (${details.master.ratingCount})\n` +
    `🗓 Досвід: ${details.master.experienceYears ?? 'Не вказано'}\n` +
    `📈 Виконано процедур: ${details.master.proceduresDoneTotal}\n\n` +
    `${formatSpecializationsBlock(details)}\n\n` +
    `${formatCertificatesBlock(details)}\n\n` +
    `${bioBlock}\n\n` +
    `${materialsBlock}\n\n` +
    formatContactsBlock(details)
  );
}

/**
 * @summary Створює inline-клавіатуру каталогу майстрів.
 */
export function createMastersCatalogKeyboard(
  masters: MasterCatalogItem[],
): ReturnType<typeof Markup.inlineKeyboard> {
  const masterRows = masters.map((master, index) => [
    Markup.button.callback(
      `${getNumberBadge(index)} 👩‍🎨 ${master.displayName}`,
      makeMasterItemAction(master.userId),
    ),
  ]);

  return Markup.inlineKeyboard([
    ...masterRows,
    [Markup.button.callback(MASTERS_BUTTON_TEXT.HOME, COMMON_NAV_ACTION.HOME)],
  ]);
}

/**
 * @summary Створює inline-клавіатуру детальної картки майстра.
 */
export function createMasterDetailsKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(MASTERS_BUTTON_TEXT.BACK, MASTERS_ACTION.BACK_TO_LIST),
      Markup.button.callback(MASTERS_BUTTON_TEXT.HOME, COMMON_NAV_ACTION.HOME),
    ],
  ]);
}
