import { Markup } from 'telegraf';
import {
  ADMIN_PANEL_ACTION,
  makeAdminPanelMastersCreateScheduleDayOffAction,
  makeAdminPanelMastersCreateSchedulePickAction,
  makeAdminPanelMastersCreateServiceToggleAction,
  makeAdminPanelMastersBookingsOpenCardAction,
  makeAdminPanelMastersEditFieldAction,
  makeAdminPanelMastersEditServicesAddPickAction,
  makeAdminPanelMastersEditServicesRemovePickAction,
  makeAdminPanelMastersEditOpenAction,
  makeAdminPanelMastersOpenAction,
  makeAdminPanelMastersOpenBookingsAction,
  makeAdminPanelMastersOpenStatsAction,
} from '../../types/bot-admin-panel.types.js';
import { tBot, tBotTemplate } from './i18n.bot.js';
import type { BotUiLanguage } from './i18n.bot.js';
import type { AdminBookingItem, AdminBookingsFeedPage } from '../../types/db-helpers/db-admin-bookings.types.js';
import type {
  MasterCatalogDetails,
  MasterCatalogItem,
  MasterSpecializationItem,
  MasterWeeklyScheduleItem,
} from '../../types/db-helpers/db-masters.types.js';
import type { MasterOwnProfileServiceManageItem } from '../../types/db-helpers/db-master-profile.types.js';
import type { ServicesCatalogItem } from '../../types/db-helpers/db-services.types.js';

/**
 * @file admin-masters-view.bot.ts
 * @summary UI/helper-и блоку "Майстри" у адмін-панелі.
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

function formatWeekdayLabel(language: BotUiLanguage, weekday: number): string {
  switch (weekday) {
    case 1:
      return tBot(language, 'ADMIN_PANEL_MASTERS_WEEKDAY_1');
    case 2:
      return tBot(language, 'ADMIN_PANEL_MASTERS_WEEKDAY_2');
    case 3:
      return tBot(language, 'ADMIN_PANEL_MASTERS_WEEKDAY_3');
    case 4:
      return tBot(language, 'ADMIN_PANEL_MASTERS_WEEKDAY_4');
    case 5:
      return tBot(language, 'ADMIN_PANEL_MASTERS_WEEKDAY_5');
    case 6:
      return tBot(language, 'ADMIN_PANEL_MASTERS_WEEKDAY_6');
    case 7:
      return tBot(language, 'ADMIN_PANEL_MASTERS_WEEKDAY_7');
    default:
      return `#${weekday}`;
  }
}

function formatWorkingRange(language: BotUiLanguage, item: MasterWeeklyScheduleItem): string {
  if (!item.isWorking || !item.openTime || !item.closeTime) {
    return tBot(language, 'ADMIN_PANEL_MASTERS_LABEL_DAY_OFF');
  }
  return `${item.openTime.slice(0, 5)}–${item.closeTime.slice(0, 5)}`;
}

function formatSpecializationLine(item: MasterSpecializationItem): string {
  return `• ${item.serviceName} — ${item.durationMinutes} хв • ${formatPrice(item.priceAmount, item.currencyCode)}`;
}

function formatBookingStatusLabel(
  language: BotUiLanguage,
  status: AdminBookingItem['status'],
): string {
  switch (status) {
    case 'pending':
      return tBot(language, 'ADMIN_PANEL_MASTERS_BOOKING_STATUS_PENDING');
    case 'confirmed':
      return tBot(language, 'ADMIN_PANEL_MASTERS_BOOKING_STATUS_CONFIRMED');
    case 'completed':
      return tBot(language, 'ADMIN_PANEL_MASTERS_BOOKING_STATUS_COMPLETED');
    case 'canceled':
      return tBot(language, 'ADMIN_PANEL_MASTERS_BOOKING_STATUS_CANCELED');
    case 'transferred':
      return tBot(language, 'ADMIN_PANEL_MASTERS_BOOKING_STATUS_TRANSFERRED');
    default:
      return status;
  }
}

function formatClientDisplayName(item: AdminBookingItem, language: BotUiLanguage): string {
  if (item.attendeeName && item.attendeeName.trim().length > 0) {
    return item.attendeeName;
  }

  const fullName = `${item.clientFirstName}${item.clientLastName ? ` ${item.clientLastName}` : ''}`.trim();
  return fullName || tBot(language, 'ADMIN_PANEL_MASTERS_LABEL_UNKNOWN_CLIENT');
}

function toSafeDate(value: Date | string): Date | null {
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function resolveLocale(language: BotUiLanguage): string {
  if (language === 'en') return 'en-US';
  if (language === 'cs') return 'cs-CZ';
  return 'uk-UA';
}

function formatUiDate(value: Date | string, language: BotUiLanguage): string {
  const parsed = toSafeDate(value);
  if (!parsed) return tBot(language, 'ADMIN_PANEL_MASTERS_LABEL_UNKNOWN_DATE');
  return parsed.toLocaleDateString(resolveLocale(language));
}

function formatUiTime(value: Date | string, language: BotUiLanguage): string {
  const parsed = toSafeDate(value);
  if (!parsed) return '--:--';
  return parsed.toLocaleTimeString(resolveLocale(language), { hour: '2-digit', minute: '2-digit' });
}

function formatDateTimeRange(
  startAt: Date | string,
  endAt: Date | string,
  language: BotUiLanguage,
): string {
  const date = formatUiDate(startAt, language);
  const startTime = formatUiTime(startAt, language);
  const endTime = formatUiTime(endAt, language);
  return `${date} • ${startTime}–${endTime}`;
}

function formatMasterCatalogLine(master: MasterCatalogItem, index: number): string {
  const experience =
    master.experienceYears == null ? 'Досвід не вказано' : `${master.experienceYears} років досвіду`;
  const bookable = master.isBookable ? '🟢 Доступний' : '⚪ Не приймає запис';
  return (
    `${getNumberBadge(index)} 👩‍🎨 ${master.displayName}\n` +
    `⭐ ${master.ratingAvg} (${master.ratingCount}) • ${experience}\n` +
    `${bookable}`
  );
}

/**
 * @summary Форматує список майстрів студії для адмін-панелі.
 */
