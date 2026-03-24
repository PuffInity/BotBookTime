import type {
  CreateMasterTemporaryScheduleInput,
  CreatedMasterVacationItem,
  CreatedMasterDayOffItem,
  CreateMasterVacationInput,
  CreateMasterDayOffInput,
  MasterUpsertedWeeklyHoursRow,
  MasterScheduleTemporaryHoursOverlapRow,
  MasterTemporaryScheduleDayInput,
  MasterInsertedDayOffRow,
  MasterInsertedVacationRow,
  MasterPanelScheduleData,
  MasterScheduleActiveBookingsCountRow,
  MasterScheduleDayOffItem,
  MasterScheduleDayOffExistsRow,
  MasterScheduleDayOffRow,
  MasterScheduleVacationOverlapRow,
  MasterScheduleTemporaryHoursItem,
  MasterScheduleTemporaryHoursRow,
  MasterScheduleVacationItem,
  MasterScheduleVacationRow,
  UpdateMasterWeeklyDayInput,
  MasterScheduleWeeklyItem,
  MasterScheduleWeeklyRow,
} from '../../types/db-helpers/db-master-schedule.types.js';
import { executeOne, executeVoid, queryMany, queryOne, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import {
  SQL_CHECK_MASTER_TEMPORARY_HOURS_OVERLAP,
  SQL_CHECK_MASTER_VACATION_OVERLAP,
  SQL_CHECK_MASTER_DAY_OFF_EXISTS_FOR_DATE,
  SQL_COUNT_MASTER_ACTIVE_BOOKINGS_IN_VACATION_RANGE,
  SQL_COUNT_MASTER_ACTIVE_BOOKINGS_ON_DAY_OFF_DATE,
  SQL_INSERT_MASTER_DAY_OFF,
  SQL_INSERT_MASTER_TEMPORARY_HOURS,
  SQL_INSERT_MASTER_VACATION,
  SQL_LIST_MASTER_UPCOMING_DAYS_OFF_FOR_PANEL,
  SQL_LIST_MASTER_UPCOMING_TEMPORARY_HOURS_FOR_PANEL,
  SQL_LIST_MASTER_UPCOMING_VACATIONS_FOR_PANEL,
  SQL_LIST_MASTER_WEEKLY_HOURS_FOR_PANEL,
  SQL_UPSERT_MASTER_WEEKLY_HOURS,
} from '../db-sql/db-master-schedule.sql.js';

/**
 * @file db-master-schedule.helper.ts
 * @summary DB helper для блоку "Мій розклад" у панелі майстра.
 */

const DEFAULT_EXCEPTIONS_LIMIT = 5;
const MAX_EXCEPTIONS_LIMIT = 20;
const MIN_TEMPORARY_SCHEDULE_DAYS = 7;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

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

function normalizeVacationDateInput(value: Date | string, fieldName: 'dateFrom' | 'dateTo'): Date {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new ValidationError('Некоректна дата відпустки', { [fieldName]: value });
    }
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value === 'string') {
    try {
      return parseSqlDate(value);
    } catch {
      throw new ValidationError('Некоректна дата відпустки', { [fieldName]: value });
    }
  }

  throw new ValidationError('Некоректна дата відпустки', { [fieldName]: value });
}

function normalizeTemporaryDateInput(value: Date | string, fieldName: 'dateFrom' | 'dateTo'): Date {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new ValidationError('Некоректна дата тимчасового графіку', { [fieldName]: value });
    }
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value === 'string') {
    try {
      return parseSqlDate(value);
    } catch {
      throw new ValidationError('Некоректна дата тимчасового графіку', { [fieldName]: value });
    }
  }

  throw new ValidationError('Некоректна дата тимчасового графіку', { [fieldName]: value });
}

