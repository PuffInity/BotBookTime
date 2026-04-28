import {
    StudioWeeklyHoursRow,
    StudioWeeklyHoursEntity,
    StudioWeeklyHoursInsert,
    StudioWeeklyHoursUpdate
} from '../../types/db/studioWeeklyHours.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file studioWeeklyHours.mapp.ts
 * @summary Mapper для таблиці `studioWeeklyHours` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {StudioWeeklyHoursRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {StudioWeeklyHoursEntity}
 */
export const studioWeeklyHoursRowToEntity = (row: StudioWeeklyHoursRow): StudioWeeklyHoursEntity => {
    return {
        studioId: row.studio_id,
        weekday: row.weekday,
        isOpen: row.is_open,
        openTime: row.open_time,
        closeTime: row.close_time,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {StudioWeeklyHoursInsert} d - Дані для створення запису.
 * @returns {Partial<StudioWeeklyHoursRow>}
 */
export const toInsertStudioWeeklyHours = (d: StudioWeeklyHoursInsert) => {
    const out: Partial<StudioWeeklyHoursRow> = {
        studio_id: d.studioId,
        weekday: d.weekday,
        is_open: d.isOpen ?? undefined,
        open_time: d.openTime ?? null,
        close_time: d.closeTime ?? null,
    };

    return out satisfies Partial<StudioWeeklyHoursRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {StudioWeeklyHoursUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<StudioWeeklyHoursRow>}
 */
export const toUpdateStudioWeeklyHours = (patch?: StudioWeeklyHoursUpdate) => {
    const out: Partial<StudioWeeklyHoursRow> = {};

    if (!patch) return out;

    if ("studioId" in patch && patch.studioId !== undefined) {
        out.studio_id = patch.studioId;
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

    return out satisfies Partial<StudioWeeklyHoursRow>;
};
