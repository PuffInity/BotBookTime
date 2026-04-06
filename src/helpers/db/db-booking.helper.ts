import type { AppointmentsEntity, AppointmentsRow, ServicesEntity, ServicesRow } from '../../types/db/index.js';
import type {
  BookingAvailableMasterRow,
  BookingAvailableTimeCodeRow,
  BookingConflictRow,
  CreatePendingBookingInput,
  CreatePendingBookingResult,
  ListAvailableMastersForBookingSlotInput,
  ListAvailableMastersForBookingSlotResult,
  ListAvailableTimeCodesForBookingDateInput,
  ListBookableServicesForBookingInput,
  ListBookableServicesForBookingResult,
  MasterScheduleAvailabilityRow,
  MasterServiceBookingMeta,
  MasterServiceBookingMetaRow,
} from '../../types/db-helpers/db-booking.types.js';
import type { MasterBookingOption } from '../../types/db-helpers/db-masters.types.js';
import type { ServicesCatalogItem } from '../../types/db-helpers/db-services.types.js';
import { appointmentsRowToEntity } from '../../utils/mappers/appointments.mapp.js';
import { servicesRowToEntity } from '../../utils/mappers/services.mapp.js';
import { executeOne, queryMany, queryOne, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import {
  SQL_CHECK_APPOINTMENT_CONFLICT,
  SQL_CHECK_MASTER_WORK_SCHEDULE_AT_SLOT,
  SQL_GET_BOOKING_META_BY_MASTER_SERVICE,
  SQL_INSERT_PENDING_APPOINTMENT,
  SQL_LIST_AVAILABLE_MASTERS_FOR_BOOKING_SLOT,
  SQL_LIST_AVAILABLE_TIME_CODES_FOR_BOOKING_DATE,
  SQL_LIST_BOOKABLE_SERVICES_FOR_BOOKING,
} from '../db-sql/db-booking.sql.js';

/**
 * @file db-booking.helper.ts
 * @summary DB helper модуля створення бронювання клієнта.
 */

const DEFAULT_CATALOG_LIMIT = 20;
const MAX_CATALOG_LIMIT = 50;

function normalizePositiveBigintId(value: string | number, fieldName: string): string {
  const normalized = String(value).trim();

  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError(`Некоректний ${fieldName}`, { [fieldName]: value });
  }

  return normalized;
}

function normalizeOptionalStudioId(studioId?: string | null): string | null {
  if (studioId == null) return null;
  return normalizePositiveBigintId(studioId, 'studioId');
}

function normalizeCatalogLimit(limit?: number): number {
  if (limit == null) return DEFAULT_CATALOG_LIMIT;
  if (!Number.isFinite(limit)) return DEFAULT_CATALOG_LIMIT;

  const normalized = Math.trunc(limit);
  if (normalized < 1) return DEFAULT_CATALOG_LIMIT;
  if (normalized > MAX_CATALOG_LIMIT) return MAX_CATALOG_LIMIT;
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

function normalizeDateCode(value: string): string {
  const normalized = value.trim();
  if (!/^\d{8}$/.test(normalized)) {
    throw new ValidationError('Некоректна дата для бронювання', { dateCode: value });
  }

  const year = Number(normalized.slice(0, 4));
  const month = Number(normalized.slice(4, 6));
  const day = Number(normalized.slice(6, 8));
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new ValidationError('Некоректна дата для бронювання', { dateCode: value });
  }

  return normalized;
}

function normalizeTimeCode(value: string): string {
  const normalized = value.trim();
  if (!/^\d{4}$/.test(normalized)) {
    throw new ValidationError('Некоректний час для бронювання', { timeCode: value });
  }

  const hours = Number(normalized.slice(0, 2));
  const minutes = Number(normalized.slice(2, 4));
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new ValidationError('Некоректний час для бронювання', { timeCode: value });
  }

  return normalized;
}

