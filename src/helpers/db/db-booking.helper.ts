import type { AppointmentsEntity, AppointmentsRow } from '../../types/db/index.js';
import type {
  BookingConflictRow,
  CreatePendingBookingInput,
  CreatePendingBookingResult,
  MasterScheduleAvailabilityRow,
  MasterServiceBookingMeta,
  MasterServiceBookingMetaRow,
} from '../../types/db-helpers/db-booking.types.js';
import { appointmentsRowToEntity } from '../../utils/mappers/appointments.mapp.js';
import { executeOne, queryOne, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import {
  SQL_CHECK_APPOINTMENT_CONFLICT,
  SQL_CHECK_MASTER_WORK_SCHEDULE_AT_SLOT,
  SQL_GET_BOOKING_META_BY_MASTER_SERVICE,
  SQL_INSERT_PENDING_APPOINTMENT,
} from '../db-sql/db-booking.sql.js';

/**
 * @file db-booking.helper.ts
 * @summary DB helper модуля створення бронювання клієнта.
 */

function normalizePositiveBigintId(value: string | number, fieldName: string): string {
  const normalized = String(value).trim();

  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError(`Некоректний ${fieldName}`, { [fieldName]: value });
  }

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

function mapBookingMeta(row: MasterServiceBookingMetaRow): MasterServiceBookingMeta {
  return {
    studioId: row.studio_id,
    studioName: row.studio_name,
    studioTimezone: row.studio_timezone,
    serviceId: row.service_id,
    serviceName: row.service_name,
    masterId: row.master_id,
    masterDisplayName: row.master_display_name,
    durationMinutes: row.duration_minutes,
    priceAmount: row.price_amount,
    currencyCode: row.currency_code,
  };
}

/**
 * @summary Створює pending-бронювання клієнта після перевірки доступності слота.
 */
export async function createPendingBooking(
  input: CreatePendingBookingInput,
): Promise<CreatePendingBookingResult> {
  const clientId = normalizePositiveBigintId(input.clientId, 'clientId');
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const serviceId = normalizePositiveBigintId(input.serviceId, 'serviceId');
  const masterId = normalizePositiveBigintId(input.masterId, 'masterId');
  const attendeeName = input.attendeeName.trim();
  const attendeePhoneE164 = input.attendeePhoneE164.trim();
  const startAt = normalizeFutureDate(input.startAt, 'startAt');

  try {
    return await withTransaction(async (client) => {
      const meta = await queryOne<MasterServiceBookingMetaRow, MasterServiceBookingMeta>(
        SQL_GET_BOOKING_META_BY_MASTER_SERVICE,
        [studioId, serviceId, masterId],
        mapBookingMeta,
        client,
      );

      if (!meta) {
        throw new ValidationError('Послуга недоступна для обраного майстра', {
          studioId,
          serviceId,
          masterId,
        });
      }

      const endAt = new Date(startAt.getTime() + meta.durationMinutes * 60 * 1000);

      const scheduleAvailability = await queryOne<
        MasterScheduleAvailabilityRow,
        MasterScheduleAvailabilityRow
      >(
        SQL_CHECK_MASTER_WORK_SCHEDULE_AT_SLOT,
        [masterId, startAt.toISOString(), endAt.toISOString(), meta.studioTimezone],
        (row) => row,
        client,
      );

      if (!scheduleAvailability?.is_available) {
        throw new ValidationError('Майстер недоступний на обраний час за графіком роботи', {
          studioId,
          serviceId,
          masterId,
          reason: scheduleAvailability?.reason_code ?? 'unknown',
        });
      }

      const conflict = await queryOne<BookingConflictRow, BookingConflictRow>(
        SQL_CHECK_APPOINTMENT_CONFLICT,
        [masterId, startAt.toISOString(), endAt.toISOString()],
        (row) => row,
        client,
      );

      if (conflict?.has_conflict) {
        throw new ValidationError('Обраний час вже зайнятий. Будь ласка, виберіть інший слот.');
      }

      const appointment = await executeOne<AppointmentsRow, AppointmentsEntity>(
        SQL_INSERT_PENDING_APPOINTMENT,
        [
          studioId,
          clientId,
          masterId,
          serviceId,
          attendeeName,
          attendeePhoneE164,
          startAt.toISOString(),
          endAt.toISOString(),
          meta.priceAmount,
          meta.currencyCode,
        ],
        appointmentsRowToEntity,
        client,
      );

      return {
        appointment,
        meta,
      };
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-booking.helper',
      action: 'Failed to create pending booking',
      error,
      meta: { clientId, studioId, serviceId, masterId, startAt: startAt.toISOString() },
    });
    throw error;
  }
}
