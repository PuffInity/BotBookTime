import { Markup } from 'telegraf';
import {
  ADMIN_PANEL_ACTION,
  ADMIN_PANEL_BUTTON_TEXT,
  makeAdminPanelMastersBookingsOpenCardAction,
  makeAdminPanelMastersOpenAction,
  makeAdminPanelMastersOpenBookingsAction,
  makeAdminPanelMastersOpenStatsAction,
} from '../../types/bot-admin-panel.types.js';
import type { AdminBookingItem, AdminBookingsFeedPage } from '../../types/db-helpers/db-admin-bookings.types.js';
import type {
  MasterCatalogDetails,
  MasterCatalogItem,
  MasterSpecializationItem,
  MasterWeeklyScheduleItem,
} from '../../types/db-helpers/db-masters.types.js';

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

function formatWeekdayLabel(weekday: number): string {
  const labels: Record<number, string> = {
    1: 'Пн',
    2: 'Вт',
    3: 'Ср',
    4: 'Чт',
    5: 'Пт',
    6: 'Сб',
    7: 'Нд',
  };
  return labels[weekday] ?? `День ${weekday}`;
}

function formatWorkingRange(item: MasterWeeklyScheduleItem): string {
  if (!item.isWorking || !item.openTime || !item.closeTime) {
    return 'вихідний';
  }
  return `${item.openTime.slice(0, 5)}–${item.closeTime.slice(0, 5)}`;
}

function formatSpecializationLine(item: MasterSpecializationItem): string {
  return `• ${item.serviceName} — ${item.durationMinutes} хв • ${formatPrice(item.priceAmount, item.currencyCode)}`;
}

function formatBookingStatusLabel(status: AdminBookingItem['status']): string {
  switch (status) {
    case 'pending':
      return '🟡 Очікує підтвердження';
    case 'confirmed':
      return '🟢 Підтверджено';
    case 'completed':
      return '⚪ Завершено';
    case 'canceled':
      return '🔴 Скасовано';
    case 'transferred':
      return '🟣 Перенесено';
    default:
      return status;
  }
}

function formatClientDisplayName(item: AdminBookingItem): string {
  if (item.attendeeName && item.attendeeName.trim().length > 0) {
    return item.attendeeName;
  }

  const fullName = `${item.clientFirstName}${item.clientLastName ? ` ${item.clientLastName}` : ''}`.trim();
  return fullName || 'Клієнт';
}

function formatDateTimeRange(startAt: Date, endAt: Date): string {
  const date = startAt.toLocaleDateString('uk-UA');
  const startTime = startAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  const endTime = endAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
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
export function formatAdminMastersCatalogText(masters: MasterCatalogItem[]): string {
  if (masters.length === 0) {
    return (
      '👩‍🎨 Майстри студії\n' +
      '━━━━━━━━━━━━━━\n\n' +
      'Поки що немає активних майстрів.\n' +
      'Додайте майстра або активуйте існуючий профіль.'
    );
  }

  return (
    '👩‍🎨 Майстри студії\n' +
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
): ReturnType<typeof Markup.inlineKeyboard> {
  const rows = masters.map((master, index) => [
    Markup.button.callback(
      `${getNumberBadge(index)} 👩‍🎨 ${master.displayName}`,
      makeAdminPanelMastersOpenAction(master.userId),
    ),
  ]);

  return Markup.inlineKeyboard([
    ...rows,
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.MASTERS_BACK, ADMIN_PANEL_ACTION.MASTERS_BACK)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.HOME, ADMIN_PANEL_ACTION.HOME)],
  ]);
}

/**
 * @summary Форматує деталі профілю майстра у адмін-панелі.
 */
export function formatAdminMasterDetailsText(details: MasterCatalogDetails): string {
  const specializations =
    details.specializations.length > 0
      ? details.specializations.map(formatSpecializationLine).join('\n')
      : '• Послуги ще не призначені';

  const weeklySchedule =
    details.weeklySchedule.length > 0
      ? details.weeklySchedule
          .slice()
          .sort((a, b) => a.weekday - b.weekday)
          .map((item) => `• ${formatWeekdayLabel(item.weekday)}: ${formatWorkingRange(item)}`)
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
): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.MASTERS_OPEN_BOOKINGS,
        makeAdminPanelMastersOpenBookingsAction(masterId),
      ),
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.MASTERS_OPEN_STATS,
        makeAdminPanelMastersOpenStatsAction(masterId),
      ),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.MASTERS_BACK_TO_LIST, ADMIN_PANEL_ACTION.MASTERS_BACK_TO_LIST)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.MASTERS_BACK, ADMIN_PANEL_ACTION.MASTERS_BACK)],
  ]);
}