function isValidTimeHHMM(value: string): boolean {
  return /^(?:\d|[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function timeToMinutes(value: string): number {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

function normalizeTemporaryDays(days: MasterTemporaryScheduleDayInput[]): MasterTemporaryScheduleDayInput[] {
  if (!Array.isArray(days) || days.length !== 7) {
    throw new ValidationError('Тимчасовий графік має містити всі 7 днів тижня');
  }

  const byWeekday = new Map<number, MasterTemporaryScheduleDayInput>();
  for (const day of days) {
    if (!Number.isInteger(day.weekday) || day.weekday < 1 || day.weekday > 7) {
      throw new ValidationError('Некоректний день тижня у тимчасовому графіку');
    }
    if (byWeekday.has(day.weekday)) {
      throw new ValidationError('Дубльований день тижня у тимчасовому графіку');
    }

    if (!day.isWorking) {
      byWeekday.set(day.weekday, {
        weekday: day.weekday,
        isWorking: false,
        openTime: null,
        closeTime: null,
      });
      continue;
    }

    if (!day.openTime || !day.closeTime || !isValidTimeHHMM(day.openTime) || !isValidTimeHHMM(day.closeTime)) {
      throw new ValidationError('Некоректний час у тимчасовому графіку');
    }

    if (timeToMinutes(day.closeTime) <= timeToMinutes(day.openTime)) {
      throw new ValidationError('Час завершення має бути пізніше часу початку');
    }

    byWeekday.set(day.weekday, {
      weekday: day.weekday,
      isWorking: true,
      openTime: day.openTime,
      closeTime: day.closeTime,
    });
  }

  for (let weekday = 1; weekday <= 7; weekday += 1) {
    if (!byWeekday.has(weekday)) {
      throw new ValidationError('Тимчасовий графік має містити всі 7 днів тижня');
    }
  }

  return Array.from(byWeekday.values()).sort((a, b) => a.weekday - b.weekday);
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

function mapInsertedVacationRow(row: MasterInsertedVacationRow): CreatedMasterVacationItem {
  return {
    id: row.id,
    dateFrom: new Date(row.date_from),
    dateTo: new Date(row.date_to),
    reason: row.reason,
  };
}

function normalizeWeekday(weekday: number): number {
  if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7) {
    throw new ValidationError('Некоректний день тижня');
  }
  return weekday;
}

function normalizeOptionalTime(value?: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim();
  if (normalized.length === 0) return null;
  if (!isValidTimeHHMM(normalized)) {
    throw new ValidationError('Час має бути у форматі HH:MM');
  }
  return normalized;
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
 * @summary Оновлює тижневий графік майстра для конкретного дня.
 */
export async function upsertMasterWeeklyDay(
  input: UpdateMasterWeeklyDayInput,
): Promise<MasterScheduleWeeklyItem> {
  const masterId = normalizePositiveBigintId(input.masterId, 'masterId');
  const weekday = normalizeWeekday(input.weekday);
  const isWorking = Boolean(input.isWorking);
  const openTime = normalizeOptionalTime(input.openTime);
  const closeTime = normalizeOptionalTime(input.closeTime);

  if (isWorking) {
    if (!openTime || !closeTime) {
      throw new ValidationError('Для робочого дня потрібно вказати час початку і завершення');
    }
    if (timeToMinutes(closeTime) <= timeToMinutes(openTime)) {
      throw new ValidationError('Час завершення має бути пізніше часу початку');
    }
  }

  try {
    return await withTransaction(async (client) =>
      executeOne<MasterUpsertedWeeklyHoursRow, MasterScheduleWeeklyItem>(
        SQL_UPSERT_MASTER_WEEKLY_HOURS,
        [
          masterId,
          weekday,
          isWorking,
          isWorking ? openTime : null,
          isWorking ? closeTime : null,
        ],
        mapWeeklyRow,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-schedule.helper',
      action: 'Failed to upsert master weekly day',
      error,
      meta: { masterId, weekday, isWorking },
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

/**
 * @summary Створює період відпустки для майстра з перевіркою перетину та активних записів.
 */
export async function createMasterVacation(
  input: CreateMasterVacationInput,
): Promise<CreatedMasterVacationItem> {
  const masterId = normalizePositiveBigintId(input.masterId, 'masterId');
  const createdBy = normalizeOptionalCreatorId(input.createdBy);
  const reason = normalizeReason(input.reason);
  const dateFrom = normalizeVacationDateInput(input.dateFrom, 'dateFrom');
  const dateTo = normalizeVacationDateInput(input.dateTo, 'dateTo');
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (dateFrom.getTime() < todayOnly.getTime()) {
    throw new ValidationError('Не можна встановити відпустку, що починається у минулому');
  }

  if (dateTo.getTime() < dateFrom.getTime()) {
    throw new ValidationError('Дата завершення відпустки не може бути раніше дати початку');
  }

  const sqlDateFrom = toSqlDate(dateFrom);
  const sqlDateTo = toSqlDate(dateTo);

  try {
    return await withTransaction(async (client) => {
      const hasOverlap = await queryOne<MasterScheduleVacationOverlapRow, boolean>(
        SQL_CHECK_MASTER_VACATION_OVERLAP,
        [masterId, sqlDateFrom, sqlDateTo],
        (row) => row.already_exists,
        client,
      );

      if (hasOverlap) {
        throw new ValidationError('Цей період перетинається з уже встановленою відпусткою');
      }

      const activeBookingsCount = await queryOne<MasterScheduleActiveBookingsCountRow, number>(
        SQL_COUNT_MASTER_ACTIVE_BOOKINGS_IN_VACATION_RANGE,
        [masterId, sqlDateFrom, sqlDateTo],
        (row) => row.active_count,
        client,
      );

      if ((activeBookingsCount ?? 0) > 0) {
        throw new ValidationError(
          'У цьому періоді є активні записи. Спочатку перенесіть або скасуйте їх.',
        );
      }

      return executeOne<MasterInsertedVacationRow, CreatedMasterVacationItem>(
        SQL_INSERT_MASTER_VACATION,
        [masterId, sqlDateFrom, sqlDateTo, reason, createdBy],
        mapInsertedVacationRow,
        client,
      );
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-schedule.helper',
      action: 'Failed to create master vacation',
      error,
      meta: { masterId, dateFrom: sqlDateFrom, dateTo: sqlDateTo, createdBy },
    });
    throw error;
  }
}

/**
 * @summary Створює тимчасову зміну графіка для періоду (7 днів тижня).
 */
export async function createMasterTemporarySchedule(
  input: CreateMasterTemporaryScheduleInput,
): Promise<void> {
  const masterId = normalizePositiveBigintId(input.masterId, 'masterId');
  const createdBy = normalizeOptionalCreatorId(input.createdBy);
  const note = normalizeReason(input.note);
  const dateFrom = normalizeTemporaryDateInput(input.dateFrom, 'dateFrom');
  const dateTo = normalizeTemporaryDateInput(input.dateTo, 'dateTo');
  const normalizedDays = normalizeTemporaryDays(input.days);
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (dateFrom.getTime() < todayOnly.getTime()) {
    throw new ValidationError('Не можна встановити тимчасовий графік, що починається у минулому');
  }

  if (dateTo.getTime() < dateFrom.getTime()) {
    throw new ValidationError('Дата завершення періоду не може бути раніше дати початку');
  }

  const rangeDays = Math.floor((dateTo.getTime() - dateFrom.getTime()) / DAY_IN_MS) + 1;
  if (rangeDays < MIN_TEMPORARY_SCHEDULE_DAYS) {
    throw new ValidationError(
      `Тимчасовий графік можна встановити лише на період від ${MIN_TEMPORARY_SCHEDULE_DAYS} днів`,
    );
  }

  const sqlDateFrom = toSqlDate(dateFrom);
  const sqlDateTo = toSqlDate(dateTo);

  try {
    await withTransaction(async (client) => {
      const hasOverlap = await queryOne<MasterScheduleTemporaryHoursOverlapRow, boolean>(
        SQL_CHECK_MASTER_TEMPORARY_HOURS_OVERLAP,
        [masterId, sqlDateFrom, sqlDateTo],
        (row) => row.already_exists,
        client,
      );

      if (hasOverlap) {
        throw new ValidationError('У цьому періоді вже є встановлена тимчасова зміна графіку');
      }

      const activeBookingsCount = await queryOne<MasterScheduleActiveBookingsCountRow, number>(
        SQL_COUNT_MASTER_ACTIVE_BOOKINGS_IN_VACATION_RANGE,
        [masterId, sqlDateFrom, sqlDateTo],
        (row) => row.active_count,
        client,
      );

      if ((activeBookingsCount ?? 0) > 0) {
        throw new ValidationError(
          'У цьому періоді є активні записи. Спочатку перенесіть або скасуйте їх.',
        );
      }

      for (const day of normalizedDays) {
        await executeVoid(
          SQL_INSERT_MASTER_TEMPORARY_HOURS,
          [
            masterId,
            sqlDateFrom,
            sqlDateTo,
            day.weekday,
            day.isWorking,
            day.openTime,
            day.closeTime,
            note,
            createdBy,
          ],
          client,
        );
      }
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-schedule.helper',
      action: 'Failed to create master temporary schedule',
      error,
      meta: { masterId, dateFrom: sqlDateFrom, dateTo: sqlDateTo, createdBy },
    });
    throw error;
  }
}