export function formatAdminMastersCatalogText(
  masters: MasterCatalogItem[],
  language: BotUiLanguage = 'uk',
): string {
  const title = tBot(language, 'ADMIN_PANEL_BTN_MASTERS');
  if (masters.length === 0) {
    return (
      `${title}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      'Поки що немає активних майстрів.\n' +
      'Додайте майстра або активуйте існуючий профіль.'
    );
  }

  return (
    `${title}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    'Оберіть майстра зі списку, щоб відкрити деталі:\n\n' +
    masters.map(formatMasterCatalogLine).join('\n\n')
  );
}

/**
 * @summary Клавіатура списку майстрів адмін-панелі.
 */
export function createAdminMastersCatalogKeyboard(
  masters: MasterCatalogItem[],
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = masters.map((master, index) => [
    Markup.button.callback(
      `${getNumberBadge(index)} 👩‍🎨 ${master.displayName}`,
      makeAdminPanelMastersOpenAction(master.userId),
    ),
  ]);

  return Markup.inlineKeyboard([
    ...rows,
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_CREATE_OPEN'), ADMIN_PANEL_ACTION.MASTERS_CREATE_OPEN)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_DELETE_OPEN'), ADMIN_PANEL_ACTION.MASTERS_DELETE_OPEN)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_BACK'), ADMIN_PANEL_ACTION.MASTERS_BACK)],
    [Markup.button.callback(tBot(language, 'HOME'), ADMIN_PANEL_ACTION.HOME)],
  ]);
}

export type AdminMasterCreateScheduleDayView = {
  weekday: number;
  isWorking: boolean;
  openTime: string | null;
  closeTime: string | null;
};

export type AdminMasterCreateConfirmViewData = {
  displayName: string;
  telegramUserId: string;
  selectedServiceNames: string[];
  experienceYears: number;
  proceduresDoneTotal: number;
  bio: string;
  materialsInfo: string;
  contactPhoneE164: string;
  contactEmail: string;
  scheduleDays: AdminMasterCreateScheduleDayView[];
};

/**
 * @summary Екран старту створення нового майстра.
 */
export function formatAdminMasterCreateStartText(): string {
  return (
    '➕ Створення нового майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Ви запускаєте майстер створення нового профілю майстра.\n\n' +
    'Потрібно послідовно заповнити:\n' +
    '• імʼя майстра\n' +
    '• Telegram ID користувача\n' +
    '• послуги майстра\n' +
    '• професійні та контактні дані\n' +
    '• тижневий графік роботи'
  );
}

/**
 * @summary Клавіатура старту створення майстра.
 */
export function createAdminMasterCreateStartKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_CREATE_START'), ADMIN_PANEL_ACTION.MASTERS_CREATE_START)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_CREATE_CANCEL'), ADMIN_PANEL_ACTION.MASTERS_CREATE_CANCEL)],
  ]);
}

/**
 * @summary Базова клавіатура для текстових кроків створення майстра.
 */
export function createAdminMasterCreateInputKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_CREATE_CANCEL'), ADMIN_PANEL_ACTION.MASTERS_CREATE_CANCEL)],
  ]);
}

/**
 * @summary Екран вводу імені майстра.
 */
export function formatAdminMasterCreateDisplayNameInputText(): string {
  return (
    '👩‍🎨 Імʼя майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Введіть імʼя майстра для відображення у профілі клієнтів.\n\n' +
    'Формат: 2..30 символів, тільки літери.'
  );
}

/**
 * @summary Екран вводу Telegram ID майстра.
 */
export function formatAdminMasterCreateTelegramInputText(displayName: string): string {
  return (
    '🆔 Telegram ID майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👩‍🎨 Майстер: ${displayName}\n\n` +
    'Введіть Telegram ID користувача (тільки цифри).'
  );
}

/**
 * @summary Екран вибору послуг для нового майстра.
 */
