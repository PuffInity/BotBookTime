import type {
  ProfileBookingStatusData,
  ProfileBookingStatusItem,
  ProfileBookingStatusRow,
} from '../../types/db-helpers/db-profile-booking.types.js';
import { queryMany, queryOne, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import {
  SQL_GET_UPCOMING_BOOKING_BY_CLIENT_ID,
  SQL_LIST_RECENT_BOOKINGS_BY_CLIENT_ID,
} from '../db-sql/db-profile-booking.sql.js';

/**
 * @file db-profile-booking.helper.ts
 * @summary DB helper для статусу бронювання у профілі клієнта.
 */

const DEFAULT_RECENT_LIMIT = 5;
const MAX_RECENT_LIMIT = 20;

function normalizePositiveBigintId(value: string | number, fieldName: string): string {
  const normalized = String(value).trim();

  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError(`Некоректний ${fieldName}`, { [fieldName]: value });
  }

  return normalized;
}

function normalizeRecentLimit(limit?: number): number {
  if (limit == null || !Number.isFinite(limit)) {
    return DEFAULT_RECENT_LIMIT;
  }

  const normalized = Math.trunc(limit);
  if (normalized < 1) return DEFAULT_RECENT_LIMIT;
  if (normalized > MAX_RECENT_LIMIT) return MAX_RECENT_LIMIT;
  return normalized;
}

function mapBookingStatusRow(row: ProfileBookingStatusRow): ProfileBookingStatusItem {
  return {
    appointmentId: row.appointment_id,
    status: row.status,
    startAt: new Date(row.start_at),
    endAt: new Date(row.end_at),
    serviceName: row.service_name,
    masterName: row.master_name,
    priceAmount: row.price_amount,
    currencyCode: row.currency_code,
  };
}

/**
 * @summary Повертає дані блоку "Статус бронювання" для профілю клієнта.
 */
export async function getProfileBookingStatus(
  clientId: string | number,
  recentLimit?: number,
): Promise<ProfileBookingStatusData> {
  const normalizedClientId = normalizePositiveBigintId(clientId, 'clientId');
  const limit = normalizeRecentLimit(recentLimit);

  try {
    return await withTransaction(async (client) => {
      const upcoming = await queryOne<ProfileBookingStatusRow, ProfileBookingStatusItem>(
        SQL_GET_UPCOMING_BOOKING_BY_CLIENT_ID,
        [normalizedClientId],
        mapBookingStatusRow,
        client,
      );

      const recent = await queryMany<ProfileBookingStatusRow, ProfileBookingStatusItem>(
        SQL_LIST_RECENT_BOOKINGS_BY_CLIENT_ID,
        [normalizedClientId, limit],
        mapBookingStatusRow,
        client,
      );

      return {
        upcoming,
        recent,
      };
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-profile-booking.helper',
      action: 'Failed to load profile booking status',
      error,
      meta: { clientId: normalizedClientId, limit },
    });
    throw error;
  }
}
