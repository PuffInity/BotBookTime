import {
    StudioDaysOffRow,
    StudioDaysOffEntity,
    StudioDaysOffInsert,
    StudioDaysOffUpdate
} from '../../types/db/studioDaysOff.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file studioDaysOff.mapp.ts
 * @summary Mapper для таблиці `studioDaysOff` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {StudioDaysOffRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {StudioDaysOffEntity}
 */
export const studioDaysOffRowToEntity = (row: StudioDaysOffRow): StudioDaysOffEntity => {
    return {
        id: row.id,
        studioId: row.studio_id,
        offDate: toDate(row.off_date),
        reason: row.reason,
        createdBy: row.created_by,
        createdAt: toDate(row.created_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {StudioDaysOffInsert} d - Дані для створення запису.
 * @returns {Partial<StudioDaysOffRow>}
 */
export const toInsertStudioDaysOff = (d: StudioDaysOffInsert) => {
    const out: Partial<StudioDaysOffRow> = {
        studio_id: d.studioId,
        off_date: toDate(d.offDate),
        reason: d.reason ?? null,
        created_by: d.createdBy ?? null,
    };

    return out satisfies Partial<StudioDaysOffRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {StudioDaysOffUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<StudioDaysOffRow>}
 */
export const toUpdateStudioDaysOff = (patch?: StudioDaysOffUpdate) => {
    const out: Partial<StudioDaysOffRow> = {};

    if (!patch) return out;

    if ("studioId" in patch && patch.studioId !== undefined) {
        out.studio_id = patch.studioId;
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

    return out satisfies Partial<StudioDaysOffRow>;
};