export function formatAdminMasterCreateServicesText(
  displayName: string,
  services: ServicesCatalogItem[],
  selectedServiceIds: string[],
): string {
  const selected = new Set(selectedServiceIds);
  const lines =
    services.length === 0
      ? '• У студії немає активних послуг для призначення.'
      : services
          .map((service, index) => {
            const marker = selected.has(service.id) ? '✅' : '▫️';
            return `${getNumberBadge(index)} ${marker} ${service.name}`;
          })
          .join('\n');

  return (
    '💼 Послуги майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👩‍🎨 Майстер: ${displayName}\n\n` +
    `${lines}\n\n` +
    `Обрано послуг: ${selected.size}`
  );
}

/**
 * @summary Клавіатура вибору послуг для нового майстра.
 */
export function createAdminMasterCreateServicesKeyboard(
  services: ServicesCatalogItem[],
  selectedServiceIds: string[],
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const selected = new Set(selectedServiceIds);
  const rows = services.map((service, index) => {
    const marker = selected.has(service.id) ? '✅' : '▫️';
    return [
      Markup.button.callback(
        `${getNumberBadge(index)} ${marker} ${service.name}`,
        makeAdminPanelMastersCreateServiceToggleAction(service.id),
      ),
    ];
  });

  return Markup.inlineKeyboard([
    ...rows,
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_CREATE_SERVICES_DONE'), ADMIN_PANEL_ACTION.MASTERS_CREATE_SERVICES_DONE)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_CREATE_CANCEL'), ADMIN_PANEL_ACTION.MASTERS_CREATE_CANCEL)],
  ]);
}

/**
 * @summary Екран вводу досвіду майстра.
 */
export function formatAdminMasterCreateExperienceYearsInputText(): string {
  return (
    '🎓 Досвід роботи\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Введіть досвід роботи майстра у роках.\n\n' +
    'Формат: ціле число від 0 до 50.'
  );
}

/**
 * @summary Екран вводу кількості виконаних процедур.
 */
export function formatAdminMasterCreateProceduresInputText(): string {
  return (
    '📊 Виконано процедур\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Введіть кількість виконаних процедур за весь час.\n\n' +
    'Формат: ціле число від 0 до 100000.'
  );
}

/**
 * @summary Екран вводу опису майстра.
 */
export function formatAdminMasterCreateBioInputText(): string {
  return (
    '📝 Опис майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Введіть короткий професійний опис майстра для профілю клієнтів.\n\n' +
    'Рекомендація: 10..1000 символів.'
  );
}

/**
 * @summary Екран вводу додаткової інформації.
 */
export function formatAdminMasterCreateMaterialsInputText(): string {
  return (
    '🧴 Додаткова інформація\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Введіть інформацію про матеріали/особливості роботи майстра.\n\n' +
    'Рекомендація: 2..500 символів.'
  );
}

/**
 * @summary Екран вводу контактного телефону майстра.
 */
export function formatAdminMasterCreatePhoneInputText(): string {
  return (
    '📞 Телефон майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Введіть телефон майстра у форматі +420123456789.'
  );
}

/**
 * @summary Екран вводу контактного email майстра.
 */
export function formatAdminMasterCreateEmailInputText(): string {
  return (
    '✉️ Email майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Введіть email майстра у форматі name@example.com.'
  );
}

function formatSchedulePreviewLine(item: AdminMasterCreateScheduleDayView, language: BotUiLanguage): string {
  if (!item.isWorking || !item.openTime || !item.closeTime) {
    return `• ${formatWeekdayLabel(language, item.weekday)}: ${tBot(language, 'ADMIN_PANEL_MASTERS_LABEL_DAY_OFF')}`;
  }
  return `• ${formatWeekdayLabel(language, item.weekday)}: ${item.openTime}–${item.closeTime}`;
}

/**
 * @summary Екран вибору дня тижня для налаштування графіку нового майстра.
 */
export function formatAdminMasterCreateSchedulePickText(
  displayName: string,
  scheduleDays: AdminMasterCreateScheduleDayView[],
  language: BotUiLanguage = 'uk',
): string {
  const lines =
    scheduleDays.length === 0
      ? '• Графік ще не налаштовано.'
      : scheduleDays
          .slice()
          .sort((a, b) => a.weekday - b.weekday)
          .map((item) => formatSchedulePreviewLine(item, language))
          .join('\n');

  return (
    '🕒 Налаштування графіку\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👩‍🎨 Майстер: ${displayName}\n\n` +
    `${lines}\n\n` +
    'Оберіть день тижня для редагування. Після заповнення всіх днів підтвердіть створення.'
  );
}

/**
 * @summary Клавіатура вибору дня графіку.
 */
