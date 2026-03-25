import type {
  AdminStudioDayOffItem,
  AdminStudioDayOffRow,
  AdminStudioHolidayItem,
  AdminStudioHolidayRow,
  AdminStudioScheduleData,
  AdminStudioTemporaryHoursItem,
  AdminStudioTemporaryHoursRow,
  AdminStudioWeeklyHoursItem,
  AdminStudioWeeklyHoursRow,
} from '../../types/db-helpers/db-admin-schedule.types.js';
import { queryMany, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import {
  SQL_LIST_STUDIO_UPCOMING_DAYS_OFF_FOR_ADMIN_PANEL,
  SQL_LIST_STUDIO_UPCOMING_HOLIDAYS_FOR_ADMIN_PANEL,
  SQL_LIST_STUDIO_UPCOMING_TEMPORARY_HOURS_FOR_ADMIN_PANEL,
  SQL_LIST_STUDIO_WEEKLY_HOURS_FOR_ADMIN_PANEL,
} from '../db-sql/db-admin-schedule.sql.js';

/**
 * @file db-admin-schedule.helper.ts
 * @summary DB helper для блоку "Розклад" у адмін-панелі.
 */

const DEFAULT_EXCEPTIONS_LIMIT = 10;
const MAX_EXCEPTIONS_LIMIT = 40;

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

function mapWeeklyRow(row: AdminStudioWeeklyHoursRow): AdminStudioWeeklyHoursItem {
  return {
    weekday: row.weekday,
    isOpen: row.is_open,
    openTime: row.open_time,
    closeTime: row.close_time,
  };
}

function mapDayOffRow(row: AdminStudioDayOffRow): AdminStudioDayOffItem {
  return {
    id: row.id,
    offDate: new Date(row.off_date),
    reason: row.reason,
  };
}

function mapHolidayRow(row: AdminStudioHolidayRow): AdminStudioHolidayItem {
  return {
    id: row.id,
    holidayDate: new Date(row.holiday_date),
    holidayName: row.holiday_name,
  };
}

function mapTemporaryRow(row: AdminStudioTemporaryHoursRow): AdminStudioTemporaryHoursItem {
  return {
    id: row.id,
    dateFrom: new Date(row.date_from),
    dateTo: new Date(row.date_to),
    weekday: row.weekday,
    isOpen: row.is_open,
    openTime: row.open_time,
    closeTime: row.close_time,
    note: row.note,
  };
}

/**
 * @summary Повертає дані розкладу студії для адмін-панелі.
 */
export async function getAdminStudioSchedule(
  studioIdInput: string | number,
  exceptionsLimit?: number,
): Promise<AdminStudioScheduleData> {
  const studioId = normalizePositiveBigintId(studioIdInput, 'studioId');
  const limit = normalizeLimit(exceptionsLimit);

  try {
    return await withTransaction(async (client) => {
      const [weeklyHours, upcomingDaysOff, upcomingHolidays, upcomingTemporaryHours] =
        await Promise.all([
          queryMany<AdminStudioWeeklyHoursRow, AdminStudioWeeklyHoursItem>(
            SQL_LIST_STUDIO_WEEKLY_HOURS_FOR_ADMIN_PANEL,
            [studioId],
            mapWeeklyRow,
            client,
          ),
          queryMany<AdminStudioDayOffRow, AdminStudioDayOffItem>(
            SQL_LIST_STUDIO_UPCOMING_DAYS_OFF_FOR_ADMIN_PANEL,
            [studioId, limit],
            mapDayOffRow,
            client,
          ),
          queryMany<AdminStudioHolidayRow, AdminStudioHolidayItem>(
            SQL_LIST_STUDIO_UPCOMING_HOLIDAYS_FOR_ADMIN_PANEL,
            [studioId, limit],
            mapHolidayRow,
            client,
          ),
          queryMany<AdminStudioTemporaryHoursRow, AdminStudioTemporaryHoursItem>(
            SQL_LIST_STUDIO_UPCOMING_TEMPORARY_HOURS_FOR_ADMIN_PANEL,
            [studioId, limit],
            mapTemporaryRow,
            client,
          ),
        ]);

      return {
        weeklyHours,
        upcomingDaysOff,
        upcomingHolidays,
        upcomingTemporaryHours,
      };
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-schedule.helper',
      action: 'Failed to load admin studio schedule',
      error,
      meta: { studioId, limit },
    });
    throw error;
  }
}

