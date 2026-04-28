import {
    StudioHolidaysRow,
    StudioHolidaysEntity,
    StudioHolidaysInsert,
    StudioHolidaysUpdate
} from '../../types/db/studioHolidays.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file studioHolidays.mapp.ts
 * @summary Mapper для таблиці `studioHolidays` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {StudioHolidaysRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {StudioHolidaysEntity}
 */
export const studioHolidaysRowToEntity = (row: StudioHolidaysRow): StudioHolidaysEntity => {
    return {
        id: row.id,
        studioId: row.studio_id,
        holidayDate: toDate(row.holiday_date),
        holidayName: row.holiday_name,
        createdBy: row.created_by,
        createdAt: toDate(row.created_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {StudioHolidaysInsert} d - Дані для створення запису.
 * @returns {Partial<StudioHolidaysRow>}
 */
export const toInsertStudioHolidays = (d: StudioHolidaysInsert) => {
    const out: Partial<StudioHolidaysRow> = {
        studio_id: d.studioId,
        holiday_date: toDate(d.holidayDate),
        holiday_name: d.holidayName,
        created_by: d.createdBy ?? null,
    };

    return out satisfies Partial<StudioHolidaysRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {StudioHolidaysUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<StudioHolidaysRow>}
 */
export const toUpdateStudioHolidays = (patch?: StudioHolidaysUpdate) => {
    const out: Partial<StudioHolidaysRow> = {};

    if (!patch) return out;

    if ("studioId" in patch && patch.studioId !== undefined) {
        out.studio_id = patch.studioId;
    }

    if ("holidayDate" in patch && patch.holidayDate !== undefined) {
        out.holiday_date = toDate(patch.holidayDate);
    }

    if ("holidayName" in patch && patch.holidayName !== undefined) {
        out.holiday_name = patch.holidayName;
    }

    if ("createdBy" in patch && patch.createdBy !== undefined) {
        out.created_by = patch.createdBy;
    }

    return out satisfies Partial<StudioHolidaysRow>;
};