export function createAdminMasterCreateSchedulePickKeyboard(
  scheduleDays: AdminMasterCreateScheduleDayView[],
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const byWeekday = new Map<number, AdminMasterCreateScheduleDayView>();
  for (const item of scheduleDays) {
    byWeekday.set(item.weekday, item);
  }

  const rows = Array.from({ length: 7 }, (_, index) => {
    const weekday = index + 1;
    const day = byWeekday.get(weekday) ?? {
      weekday,
      isWorking: false,
      openTime: null,
      closeTime: null,
    };
    const status =
      day.isWorking && day.openTime && day.closeTime
        ? `${day.openTime}–${day.closeTime}`
        : tBot(language, 'ADMIN_PANEL_MASTERS_LABEL_DAY_OFF');
    return [
      Markup.button.callback(
        `${formatWeekdayLabel(language, weekday)} • ${status}`,
        makeAdminPanelMastersCreateSchedulePickAction(weekday),
      ),
    ];
  });

  return Markup.inlineKeyboard([
    ...rows,
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_CREATE_CONFIRM'), ADMIN_PANEL_ACTION.MASTERS_CREATE_CONFIRM)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_CREATE_CANCEL'), ADMIN_PANEL_ACTION.MASTERS_CREATE_CANCEL)],
  ]);
}

/**
 * @summary Клавіатура вводу часу для конкретного дня графіку.
 */
export function createAdminMasterCreateScheduleInputKeyboard(
  weekday: number,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_MASTERS_BTN_CREATE_MARK_DAY_OFF'),
        makeAdminPanelMastersCreateScheduleDayOffAction(weekday),
      ),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_CREATE_BACK_TO_SCHEDULE'), ADMIN_PANEL_ACTION.MASTERS_CREATE_CONTINUE)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_CREATE_CANCEL'), ADMIN_PANEL_ACTION.MASTERS_CREATE_CANCEL)],
  ]);
}

/**
 * @summary Екран вводу часу початку робочого дня.
 */
export function formatAdminMasterCreateScheduleFromInputText(
  weekday: number,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `🕒 ${formatWeekdayLabel(language, weekday)} • Час початку\n` +
    '━━━━━━━━━━━━━━\n\n' +
    'Введіть час початку у форматі HH:MM.\n' +
    'Приклад: 9:00 або 09:00'
  );
}

/**
 * @summary Екран вводу часу завершення робочого дня.
 */
export function formatAdminMasterCreateScheduleToInputText(
  weekday: number,
  fromTime: string,
  language: BotUiLanguage = 'uk',
): string {
  return (
    `🕒 ${formatWeekdayLabel(language, weekday)} • Час завершення\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `Початок: ${fromTime}\n\n` +
    'Введіть час завершення у форматі HH:MM.'
  );
}

/**
 * @summary Екран фінального підтвердження створення майстра.
 */
export function formatAdminMasterCreateConfirmText(
  data: AdminMasterCreateConfirmViewData,
  language: BotUiLanguage = 'uk',
): string {
  const servicesList =
    data.selectedServiceNames.length > 0
      ? data.selectedServiceNames.map((name, index) => `${getNumberBadge(index)} ${name}`).join('\n')
      : '• Послуги не обрані';

  const scheduleList = data.scheduleDays
    .slice()
    .sort((a, b) => a.weekday - b.weekday)
    .map((item) => formatSchedulePreviewLine(item, language))
    .join('\n');

  return (
    '⚠️ Підтвердження створення майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👩‍🎨 Імʼя: ${data.displayName}\n` +
    `🆔 Telegram ID: ${data.telegramUserId}\n` +
    `🎓 Досвід: ${data.experienceYears} років\n` +
    `📊 Процедур: ${data.proceduresDoneTotal}\n` +
    `📞 Телефон: ${data.contactPhoneE164}\n` +
    `✉️ Email: ${data.contactEmail}\n\n` +
    `📝 Опис:\n${data.bio}\n\n` +
    `🧴 Додаткова інформація:\n${data.materialsInfo}\n\n` +
    `💼 Послуги:\n${servicesList}\n\n` +
    `🕒 Графік:\n${scheduleList}`
  );
}

/**
 * @summary Клавіатура фінального підтвердження створення майстра.
 */
export function createAdminMasterCreateConfirmKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_CREATE_CONFIRM'), ADMIN_PANEL_ACTION.MASTERS_CREATE_CONFIRM)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_CREATE_BACK_TO_SCHEDULE'), ADMIN_PANEL_ACTION.MASTERS_CREATE_CONTINUE)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_CREATE_CANCEL'), ADMIN_PANEL_ACTION.MASTERS_CREATE_CANCEL)],
  ]);
}

/**
 * @summary Форматує деталі профілю майстра у адмін-панелі.
 */
export function formatAdminMasterDetailsText(
  details: MasterCatalogDetails,
  language: BotUiLanguage = 'uk',
): string {
  const specializations =
    details.specializations.length > 0
      ? details.specializations.map(formatSpecializationLine).join('\n')
      : '• Послуги ще не призначені';

  const weeklySchedule =
    details.weeklySchedule.length > 0
      ? details.weeklySchedule
          .slice()
          .sort((a, b) => a.weekday - b.weekday)
          .map((item) => `• ${formatWeekdayLabel(language, item.weekday)}: ${formatWorkingRange(language, item)}`)
          .join('\n')
      : '• Графік ще не заповнений';

  const bio = details.master.bio?.trim() ? details.master.bio.trim() : 'Не вказано';
  const materials = details.materialsInfo?.trim() ? details.materialsInfo.trim() : 'Не вказано';

  return (
    '👩‍🎨 Профіль майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👤 Ім’я: ${details.master.displayName}\n` +
    `🪪 ID майстра: ${details.master.userId}\n\n` +
    '📊 Професійна інформація\n' +
    `⭐ Рейтинг: ${details.master.ratingAvg} (${details.master.ratingCount})\n` +
    `🗓 Досвід: ${details.master.experienceYears ?? 'Не вказано'}\n` +
    `📈 Виконано процедур: ${details.master.proceduresDoneTotal}\n\n` +
    '💼 Спеціалізація\n' +
    `${specializations}\n\n` +
    '🕒 Робочий графік\n' +
    `${weeklySchedule}\n\n` +
    '📍 Додаткова інформація\n' +
    `📝 Bio: ${bio}\n` +
    `🧴 Матеріали: ${materials}\n` +
    `📱 Телефон: ${details.contactPhoneE164 ?? 'Не вказано'}\n` +
    `✉️ Email: ${details.contactEmail ?? 'Не вказано'}`
  );
}

