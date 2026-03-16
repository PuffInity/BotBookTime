import {
    StudioContentBlocksRow,
    StudioContentBlocksEntity,
    StudioContentBlocksInsert,
    StudioContentBlocksUpdate
} from '../../types/db/studioContentBlocks.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file studioContentBlocks.mapp.ts
 * @summary Mapper для таблиці `studioContentBlocks` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {StudioContentBlocksRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {StudioContentBlocksEntity}
 */
export const studioContentBlocksRowToEntity = (row: StudioContentBlocksRow): StudioContentBlocksEntity => {
    return {
        studioId: row.studio_id,
        blockKey: row.block_key,
        language: row.language,
        content: row.content,
        updatedBy: row.updated_by,
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {StudioContentBlocksInsert} d - Дані для створення запису.
 * @returns {Partial<StudioContentBlocksRow>}
 */
export const toInsertStudioContentBlocks = (d: StudioContentBlocksInsert) => {
    const out: Partial<StudioContentBlocksRow> = {
        studio_id: d.studioId,
        block_key: d.blockKey,
        language: d.language,
        content: d.content,
        updated_by: d.updatedBy ?? null,
    };

    return out satisfies Partial<StudioContentBlocksRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {StudioContentBlocksUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<StudioContentBlocksRow>}
 */
export const toUpdateStudioContentBlocks = (patch?: StudioContentBlocksUpdate) => {
    const out: Partial<StudioContentBlocksRow> = {};

    if (!patch) return out;

    if ("studioId" in patch && patch.studioId !== undefined) {
        out.studio_id = patch.studioId;
    }

    if ("blockKey" in patch && patch.blockKey !== undefined) {
        out.block_key = patch.blockKey;
    }

    if ("language" in patch && patch.language !== undefined) {
        out.language = patch.language;
    }

    if ("content" in patch && patch.content !== undefined) {
        out.content = patch.content;
    }

    if ("updatedBy" in patch && patch.updatedBy !== undefined) {
        out.updated_by = patch.updatedBy;
    }

    return out satisfies Partial<StudioContentBlocksRow>;
};
