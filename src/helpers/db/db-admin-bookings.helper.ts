import type {
  AdminBookingFeedRow,
  AdminBookingItem,
  AdminBookingRow,
  AdminBookingsCategory,
  AdminBookingsFeedPage,
  BookingConflictRow,
  CancelAdminBookingInput,
  ClearCanceledAdminBookingsInput,
  ConfirmAdminPendingBookingInput,
  DeletedCountRow,
  GetAdminBookingCardByIdInput,
  HardDeleteAdminBookingInput,
  InsertedAppointmentIdRow,
  ListAdminBookingsFeedInput,
  MasterScheduleAvailabilityRow,
  ReassignAdminBookingMasterInput,
  RescheduleAdminBookingInput,
  RescheduleAdminBookingResult,
} from '../../types/db-helpers/db-admin-bookings.types.js';
import { executeOne, executeVoid, queryMany, queryOne, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import {
  SQL_CANCEL_ADMIN_BOOKING,
  SQL_CHECK_APPOINTMENT_CONFLICT_EXCLUDING_ID,
  SQL_CONFIRM_ADMIN_PENDING_BOOKING,
  SQL_CLEAR_CANCELED_ADMIN_BOOKINGS,
  SQL_GET_ADMIN_BOOKING_FOR_RESCHEDULE,
  SQL_GET_ADMIN_BOOKING_CARD_BY_ID,
  SQL_HARD_DELETE_ADMIN_BOOKING,
  SQL_INSERT_APPOINTMENT_TRANSFER_LINK,
  SQL_INSERT_RESCHEDULED_APPOINTMENT,
  SQL_LIST_ADMIN_BOOKINGS_FEED,
  SQL_MARK_ADMIN_APPOINTMENT_AS_TRANSFERRED,
  SQL_REASSIGN_ADMIN_BOOKING_MASTER,
} from '../db-sql/db-admin-bookings.sql.js';
import { SQL_CHECK_MASTER_WORK_SCHEDULE_AT_SLOT } from '../db-sql/db-booking.sql.js';

/**
 * @file db-admin-bookings.helper.ts
 * @summary DB helper для блоку записів адмін-панелі.
 */

const DEFAULT_FEED_LIMIT = 5;
const MAX_FEED_LIMIT = 20;

type AdminBookingForRescheduleRow = AdminBookingRow & {
  studio_timezone: string;
  booked_for_user_id: string | null;
  source: 'telegram_bot' | 'admin_panel' | 'master_panel';
  internal_comment: string | null;
  created_by: string | null;
};

function normalizePositiveBigintId(value: string | number, fieldName: string): string {
  const normalized = String(value).trim();
  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError(`Некоректний ${fieldName}`, { [fieldName]: value });
  }
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

function normalizeOptionalMasterId(masterId?: string | number | null): string | null {
  if (masterId == null) return null;
  return normalizePositiveBigintId(masterId, 'masterId');
}

function normalizeBookingsCategory(category: AdminBookingsCategory): AdminBookingsCategory {
  if (
    category === 'pending' ||
    category === 'today' ||
    category === 'tomorrow' ||
    category === 'all' ||
    category === 'canceled'
  ) {
    return category;
  }

  throw new ValidationError('Некоректна категорія записів', { category });
}

function mapAdminBookingRow(row: AdminBookingRow): AdminBookingItem {
  return {
    appointmentId: row.appointment_id,
    studioId: row.studio_id,
    clientId: row.client_id,
    masterId: row.master_id,
    serviceId: row.service_id,
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
 * @summary Повертає сторінку записів студії за категорією.
 */
export async function listAdminBookingsFeed(
  input: ListAdminBookingsFeedInput,
): Promise<AdminBookingsFeedPage> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const category = normalizeBookingsCategory(input.category);
  const masterId = normalizeOptionalMasterId(input.masterId);
  const limit = normalizeFeedLimit(input.limit);
  const offset = normalizeOffset(input.offset);

  try {
    const rows = await withTransaction(async (client) =>
      queryMany<AdminBookingFeedRow, AdminBookingFeedRow>(
        SQL_LIST_ADMIN_BOOKINGS_FEED,
        [studioId, category, limit, offset, masterId],
        (row) => row,
        client,
      ),
    );

    const total = rows.length > 0 ? rows[0].total_count : 0;
    const items = rows.map((row) => mapAdminBookingRow(row));

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
      scope: 'db-admin-bookings.helper',
      action: 'Failed to list admin bookings feed',
      error,
      meta: { studioId, category, masterId, limit, offset },
    });
    throw error;
  }
}