/**
 * @summary Клавіатура картки майстра.
 */
export function createAdminMasterDetailsKeyboard(
  masterId: string,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_MASTERS_BTN_OPEN_BOOKINGS'),
        makeAdminPanelMastersOpenBookingsAction(masterId),
      ),
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_MASTERS_BTN_OPEN_STATS'),
        makeAdminPanelMastersOpenStatsAction(masterId),
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_MASTERS_BTN_EDIT_OPEN'),
        makeAdminPanelMastersEditOpenAction(masterId),
      ),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_DELETE_OPEN'), ADMIN_PANEL_ACTION.MASTERS_DELETE_OPEN)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_BACK_TO_LIST'), ADMIN_PANEL_ACTION.MASTERS_BACK_TO_LIST)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_BACK'), ADMIN_PANEL_ACTION.MASTERS_BACK)],
  ]);
}

/**
 * @summary Форматує екран введення Telegram ID для видалення майстра.
 */
export function formatAdminMasterDeleteInputText(): string {
  return (
    '❌ Видалення майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    'Щоб видалити майстра з системи, надішліть його Telegram ID.\n\n' +
    '📌 Формат: тільки цифри (5..15 символів)\n' +
    'Приклад: 548732119'
  );
}

/**
 * @summary Клавіатура екрану введення Telegram ID для видалення майстра.
 */
export function createAdminMasterDeleteInputKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_DELETE_CANCEL'), ADMIN_PANEL_ACTION.MASTERS_DELETE_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_BACK_TO_LIST'), ADMIN_PANEL_ACTION.MASTERS_BACK_TO_LIST)],
  ]);
}

/**
 * @summary Форматує екран підтвердження видалення майстра.
 */
export function formatAdminMasterDeleteConfirmText(
  masterName: string,
  telegramUserId: string,
): string {
  return (
    '⚠️ Підтвердження видалення майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👩‍🎨 Майстер: ${masterName}\n` +
    `🆔 Telegram ID: ${telegramUserId}\n\n` +
    'Після видалення:\n' +
    '• майстер втратить доступ до панелі майстра\n' +
    '• клієнти не зможуть створювати нові записи до цього майстра\n' +
    '• активні послуги майстра будуть вимкнені'
  );
}

/**
 * @summary Клавіатура підтвердження видалення майстра.
 */
export function createAdminMasterDeleteConfirmKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_DELETE_CONFIRM'), ADMIN_PANEL_ACTION.MASTERS_DELETE_CONFIRM)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_DELETE_CANCEL'), ADMIN_PANEL_ACTION.MASTERS_DELETE_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_BACK_TO_LIST'), ADMIN_PANEL_ACTION.MASTERS_BACK_TO_LIST)],
  ]);
}

/**
 * @summary Текст списку записів конкретного майстра.
 */
