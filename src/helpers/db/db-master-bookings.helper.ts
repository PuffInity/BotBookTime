import type {
  GetMasterBookingCardByIdInput,
  CancelMasterPendingBookingInput,
  BookingConflictRow,
  ConfirmMasterPendingBookingInput,
  InsertedAppointmentIdRow,
  ListMasterBookingsFeedInput,
  ListMasterPendingBookingsInput,
  MasterBookingFeedRow,
  MasterBookingsFeedPage,
  MasterPendingBookingForRescheduleRow,
  MasterPendingBookingItem,
  MasterPendingBookingRow,
  MasterScheduleAvailabilityRow,
  RescheduleMasterPendingBookingInput,
  RescheduleMasterPendingBookingResult,
} from '../../types/db-helpers/db-master-bookings.types.js';
import { executeOne, executeVoid, queryMany, queryOne, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import {
  SQL_CHECK_APPOINTMENT_CONFLICT_EXCLUDING_ID,
  SQL_CANCEL_MASTER_PENDING_BOOKING,
  SQL_CONFIRM_MASTER_PENDING_BOOKING,
  SQL_LIST_MASTER_BOOKINGS_FEED,
  SQL_GET_MASTER_BOOKING_CARD_BY_ID,
  SQL_GET_MASTER_PENDING_BOOKING_FOR_RESCHEDULE,
  SQL_INSERT_APPOINTMENT_TRANSFER_LINK,
  SQL_INSERT_RESCHEDULED_APPOINTMENT,
  SQL_LIST_MASTER_PENDING_BOOKINGS,
  SQL_MARK_PENDING_APPOINTMENT_AS_TRANSFERRED,
} from '../db-sql/db-master-bookings.sql.js';
import { SQL_CHECK_MASTER_WORK_SCHEDULE_AT_SLOT } from '../db-sql/db-booking.sql.js';

/**
 * @file db-master-bookings.helper.ts
 * @summary DB helper для блоку записів у панелі майстра (pending queue).
 */

const DEFAULT_PENDING_LIMIT = 20;
const MAX_PENDING_LIMIT = 50;
const DEFAULT_FEED_LIMIT = 5;
const MAX_FEED_LIMIT = 20;

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

function normalizeFeedLimit(limit?: number): number {
  if (limit == null || !Number.isFinite(limit)) {
    return DEFAULT_FEED_LIMIT;
  }

  const normalized = Math.trunc(limit);
  if (normalized < 1) return DEFAULT_FEED_LIMIT;
  if (normalized > MAX_FEED_LIMIT) return MAX_FEED_LIMIT;
  return normalized;
}

function normalizeOffset(offset?: number): number {
  if (offset == null || !Number.isFinite(offset)) {
    return 0;
  }

  const normalized = Math.trunc(offset);
  if (normalized < 0) return 0;
  return normalized;
}

function normalizeFutureDate(value: Date, fieldName: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new ValidationError(`Некоректний ${fieldName}`, { [fieldName]: value });
  }

  if (value.getTime() <= Date.now()) {
    throw new ValidationError('Час візиту має бути в майбутньому', { [fieldName]: value.toISOString() });
  }

  return value;
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

function normalizeBookingsCategory(
  category: ListMasterBookingsFeedInput['category'],
): ListMasterBookingsFeedInput['category'] {
  if (category === 'today' || category === 'tomorrow' || category === 'all' || category === 'canceled') {
    return category;
  }

  throw new ValidationError('Некоректна категорія записів', { category });
}

function mapRescheduleRowToPendingItem(
  row: MasterPendingBookingForRescheduleRow,
): MasterPendingBookingItem {
  return mapMasterPendingBookingRow(row);
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
 * @summary Повертає сторінку записів майстра за категорією (`today|tomorrow|all|canceled`).
 */
export async function listMasterBookingsFeed(
  input: ListMasterBookingsFeedInput,
): Promise<MasterBookingsFeedPage> {
  const masterId = normalizePositiveBigintId(input.masterId, 'masterId');
  const category = normalizeBookingsCategory(input.category);
  const limit = normalizeFeedLimit(input.limit);
  const offset = normalizeOffset(input.offset);

  try {
    const rows = await withTransaction(async (client) =>
      queryMany<MasterBookingFeedRow, MasterBookingFeedRow>(
        SQL_LIST_MASTER_BOOKINGS_FEED,
        [masterId, category, limit, offset],
        (row) => row,
        client,
      ),
    );

    const total = rows.length > 0 ? rows[0].total_count : 0;
    const items = rows.map((row) => mapMasterPendingBookingRow(row));

    return {
      category,
      limit,
      offset,
      total,
      items,
      hasPrevPage: offset > 0,
      hasNextPage: offset + items.length < total,
    };
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-bookings.helper',
      action: 'Failed to list master bookings feed',
      error,
      meta: { masterId, category, limit, offset },
    });
    throw error;
  }
}

/**
 * @summary Повертає картку конкретного запису майстра за id.
 */
