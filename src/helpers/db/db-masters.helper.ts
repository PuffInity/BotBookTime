import type { MasterBookingOption, MasterBookingOptionRow, ListMastersByServiceInput } from '../../types/db-helpers/db-masters.types.js';
import { queryMany, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import { SQL_LIST_ACTIVE_MASTERS_BY_SERVICE_ID } from '../db-sql/db-masters.sql.js';

/**
 * @file db-masters.helper.ts
 * @summary DB helper для доступних майстрів у flow бронювання.
 */

const DEFAULT_LIMIT = 20;
const MIN_LIMIT = 1;
const MAX_LIMIT = 50;

function normalizePositiveBigintId(value: string | number, fieldName: string): string {
  const normalized = String(value).trim();

  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError(`Некоректний ${fieldName}`, { [fieldName]: value });
  }

  return normalized;
}

function normalizeLimit(limit?: number): number {
  if (limit == null) return DEFAULT_LIMIT;
  if (!Number.isFinite(limit)) return DEFAULT_LIMIT;

  const normalized = Math.trunc(limit);
  if (normalized < MIN_LIMIT) return DEFAULT_LIMIT;
  if (normalized > MAX_LIMIT) return MAX_LIMIT;
  return normalized;
}

function masterBookingOptionRowToItem(row: MasterBookingOptionRow): MasterBookingOption {
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
 * @summary Повертає активних майстрів, які можуть виконати конкретну послугу.
 */
export async function listActiveMastersByService(
  input: ListMastersByServiceInput,
): Promise<MasterBookingOption[]> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const serviceId = normalizePositiveBigintId(input.serviceId, 'serviceId');
  const limit = normalizeLimit(input.limit);

  try {
    return await withTransaction(async (client) =>
      queryMany<MasterBookingOptionRow, MasterBookingOption>(
        SQL_LIST_ACTIVE_MASTERS_BY_SERVICE_ID,
        [studioId, serviceId, limit],
        masterBookingOptionRowToItem,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-masters.helper',
      action: 'Failed to list active masters by service',
      error,
      meta: { studioId, serviceId, limit },
    });
    throw error;
  }
}
