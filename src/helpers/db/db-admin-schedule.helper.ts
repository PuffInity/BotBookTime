import type {
  AdminStudioTemporaryHoursOverlapRow,
  AdminStudioTemporaryScheduleDayInput,
  AdminInsertedStudioDayOffRow,
  AdminInsertedStudioHolidayRow,
  AdminStudioActiveBookingsCountRow,
  AdminStudioDayOffItem,
  AdminStudioDayOffRow,
  AdminStudioExistsForDateRow,
  AdminStudioHolidayItem,
  AdminStudioHolidayRow,
  AdminStudioScheduleData,
  AdminStudioTemporaryHoursItem,
  AdminStudioTemporaryHoursRow,
  AdminStudioWeeklyHoursItem,
  AdminStudioWeeklyHoursRow,
  CreateAdminStudioDayOffInput,
  CreateAdminStudioHolidayInput,
  CreateAdminStudioTemporaryScheduleInput,
  DeleteAdminStudioDayOffInput,
  DeleteAdminStudioHolidayInput,
  DeleteAdminStudioTemporarySchedulePeriodInput,
} from '../../types/db-helpers/db-admin-schedule.types.js';
import { executeOne, executeVoid, queryMany, queryOne, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import {
  SQL_CHECK_STUDIO_DAY_OFF_EXISTS_FOR_DATE,
  SQL_CHECK_STUDIO_HOLIDAY_EXISTS_FOR_DATE,
  SQL_CHECK_STUDIO_TEMPORARY_HOURS_OVERLAP,
  SQL_COUNT_STUDIO_ACTIVE_BOOKINGS_ON_DATE,
  SQL_DELETE_STUDIO_DAY_OFF_BY_ID,
  SQL_DELETE_STUDIO_HOLIDAY_BY_ID,
  SQL_DELETE_STUDIO_TEMPORARY_HOURS_PERIOD,
  SQL_INSERT_STUDIO_DAY_OFF,
  SQL_INSERT_STUDIO_HOLIDAY,
  SQL_INSERT_STUDIO_TEMPORARY_HOURS,
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

function parseSqlDate(dateText: string): Date {
  const normalized = dateText.trim();
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new ValidationError('Некоректна дата');
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
    throw new ValidationError('Некоректна дата');
  }

  return parsed;
}

function normalizeStudioDateInput(value: Date | string, fieldName: string): Date {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new ValidationError(`Некоректний ${fieldName}`, { [fieldName]: value });
    }
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value === 'string') {
    try {
      return parseSqlDate(value);
    } catch {
      throw new ValidationError(`Некоректний ${fieldName}`, { [fieldName]: value });
    }
  }

  throw new ValidationError(`Некоректний ${fieldName}`, { [fieldName]: value });
}

function toSqlDate(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeHolidayName(value: string): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length < 2) {
    throw new ValidationError('Назва свята має містити мінімум 2 символи');
  }
  if (normalized.length > 120) {
    throw new ValidationError('Назва свята занадто довга (максимум 120 символів)');
  }
  return normalized;
}

function normalizeTemporaryNote(value?: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim();
  if (normalized.length === 0) return null;
  return normalized.slice(0, 250);
}