export function formatAdminMasterBookingsFeedText(
  masterName: string,
  page: AdminBookingsFeedPage,
  language: BotUiLanguage = 'uk',
): string {
  if (page.items.length === 0) {
    return (
      `${tBot(language, 'ADMIN_PANEL_MASTERS_BOOKINGS_FEED_TITLE')}\n` +
      '━━━━━━━━━━━━━━\n\n' +
      `👩‍🎨 Майстер: ${masterName}\n\n` +
      tBot(language, 'ADMIN_PANEL_MASTERS_BOOKINGS_FEED_EMPTY')
    );
  }

  const lines = page.items.map((item, index) => {
    return (
      `${getNumberBadge(index + page.offset)}\n\n` +
      `👤 ${formatClientDisplayName(item, language)}\n` +
      `💼 ${item.serviceName}\n` +
      `🕒 ${formatDateTimeRange(item.startAt, item.endAt, language)}\n` +
      `💰 ${formatPrice(item.priceAmount, item.currencyCode)}\n` +
      `${formatBookingStatusLabel(language, item.status)}`
    );
  });

  const pageNumber = Math.floor(page.offset / page.limit) + 1;
  const totalPages = Math.max(1, Math.ceil(page.total / page.limit));

  return (
    `${tBot(language, 'ADMIN_PANEL_MASTERS_BOOKINGS_FEED_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `👩‍🎨 Майстер: ${masterName}\n\n` +
    `${tBot(language, 'ADMIN_PANEL_MASTERS_BOOKINGS_FEED_PICK')}\n\n` +
    `${lines.join('\n\n⸻\n\n')}\n\n` +
    tBotTemplate(language, 'ADMIN_PANEL_MASTERS_BOOKINGS_FEED_PAGE', {
      current: pageNumber,
      total: totalPages,
    })
  );
}

/**
 * @summary Клавіатура списку записів майстра.
 */
export function createAdminMasterBookingsFeedKeyboard(
  page: AdminBookingsFeedPage,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const numberButtons = page.items.map((item, index) =>
    Markup.button.callback(
      `${index + 1}`,
      makeAdminPanelMastersBookingsOpenCardAction(item.appointmentId),
    ),
  );

  const numberRows: ReturnType<typeof Markup.button.callback>[][] = [];
  for (let i = 0; i < numberButtons.length; i += 3) {
    numberRows.push(numberButtons.slice(i, i + 3));
  }

  const paginationRow: ReturnType<typeof Markup.button.callback>[] = [];
  if (page.hasPrevPage) {
    paginationRow.push(
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_BTN_PREV'),
        ADMIN_PANEL_ACTION.MASTERS_BOOKINGS_PREV_PAGE,
      ),
    );
  }
  if (page.hasNextPage) {
    paginationRow.push(
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_BTN_NEXT'),
        ADMIN_PANEL_ACTION.MASTERS_BOOKINGS_NEXT_PAGE,
      ),
    );
  }

  return Markup.inlineKeyboard([
    ...numberRows,
    ...(paginationRow.length > 0 ? [paginationRow] : []),
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_MASTERS_BTN_BOOKINGS_BACK_TO_MASTER'),
        ADMIN_PANEL_ACTION.MASTERS_BOOKINGS_BACK_TO_MASTER,
      ),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_BACK_TO_LIST'), ADMIN_PANEL_ACTION.MASTERS_BACK_TO_LIST)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_BACK'), ADMIN_PANEL_ACTION.MASTERS_BACK)],
  ]);
}

/**
 * @summary Текст детальної картки запису в контексті конкретного майстра.
 */
export function formatAdminMasterBookingCardText(
  item: AdminBookingItem,
  language: BotUiLanguage = 'uk',
): string {
  const comment = item.clientComment?.trim();
  const commentBlock = comment
    ? `\n\n${tBot(language, 'ADMIN_PANEL_MASTERS_BOOKING_CARD_COMMENT_TITLE')}\n${comment}`
    : '';
  const notSpecified = tBot(language, 'ADMIN_PANEL_MASTERS_LABEL_NOT_SPECIFIED');

  return (
    `${tBot(language, 'ADMIN_PANEL_MASTERS_BOOKING_CARD_TITLE')}\n` +
    '━━━━━━━━━━━━━━\n\n' +
    `${tBotTemplate(language, 'ADMIN_PANEL_MASTERS_BOOKING_CARD_CLIENT', {
      value: formatClientDisplayName(item, language),
    })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_MASTERS_BOOKING_CARD_PHONE', {
      value: item.attendeePhoneE164 ?? notSpecified,
    })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_MASTERS_BOOKING_CARD_EMAIL', {
      value: item.attendeeEmail ?? notSpecified,
    })}\n\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_MASTERS_BOOKING_CARD_SERVICE', {
      value: item.serviceName,
    })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_MASTERS_BOOKING_CARD_MASTER', {
      value: item.masterName,
    })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_MASTERS_BOOKING_CARD_TIME', {
      value: formatDateTimeRange(item.startAt, item.endAt, language),
    })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_MASTERS_BOOKING_CARD_PRICE', {
      value: formatPrice(item.priceAmount, item.currencyCode),
    })}\n` +
    `${tBotTemplate(language, 'ADMIN_PANEL_MASTERS_BOOKING_CARD_STATUS', {
      value: formatBookingStatusLabel(language, item.status),
    })}` +
    commentBlock
  );
}

/**
 * @summary Клавіатура картки запису майстра (read-only).
 */
export function createAdminMasterBookingCardKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_BTN_BACK_TO_LIST'),
        ADMIN_PANEL_ACTION.MASTERS_BOOKINGS_BACK_TO_LIST,
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_MASTERS_BTN_BOOKINGS_BACK_TO_MASTER'),
        ADMIN_PANEL_ACTION.MASTERS_BOOKINGS_BACK_TO_MASTER,
      ),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_BACK_TO_LIST'), ADMIN_PANEL_ACTION.MASTERS_BACK_TO_LIST)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_BACK'), ADMIN_PANEL_ACTION.MASTERS_BACK)],
  ]);
}

/**
 * @summary Stub-текст для підблоку "Статистика майстра".
 */
export function formatAdminMasterStatsStubText(masterName: string): string {
  return (
    '📊 Статистика майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👩‍🎨 Майстер: ${masterName}\n\n` +
    '⚠️ Розділ тимчасово недоступний.\n' +
    'На наступному кроці тут будуть показники продуктивності, завантаженості та фінансів майстра.'
  );
}

