import {
    AppointmentTransfersRow,
    AppointmentTransfersEntity,
    AppointmentTransfersInsert,
    AppointmentTransfersUpdate
} from '../../types/db/appointmentTransfers.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file appointmentTransfers.mapp.ts
 * @summary Mapper для таблиці `appointmentTransfers` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {AppointmentTransfersRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {AppointmentTransfersEntity}
 */
export const appointmentTransfersRowToEntity = (row: AppointmentTransfersRow): AppointmentTransfersEntity => {
    return {
        id: row.id,
        fromAppointmentId: row.from_appointment_id,
        toAppointmentId: row.to_appointment_id,
        transferredBy: row.transferred_by,
        reason: row.reason,
        createdAt: toDate(row.created_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {AppointmentTransfersInsert} d - Дані для створення запису.
 * @returns {Partial<AppointmentTransfersRow>}
 */
export const toInsertAppointmentTransfers = (d: AppointmentTransfersInsert) => {
    const out: Partial<AppointmentTransfersRow> = {
        from_appointment_id: d.fromAppointmentId,
        to_appointment_id: d.toAppointmentId,
        transferred_by: d.transferredBy ?? null,
        reason: d.reason ?? null,
    };

    return out satisfies Partial<AppointmentTransfersRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {AppointmentTransfersUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<AppointmentTransfersRow>}
 */
export const toUpdateAppointmentTransfers = (patch?: AppointmentTransfersUpdate) => {
    const out: Partial<AppointmentTransfersRow> = {};

    if (!patch) return out;

    if ("fromAppointmentId" in patch && patch.fromAppointmentId !== undefined) {
        out.from_appointment_id = patch.fromAppointmentId;
    }

    if ("toAppointmentId" in patch && patch.toAppointmentId !== undefined) {
        out.to_appointment_id = patch.toAppointmentId;
    }

    if ("transferredBy" in patch && patch.transferredBy !== undefined) {
        out.transferred_by = patch.transferredBy;
    }

    if ("reason" in patch && patch.reason !== undefined) {
        out.reason = patch.reason;
    }

    return out satisfies Partial<AppointmentTransfersRow>;
};