function dateCodeToIsoDate(dateCode: string): string {
  return `${dateCode.slice(0, 4)}-${dateCode.slice(4, 6)}-${dateCode.slice(6, 8)}`;
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

function mapBookableServiceToCatalogItem(service: ServicesEntity): ServicesCatalogItem {
  return {
    id: service.id,
    studioId: service.studioId,
    name: service.name,
    description: service.description,
    durationMinutes: service.durationMinutes,
    basePrice: service.basePrice,
    currencyCode: service.currencyCode,
    resultDescription: service.resultDescription,
    isActive: service.isActive,
  };
}

function mapAvailableMasterRowToOption(row: BookingAvailableMasterRow): MasterBookingOption {
  return {
    masterId: row.master_id,
    studioId: row.studio_id,
    displayName: row.display_name,
    ratingAvg: row.rating_avg,
    ratingCount: row.rating_count,
    experienceYears: row.experience_years,
  };
}

/**
 * @summary Повертає тільки ті послуги, для яких є прикріплені активні bookable-майстри.
 */
export async function listBookableServicesForBooking(
  input: ListBookableServicesForBookingInput = {},
): Promise<ListBookableServicesForBookingResult> {
  const studioId = normalizeOptionalStudioId(input.studioId);
  const limit = normalizeCatalogLimit(input.limit);

  try {
    return await withTransaction(async (client) => {
      const services = await queryMany<ServicesRow, ServicesEntity>(
        SQL_LIST_BOOKABLE_SERVICES_FOR_BOOKING,
        [studioId, limit],
        servicesRowToEntity,
        client,
      );

      return services.map(mapBookableServiceToCatalogItem);
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-booking.helper',
      action: 'Failed to list bookable services for booking',
      error,
      meta: { studioId, limit },
    });
    throw error;
  }
}

/**
 * @summary Повертає вільні коди часу (HHmm) для послуги на обрану дату.
 */
export async function listAvailableTimeCodesForBookingDate(
  input: ListAvailableTimeCodesForBookingDateInput,
): Promise<string[]> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const serviceId = normalizePositiveBigintId(input.serviceId, 'serviceId');
  const dateCode = normalizeDateCode(input.dateCode);
  const timeCodes = [...new Set(input.timeCodes.map(normalizeTimeCode))];
  const localDate = dateCodeToIsoDate(dateCode);

  if (timeCodes.length === 0) {
    return [];
  }

  try {
    return await withTransaction((client) =>
      queryMany<BookingAvailableTimeCodeRow, string>(
        SQL_LIST_AVAILABLE_TIME_CODES_FOR_BOOKING_DATE,
        [studioId, serviceId, localDate, timeCodes],
        (row) => row.time_code,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-booking.helper',
      action: 'Failed to list available time codes for booking date',
      error,
      meta: { studioId, serviceId, dateCode, timeCodesCount: timeCodes.length },
    });
    throw error;
  }
}

/**
 * @summary Повертає список майстрів, які реально доступні у конкретний слот.
 */
export async function listAvailableMastersForBookingSlot(
  input: ListAvailableMastersForBookingSlotInput,
): Promise<ListAvailableMastersForBookingSlotResult> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const serviceId = normalizePositiveBigintId(input.serviceId, 'serviceId');
  const dateCode = normalizeDateCode(input.dateCode);
  const timeCode = normalizeTimeCode(input.timeCode);
  const localDate = dateCodeToIsoDate(dateCode);

  try {
    return await withTransaction((client) =>
      queryMany<BookingAvailableMasterRow, MasterBookingOption>(
        SQL_LIST_AVAILABLE_MASTERS_FOR_BOOKING_SLOT,
        [studioId, serviceId, localDate, timeCode],
        mapAvailableMasterRowToOption,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-booking.helper',
      action: 'Failed to list available masters for booking slot',
      error,
      meta: { studioId, serviceId, dateCode, timeCode },
    });
    throw error;
  }
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
