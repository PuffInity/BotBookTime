import type { NotificationType } from '../../types/db/dbEnums.type.js';
import type { NotificationTextPayload } from '../../types/notification-dispatch.types.js';

/**
 * @file notification-text.helper.ts
 * @summary Форматування дефолтного тексту для Telegram-сповіщень.
 */

const DEFAULT_TIMEZONE = 'Europe/Prague';
const DEFAULT_LOCALE = 'uk-UA';

function formatDateTime(value?: Date | string): string | null {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    timeZone: DEFAULT_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function composeHeader(notificationType: NotificationType): string {
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
): string {
  const lines: string[] = [];

  lines.push(composeHeader(notificationType));
  lines.push('━━━━━━━━━━━━━━');

  if (payload.studioName) {
    lines.push(`🏢 Салон: ${payload.studioName}`);
  }

  if (payload.serviceName) {
    lines.push(`💅 Послуга: ${payload.serviceName}`);
  }

  const startAt = formatDateTime(payload.startAt);
  if (startAt) {
    lines.push(`🗓 Дата і час: ${startAt}`);
  }

  if (payload.statusLabel) {
    lines.push(`📍 Статус: ${payload.statusLabel}`);
  }

  if (payload.message) {
    lines.push('');
    lines.push(payload.message);
  } else {
    if (notificationType === 'booking_confirmation') {
      lines.push('Ваш запис підтверджено. Очікуємо вас у салоні ✨');
    } else if (notificationType === 'visit_reminder') {
      lines.push('Нагадуємо про ваш візит найближчим часом.');
    } else if (notificationType === 'status_change') {
      lines.push('Статус вашого запису було оновлено.');
    } else {
      lines.push('Для вас є новини від нашого салону.');
    }
  }

  return lines.join('\n');
}
