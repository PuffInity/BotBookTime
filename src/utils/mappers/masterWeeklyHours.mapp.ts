import {
    MasterWeeklyHoursRow,
    MasterWeeklyHoursEntity,
    MasterWeeklyHoursInsert,
    MasterWeeklyHoursUpdate
} from '../../types/db/masterWeeklyHours.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file masterWeeklyHours.mapp.ts
 * @summary Mapper для таблиці `masterWeeklyHours` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {MasterWeeklyHoursRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {MasterWeeklyHoursEntity}
 */
export const masterWeeklyHoursRowToEntity = (row: MasterWeeklyHoursRow): MasterWeeklyHoursEntity => {
    return {
        masterId: row.master_id,
        weekday: row.weekday,
        isWorking: row.is_working,
        openTime: row.open_time,
        closeTime: row.close_time,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {MasterWeeklyHoursInsert} d - Дані для створення запису.
 * @returns {Partial<MasterWeeklyHoursRow>}
 */
export const toInsertMasterWeeklyHours = (d: MasterWeeklyHoursInsert) => {
    const out: Partial<MasterWeeklyHoursRow> = {
        master_id: d.masterId,
        weekday: d.weekday,
        is_working: d.isWorking ?? undefined,
        open_time: d.openTime ?? null,
        close_time: d.closeTime ?? null,
    };

    return out satisfies Partial<MasterWeeklyHoursRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {MasterWeeklyHoursUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<MasterWeeklyHoursRow>}
 */
export const toUpdateMasterWeeklyHours = (patch?: MasterWeeklyHoursUpdate) => {
    const out: Partial<MasterWeeklyHoursRow> = {};

    if (!patch) return out;

    if ("masterId" in patch && patch.masterId !== undefined) {
        out.master_id = patch.masterId;
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

    return out satisfies Partial<MasterWeeklyHoursRow>;
};