/**
 * @summary Текст списку записів конкретного майстра.
 */
export function formatAdminMasterBookingsFeedText(
  masterName: string,
  page: AdminBookingsFeedPage,
): string {
  if (page.items.length === 0) {
    return (
      '📅 Записи майстра\n' +
      '━━━━━━━━━━━━━━\n\n' +
      `👩‍🎨 Майстер: ${masterName}\n\n` +
      '📭 У майстра поки немає записів.'
    );
  }

  const lines = page.items.map((item, index) => {
    return (
      `${getNumberBadge(index + page.offset)}\n\n` +
      `👤 ${formatClientDisplayName(item)}\n` +
      `💼 ${item.serviceName}\n` +
      `🕒 ${formatDateTimeRange(item.startAt, item.endAt)}\n` +
      `💰 ${formatPrice(item.priceAmount, item.currencyCode)}\n` +
      `${formatBookingStatusLabel(item.status)}`
    );
  });

  const pageNumber = Math.floor(page.offset / page.limit) + 1;
  const totalPages = Math.max(1, Math.ceil(page.total / page.limit));

  return (
    '📅 Записи майстра\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👩‍🎨 Майстер: ${masterName}\n\n` +
    `${lines.join('\n\n⸻\n\n')}\n\n` +
    `📄 Сторінка ${pageNumber} з ${totalPages}`
  );
}

/**
 * @summary Клавіатура списку записів майстра.
 */
export function createAdminMasterBookingsFeedKeyboard(
  page: AdminBookingsFeedPage,
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
        ADMIN_PANEL_BUTTON_TEXT.RECORDS_PREV_PAGE,
        ADMIN_PANEL_ACTION.MASTERS_BOOKINGS_PREV_PAGE,
      ),
    );
  }
  if (page.hasNextPage) {
    paginationRow.push(
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.RECORDS_NEXT_PAGE,
        ADMIN_PANEL_ACTION.MASTERS_BOOKINGS_NEXT_PAGE,
      ),
    );
  }

  return Markup.inlineKeyboard([
    ...numberRows,
    ...(paginationRow.length > 0 ? [paginationRow] : []),
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.MASTERS_BOOKINGS_BACK_TO_MASTER,
        ADMIN_PANEL_ACTION.MASTERS_BOOKINGS_BACK_TO_MASTER,
      ),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.MASTERS_BACK_TO_LIST, ADMIN_PANEL_ACTION.MASTERS_BACK_TO_LIST)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.MASTERS_BACK, ADMIN_PANEL_ACTION.MASTERS_BACK)],
  ]);
}

/**
 * @summary Текст детальної картки запису в контексті конкретного майстра.
 */
export function formatAdminMasterBookingCardText(item: AdminBookingItem): string {
  const comment = item.clientComment?.trim();
  const commentBlock = comment ? `\n\n📝 Коментар клієнта:\n${comment}` : '';

  return (
    '📄 Картка запису\n' +
    '━━━━━━━━━━━━━━\n\n' +
    `👤 Клієнт: ${formatClientDisplayName(item)}\n` +
    `📱 Телефон: ${item.attendeePhoneE164 ?? 'Не вказано'}\n` +
    `✉️ Email: ${item.attendeeEmail ?? 'Не вказано'}\n\n` +
    `💼 Послуга: ${item.serviceName}\n` +
    `👩‍🎨 Майстер: ${item.masterName}\n` +
    `🕒 Час: ${formatDateTimeRange(item.startAt, item.endAt)}\n` +
    `💰 Ціна: ${formatPrice(item.priceAmount, item.currencyCode)}\n` +
    `📌 Статус: ${formatBookingStatusLabel(item.status)}` +
    commentBlock
  );
}

/**
 * @summary Клавіатура картки запису майстра (read-only).
 */
export function createAdminMasterBookingCardKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.RECORDS_BACK_TO_LIST,
        ADMIN_PANEL_ACTION.MASTERS_BOOKINGS_BACK_TO_LIST,
      ),
    ],
    [
      Markup.button.callback(
        ADMIN_PANEL_BUTTON_TEXT.MASTERS_BOOKINGS_BACK_TO_MASTER,
        ADMIN_PANEL_ACTION.MASTERS_BOOKINGS_BACK_TO_MASTER,
      ),
    ],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.MASTERS_BACK_TO_LIST, ADMIN_PANEL_ACTION.MASTERS_BACK_TO_LIST)],
    [Markup.button.callback(ADMIN_PANEL_BUTTON_TEXT.MASTERS_BACK, ADMIN_PANEL_ACTION.MASTERS_BACK)],
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
