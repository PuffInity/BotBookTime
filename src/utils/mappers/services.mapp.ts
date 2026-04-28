import {
    ServicesRow,
    ServicesEntity,
    ServicesInsert,
    ServicesUpdate
} from '../../types/db/services.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file services.mapp.ts
 * @summary Mapper для таблиці `services` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {ServicesRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {ServicesEntity}
 */
export const servicesRowToEntity = (row: ServicesRow): ServicesEntity => {
    return {
        id: row.id,
        studioId: row.studio_id,
        name: row.name,
        description: row.description,
        durationMinutes: row.duration_minutes,
        basePrice: row.base_price,
        currencyCode: row.currency_code,
        resultDescription: row.result_description,
        isActive: row.is_active,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {ServicesInsert} d - Дані для створення запису.
 * @returns {Partial<ServicesRow>}
 */
export const toInsertServices = (d: ServicesInsert) => {
    const out: Partial<ServicesRow> = {
        studio_id: d.studioId,
        name: d.name,
        description: d.description ?? null,
        duration_minutes: d.durationMinutes,
        base_price: d.basePrice,
        currency_code: d.currencyCode ?? undefined,
        result_description: d.resultDescription ?? null,
        is_active: d.isActive ?? undefined,
    };

    return out satisfies Partial<ServicesRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {ServicesUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<ServicesRow>}
 */
export const toUpdateServices = (patch?: ServicesUpdate) => {
    const out: Partial<ServicesRow> = {};

    if (!patch) return out;

    if ("studioId" in patch && patch.studioId !== undefined) {
        out.studio_id = patch.studioId;
    }

    if ("name" in patch && patch.name !== undefined) {
        out.name = patch.name;
    }

    if ("description" in patch && patch.description !== undefined) {
        out.description = patch.description;
    }

    if ("durationMinutes" in patch && patch.durationMinutes !== undefined) {
        out.duration_minutes = patch.durationMinutes;
    }

    if ("basePrice" in patch && patch.basePrice !== undefined) {
        out.base_price = patch.basePrice;
    }

    if ("currencyCode" in patch && patch.currencyCode !== undefined) {
        out.currency_code = patch.currencyCode;
    }

    if ("resultDescription" in patch && patch.resultDescription !== undefined) {
        out.result_description = patch.resultDescription;
    }

    if ("isActive" in patch && patch.isActive !== undefined) {
        out.is_active = patch.isActive;
    }

    return out satisfies Partial<ServicesRow>;
};
