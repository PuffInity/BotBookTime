import {
    AppointmentsRow,
    AppointmentsEntity,
    AppointmentsInsert,
    AppointmentsUpdate
} from '../../types/db/appointments.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file appointments.mapp.ts
 * @summary Mapper для таблиці `appointments` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {AppointmentsRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {AppointmentsEntity}
 */
export const appointmentsRowToEntity = (row: AppointmentsRow): AppointmentsEntity => {
    return {
        id: row.id,
        studioId: row.studio_id,
        clientId: row.client_id,
        bookedForUserId: row.booked_for_user_id,
        masterId: row.master_id,
        serviceId: row.service_id,
        source: row.source,
        status: row.status,
        attendeeName: row.attendee_name,
        attendeePhoneE164: row.attendee_phone_e164,
        attendeeEmail: row.attendee_email,
        clientComment: row.client_comment,
        internalComment: row.internal_comment,
        startAt: toDate(row.start_at),
        endAt: toDate(row.end_at),
        slot: row.slot,
        priceAmount: row.price_amount,
        currencyCode: row.currency_code,
        createdBy: row.created_by,
        updatedBy: row.updated_by,
        confirmedAt: row.confirmed_at ? toDate(row.confirmed_at) : null,
        canceledAt: row.canceled_at ? toDate(row.canceled_at) : null,
        completedAt: row.completed_at ? toDate(row.completed_at) : null,
        transferredAt: row.transferred_at ? toDate(row.transferred_at) : null,
        canceledReason: row.canceled_reason,
        deletedAt: row.deleted_at ? toDate(row.deleted_at) : null,
        deletedBy: row.deleted_by,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {AppointmentsInsert} d - Дані для створення запису.
 * @returns {Partial<AppointmentsRow>}
 */
export const toInsertAppointments = (d: AppointmentsInsert) => {
    const out: Partial<AppointmentsRow> = {
        studio_id: d.studioId,
        client_id: d.clientId,
        booked_for_user_id: d.bookedForUserId ?? null,
        master_id: d.masterId,
        service_id: d.serviceId,
        source: d.source ?? undefined,
        status: d.status ?? undefined,
        attendee_name: d.attendeeName ?? null,
        attendee_phone_e164: d.attendeePhoneE164 ?? null,
        attendee_email: d.attendeeEmail ?? null,
        client_comment: d.clientComment ?? null,
        internal_comment: d.internalComment ?? null,
        start_at: toDate(d.startAt),
        end_at: toDate(d.endAt),
        price_amount: d.priceAmount,
        currency_code: d.currencyCode ?? undefined,
        created_by: d.createdBy ?? null,
        updated_by: d.updatedBy ?? null,
        confirmed_at: d.confirmedAt ? toDate(d.confirmedAt) : null,
        canceled_at: d.canceledAt ? toDate(d.canceledAt) : null,
        completed_at: d.completedAt ? toDate(d.completedAt) : null,
        transferred_at: d.transferredAt ? toDate(d.transferredAt) : null,
        canceled_reason: d.canceledReason ?? null,
        deleted_at: d.deletedAt ? toDate(d.deletedAt) : null,
        deleted_by: d.deletedBy ?? null,
    };

    return out satisfies Partial<AppointmentsRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {AppointmentsUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<AppointmentsRow>}
 */
export const toUpdateAppointments = (patch?: AppointmentsUpdate) => {
    const out: Partial<AppointmentsRow> = {};

    if (!patch) return out;

    if ("studioId" in patch && patch.studioId !== undefined) {
        out.studio_id = patch.studioId;
    }

    if ("clientId" in patch && patch.clientId !== undefined) {
        out.client_id = patch.clientId;
    }

    if ("bookedForUserId" in patch && patch.bookedForUserId !== undefined) {
        out.booked_for_user_id = patch.bookedForUserId;
    }

    if ("masterId" in patch && patch.masterId !== undefined) {
        out.master_id = patch.masterId;
    }

    if ("serviceId" in patch && patch.serviceId !== undefined) {
        out.service_id = patch.serviceId;
    }

    if ("source" in patch && patch.source !== undefined) {
        out.source = patch.source;
    }

    if ("status" in patch && patch.status !== undefined) {
        out.status = patch.status;
    }

    if ("attendeeName" in patch && patch.attendeeName !== undefined) {
        out.attendee_name = patch.attendeeName;
    }

    if ("attendeePhoneE164" in patch && patch.attendeePhoneE164 !== undefined) {
        out.attendee_phone_e164 = patch.attendeePhoneE164;
    }

    if ("attendeeEmail" in patch && patch.attendeeEmail !== undefined) {
        out.attendee_email = patch.attendeeEmail;
    }

    if ("clientComment" in patch && patch.clientComment !== undefined) {
        out.client_comment = patch.clientComment;
    }

    if ("internalComment" in patch && patch.internalComment !== undefined) {
        out.internal_comment = patch.internalComment;
    }

    if ("startAt" in patch && patch.startAt !== undefined) {
        out.start_at = toDate(patch.startAt);
    }

    if ("endAt" in patch && patch.endAt !== undefined) {
        out.end_at = toDate(patch.endAt);
    }

    if ("priceAmount" in patch && patch.priceAmount !== undefined) {
        out.price_amount = patch.priceAmount;
    }

    if ("currencyCode" in patch && patch.currencyCode !== undefined) {
        out.currency_code = patch.currencyCode;
    }

    if ("createdBy" in patch && patch.createdBy !== undefined) {
        out.created_by = patch.createdBy;
    }

    if ("updatedBy" in patch && patch.updatedBy !== undefined) {
        out.updated_by = patch.updatedBy;
    }

    if ("confirmedAt" in patch && patch.confirmedAt !== undefined) {
        out.confirmed_at = patch.confirmedAt ? toDate(patch.confirmedAt) : null;
    }

    if ("canceledAt" in patch && patch.canceledAt !== undefined) {
        out.canceled_at = patch.canceledAt ? toDate(patch.canceledAt) : null;
    }

    if ("completedAt" in patch && patch.completedAt !== undefined) {
        out.completed_at = patch.completedAt ? toDate(patch.completedAt) : null;
    }

    if ("transferredAt" in patch && patch.transferredAt !== undefined) {
        out.transferred_at = patch.transferredAt ? toDate(patch.transferredAt) : null;
    }

    if ("canceledReason" in patch && patch.canceledReason !== undefined) {
        out.canceled_reason = patch.canceledReason;
    }

    if ("deletedAt" in patch && patch.deletedAt !== undefined) {
        out.deleted_at = patch.deletedAt ? toDate(patch.deletedAt) : null;
    }

    if ("deletedBy" in patch && patch.deletedBy !== undefined) {
        out.deleted_by = patch.deletedBy;
    }

    return out satisfies Partial<AppointmentsRow>;
};
