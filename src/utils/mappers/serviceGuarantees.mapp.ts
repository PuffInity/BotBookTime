import {
    ServiceGuaranteesRow,
    ServiceGuaranteesEntity,
    ServiceGuaranteesInsert,
    ServiceGuaranteesUpdate
} from '../../types/db/serviceGuarantees.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file serviceGuarantees.mapp.ts
 * @summary Mapper для таблиці `serviceGuarantees` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {ServiceGuaranteesRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {ServiceGuaranteesEntity}
 */
export const serviceGuaranteesRowToEntity = (row: ServiceGuaranteesRow): ServiceGuaranteesEntity => {
    return {
        serviceId: row.service_id,
        guaranteeNo: row.guarantee_no,
        guaranteeText: row.guarantee_text,
        validDays: row.valid_days,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {ServiceGuaranteesInsert} d - Дані для створення запису.
 * @returns {Partial<ServiceGuaranteesRow>}
 */
export const toInsertServiceGuarantees = (d: ServiceGuaranteesInsert) => {
    const out: Partial<ServiceGuaranteesRow> = {
        service_id: d.serviceId,
        guarantee_no: d.guaranteeNo,
        guarantee_text: d.guaranteeText,
        valid_days: d.validDays ?? null,
    };

    return out satisfies Partial<ServiceGuaranteesRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {ServiceGuaranteesUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<ServiceGuaranteesRow>}
 */
export const toUpdateServiceGuarantees = (patch?: ServiceGuaranteesUpdate) => {
    const out: Partial<ServiceGuaranteesRow> = {};

    if (!patch) return out;

    if ("serviceId" in patch && patch.serviceId !== undefined) {
        out.service_id = patch.serviceId;
    }

    if ("guaranteeNo" in patch && patch.guaranteeNo !== undefined) {
        out.guarantee_no = patch.guaranteeNo;
    }

    if ("guaranteeText" in patch && patch.guaranteeText !== undefined) {
        out.guarantee_text = patch.guaranteeText;
    }

    if ("validDays" in patch && patch.validDays !== undefined) {
        out.valid_days = patch.validDays;
    }

    return out satisfies Partial<ServiceGuaranteesRow>;
};
