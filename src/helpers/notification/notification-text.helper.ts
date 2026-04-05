import type { NotificationType } from '../../types/db/dbEnums.type.js';
import type { LanguageCode } from '../../types/db/dbEnums.type.js';
import type { NotificationTextPayload } from '../../types/notification-dispatch.types.js';

/**
 * @file notification-text.helper.ts
 * @summary Форматування дефолтного тексту для Telegram-сповіщень.
 */

const DEFAULT_TIMEZONE = 'Europe/Prague';

const LOCALE_BY_LANGUAGE: Record<LanguageCode, string> = {
  uk: 'uk-UA',
  en: 'en-US',
  cs: 'cs-CZ',
};

function resolveLanguage(language?: LanguageCode): LanguageCode {
  if (language === 'en' || language === 'cs') return language;
  return 'uk';
}

function formatDateTime(value?: Date | string, language?: LanguageCode): string | null {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(LOCALE_BY_LANGUAGE[resolveLanguage(language)], {
    timeZone: DEFAULT_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function composeHeader(notificationType: NotificationType, language: LanguageCode): string {
  if (language === 'en') {
    if (notificationType === 'booking_confirmation') return '✅ Booking confirmation';
    if (notificationType === 'status_change') return '🔄 Booking status update';
    if (notificationType === 'visit_reminder') return '⏰ Visit reminder';
    return '📢 News and promotions';
  }

  if (language === 'cs') {
    if (notificationType === 'booking_confirmation') return '✅ Potvrzení rezervace';
    if (notificationType === 'status_change') return '🔄 Aktualizace stavu rezervace';
    if (notificationType === 'visit_reminder') return '⏰ Připomínka návštěvy';
    return '📢 Novinky a akce';
  }

  if (notificationType === 'booking_confirmation') return '✅ Підтвердження запису';
  if (notificationType === 'status_change') return '🔄 Оновлення статусу запису';
  if (notificationType === 'visit_reminder') return '⏰ Нагадування про візит';
  return '📢 Новини та акції';
}

/**
 * @summary Будує дефолтний текст Telegram-сповіщення на випадок, якщо явний `telegramText` не переданий.
 */
export function buildNotificationTelegramText(
  notificationType: NotificationType,
  payload: NotificationTextPayload = {},
  languageInput?: LanguageCode,
): string {
  const language = resolveLanguage(languageInput);
  const lines: string[] = [];

  lines.push(composeHeader(notificationType, language));
  lines.push('━━━━━━━━━━━━━━');

  if (payload.studioName) {
    lines.push(
      language === 'en'
        ? `🏢 Studio: ${payload.studioName}`
        : language === 'cs'
          ? `🏢 Studio: ${payload.studioName}`
          : `🏢 Салон: ${payload.studioName}`,
    );
  }

  if (payload.serviceName) {
    lines.push(
      language === 'en'
        ? `💅 Service: ${payload.serviceName}`
        : language === 'cs'
          ? `💅 Služba: ${payload.serviceName}`
          : `💅 Послуга: ${payload.serviceName}`,
    );
  }

  const startAt = formatDateTime(payload.startAt, language);
  if (startAt) {
    lines.push(
      language === 'en'
        ? `🗓 Date and time: ${startAt}`
        : language === 'cs'
          ? `🗓 Datum a čas: ${startAt}`
          : `🗓 Дата і час: ${startAt}`,
    );
  }

  if (payload.statusLabel) {
    lines.push(
      language === 'en'
        ? `📍 Status: ${payload.statusLabel}`
        : language === 'cs'
          ? `📍 Stav: ${payload.statusLabel}`
          : `📍 Статус: ${payload.statusLabel}`,
    );
  }

  if (payload.message) {
    lines.push('');
    lines.push(payload.message);
  } else {
    if (notificationType === 'booking_confirmation') {
      lines.push(
        language === 'en'
          ? 'Your booking is confirmed. We look forward to seeing you at the studio ✨'
          : language === 'cs'
            ? 'Vaše rezervace je potvrzena. Těšíme se na vás ve studiu ✨'
            : 'Ваш запис підтверджено. Очікуємо вас у салоні ✨',
      );
    } else if (notificationType === 'visit_reminder') {
      lines.push(
        language === 'en'
          ? 'A reminder about your upcoming visit.'
          : language === 'cs'
            ? 'Připomínáme vaši blížící se návštěvu.'
            : 'Нагадуємо про ваш візит найближчим часом.',
      );
    } else if (notificationType === 'status_change') {
      lines.push(
        language === 'en'
          ? 'The status of your booking has been updated.'
          : language === 'cs'
            ? 'Stav vaší rezervace byl aktualizován.'
            : 'Статус вашого запису було оновлено.',
      );
    } else {
      lines.push(
        language === 'en'
          ? 'You have news from our studio.'
          : language === 'cs'
            ? 'Máme pro vás novinky ze studia.'
            : 'Для вас є новини від нашого салону.',
      );
    }
  }

  return lines.join('\n');
}
