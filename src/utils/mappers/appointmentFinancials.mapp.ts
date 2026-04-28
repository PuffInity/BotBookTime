import {
    AppointmentFinancialsRow,
    AppointmentFinancialsEntity,
    AppointmentFinancialsInsert,
    AppointmentFinancialsUpdate
} from '../../types/db/appointmentFinancials.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file appointmentFinancials.mapp.ts
 * @summary Mapper для таблиці `appointmentFinancials` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {AppointmentFinancialsRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {AppointmentFinancialsEntity}
 */
export const appointmentFinancialsRowToEntity = (row: AppointmentFinancialsRow): AppointmentFinancialsEntity => {
    return {
        appointmentId: row.appointment_id,
        paymentStatus: row.payment_status,
        amountTotal: row.amount_total,
        amountPaid: row.amount_paid,
        salonShareAmount: row.salon_share_amount,
        masterShareAmount: row.master_share_amount,
        paidAt: row.paid_at ? toDate(row.paid_at) : null,
        paymentMethod: row.payment_method,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {AppointmentFinancialsInsert} d - Дані для створення запису.
 * @returns {Partial<AppointmentFinancialsRow>}
 */
export const toInsertAppointmentFinancials = (d: AppointmentFinancialsInsert) => {
    const out: Partial<AppointmentFinancialsRow> = {
        appointment_id: d.appointmentId,
        payment_status: d.paymentStatus ?? undefined,
        amount_total: d.amountTotal,
        amount_paid: d.amountPaid ?? undefined,
        salon_share_amount: d.salonShareAmount ?? undefined,
        master_share_amount: d.masterShareAmount ?? undefined,
        paid_at: d.paidAt ? toDate(d.paidAt) : null,
        payment_method: d.paymentMethod ?? null,
    };

    return out satisfies Partial<AppointmentFinancialsRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {AppointmentFinancialsUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<AppointmentFinancialsRow>}
 */
export const toUpdateAppointmentFinancials = (patch?: AppointmentFinancialsUpdate) => {
    const out: Partial<AppointmentFinancialsRow> = {};

    if (!patch) return out;

    if ("appointmentId" in patch && patch.appointmentId !== undefined) {
        out.appointment_id = patch.appointmentId;
    }

    if ("paymentStatus" in patch && patch.paymentStatus !== undefined) {
        out.payment_status = patch.paymentStatus;
    }

    if ("amountTotal" in patch && patch.amountTotal !== undefined) {
        out.amount_total = patch.amountTotal;
    }

    if ("amountPaid" in patch && patch.amountPaid !== undefined) {
        out.amount_paid = patch.amountPaid;
    }

    if ("salonShareAmount" in patch && patch.salonShareAmount !== undefined) {
        out.salon_share_amount = patch.salonShareAmount;
    }

    if ("masterShareAmount" in patch && patch.masterShareAmount !== undefined) {
        out.master_share_amount = patch.masterShareAmount;
    }

    if ("paidAt" in patch && patch.paidAt !== undefined) {
        out.paid_at = patch.paidAt ? toDate(patch.paidAt) : null;
    }

    if ("paymentMethod" in patch && patch.paymentMethod !== undefined) {
        out.payment_method = patch.paymentMethod;
    }

    return out satisfies Partial<AppointmentFinancialsRow>;
};
