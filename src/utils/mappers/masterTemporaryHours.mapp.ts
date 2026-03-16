import {
    MasterTemporaryHoursRow,
    MasterTemporaryHoursEntity,
    MasterTemporaryHoursInsert,
    MasterTemporaryHoursUpdate
} from '../../types/db/masterTemporaryHours.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file masterTemporaryHours.mapp.ts
 * @summary Mapper для таблиці `masterTemporaryHours` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {MasterTemporaryHoursRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {MasterTemporaryHoursEntity}
 */
export const masterTemporaryHoursRowToEntity = (row: MasterTemporaryHoursRow): MasterTemporaryHoursEntity => {
    return {
        id: row.id,
        masterId: row.master_id,
        dateFrom: toDate(row.date_from),
        dateTo: toDate(row.date_to),
        weekday: row.weekday,
        isWorking: row.is_working,
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
 * @param {MasterTemporaryHoursInsert} d - Дані для створення запису.
 * @returns {Partial<MasterTemporaryHoursRow>}
 */
export const toInsertMasterTemporaryHours = (d: MasterTemporaryHoursInsert) => {
    const out: Partial<MasterTemporaryHoursRow> = {
        master_id: d.masterId,
        date_from: toDate(d.dateFrom),
        date_to: toDate(d.dateTo),
        weekday: d.weekday,
        is_working: d.isWorking ?? undefined,
        open_time: d.openTime ?? null,
        close_time: d.closeTime ?? null,
        note: d.note ?? null,
        created_by: d.createdBy ?? null,
    };

    return out satisfies Partial<MasterTemporaryHoursRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {MasterTemporaryHoursUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<MasterTemporaryHoursRow>}
 */
export const toUpdateMasterTemporaryHours = (patch?: MasterTemporaryHoursUpdate) => {
    const out: Partial<MasterTemporaryHoursRow> = {};

    if (!patch) return out;

    if ("masterId" in patch && patch.masterId !== undefined) {
        out.master_id = patch.masterId;
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

    if ("isWorking" in patch && patch.isWorking !== undefined) {
        out.is_working = patch.isWorking;
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

    return out satisfies Partial<MasterTemporaryHoursRow>;
};
