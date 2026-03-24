import type {
  CreatedMasterDayOffItem,
  CreateMasterDayOffInput,
  MasterInsertedDayOffRow,
  MasterPanelScheduleData,
  MasterScheduleActiveBookingsCountRow,
  MasterScheduleDayOffItem,
  MasterScheduleDayOffExistsRow,
  MasterScheduleDayOffRow,
  MasterScheduleTemporaryHoursItem,
  MasterScheduleTemporaryHoursRow,
  MasterScheduleVacationItem,
  MasterScheduleVacationRow,
  MasterScheduleWeeklyItem,
  MasterScheduleWeeklyRow,
} from '../../types/db-helpers/db-master-schedule.types.js';
import { executeOne, queryMany, queryOne, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import {
  SQL_CHECK_MASTER_DAY_OFF_EXISTS_FOR_DATE,
  SQL_COUNT_MASTER_ACTIVE_BOOKINGS_ON_DAY_OFF_DATE,
  SQL_INSERT_MASTER_DAY_OFF,
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

function normalizeOptionalCreatorId(value?: string | number | null): string | null {
  if (value == null) return null;
  return normalizePositiveBigintId(value, 'createdBy');
}

function normalizeReason(value?: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim();
  if (normalized.length === 0) return null;
  return normalized.slice(0, 250);
}

function toSqlDate(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseSqlDate(dateText: string): Date {
  const normalized = dateText.trim();
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new ValidationError('Некоректна дата вихідного дня');
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    throw new ValidationError('Некоректна дата вихідного дня');
  }

  return parsed;
}

function normalizeDayOffDateInput(value: Date | string): Date {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new ValidationError('Некоректна дата вихідного дня');
    }
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value === 'string') {
    return parseSqlDate(value);
  }

  throw new ValidationError('Некоректна дата вихідного дня');
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

function mapInsertedDayOffRow(row: MasterInsertedDayOffRow): CreatedMasterDayOffItem {
  return {
    id: row.id,
    offDate: new Date(row.off_date),
    reason: row.reason,
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

/**
 * @summary Створює вихідний день для майстра з базовими перевірками безпеки.
 */
export async function createMasterDayOff(
  input: CreateMasterDayOffInput,
): Promise<CreatedMasterDayOffItem> {
  const masterId = normalizePositiveBigintId(input.masterId, 'masterId');
  const createdBy = normalizeOptionalCreatorId(input.createdBy);
  const reason = normalizeReason(input.reason);
  const dateOnly = normalizeDayOffDateInput(input.offDate);
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (dateOnly.getTime() < todayOnly.getTime()) {
    throw new ValidationError('Не можна встановити вихідний день у минулому');
  }
  const sqlDate = toSqlDate(dateOnly);

  try {
    return await withTransaction(async (client) => {
      const alreadyExists = await queryOne<MasterScheduleDayOffExistsRow, boolean>(
        SQL_CHECK_MASTER_DAY_OFF_EXISTS_FOR_DATE,
        [masterId, sqlDate],
        (row) => row.already_exists,
        client,
      );

      if (alreadyExists) {
        throw new ValidationError('На цю дату вже встановлено вихідний день');
      }

      const activeBookingsCount = await queryOne<MasterScheduleActiveBookingsCountRow, number>(
        SQL_COUNT_MASTER_ACTIVE_BOOKINGS_ON_DAY_OFF_DATE,
        [masterId, sqlDate],
        (row) => row.active_count,
        client,
      );

      if ((activeBookingsCount ?? 0) > 0) {
        throw new ValidationError(
          'На цю дату вже є активні записи. Спочатку перенесіть або скасуйте їх.',
        );
      }

      return executeOne<MasterInsertedDayOffRow, CreatedMasterDayOffItem>(
        SQL_INSERT_MASTER_DAY_OFF,
        [masterId, sqlDate, reason, createdBy],
        mapInsertedDayOffRow,
        client,
      );
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-schedule.helper',
      action: 'Failed to create master day off',
      error,
      meta: { masterId, offDate: sqlDate, createdBy },
    });
    throw error;
  }
}