export async function getMasterBookingCardById(
  input: GetMasterBookingCardByIdInput,
): Promise<MasterPendingBookingItem | null> {
  const masterId = normalizePositiveBigintId(input.masterId, 'masterId');
  const appointmentId = normalizePositiveBigintId(input.appointmentId, 'appointmentId');

  try {
    return await withTransaction(async (client) =>
      queryOne<MasterPendingBookingRow, MasterPendingBookingItem>(
        SQL_GET_MASTER_BOOKING_CARD_BY_ID,
        [appointmentId, masterId],
        mapMasterPendingBookingRow,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-bookings.helper',
      action: 'Failed to get master booking card by id',
      error,
      meta: { masterId, appointmentId },
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

/**
 * @summary Переносить pending-запис майстра:
 * створює новий запис на новий слот, старий переводить у `transferred`,
 * і створює звʼязок у `appointment_transfers`.
 */
export async function rescheduleMasterPendingBooking(
  input: RescheduleMasterPendingBookingInput,
): Promise<RescheduleMasterPendingBookingResult> {
  const masterId = normalizePositiveBigintId(input.masterId, 'masterId');
  const appointmentId = normalizePositiveBigintId(input.appointmentId, 'appointmentId');
  const newStartAt = normalizeFutureDate(input.newStartAt, 'newStartAt');
  const reason = input.reason?.trim() || 'Перенесено майстром через Telegram-бота';

  try {
    return await withTransaction(async (client) => {
      const source = await queryOne<MasterPendingBookingForRescheduleRow, MasterPendingBookingForRescheduleRow>(
        SQL_GET_MASTER_PENDING_BOOKING_FOR_RESCHEDULE,
        [appointmentId, masterId],
        (row) => row,
        client,
      );

      if (!source) {
        throw new ValidationError(
          'Запис не знайдено або його вже оброблено. Оновіть список pending-записів.',
          { appointmentId, masterId },
        );
      }

      const previous = mapRescheduleRowToPendingItem(source);
      const durationMs = source.end_at.getTime() - source.start_at.getTime();
      if (durationMs <= 0) {
        throw new ValidationError('Некоректна тривалість запису для перенесення', {
          appointmentId,
          startAt: source.start_at,
          endAt: source.end_at,
        });
      }

      const newEndAt = new Date(newStartAt.getTime() + durationMs);

      if (newStartAt.getTime() === source.start_at.getTime()) {
        throw new ValidationError('Новий час збігається з поточним. Оберіть інший слот.');
      }

      const scheduleAvailability = await queryOne<
        MasterScheduleAvailabilityRow,
        MasterScheduleAvailabilityRow
      >(
        SQL_CHECK_MASTER_WORK_SCHEDULE_AT_SLOT,
        [masterId, newStartAt.toISOString(), newEndAt.toISOString(), source.studio_timezone],
        (row) => row,
        client,
      );

      if (!scheduleAvailability?.is_available) {
        throw new ValidationError('Майстер недоступний на обраний час за графіком роботи', {
          appointmentId,
          masterId,
          reason: scheduleAvailability?.reason_code ?? 'unknown',
        });
      }

      const conflict = await queryOne<BookingConflictRow, BookingConflictRow>(
        SQL_CHECK_APPOINTMENT_CONFLICT_EXCLUDING_ID,
        [masterId, newStartAt.toISOString(), newEndAt.toISOString(), appointmentId],
        (row) => row,
        client,
      );

      if (conflict?.has_conflict) {
        throw new ValidationError('Обраний слот зайнятий. Виберіть іншу дату або час.');
      }

      const inserted = await executeOne<InsertedAppointmentIdRow, string>(
        SQL_INSERT_RESCHEDULED_APPOINTMENT,
        [
          source.studio_id,
          source.client_id,
          source.booked_for_user_id,
          masterId,
          source.service_id,
          source.status,
          source.attendee_name,
          source.attendee_phone_e164,
          source.attendee_email,
          source.client_comment,
          source.internal_comment,
          newStartAt.toISOString(),
          newEndAt.toISOString(),
          source.price_amount,
          source.currency_code,
          source.created_by,
          masterId,
        ],
        (row) => row.id,
        client,
      );

      const transferredSourceId = await queryOne<{ id: string }, string>(
        SQL_MARK_PENDING_APPOINTMENT_AS_TRANSFERRED,
        [appointmentId, masterId],
        (row) => row.id,
        client,
      );

      if (!transferredSourceId) {
        throw new ValidationError('Не вдалося зафіксувати перенесення запису. Спробуйте ще раз.', {
          appointmentId,
          masterId,
        });
      }

      await executeVoid(
        SQL_INSERT_APPOINTMENT_TRANSFER_LINK,
        [appointmentId, inserted, masterId, reason],
        client,
      );

      const current = await queryOne<MasterPendingBookingRow, MasterPendingBookingItem>(
        SQL_GET_MASTER_BOOKING_CARD_BY_ID,
        [inserted, masterId],
        mapMasterPendingBookingRow,
        client,
      );

      if (!current) {
        throw new ValidationError('Не вдалося завантажити новий запис після перенесення', {
          appointmentId,
          newAppointmentId: inserted,
          masterId,
        });
      }

      return {
        previous,
        current,
      };
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-bookings.helper',
      action: 'Failed to reschedule master pending booking',
      error,
      meta: {
        masterId,
        appointmentId,
        newStartAt: newStartAt.toISOString(),
      },
    });
    throw error;
  }
}
