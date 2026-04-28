import {
    MasterServicesRow,
    MasterServicesEntity,
    MasterServicesInsert,
    MasterServicesUpdate
} from '../../types/db/masterServices.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file masterServices.mapp.ts
 * @summary Mapper для таблиці `masterServices` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {MasterServicesRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {MasterServicesEntity}
 */
export const masterServicesRowToEntity = (row: MasterServicesRow): MasterServicesEntity => {
    return {
        studioId: row.studio_id,
        masterId: row.master_id,
        serviceId: row.service_id,
        customPrice: row.custom_price,
        customDurationMinutes: row.custom_duration_minutes,
        isActive: row.is_active,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {MasterServicesInsert} d - Дані для створення запису.
 * @returns {Partial<MasterServicesRow>}
 */
export const toInsertMasterServices = (d: MasterServicesInsert) => {
    const out: Partial<MasterServicesRow> = {
        studio_id: d.studioId,
        master_id: d.masterId,
        service_id: d.serviceId,
        custom_price: d.customPrice ?? null,
        custom_duration_minutes: d.customDurationMinutes ?? null,
        is_active: d.isActive ?? undefined,
    };

    return out satisfies Partial<MasterServicesRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {MasterServicesUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<MasterServicesRow>}
 */
export const toUpdateMasterServices = (patch?: MasterServicesUpdate) => {
    const out: Partial<MasterServicesRow> = {};

    if (!patch) return out;

    if ("studioId" in patch && patch.studioId !== undefined) {
        out.studio_id = patch.studioId;
    }

    if ("masterId" in patch && patch.masterId !== undefined) {
        out.master_id = patch.masterId;
    }

    if ("serviceId" in patch && patch.serviceId !== undefined) {
        out.service_id = patch.serviceId;
    }

    if ("customPrice" in patch && patch.customPrice !== undefined) {
        out.custom_price = patch.customPrice;
    }

    if ("customDurationMinutes" in patch && patch.customDurationMinutes !== undefined) {
        out.custom_duration_minutes = patch.customDurationMinutes;
    }

    if ("isActive" in patch && patch.isActive !== undefined) {
        out.is_active = patch.isActive;
    }

    return out satisfies Partial<MasterServicesRow>;
};
