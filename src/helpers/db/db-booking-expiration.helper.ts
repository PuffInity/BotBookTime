import type {
  ExpirePendingBookingsInput,
  ExpiredPendingBookingItem,
  ExpiredPendingBookingRow,
} from '../../types/db-helpers/db-booking-expiration.types.js';
import { queryMany, withTransaction } from '../db.helper.js';
import { handleError, ValidationError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import { SQL_EXPIRE_PENDING_APPOINTMENTS } from '../db-sql/db-booking-expiration.sql.js';

/**
 * @file db-booking-expiration.helper.ts
 * @summary DB helper для автоматичного скасування прострочених pending-бронювань.
 */

const DEFAULT_BATCH_LIMIT = 50;
const MAX_BATCH_LIMIT = 500;
const DEFAULT_CANCEL_REASON = 'Скасовано автоматично (прострочений): запис не було підтверджено до часу візиту.';

/**
 * uk: Внутрішній helper метод normalizeBatchLimit.
 * en: Internal helper method normalizeBatchLimit.
 * cz: Interní helper metoda normalizeBatchLimit.
 */
function normalizeBatchLimit(limit?: number): number {
  if (limit == null || !Number.isFinite(limit)) return DEFAULT_BATCH_LIMIT;

  const normalized = Math.trunc(limit);
  if (normalized < 1) return DEFAULT_BATCH_LIMIT;
  if (normalized > MAX_BATCH_LIMIT) return MAX_BATCH_LIMIT;
  return normalized;
}

/**
 * uk: Внутрішній helper метод normalizeCancelReason.
 * en: Internal helper method normalizeCancelReason.
 * cz: Interní helper metoda normalizeCancelReason.
 */
function normalizeCancelReason(reason?: string): string {
  const normalized = (reason ?? '').trim();
  if (!normalized) return DEFAULT_CANCEL_REASON;
  if (normalized.length > 500) {
    throw new ValidationError('cancelReason занадто довгий (максимум 500 символів)');
  }
  return normalized;
}

/**
 * uk: Внутрішній helper метод mapExpiredPendingRow.
 * en: Internal helper method mapExpiredPendingRow.
 * cz: Interní helper metoda mapExpiredPendingRow.
 */
function mapExpiredPendingRow(row: ExpiredPendingBookingRow): ExpiredPendingBookingItem {
  return {
    appointmentId: row.appointment_id,
    clientId: row.client_id,
    startAt: new Date(row.start_at),
    recipientName: row.recipient_name,
    recipientEmail: row.recipient_email,
    preferredLanguage: row.preferred_language,
    studioName: row.studio_name,
    serviceName: row.service_name,
    masterName: row.master_name,
  };
}

/**
 * @summary Скасовує прострочені pending-бронювання (start_at <= now) і повертає змінені записи.
 */
export async function expirePendingBookings(
  input: ExpirePendingBookingsInput = {},
): Promise<ExpiredPendingBookingItem[]> {
  const limit = normalizeBatchLimit(input.limit);
  const cancelReason = normalizeCancelReason(input.cancelReason);

  try {
    return await withTransaction(async (client) =>
      queryMany<ExpiredPendingBookingRow, ExpiredPendingBookingItem>(
        SQL_EXPIRE_PENDING_APPOINTMENTS,
        [limit, cancelReason],
        mapExpiredPendingRow,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-booking-expiration.helper',
      action: 'Failed to expire pending bookings',
      error,
      meta: { limit },
    });
    throw error;
  }
}