export type AdminMasterEditableField =
  | 'display_name'
  | 'bio'
  | 'materials'
  | 'phone'
  | 'email'
  | 'started_on'
  | 'procedures_done_total';

function getEditableFieldLabel(field: AdminMasterEditableField): string {
  switch (field) {
    case 'display_name':
      return 'Імʼя майстра';
    case 'bio':
      return 'Опис майстра';
    case 'materials':
      return 'Додаткова інформація';
    case 'phone':
      return 'Телефон майстра';
    case 'email':
      return 'Email майстра';
    case 'started_on':
      return 'Дата початку роботи';
    case 'procedures_done_total':
      return 'Кількість процедур';
    default:
      return 'Поле профілю';
  }
}

/**
 * @summary Форматує екран меню редагування профілю майстра.
 */
export function formatAdminMasterEditMenuText(masterName: string): string {
  return (
    '✏️ Редагування профілю майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👩‍🎨 Майстер: ${masterName}\n\n` +
    'Оберіть поле, яке потрібно оновити:'
  );
}

/**
 * @summary Клавіатура меню редагування профілю майстра.
 */
export function createAdminMasterEditMenuKeyboard(
  masterId: string,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_MASTERS_BTN_EDIT_DISPLAY_NAME'),
        makeAdminPanelMastersEditFieldAction(masterId, 'display_name'),
      ),
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_MASTERS_BTN_EDIT_BIO'),
        makeAdminPanelMastersEditFieldAction(masterId, 'bio'),
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_MASTERS_BTN_EDIT_MATERIALS'),
        makeAdminPanelMastersEditFieldAction(masterId, 'materials'),
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_MASTERS_BTN_EDIT_SERVICES'),
        ADMIN_PANEL_ACTION.MASTERS_EDIT_SERVICES_OPEN,
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_MASTERS_BTN_EDIT_PHONE'),
        makeAdminPanelMastersEditFieldAction(masterId, 'phone'),
      ),
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_MASTERS_BTN_EDIT_EMAIL'),
        makeAdminPanelMastersEditFieldAction(masterId, 'email'),
      ),
    ],
    [
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_MASTERS_BTN_EDIT_STARTED_ON'),
        makeAdminPanelMastersEditFieldAction(masterId, 'started_on'),
      ),
      Markup.button.callback(
        tBot(language, 'ADMIN_PANEL_MASTERS_BTN_EDIT_PROCEDURES'),
        makeAdminPanelMastersEditFieldAction(masterId, 'procedures_done_total'),
      ),
    ],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_EDIT_BACK'), ADMIN_PANEL_ACTION.MASTERS_EDIT_BACK)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_BACK'), ADMIN_PANEL_ACTION.MASTERS_BACK)],
  ]);
}

/**
 * @summary Форматує головний екран керування послугами майстра.
 */
export function formatAdminMasterEditServicesMenuText(
  masterName: string,
  services: MasterOwnProfileServiceManageItem[],
): string {
  const list =
    services.length === 0
      ? '• У майстра ще немає активних послуг.'
      : services
          .filter((item) => item.isActive)
          .map((item, index) => {
            return (
              `${getNumberBadge(index)} ${item.serviceName}\n` +
              `⏱ ${item.durationMinutes} хв • 💰 ${formatPrice(item.priceAmount, item.currencyCode)}`
            );
          })
          .join('\n\n');

  return (
    '💼 Керування послугами майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👩‍🎨 Майстер: ${masterName}\n\n` +
    '📋 Активні послуги:\n' +
    `${list || '• У майстра ще немає активних послуг.'}\n\n` +
    'Оберіть дію нижче.'
  );
}

/**
 * @summary Клавіатура меню керування послугами майстра.
 */
export function createAdminMasterEditServicesMenuKeyboard(
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_EDIT_SERVICES_ADD'), ADMIN_PANEL_ACTION.MASTERS_EDIT_SERVICES_ADD_OPEN)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_EDIT_SERVICES_REMOVE'), ADMIN_PANEL_ACTION.MASTERS_EDIT_SERVICES_REMOVE_OPEN)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_EDIT_SERVICES_BACK'), ADMIN_PANEL_ACTION.MASTERS_EDIT_SERVICES_BACK)],
  ]);
}

/**
 * @summary Форматує список кандидатів на додавання послуги майстру.
 */
export function formatAdminMasterEditServicesAddCandidatesText(
  masterName: string,
  candidates: MasterOwnProfileServiceManageItem[],
): string {
  if (candidates.length === 0) {
    return (
      '➕ Додати послугу майстру\n' +
      '━━━━━━━━━━━━━━\n\n' +
      `👩‍🎨 Майстер: ${masterName}\n\n` +
      '✅ Усі доступні послуги вже призначені майстру.'
    );
  }

  const list = candidates
    .map((item, index) => {
      return (
        `${getNumberBadge(index)} ${item.serviceName}\n` +
        `⏱ ${item.durationMinutes} хв • 💰 ${formatPrice(item.priceAmount, item.currencyCode)}`
      );
    })
    .join('\n\n');

  return (
    '➕ Додати послугу майстру\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👩‍🎨 Майстер: ${masterName}\n\n` +
    'Оберіть послугу для додавання:\n\n' +
    list
  );
}