/**
 * @summary Повертає картку конкретного запису студії за id.
 */
export async function getAdminBookingCardById(
  input: GetAdminBookingCardByIdInput,
): Promise<AdminBookingItem | null> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const appointmentId = normalizePositiveBigintId(input.appointmentId, 'appointmentId');

  try {
    return await withTransaction(async (client) =>
      queryOne<AdminBookingRow, AdminBookingItem>(
        SQL_GET_ADMIN_BOOKING_CARD_BY_ID,
        [appointmentId, studioId],
        mapAdminBookingRow,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-bookings.helper',
      action: 'Failed to get admin booking card by id',
      error,
      meta: { studioId, appointmentId },
    });
    throw error;
  }
}

/**
 * @summary Підтверджує pending-запис у студії від імені адміністратора.
 */
export async function confirmAdminPendingBooking(
  input: ConfirmAdminPendingBookingInput,
): Promise<AdminBookingItem> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const actorUserId = normalizePositiveBigintId(input.actorUserId, 'actorUserId');
  const appointmentId = normalizePositiveBigintId(input.appointmentId, 'appointmentId');

  try {
    const result = await withTransaction(async (client) =>
      queryOne<AdminBookingRow, AdminBookingItem>(
        SQL_CONFIRM_ADMIN_PENDING_BOOKING,
        [appointmentId, studioId, actorUserId],
        mapAdminBookingRow,
        client,
      ),
    );

    if (!result) {
      throw new ValidationError(
        'Запис не можна підтвердити. Можливо, його вже оброблено або видалено.',
        { studioId, appointmentId },
      );
    }

    return result;
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-bookings.helper',
      action: 'Failed to confirm admin pending booking',
      error,
      meta: { studioId, actorUserId, appointmentId },
    });
    throw error;
  }
}

/**
 * @summary Скасовує pending/confirmed-запис у студії від імені адміністратора.
 */
export async function cancelAdminBooking(
  input: CancelAdminBookingInput,
) : Promise<AdminBookingItem> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const actorUserId = normalizePositiveBigintId(input.actorUserId, 'actorUserId');
  const appointmentId = normalizePositiveBigintId(input.appointmentId, 'appointmentId');
  const cancelReason = input.cancelReason?.trim() || 'Скасовано адміністратором через Telegram-бота';

  try {
    const result = await withTransaction(async (client) =>
      queryOne<AdminBookingRow, AdminBookingItem>(
        SQL_CANCEL_ADMIN_BOOKING,
        [appointmentId, studioId, actorUserId, cancelReason],
        mapAdminBookingRow,
        client,
      ),
    );

    if (!result) {
      throw new ValidationError(
        'Запис не можна скасувати. Можливо, його вже оброблено або видалено.',
        { studioId, appointmentId },
      );
    }

    return result;
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-bookings.helper',
      action: 'Failed to cancel admin booking',
      error,
      meta: { studioId, actorUserId, appointmentId },
    });
    throw error;
  }
}

/**
 * @summary Видаляє запис назавжди (hard-delete) для скасованого/завершеного/перенесеного статусу.
 */
