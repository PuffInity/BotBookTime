import {
    MasterDaysOffRow,
    MasterDaysOffEntity,
    MasterDaysOffInsert,
    MasterDaysOffUpdate
} from '../../types/db/masterDaysOff.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file masterDaysOff.mapp.ts
 * @summary Mapper для таблиці `masterDaysOff` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {MasterDaysOffRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {MasterDaysOffEntity}
 */
export const masterDaysOffRowToEntity = (row: MasterDaysOffRow): MasterDaysOffEntity => {
    return {
        id: row.id,
        masterId: row.master_id,
        offDate: toDate(row.off_date),
        reason: row.reason,
        createdBy: row.created_by,
        createdAt: toDate(row.created_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {MasterDaysOffInsert} d - Дані для створення запису.
 * @returns {Partial<MasterDaysOffRow>}
 */
export const toInsertMasterDaysOff = (d: MasterDaysOffInsert) => {
    const out: Partial<MasterDaysOffRow> = {
        master_id: d.masterId,
        off_date: toDate(d.offDate),
        reason: d.reason ?? null,
        created_by: d.createdBy ?? null,
    };

    return out satisfies Partial<MasterDaysOffRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {MasterDaysOffUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<MasterDaysOffRow>}
 */
export const toUpdateMasterDaysOff = (patch?: MasterDaysOffUpdate) => {
    const out: Partial<MasterDaysOffRow> = {};

    if (!patch) return out;

    if ("masterId" in patch && patch.masterId !== undefined) {
        out.master_id = patch.masterId;
    }

    if ("offDate" in patch && patch.offDate !== undefined) {
        out.off_date = toDate(patch.offDate);
    }

    if ("reason" in patch && patch.reason !== undefined) {
        out.reason = patch.reason;
    }

    if ("createdBy" in patch && patch.createdBy !== undefined) {
        out.created_by = patch.createdBy;
    }

    return out satisfies Partial<MasterDaysOffRow>;
};
