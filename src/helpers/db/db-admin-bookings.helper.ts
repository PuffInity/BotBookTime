import type {
  AdminBookingFeedRow,
  AdminBookingItem,
  AdminBookingRow,
  AdminBookingsCategory,
  AdminBookingsFeedPage,
  GetAdminBookingCardByIdInput,
  ListAdminBookingsFeedInput,
} from '../../types/db-helpers/db-admin-bookings.types.js';
import { queryMany, queryOne, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import {
  SQL_GET_ADMIN_BOOKING_CARD_BY_ID,
  SQL_LIST_ADMIN_BOOKINGS_FEED,
} from '../db-sql/db-admin-bookings.sql.js';

/**
 * @file db-admin-bookings.helper.ts
 * @summary DB helper для блоку записів адмін-панелі.
 */

const DEFAULT_FEED_LIMIT = 5;
const MAX_FEED_LIMIT = 20;

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
 * @summary Повертає сторінку записів студії за категорією.
 */
export async function listAdminBookingsFeed(
  input: ListAdminBookingsFeedInput,
): Promise<AdminBookingsFeedPage> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const category = normalizeBookingsCategory(input.category);
  const limit = normalizeFeedLimit(input.limit);
  const offset = normalizeOffset(input.offset);

  try {
    const rows = await withTransaction(async (client) =>
      queryMany<AdminBookingFeedRow, AdminBookingFeedRow>(
        SQL_LIST_ADMIN_BOOKINGS_FEED,
        [studioId, category, limit, offset],
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
      meta: { studioId, category, limit, offset },
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
