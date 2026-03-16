import {
    AppointmentReviewsRow,
    AppointmentReviewsEntity,
    AppointmentReviewsInsert,
    AppointmentReviewsUpdate
} from '../../types/db/appointmentReviews.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file appointmentReviews.mapp.ts
 * @summary Mapper для таблиці `appointmentReviews` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {AppointmentReviewsRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {AppointmentReviewsEntity}
 */
export const appointmentReviewsRowToEntity = (row: AppointmentReviewsRow): AppointmentReviewsEntity => {
    return {
        appointmentId: row.appointment_id,
        clientId: row.client_id,
        masterId: row.master_id,
        rating: row.rating,
        reviewText: row.review_text,
        createdAt: toDate(row.created_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {AppointmentReviewsInsert} d - Дані для створення запису.
 * @returns {Partial<AppointmentReviewsRow>}
 */
export const toInsertAppointmentReviews = (d: AppointmentReviewsInsert) => {
    const out: Partial<AppointmentReviewsRow> = {
        appointment_id: d.appointmentId,
        client_id: d.clientId,
        master_id: d.masterId,
        rating: d.rating,
        review_text: d.reviewText ?? null,
    };

    return out satisfies Partial<AppointmentReviewsRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {AppointmentReviewsUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<AppointmentReviewsRow>}
 */
export const toUpdateAppointmentReviews = (patch?: AppointmentReviewsUpdate) => {
    const out: Partial<AppointmentReviewsRow> = {};

    if (!patch) return out;

    if ("appointmentId" in patch && patch.appointmentId !== undefined) {
        out.appointment_id = patch.appointmentId;
    }

    if ("clientId" in patch && patch.clientId !== undefined) {
        out.client_id = patch.clientId;
    }

    if ("masterId" in patch && patch.masterId !== undefined) {
        out.master_id = patch.masterId;
    }

    if ("rating" in patch && patch.rating !== undefined) {
        out.rating = patch.rating;
    }

    if ("reviewText" in patch && patch.reviewText !== undefined) {
        out.review_text = patch.reviewText;
    }

    return out satisfies Partial<AppointmentReviewsRow>;
};
