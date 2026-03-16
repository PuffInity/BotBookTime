import {
    AppointmentStatusHistoryRow,
    AppointmentStatusHistoryEntity,
    AppointmentStatusHistoryInsert,
    AppointmentStatusHistoryUpdate
} from '../../types/db/appointmentStatusHistory.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file appointmentStatusHistory.mapp.ts
 * @summary Mapper для таблиці `appointmentStatusHistory` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {AppointmentStatusHistoryRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {AppointmentStatusHistoryEntity}
 */
export const appointmentStatusHistoryRowToEntity = (row: AppointmentStatusHistoryRow): AppointmentStatusHistoryEntity => {
    return {
        id: row.id,
        appointmentId: row.appointment_id,
        oldStatus: row.old_status,
        newStatus: row.new_status,
        changedBy: row.changed_by,
        comment: row.comment,
        createdAt: toDate(row.created_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {AppointmentStatusHistoryInsert} d - Дані для створення запису.
 * @returns {Partial<AppointmentStatusHistoryRow>}
 */
export const toInsertAppointmentStatusHistory = (d: AppointmentStatusHistoryInsert) => {
    const out: Partial<AppointmentStatusHistoryRow> = {
        appointment_id: d.appointmentId,
        old_status: d.oldStatus ?? null,
        new_status: d.newStatus,
        changed_by: d.changedBy ?? null,
        comment: d.comment ?? null,
    };

    return out satisfies Partial<AppointmentStatusHistoryRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {AppointmentStatusHistoryUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<AppointmentStatusHistoryRow>}
 */
export const toUpdateAppointmentStatusHistory = (patch?: AppointmentStatusHistoryUpdate) => {
    const out: Partial<AppointmentStatusHistoryRow> = {};

    if (!patch) return out;

    if ("appointmentId" in patch && patch.appointmentId !== undefined) {
        out.appointment_id = patch.appointmentId;
    }

    if ("oldStatus" in patch && patch.oldStatus !== undefined) {
        out.old_status = patch.oldStatus;
    }

    if ("newStatus" in patch && patch.newStatus !== undefined) {
        out.new_status = patch.newStatus;
    }

    if ("changedBy" in patch && patch.changedBy !== undefined) {
        out.changed_by = patch.changedBy;
    }

    if ("comment" in patch && patch.comment !== undefined) {
        out.comment = patch.comment;
    }

    return out satisfies Partial<AppointmentStatusHistoryRow>;
};