function isValidTimeHHMM(value: string): boolean {
  return /^(?:\d|[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function timeToMinutes(value: string): number {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

function normalizeTemporaryDays(
  days: AdminStudioTemporaryScheduleDayInput[],
): AdminStudioTemporaryScheduleDayInput[] {
  if (!Array.isArray(days) || days.length !== 7) {
    throw new ValidationError('Тимчасовий графік має містити всі 7 днів тижня');
  }

  const byWeekday = new Map<number, AdminStudioTemporaryScheduleDayInput>();

  for (const day of days) {
    if (!Number.isInteger(day.weekday) || day.weekday < 1 || day.weekday > 7) {
      throw new ValidationError('Некоректний день тижня у тимчасовому графіку');
    }
    if (byWeekday.has(day.weekday)) {
      throw new ValidationError('Дубльований день тижня у тимчасовому графіку');
    }

    if (!day.isOpen) {
      byWeekday.set(day.weekday, {
        weekday: day.weekday,
        isOpen: false,
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
      isOpen: true,
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

function mapInsertedDayOffRow(row: AdminInsertedStudioDayOffRow): AdminStudioDayOffItem {
  return {
    id: row.id,
    offDate: new Date(row.off_date),
    reason: row.reason,
  };
}

function mapInsertedHolidayRow(row: AdminInsertedStudioHolidayRow): AdminStudioHolidayItem {
  return {
    id: row.id,
    holidayDate: new Date(row.holiday_date),
    holidayName: row.holiday_name,
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

/**
 * @summary Створює вихідний день студії.
 */
export async function createAdminStudioDayOff(
  input: CreateAdminStudioDayOffInput,
): Promise<AdminStudioDayOffItem> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const createdBy = normalizeOptionalCreatorId(input.createdBy);
  const offDate = normalizeStudioDateInput(input.offDate, 'offDate');
  const offDateSql = toSqlDate(offDate);
  const reason = input.reason?.trim() ? input.reason.trim().slice(0, 250) : null;

  try {
    return await withTransaction(async (client) => {
      const exists = await queryOne<AdminStudioExistsForDateRow, AdminStudioExistsForDateRow>(
        SQL_CHECK_STUDIO_DAY_OFF_EXISTS_FOR_DATE,
        [studioId, offDateSql],
        (row) => row,
        client,
      );

      if (exists?.already_exists) {
        throw new ValidationError('Вихідний день на цю дату вже існує');
      }

      const active = await queryOne<AdminStudioActiveBookingsCountRow, AdminStudioActiveBookingsCountRow>(
        SQL_COUNT_STUDIO_ACTIVE_BOOKINGS_ON_DATE,
        [studioId, offDateSql],
        (row) => row,
        client,
      );
      if ((active?.active_count ?? 0) > 0) {
        throw new ValidationError(
          `На цю дату вже є активні записи (${active?.active_count ?? 0}). Спочатку перенесіть або скасуйте їх.`,
        );
      }

      return executeOne<AdminInsertedStudioDayOffRow, AdminStudioDayOffItem>(
        SQL_INSERT_STUDIO_DAY_OFF,
        [studioId, offDateSql, reason, createdBy],
        mapInsertedDayOffRow,
        client,
      );
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-schedule.helper',
      action: 'Failed to create studio day off from admin panel',
      error,
      meta: { studioId, offDate: offDateSql },
    });
    throw error;
  }
}

/**
 * @summary Видаляє вихідний день студії.
 */
export async function deleteAdminStudioDayOff(
  input: DeleteAdminStudioDayOffInput,
): Promise<void> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const dayOffId = normalizePositiveBigintId(input.dayOffId, 'dayOffId');

  try {
    await withTransaction(async (client) => {
      const deletedId = await queryOne<{ id: string }, string>(
        SQL_DELETE_STUDIO_DAY_OFF_BY_ID,
        [dayOffId, studioId],
        (row) => row.id,
        client,
      );

      if (!deletedId) {
        throw new ValidationError('Вихідний день не знайдено або вже видалено');
      }
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-schedule.helper',
      action: 'Failed to delete studio day off from admin panel',
      error,
      meta: { studioId, dayOffId },
    });
    throw error;
  }
}

/**
 * @summary Створює святковий день студії.
 */
export async function createAdminStudioHoliday(
  input: CreateAdminStudioHolidayInput,
): Promise<AdminStudioHolidayItem> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const createdBy = normalizeOptionalCreatorId(input.createdBy);
  const holidayDate = normalizeStudioDateInput(input.holidayDate, 'holidayDate');
  const holidayDateSql = toSqlDate(holidayDate);
  const holidayName = normalizeHolidayName(input.holidayName);

  try {
    return await withTransaction(async (client) => {
      const exists = await queryOne<AdminStudioExistsForDateRow, AdminStudioExistsForDateRow>(
        SQL_CHECK_STUDIO_HOLIDAY_EXISTS_FOR_DATE,
        [studioId, holidayDateSql],
        (row) => row,
        client,
      );

      if (exists?.already_exists) {
        throw new ValidationError('Святковий день на цю дату вже існує');
      }

      return executeOne<AdminInsertedStudioHolidayRow, AdminStudioHolidayItem>(
        SQL_INSERT_STUDIO_HOLIDAY,
        [studioId, holidayDateSql, holidayName, createdBy],
        mapInsertedHolidayRow,
        client,
      );
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-schedule.helper',
      action: 'Failed to create studio holiday from admin panel',
      error,
      meta: { studioId, holidayDate: holidayDateSql },
    });
    throw error;
  }
}

/**
 * @summary Видаляє святковий день студії.
 */
export async function deleteAdminStudioHoliday(
  input: DeleteAdminStudioHolidayInput,
): Promise<void> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const holidayId = normalizePositiveBigintId(input.holidayId, 'holidayId');

  try {
    await withTransaction(async (client) => {
      const deletedId = await queryOne<{ id: string }, string>(
        SQL_DELETE_STUDIO_HOLIDAY_BY_ID,
        [holidayId, studioId],
        (row) => row.id,
        client,
      );

      if (!deletedId) {
        throw new ValidationError('Святковий день не знайдено або вже видалено');
      }
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-schedule.helper',
      action: 'Failed to delete studio holiday from admin panel',
      error,
      meta: { studioId, holidayId },
    });
    throw error;
  }
}

/**
 * @summary Створює тимчасовий графік студії на заданий період.
 */
export async function createAdminStudioTemporarySchedule(
  input: CreateAdminStudioTemporaryScheduleInput,
): Promise<void> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const createdBy = normalizeOptionalCreatorId(input.createdBy);
  const dateFrom = normalizeStudioDateInput(input.dateFrom, 'dateFrom');
  const dateTo = normalizeStudioDateInput(input.dateTo, 'dateTo');
  const dateFromSql = toSqlDate(dateFrom);
  const dateToSql = toSqlDate(dateTo);
  const note = normalizeTemporaryNote(input.note);
  const days = normalizeTemporaryDays(input.days);

  if (dateTo.getTime() < dateFrom.getTime()) {
    throw new ValidationError('Дата завершення не може бути раніше дати початку');
  }

  const daysCount = Math.floor((dateTo.getTime() - dateFrom.getTime()) / DAY_IN_MS) + 1;
  if (daysCount < MIN_TEMPORARY_SCHEDULE_DAYS) {
    throw new ValidationError(
      `Тимчасовий графік можна встановити лише на період від ${MIN_TEMPORARY_SCHEDULE_DAYS} днів`,
    );
  }

  try {
    await withTransaction(async (client) => {
      const overlap = await queryOne<AdminStudioTemporaryHoursOverlapRow, AdminStudioTemporaryHoursOverlapRow>(
        SQL_CHECK_STUDIO_TEMPORARY_HOURS_OVERLAP,
        [studioId, dateFromSql, dateToSql],
        (row) => row,
        client,
      );
      if (overlap?.already_exists) {
        throw new ValidationError('На цей період уже існує тимчасовий графік студії');
      }

      for (const day of days) {
        await executeVoid(
          SQL_INSERT_STUDIO_TEMPORARY_HOURS,
          [
            studioId,
            dateFromSql,
            dateToSql,
            day.weekday,
            day.isOpen,
            day.isOpen ? day.openTime : null,
            day.isOpen ? day.closeTime : null,
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
      scope: 'db-admin-schedule.helper',
      action: 'Failed to create studio temporary schedule from admin panel',
      error,
      meta: { studioId, dateFrom: dateFromSql, dateTo: dateToSql },
    });
    throw error;
  }
}

/**
 * @summary Видаляє тимчасовий графік студії за періодом.
 */
export async function deleteAdminStudioTemporarySchedulePeriod(
  input: DeleteAdminStudioTemporarySchedulePeriodInput,
): Promise<void> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const dateFrom = normalizeStudioDateInput(input.dateFrom, 'dateFrom');
  const dateTo = normalizeStudioDateInput(input.dateTo, 'dateTo');
  const dateFromSql = toSqlDate(dateFrom);
  const dateToSql = toSqlDate(dateTo);

  try {
    await withTransaction(async (client) => {
      const deletedRows = await queryMany<{ id: string }, string>(
        SQL_DELETE_STUDIO_TEMPORARY_HOURS_PERIOD,
        [studioId, dateFromSql, dateToSql],
        (row) => row.id,
        client,
      );

      if (deletedRows.length === 0) {
        throw new ValidationError('Тимчасовий графік за цей період не знайдено або вже видалено');
      }
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-schedule.helper',
      action: 'Failed to delete studio temporary schedule period from admin panel',
      error,
      meta: { studioId, dateFrom: dateFromSql, dateTo: dateToSql },
    });
    throw error;
  }
}
