import {
    MasterVacationsRow,
    MasterVacationsEntity,
    MasterVacationsInsert,
    MasterVacationsUpdate
} from '../../types/db/masterVacations.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file masterVacations.mapp.ts
 * @summary Mapper для таблиці `masterVacations` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {MasterVacationsRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {MasterVacationsEntity}
 */
export const masterVacationsRowToEntity = (row: MasterVacationsRow): MasterVacationsEntity => {
    return {
        id: row.id,
        masterId: row.master_id,
        dateFrom: toDate(row.date_from),
        dateTo: toDate(row.date_to),
        reason: row.reason,
        createdBy: row.created_by,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {MasterVacationsInsert} d - Дані для створення запису.
 * @returns {Partial<MasterVacationsRow>}
 */
export const toInsertMasterVacations = (d: MasterVacationsInsert) => {
    const out: Partial<MasterVacationsRow> = {
        master_id: d.masterId,
        date_from: toDate(d.dateFrom),
        date_to: toDate(d.dateTo),
        reason: d.reason ?? null,
        created_by: d.createdBy ?? null,
    };

    return out satisfies Partial<MasterVacationsRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {MasterVacationsUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<MasterVacationsRow>}
 */
export const toUpdateMasterVacations = (patch?: MasterVacationsUpdate) => {
    const out: Partial<MasterVacationsRow> = {};

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

    if ("reason" in patch && patch.reason !== undefined) {
        out.reason = patch.reason;
    }

    if ("createdBy" in patch && patch.createdBy !== undefined) {
        out.created_by = patch.createdBy;
    }

    return out satisfies Partial<MasterVacationsRow>;
};