export async function hardDeleteAdminBooking(input: HardDeleteAdminBookingInput): Promise<boolean> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const appointmentId = normalizePositiveBigintId(input.appointmentId, 'appointmentId');

  try {
    const deleted = await withTransaction(async (client) =>
      executeOne<{ id: string }, { id: string }>(
        SQL_HARD_DELETE_ADMIN_BOOKING,
        [appointmentId, studioId],
        (row) => ({ id: row.id }),
        client,
      ),
    );

    return Boolean(deleted);
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-bookings.helper',
      action: 'Failed to hard delete admin booking',
      error,
      meta: { studioId, appointmentId },
    });
    throw error;
  }
}

/**
 * @summary Очищає всі скасовані записи студії (hard-delete).
 */
export async function clearCanceledAdminBookings(
  input: ClearCanceledAdminBookingsInput,
): Promise<number> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');

  try {
    return await withTransaction(async (client) => {
      const row = await queryOne<DeletedCountRow, number>(
        SQL_CLEAR_CANCELED_ADMIN_BOOKINGS,
        [studioId],
        (result) => result.deleted_count,
        client,
      );

      return row ?? 0;
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-bookings.helper',
      action: 'Failed to clear canceled admin bookings',
      error,
      meta: { studioId },
    });
    throw error;
  }
}

/**
 * @summary Переносить pending/confirmed-запис у студії від імені адміністратора.
 */
