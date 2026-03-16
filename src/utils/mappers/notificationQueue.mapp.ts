import {
    NotificationQueueRow,
    NotificationQueueEntity,
    NotificationQueueInsert,
    NotificationQueueUpdate
} from '../../types/db/notificationQueue.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file notificationQueue.mapp.ts
 * @summary Mapper для таблиці `notificationQueue` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {NotificationQueueRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {NotificationQueueEntity}
 */
export const notificationQueueRowToEntity = (row: NotificationQueueRow): NotificationQueueEntity => {
    return {
        id: row.id,
        userId: row.user_id,
        appointmentId: row.appointment_id,
        notificationType: row.notification_type,
        channel: row.channel,
        status: row.status,
        payload: row.payload,
        scheduledFor: toDate(row.scheduled_for),
        sentAt: row.sent_at ? toDate(row.sent_at) : null,
        attempts: row.attempts,
        lastError: row.last_error,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {NotificationQueueInsert} d - Дані для створення запису.
 * @returns {Partial<NotificationQueueRow>}
 */
export const toInsertNotificationQueue = (d: NotificationQueueInsert) => {
    const out: Partial<NotificationQueueRow> = {
        user_id: d.userId,
        appointment_id: d.appointmentId ?? null,
        notification_type: d.notificationType,
        channel: d.channel ?? undefined,
        status: d.status ?? undefined,
        payload: d.payload ?? undefined,
        scheduled_for: toDate(d.scheduledFor),
        sent_at: d.sentAt ? toDate(d.sentAt) : null,
        attempts: d.attempts ?? undefined,
        last_error: d.lastError ?? null,
    };

    return out satisfies Partial<NotificationQueueRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {NotificationQueueUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<NotificationQueueRow>}
 */
export const toUpdateNotificationQueue = (patch?: NotificationQueueUpdate) => {
    const out: Partial<NotificationQueueRow> = {};

    if (!patch) return out;

    if ("userId" in patch && patch.userId !== undefined) {
        out.user_id = patch.userId;
    }

    if ("appointmentId" in patch && patch.appointmentId !== undefined) {
        out.appointment_id = patch.appointmentId;
    }

    if ("notificationType" in patch && patch.notificationType !== undefined) {
        out.notification_type = patch.notificationType;
    }

    if ("channel" in patch && patch.channel !== undefined) {
        out.channel = patch.channel;
    }

    if ("status" in patch && patch.status !== undefined) {
        out.status = patch.status;
    }

    if ("payload" in patch && patch.payload !== undefined) {
        out.payload = patch.payload;
    }

    if ("scheduledFor" in patch && patch.scheduledFor !== undefined) {
        out.scheduled_for = toDate(patch.scheduledFor);
    }

    if ("sentAt" in patch && patch.sentAt !== undefined) {
        out.sent_at = patch.sentAt ? toDate(patch.sentAt) : null;
    }

    if ("attempts" in patch && patch.attempts !== undefined) {
        out.attempts = patch.attempts;
    }

    if ("lastError" in patch && patch.lastError !== undefined) {
        out.last_error = patch.lastError;
    }

    return out satisfies Partial<NotificationQueueRow>;
};
