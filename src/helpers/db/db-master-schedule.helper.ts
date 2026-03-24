import type {
  MasterPanelScheduleData,
  MasterScheduleDayOffItem,
  MasterScheduleDayOffRow,
  MasterScheduleTemporaryHoursItem,
  MasterScheduleTemporaryHoursRow,
  MasterScheduleVacationItem,
  MasterScheduleVacationRow,
  MasterScheduleWeeklyItem,
  MasterScheduleWeeklyRow,
} from '../../types/db-helpers/db-master-schedule.types.js';
import { queryMany, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import {
  SQL_LIST_MASTER_UPCOMING_DAYS_OFF_FOR_PANEL,
  SQL_LIST_MASTER_UPCOMING_TEMPORARY_HOURS_FOR_PANEL,
  SQL_LIST_MASTER_UPCOMING_VACATIONS_FOR_PANEL,
  SQL_LIST_MASTER_WEEKLY_HOURS_FOR_PANEL,
} from '../db-sql/db-master-schedule.sql.js';

/**
 * @file db-master-schedule.helper.ts
 * @summary DB helper для блоку "Мій розклад" у панелі майстра.
 */

const DEFAULT_EXCEPTIONS_LIMIT = 5;
const MAX_EXCEPTIONS_LIMIT = 20;

function normalizePositiveBigintId(value: string | number, fieldName: string): string {
  const normalized = String(value).trim();
  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError(`Некоректний ${fieldName}`, { [fieldName]: value });
  }
  return normalized;
}

function normalizeLimit(limit?: number): number {
  if (limit == null || !Number.isFinite(limit)) {
    return DEFAULT_EXCEPTIONS_LIMIT;
  }

  const normalized = Math.trunc(limit);
  if (normalized < 1) return DEFAULT_EXCEPTIONS_LIMIT;
  if (normalized > MAX_EXCEPTIONS_LIMIT) return MAX_EXCEPTIONS_LIMIT;
  return normalized;
}

function mapWeeklyRow(row: MasterScheduleWeeklyRow): MasterScheduleWeeklyItem {
  return {
    weekday: row.weekday,
    isWorking: row.is_working,
    openTime: row.open_time,
    closeTime: row.close_time,
  };
}

function mapDayOffRow(row: MasterScheduleDayOffRow): MasterScheduleDayOffItem {
  return {
    offDate: new Date(row.off_date),
    reason: row.reason,
  };
}

function mapVacationRow(row: MasterScheduleVacationRow): MasterScheduleVacationItem {
  return {
    dateFrom: new Date(row.date_from),
    dateTo: new Date(row.date_to),
    reason: row.reason,
  };
}

function mapTemporaryHoursRow(
  row: MasterScheduleTemporaryHoursRow,
): MasterScheduleTemporaryHoursItem {
  return {
    dateFrom: new Date(row.date_from),
    dateTo: new Date(row.date_to),
    weekday: row.weekday,
    isWorking: row.is_working,
    openTime: row.open_time,
    closeTime: row.close_time,
    note: row.note,
  };
}

/**
 * @summary Повертає дані для екрану "Мій розклад" у панелі майстра.
 */
export async function getMasterPanelSchedule(
  masterIdInput: string | number,
  exceptionsLimit?: number,
): Promise<MasterPanelScheduleData> {
  const masterId = normalizePositiveBigintId(masterIdInput, 'masterId');
  const limit = normalizeLimit(exceptionsLimit);

  try {
    return await withTransaction(async (client) => {
      const [weeklyHours, upcomingDaysOff, upcomingVacations, upcomingTemporaryHours] =
        await Promise.all([
          queryMany<MasterScheduleWeeklyRow, MasterScheduleWeeklyItem>(
            SQL_LIST_MASTER_WEEKLY_HOURS_FOR_PANEL,
            [masterId],
            mapWeeklyRow,
            client,
          ),
          queryMany<MasterScheduleDayOffRow, MasterScheduleDayOffItem>(
            SQL_LIST_MASTER_UPCOMING_DAYS_OFF_FOR_PANEL,
            [masterId, limit],
            mapDayOffRow,
            client,
          ),
          queryMany<MasterScheduleVacationRow, MasterScheduleVacationItem>(
            SQL_LIST_MASTER_UPCOMING_VACATIONS_FOR_PANEL,
            [masterId, limit],
            mapVacationRow,
            client,
          ),
          queryMany<MasterScheduleTemporaryHoursRow, MasterScheduleTemporaryHoursItem>(
            SQL_LIST_MASTER_UPCOMING_TEMPORARY_HOURS_FOR_PANEL,
            [masterId, limit],
            mapTemporaryHoursRow,
            client,
          ),
        ]);

      return {
        weeklyHours,
        upcomingDaysOff,
        upcomingVacations,
        upcomingTemporaryHours,
      };
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-schedule.helper',
      action: 'Failed to load master panel schedule',
      error,
      meta: { masterId, limit },
    });
    throw error;
  }
}
