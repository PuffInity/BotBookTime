import {
    ServiceStepsRow,
    ServiceStepsEntity,
    ServiceStepsInsert,
    ServiceStepsUpdate
} from '../../types/db/serviceSteps.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file serviceSteps.mapp.ts
 * @summary Mapper для таблиці `serviceSteps` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {ServiceStepsRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {ServiceStepsEntity}
 */
export const serviceStepsRowToEntity = (row: ServiceStepsRow): ServiceStepsEntity => {
    return {
        serviceId: row.service_id,
        stepNo: row.step_no,
        durationMinutes: row.duration_minutes,
        title: row.title,
        description: row.description,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {ServiceStepsInsert} d - Дані для створення запису.
 * @returns {Partial<ServiceStepsRow>}
 */
export const toInsertServiceSteps = (d: ServiceStepsInsert) => {
    const out: Partial<ServiceStepsRow> = {
        service_id: d.serviceId,
        step_no: d.stepNo,
        duration_minutes: d.durationMinutes ?? 10,
        title: d.title,
        description: d.description,
    };

    return out satisfies Partial<ServiceStepsRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {ServiceStepsUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<ServiceStepsRow>}
 */
export const toUpdateServiceSteps = (patch?: ServiceStepsUpdate) => {
    const out: Partial<ServiceStepsRow> = {};

    if (!patch) return out;

    if ("serviceId" in patch && patch.serviceId !== undefined) {
        out.service_id = patch.serviceId;
    }

    if ("stepNo" in patch && patch.stepNo !== undefined) {
        out.step_no = patch.stepNo;
    }

    if ("durationMinutes" in patch && patch.durationMinutes !== undefined) {
        out.duration_minutes = patch.durationMinutes;
    }

    if ("title" in patch && patch.title !== undefined) {
        out.title = patch.title;
    }

    if ("description" in patch && patch.description !== undefined) {
        out.description = patch.description;
    }

    return out satisfies Partial<ServiceStepsRow>;
};
