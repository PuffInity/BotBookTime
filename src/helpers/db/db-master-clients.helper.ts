import type {
  GetMasterClientBookingsHistoryByBookingInput,
  GetMasterClientProfileByBookingInput,
  MasterClientBookingsHistoryItem,
  MasterClientBookingsHistoryRow,
  MasterClientProfileItem,
  MasterClientProfileRow,
} from '../../types/db-helpers/db-master-clients.types.js';
import { queryMany, queryOne, withTransaction } from '../db.helper.js';
import { ValidationError } from '../../utils/error.utils.js';
import {
  SQL_GET_MASTER_CLIENT_PROFILE_BY_BOOKING,
  SQL_LIST_MASTER_CLIENT_BOOKINGS_HISTORY_BY_BOOKING,
} from '../db-sql/db-master-clients.sql.js';

/**
 * @file db-master-clients.helper.ts
 * @summary DB helper для блоку "Профіль клієнта" у панелі майстра.
 */

/**
 * uk: Внутрішній helper метод normalizePositiveBigintId.
 * en: Internal helper method normalizePositiveBigintId.
 * cz: Interní helper metoda normalizePositiveBigintId.
 */
function normalizePositiveBigintId(value: string | number, fieldName: string): string {
  const normalized = String(value).trim();
  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError(`Некоректний ${fieldName}`, { [fieldName]: value });
  }
  return normalized;
}

/**
 * uk: Внутрішній helper метод normalizeHistoryLimit.
 * en: Internal helper method normalizeHistoryLimit.
 * cz: Interní helper metoda normalizeHistoryLimit.
 */
function normalizeHistoryLimit(value?: number): number {
  if (value == null || !Number.isFinite(value)) return 12;
  const normalized = Math.trunc(value);
  if (normalized < 1) return 12;
  if (normalized > 50) return 50;
  return normalized;
}

/**
 * uk: Внутрішній helper метод mapMasterClientProfileRow.
 * en: Internal helper method mapMasterClientProfileRow.
 * cz: Interní helper metoda mapMasterClientProfileRow.
 */
function mapMasterClientProfileRow(row: MasterClientProfileRow): MasterClientProfileItem {
  return {
    clientId: row.client_id,
    firstName: row.first_name,
    lastName: row.last_name,
    telegramUsername: row.telegram_username,
    phoneE164: row.phone_e164,
    phoneVerified: row.phone_verified,
    email: row.email,
    emailVerified: row.email_verified,
    preferredLanguage: row.preferred_language,
    profileCreatedAt: new Date(row.profile_created_at),
    notificationsEnabled: row.notifications_enabled,
    bookingsTotal: row.bookings_total,
    bookingsConfirmed: row.bookings_confirmed,
    bookingsCompleted: row.bookings_completed,
    bookingsCanceled: row.bookings_canceled,
    lastVisitAt: row.last_visit_at ? new Date(row.last_visit_at) : null,
  };
}

/**
 * uk: Внутрішній helper метод mapMasterClientBookingsHistoryRow.
 * en: Internal helper method mapMasterClientBookingsHistoryRow.
 * cz: Interní helper metoda mapMasterClientBookingsHistoryRow.
 */
function mapMasterClientBookingsHistoryRow(
  row: MasterClientBookingsHistoryRow,
): MasterClientBookingsHistoryItem {
  return {
    appointmentId: row.appointment_id,
    serviceName: row.service_name,
    priceAmount: row.price_amount,
    currencyCode: row.currency_code,
    startAt: new Date(row.start_at),
    endAt: new Date(row.end_at),
    status: row.status,
  };
}

/**
 * @summary Повертає профіль клієнта для конкретного запису майстра.
 * Запит захищений по `masterId + appointmentId`.
 */
export async function getMasterClientProfileByBooking(
  input: GetMasterClientProfileByBookingInput,
): Promise<MasterClientProfileItem | null> {
  const masterId = normalizePositiveBigintId(input.masterId, 'masterId');
  const appointmentId = normalizePositiveBigintId(input.appointmentId, 'appointmentId');

  return await withTransaction(async (client) =>
    queryOne<MasterClientProfileRow, MasterClientProfileItem>(
      SQL_GET_MASTER_CLIENT_PROFILE_BY_BOOKING,
      [masterId, appointmentId],
      mapMasterClientProfileRow,
      client,
    ),
  );
}

/**
 * @summary Повертає всі записи цього клієнта до цього майстра (через поточний booking-контекст).
 */
export async function listMasterClientBookingsHistoryByBooking(
  input: GetMasterClientBookingsHistoryByBookingInput,
): Promise<MasterClientBookingsHistoryItem[]> {
  const masterId = normalizePositiveBigintId(input.masterId, 'masterId');
  const appointmentId = normalizePositiveBigintId(input.appointmentId, 'appointmentId');
  const limit = normalizeHistoryLimit(input.limit);

  return await withTransaction(async (client) =>
    queryMany<MasterClientBookingsHistoryRow, MasterClientBookingsHistoryItem>(
      SQL_LIST_MASTER_CLIENT_BOOKINGS_HISTORY_BY_BOOKING,
      [masterId, appointmentId, limit],
      mapMasterClientBookingsHistoryRow,
      client,
    ),
  );
}
