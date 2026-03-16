import {
    StudioTemporaryHoursRow,
    StudioTemporaryHoursEntity,
    StudioTemporaryHoursInsert,
    StudioTemporaryHoursUpdate
} from '../../types/db/studioTemporaryHours.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file studioTemporaryHours.mapp.ts
 * @summary Mapper для таблиці `studioTemporaryHours` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {StudioTemporaryHoursRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {StudioTemporaryHoursEntity}
 */
export const studioTemporaryHoursRowToEntity = (row: StudioTemporaryHoursRow): StudioTemporaryHoursEntity => {
    return {
        id: row.id,
        studioId: row.studio_id,
        dateFrom: toDate(row.date_from),
        dateTo: toDate(row.date_to),
        weekday: row.weekday,
        isOpen: row.is_open,
        openTime: row.open_time,
        closeTime: row.close_time,
        note: row.note,
        createdBy: row.created_by,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {StudioTemporaryHoursInsert} d - Дані для створення запису.
 * @returns {Partial<StudioTemporaryHoursRow>}
 */
export const toInsertStudioTemporaryHours = (d: StudioTemporaryHoursInsert) => {
    const out: Partial<StudioTemporaryHoursRow> = {
        studio_id: d.studioId,
        date_from: toDate(d.dateFrom),
        date_to: toDate(d.dateTo),
        weekday: d.weekday,
        is_open: d.isOpen ?? undefined,
        open_time: d.openTime ?? null,
        close_time: d.closeTime ?? null,
        note: d.note ?? null,
        created_by: d.createdBy ?? null,
    };

    return out satisfies Partial<StudioTemporaryHoursRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {StudioTemporaryHoursUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<StudioTemporaryHoursRow>}
 */
export const toUpdateStudioTemporaryHours = (patch?: StudioTemporaryHoursUpdate) => {
    const out: Partial<StudioTemporaryHoursRow> = {};

    if (!patch) return out;

    if ("studioId" in patch && patch.studioId !== undefined) {
        out.studio_id = patch.studioId;
    }

    if ("dateFrom" in patch && patch.dateFrom !== undefined) {
        out.date_from = toDate(patch.dateFrom);
    }

    if ("dateTo" in patch && patch.dateTo !== undefined) {
        out.date_to = toDate(patch.dateTo);
    }

    if ("weekday" in patch && patch.weekday !== undefined) {
        out.weekday = patch.weekday;
    }

    if ("isOpen" in patch && patch.isOpen !== undefined) {
        out.is_open = patch.isOpen;
    }

    if ("openTime" in patch && patch.openTime !== undefined) {
        out.open_time = patch.openTime;
    }

    if ("closeTime" in patch && patch.closeTime !== undefined) {
        out.close_time = patch.closeTime;
    }

    if ("note" in patch && patch.note !== undefined) {
        out.note = patch.note;
    }

    if ("createdBy" in patch && patch.createdBy !== undefined) {
        out.created_by = patch.createdBy;
    }

    return out satisfies Partial<StudioTemporaryHoursRow>;
};