/**
 * @summary Клавіатура списку кандидатів на додавання.
 */
export function createAdminMasterEditServicesAddCandidatesKeyboard(
  candidates: MasterOwnProfileServiceManageItem[],
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = candidates.map((item, index) => [
    Markup.button.callback(
      `${getNumberBadge(index)} ${item.serviceName}`,
      makeAdminPanelMastersEditServicesAddPickAction(item.serviceId),
    ),
  ]);

  return Markup.inlineKeyboard([
    ...rows,
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_EDIT_SERVICES_BACK'), ADMIN_PANEL_ACTION.MASTERS_EDIT_SERVICES_BACK)],
  ]);
}

/**
 * @summary Форматує список кандидатів на видалення послуги у майстра.
 */
export function formatAdminMasterEditServicesRemoveCandidatesText(
  masterName: string,
  candidates: MasterOwnProfileServiceManageItem[],
): string {
  if (candidates.length === 0) {
    return (
      '➖ Видалити послугу майстра\n' +
      '━━━━━━━━━━━━━━\n\n' +
      `👩‍🎨 Майстер: ${masterName}\n\n` +
      '📭 Немає активних послуг для вимкнення.'
    );
  }

  const list = candidates
    .map((item, index) => {
      return (
        `${getNumberBadge(index)} ${item.serviceName}\n` +
        `⏱ ${item.durationMinutes} хв • 💰 ${formatPrice(item.priceAmount, item.currencyCode)}`
      );
    })
    .join('\n\n');

  return (
    '➖ Видалити послугу майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👩‍🎨 Майстер: ${masterName}\n\n` +
    'Оберіть послугу для вимкнення:\n\n' +
    list
  );
}

/**
 * @summary Клавіатура списку кандидатів на видалення.
 */
export function createAdminMasterEditServicesRemoveCandidatesKeyboard(
  candidates: MasterOwnProfileServiceManageItem[],
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = candidates.map((item, index) => [
    Markup.button.callback(
      `${getNumberBadge(index)} ${item.serviceName}`,
      makeAdminPanelMastersEditServicesRemovePickAction(item.serviceId),
    ),
  ]);

  return Markup.inlineKeyboard([
    ...rows,
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_EDIT_SERVICES_BACK'), ADMIN_PANEL_ACTION.MASTERS_EDIT_SERVICES_BACK)],
  ]);
}

/**
 * @summary Форматує екран вводу нового значення для поля майстра.
 */
export function formatAdminMasterEditInputText(
  field: AdminMasterEditableField,
  currentValue: string,
): string {
  const label = getEditableFieldLabel(field);
  const hint =
    field === 'phone'
      ? '\n\nФормат: +420123456789'
      : field === 'email'
        ? '\n\nФормат: name@example.com'
        : field === 'started_on'
          ? '\n\nФормат: ДД.ММ.РРРР'
          : field === 'procedures_done_total'
            ? '\n\nВкажіть ціле число від 0 до 100000'
            : '';

  return (
    '✏️ Редагування поля\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `Поле: ${label}\n\n` +
    `Поточне значення:\n${currentValue}\n\n` +
    'Введіть нове значення повідомленням.' +
    hint
  );
}

/**
 * @summary Клавіатура для кроку вводу нового значення.
 */
export function createAdminMasterEditInputKeyboard(
  masterId: string,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_EDIT_CANCEL'), ADMIN_PANEL_ACTION.MASTERS_EDIT_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_EDIT_BACK'), makeAdminPanelMastersEditOpenAction(masterId))],
  ]);
}

/**
 * @summary Форматує підтвердження перед збереженням поля майстра.
 */
export function formatAdminMasterEditConfirmText(
  field: AdminMasterEditableField,
  previousValue: string,
  nextValue: string,
): string {
  const label = getEditableFieldLabel(field);
  return (
    '⚠️ Підтвердження змін\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `Поле: ${label}\n\n` +
    `Було:\n${previousValue}\n\n` +
    `Стане:\n${nextValue}\n\n` +
    'Підтвердіть збереження.'
  );
}

/**
 * @summary Клавіатура підтвердження перед збереженням.
 */
export function createAdminMasterEditConfirmKeyboard(
  masterId: string,
  language: BotUiLanguage = 'uk',
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_EDIT_CONFIRM'), ADMIN_PANEL_ACTION.MASTERS_EDIT_CONFIRM)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_EDIT_CANCEL'), ADMIN_PANEL_ACTION.MASTERS_EDIT_CANCEL)],
    [Markup.button.callback(tBot(language, 'ADMIN_PANEL_MASTERS_BTN_EDIT_BACK'), makeAdminPanelMastersEditOpenAction(masterId))],
  ]);
}

/**
 * @summary Форматує текст успішного оновлення поля профілю майстра.
 */
export function formatAdminMasterEditSuccessText(
  field: AdminMasterEditableField,
  value: string,
): string {
  return (
    '✅ Профіль майстра оновлено\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `${getEditableFieldLabel(field)}:\n${value}`
  );
}
