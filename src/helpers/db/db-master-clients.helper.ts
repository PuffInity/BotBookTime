import type {
  GetMasterClientProfileByBookingInput,
  MasterClientProfileItem,
  MasterClientProfileRow,
} from '../../types/db-helpers/db-master-clients.types.js';
import { queryOne, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import { SQL_GET_MASTER_CLIENT_PROFILE_BY_BOOKING } from '../db-sql/db-master-clients.sql.js';

/**
 * @file db-master-clients.helper.ts
 * @summary DB helper для блоку "Профіль клієнта" у панелі майстра.
 */

function normalizePositiveBigintId(value: string | number, fieldName: string): string {
  const normalized = String(value).trim();
  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError(`Некоректний ${fieldName}`, { [fieldName]: value });
  }
  return normalized;
}

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
 * @summary Повертає профіль клієнта для конкретного запису майстра.
 * Запит захищений по `masterId + appointmentId`.
 */
export async function getMasterClientProfileByBooking(
  input: GetMasterClientProfileByBookingInput,
): Promise<MasterClientProfileItem | null> {
  const masterId = normalizePositiveBigintId(input.masterId, 'masterId');
  const appointmentId = normalizePositiveBigintId(input.appointmentId, 'appointmentId');

  try {
    return await withTransaction(async (client) =>
      queryOne<MasterClientProfileRow, MasterClientProfileItem>(
        SQL_GET_MASTER_CLIENT_PROFILE_BY_BOOKING,
        [masterId, appointmentId],
        mapMasterClientProfileRow,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-clients.helper',
      action: 'Failed to load master client profile by booking',
      error,
      meta: { masterId, appointmentId },
    });
    throw error;
  }
}
