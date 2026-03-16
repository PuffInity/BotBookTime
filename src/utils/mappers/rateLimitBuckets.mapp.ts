import {
    RateLimitBucketsRow,
    RateLimitBucketsEntity,
    RateLimitBucketsInsert,
    RateLimitBucketsUpdate
} from '../../types/db/rateLimitBuckets.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file rateLimitBuckets.mapp.ts
 * @summary Mapper для таблиці `rateLimitBuckets` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {RateLimitBucketsRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {RateLimitBucketsEntity}
 */
export const rateLimitBucketsRowToEntity = (row: RateLimitBucketsRow): RateLimitBucketsEntity => {
    return {
        id: row.id,
        subjectType: row.subject_type,
        subjectKey: row.subject_key,
        actionKey: row.action_key,
        windowStartedAt: toDate(row.window_started_at),
        windowEndsAt: toDate(row.window_ends_at),
        attempts: row.attempts,
        maxAttempts: row.max_attempts,
        blockedUntil: row.blocked_until ? toDate(row.blocked_until) : null,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {RateLimitBucketsInsert} d - Дані для створення запису.
 * @returns {Partial<RateLimitBucketsRow>}
 */
export const toInsertRateLimitBuckets = (d: RateLimitBucketsInsert) => {
    const out: Partial<RateLimitBucketsRow> = {
        subject_type: d.subjectType,
        subject_key: d.subjectKey,
        action_key: d.actionKey,
        window_started_at: toDate(d.windowStartedAt),
        window_ends_at: toDate(d.windowEndsAt),
        attempts: d.attempts ?? undefined,
        max_attempts: d.maxAttempts,
        blocked_until: d.blockedUntil ? toDate(d.blockedUntil) : null,
    };

    return out satisfies Partial<RateLimitBucketsRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {RateLimitBucketsUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<RateLimitBucketsRow>}
 */
export const toUpdateRateLimitBuckets = (patch?: RateLimitBucketsUpdate) => {
    const out: Partial<RateLimitBucketsRow> = {};

    if (!patch) return out;

    if ("subjectType" in patch && patch.subjectType !== undefined) {
        out.subject_type = patch.subjectType;
    }

    if ("subjectKey" in patch && patch.subjectKey !== undefined) {
        out.subject_key = patch.subjectKey;
    }

    if ("actionKey" in patch && patch.actionKey !== undefined) {
        out.action_key = patch.actionKey;
    }

    if ("windowStartedAt" in patch && patch.windowStartedAt !== undefined) {
        out.window_started_at = toDate(patch.windowStartedAt);
    }

    if ("windowEndsAt" in patch && patch.windowEndsAt !== undefined) {
        out.window_ends_at = toDate(patch.windowEndsAt);
    }

    if ("attempts" in patch && patch.attempts !== undefined) {
        out.attempts = patch.attempts;
    }

    if ("maxAttempts" in patch && patch.maxAttempts !== undefined) {
        out.max_attempts = patch.maxAttempts;
    }

    if ("blockedUntil" in patch && patch.blockedUntil !== undefined) {
        out.blocked_until = patch.blockedUntil ? toDate(patch.blockedUntil) : null;
    }

    return out satisfies Partial<RateLimitBucketsRow>;
};
