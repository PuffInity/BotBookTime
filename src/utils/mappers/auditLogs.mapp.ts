import {
    AuditLogsRow,
    AuditLogsEntity,
    AuditLogsInsert,
    AuditLogsUpdate
} from '../../types/db/auditLogs.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file auditLogs.mapp.ts
 * @summary Mapper для таблиці `auditLogs` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {AuditLogsRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {AuditLogsEntity}
 */
export const auditLogsRowToEntity = (row: AuditLogsRow): AuditLogsEntity => {
    return {
        id: row.id,
        actorUserId: row.actor_user_id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        action: row.action,
        payload: row.payload,
        createdAt: toDate(row.created_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {AuditLogsInsert} d - Дані для створення запису.
 * @returns {Partial<AuditLogsRow>}
 */
export const toInsertAuditLogs = (d: AuditLogsInsert) => {
    const out: Partial<AuditLogsRow> = {
        actor_user_id: d.actorUserId ?? null,
        entity_type: d.entityType,
        entity_id: d.entityId,
        action: d.action,
        payload: d.payload ?? undefined,
    };

    return out satisfies Partial<AuditLogsRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {AuditLogsUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<AuditLogsRow>}
 */
export const toUpdateAuditLogs = (patch?: AuditLogsUpdate) => {
    const out: Partial<AuditLogsRow> = {};

    if (!patch) return out;

    if ("actorUserId" in patch && patch.actorUserId !== undefined) {
        out.actor_user_id = patch.actorUserId;
    }

    if ("entityType" in patch && patch.entityType !== undefined) {
        out.entity_type = patch.entityType;
    }

    if ("entityId" in patch && patch.entityId !== undefined) {
        out.entity_id = patch.entityId;
    }

    if ("action" in patch && patch.action !== undefined) {
        out.action = patch.action;
    }

    if ("payload" in patch && patch.payload !== undefined) {
        out.payload = patch.payload;
    }

    return out satisfies Partial<AuditLogsRow>;
};
