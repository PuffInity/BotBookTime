import {
    FaqEntriesRow,
    FaqEntriesEntity,
    FaqEntriesInsert,
    FaqEntriesUpdate
} from '../../types/db/faqEntries.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file faqEntries.mapp.ts
 * @summary Mapper для таблиці `faqEntries` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {FaqEntriesRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {FaqEntriesEntity}
 */
export const faqEntriesRowToEntity = (row: FaqEntriesRow): FaqEntriesEntity => {
    return {
        id: row.id,
        studioId: row.studio_id,
        sortOrder: row.sort_order,
        isActive: row.is_active,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {FaqEntriesInsert} d - Дані для створення запису.
 * @returns {Partial<FaqEntriesRow>}
 */
export const toInsertFaqEntries = (d: FaqEntriesInsert) => {
    const out: Partial<FaqEntriesRow> = {
        studio_id: d.studioId,
        sort_order: d.sortOrder,
        is_active: d.isActive ?? undefined,
    };

    return out satisfies Partial<FaqEntriesRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {FaqEntriesUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<FaqEntriesRow>}
 */
export const toUpdateFaqEntries = (patch?: FaqEntriesUpdate) => {
    const out: Partial<FaqEntriesRow> = {};

    if (!patch) return out;

    if ("studioId" in patch && patch.studioId !== undefined) {
        out.studio_id = patch.studioId;
    }

    if ("sortOrder" in patch && patch.sortOrder !== undefined) {
        out.sort_order = patch.sortOrder;
    }

    if ("isActive" in patch && patch.isActive !== undefined) {
        out.is_active = patch.isActive;
    }

    return out satisfies Partial<FaqEntriesRow>;
};