export async function rescheduleAdminBooking(
  input: RescheduleAdminBookingInput,
): Promise<RescheduleAdminBookingResult> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const actorUserId = normalizePositiveBigintId(input.actorUserId, 'actorUserId');
  const appointmentId = normalizePositiveBigintId(input.appointmentId, 'appointmentId');
  const newStartAt = normalizeFutureDate(input.newStartAt, 'newStartAt');
  const reason = input.reason?.trim() || 'Перенесено адміністратором через Telegram-бота';

  try {
    return await withTransaction(async (client) => {
      const source = await queryOne<AdminBookingForRescheduleRow, AdminBookingForRescheduleRow>(
        SQL_GET_ADMIN_BOOKING_FOR_RESCHEDULE,
        [appointmentId, studioId],
        (row) => row,
        client,
      );

      if (!source) {
        throw new ValidationError(
          'Запис не знайдено або його вже оброблено. Оновіть список записів.',
          { studioId, appointmentId },
        );
      }

      const previous = mapAdminBookingRow(source);
      const durationMs = new Date(source.end_at).getTime() - new Date(source.start_at).getTime();
      if (durationMs <= 0) {
        throw new ValidationError('Некоректна тривалість запису для перенесення', {
          appointmentId,
          startAt: source.start_at,
          endAt: source.end_at,
        });
      }

      const newEndAt = new Date(newStartAt.getTime() + durationMs);

      if (newStartAt.getTime() === new Date(source.start_at).getTime()) {
        throw new ValidationError('Новий час збігається з поточним. Оберіть інший слот.');
      }

      const scheduleAvailability = await queryOne<
        MasterScheduleAvailabilityRow,
        MasterScheduleAvailabilityRow
      >(
        SQL_CHECK_MASTER_WORK_SCHEDULE_AT_SLOT,
        [source.master_id, newStartAt.toISOString(), newEndAt.toISOString(), source.studio_timezone],
        (row) => row,
        client,
      );

      if (!scheduleAvailability?.is_available) {
        throw new ValidationError('Майстер недоступний на обраний час за графіком роботи', {
          appointmentId,
          masterId: source.master_id,
          reason: scheduleAvailability?.reason_code ?? 'unknown',
        });
      }

      const conflict = await queryOne<BookingConflictRow, BookingConflictRow>(
        SQL_CHECK_APPOINTMENT_CONFLICT_EXCLUDING_ID,
        [source.master_id, newStartAt.toISOString(), newEndAt.toISOString(), appointmentId],
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
          source.master_id,
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
          source.created_by ?? source.client_id,
          actorUserId,
        ],
        (row) => row.id,
        client,
      );

      const transferredSourceId = await queryOne<{ id: string }, string>(
        SQL_MARK_ADMIN_APPOINTMENT_AS_TRANSFERRED,
        [appointmentId, studioId, actorUserId],
        (row) => row.id,
        client,
      );

      if (!transferredSourceId) {
        throw new ValidationError('Не вдалося зафіксувати перенесення запису. Спробуйте ще раз.', {
          appointmentId,
          studioId,
        });
      }

      await executeVoid(
        SQL_INSERT_APPOINTMENT_TRANSFER_LINK,
        [appointmentId, inserted, actorUserId, reason],
        client,
      );

      const current = await queryOne<AdminBookingRow, AdminBookingItem>(
        SQL_GET_ADMIN_BOOKING_CARD_BY_ID,
        [inserted, studioId],
        mapAdminBookingRow,
        client,
      );

      if (!current) {
        throw new ValidationError('Не вдалося завантажити новий запис після перенесення', {
          appointmentId,
          newAppointmentId: inserted,
          studioId,
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
      scope: 'db-admin-bookings.helper',
      action: 'Failed to reschedule admin booking',
      error,
      meta: {
        studioId,
        actorUserId,
        appointmentId,
        newStartAt: newStartAt.toISOString(),
      },
    });
    throw error;
  }
}

/**
 * @summary Змінює майстра для pending/confirmed-запису у студії.
 */
export async function reassignAdminBookingMaster(
  input: ReassignAdminBookingMasterInput,
): Promise<AdminBookingItem> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const actorUserId = normalizePositiveBigintId(input.actorUserId, 'actorUserId');
  const appointmentId = normalizePositiveBigintId(input.appointmentId, 'appointmentId');
  const newMasterId = normalizePositiveBigintId(input.newMasterId, 'newMasterId');

  try {
    return await withTransaction(async (client) => {
      const source = await queryOne<AdminBookingForRescheduleRow, AdminBookingForRescheduleRow>(
        SQL_GET_ADMIN_BOOKING_FOR_RESCHEDULE,
        [appointmentId, studioId],
        (row) => row,
        client,
      );

      if (!source) {
        throw new ValidationError('Запис не знайдено або його вже оброблено.', {
          studioId,
          appointmentId,
        });
      }

      if (source.master_id === newMasterId) {
        throw new ValidationError('Обрано того самого майстра. Виберіть іншого.');
      }

      const startAt = new Date(source.start_at);
      const endAt = new Date(source.end_at);

      const scheduleAvailability = await queryOne<
        MasterScheduleAvailabilityRow,
        MasterScheduleAvailabilityRow
      >(
        SQL_CHECK_MASTER_WORK_SCHEDULE_AT_SLOT,
        [newMasterId, startAt.toISOString(), endAt.toISOString(), source.studio_timezone],
        (row) => row,
        client,
      );

      if (!scheduleAvailability?.is_available) {
        throw new ValidationError('Новий майстер недоступний на цей час за графіком роботи', {
          appointmentId,
          newMasterId,
          reason: scheduleAvailability?.reason_code ?? 'unknown',
        });
      }

      const conflict = await queryOne<BookingConflictRow, BookingConflictRow>(
        SQL_CHECK_APPOINTMENT_CONFLICT_EXCLUDING_ID,
        [newMasterId, startAt.toISOString(), endAt.toISOString(), appointmentId],
        (row) => row,
        client,
      );

      if (conflict?.has_conflict) {
        throw new ValidationError('У нового майстра цей слот уже зайнятий.');
      }

      const updated = await queryOne<AdminBookingRow, AdminBookingItem>(
        SQL_REASSIGN_ADMIN_BOOKING_MASTER,
        [appointmentId, studioId, newMasterId, actorUserId],
        mapAdminBookingRow,
        client,
      );

      if (!updated) {
        throw new ValidationError('Не вдалося змінити майстра для цього запису.', {
          appointmentId,
          studioId,
          newMasterId,
        });
      }

      return updated;
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-bookings.helper',
      action: 'Failed to reassign admin booking master',
      error,
      meta: {
        studioId,
        actorUserId,
        appointmentId,
        newMasterId,
      },
    });
    throw error;
  }
}
