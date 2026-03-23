import type {
  CancelMasterPendingBookingInput,
  ConfirmMasterPendingBookingInput,
  ListMasterPendingBookingsInput,
  MasterPendingBookingItem,
  MasterPendingBookingRow,
} from '../../types/db-helpers/db-master-bookings.types.js';
import { queryMany, queryOne, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import {
  SQL_CANCEL_MASTER_PENDING_BOOKING,
  SQL_CONFIRM_MASTER_PENDING_BOOKING,
  SQL_LIST_MASTER_PENDING_BOOKINGS,
} from '../db-sql/db-master-bookings.sql.js';

/**
 * @file db-master-bookings.helper.ts
 * @summary DB helper для блоку записів у панелі майстра (pending queue).
 */

const DEFAULT_PENDING_LIMIT = 20;
const MAX_PENDING_LIMIT = 50;

function normalizePositiveBigintId(value: string | number, fieldName: string): string {
  const normalized = String(value).trim();
  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError(`Некоректний ${fieldName}`, { [fieldName]: value });
  }
  return normalized;
}

function normalizePendingLimit(limit?: number): number {
  if (limit == null || !Number.isFinite(limit)) {
    return DEFAULT_PENDING_LIMIT;
  }

  const normalized = Math.trunc(limit);
  if (normalized < 1) return DEFAULT_PENDING_LIMIT;
  if (normalized > MAX_PENDING_LIMIT) return MAX_PENDING_LIMIT;
  return normalized;
}

function mapMasterPendingBookingRow(row: MasterPendingBookingRow): MasterPendingBookingItem {
  return {
    appointmentId: row.appointment_id,
    clientId: row.client_id,
    status: row.status,
    startAt: new Date(row.start_at),
    endAt: new Date(row.end_at),
    priceAmount: row.price_amount,
    currencyCode: row.currency_code,
    attendeeName: row.attendee_name,
    attendeePhoneE164: row.attendee_phone_e164,
    attendeeEmail: row.attendee_email,
    clientFirstName: row.client_first_name,
    clientLastName: row.client_last_name,
    clientTelegramUsername: row.client_telegram_username,
    clientComment: row.client_comment,
    serviceName: row.service_name,
    studioName: row.studio_name,
    masterName: row.master_name,
  };
}

/**
 * @summary Повертає список нових записів майстра зі статусом `pending`.
 */
export async function listMasterPendingBookings(
  input: ListMasterPendingBookingsInput,
): Promise<MasterPendingBookingItem[]> {
  const masterId = normalizePositiveBigintId(input.masterId, 'masterId');
  const limit = normalizePendingLimit(input.limit);

  try {
    return await withTransaction(async (client) =>
      queryMany<MasterPendingBookingRow, MasterPendingBookingItem>(
        SQL_LIST_MASTER_PENDING_BOOKINGS,
        [masterId, limit],
        mapMasterPendingBookingRow,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-bookings.helper',
      action: 'Failed to list master pending bookings',
      error,
      meta: { masterId, limit },
    });
    throw error;
  }
}

/**
 * @summary Підтверджує pending-запис майстра і повертає оновлену картку запису.
 */
export async function confirmMasterPendingBooking(
  input: ConfirmMasterPendingBookingInput,
): Promise<MasterPendingBookingItem> {
  const masterId = normalizePositiveBigintId(input.masterId, 'masterId');
  const appointmentId = normalizePositiveBigintId(input.appointmentId, 'appointmentId');

  try {
    const result = await withTransaction(async (client) =>
      queryOne<MasterPendingBookingRow, MasterPendingBookingItem>(
        SQL_CONFIRM_MASTER_PENDING_BOOKING,
        [appointmentId, masterId],
        mapMasterPendingBookingRow,
        client,
      ),
    );

    if (!result) {
      throw new ValidationError(
        'Запис не можна підтвердити. Можливо, його вже оброблено або видалено.',
        { masterId, appointmentId },
      );
    }

    return result;
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-bookings.helper',
      action: 'Failed to confirm master pending booking',
      error,
      meta: { masterId, appointmentId },
    });
    throw error;
  }
}

/**
 * @summary Скасовує pending-запис майстра і повертає оновлену картку запису.
 */
export async function cancelMasterPendingBooking(
  input: CancelMasterPendingBookingInput,
): Promise<MasterPendingBookingItem> {
  const masterId = normalizePositiveBigintId(input.masterId, 'masterId');
  const appointmentId = normalizePositiveBigintId(input.appointmentId, 'appointmentId');
  const cancelReason = input.cancelReason?.trim() || 'Скасовано майстром через Telegram-бота';

  try {
    const result = await withTransaction(async (client) =>
      queryOne<MasterPendingBookingRow, MasterPendingBookingItem>(
        SQL_CANCEL_MASTER_PENDING_BOOKING,
        [appointmentId, masterId, cancelReason],
        mapMasterPendingBookingRow,
        client,
      ),
    );

    if (!result) {
      throw new ValidationError(
        'Запис не можна скасувати. Можливо, його вже оброблено або видалено.',
        { masterId, appointmentId },
      );
    }

    return result;
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-bookings.helper',
      action: 'Failed to cancel master pending booking',
      error,
      meta: { masterId, appointmentId },
    });
    throw error;
  }
}

