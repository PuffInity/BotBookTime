import {
    VerificationCodesRow,
    VerificationCodesEntity,
    VerificationCodesInsert,
    VerificationCodesUpdate
} from '../../types/db/verificationCodes.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file verificationCodes.mapp.ts
 * @summary Mapper для таблиці `verificationCodes` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {VerificationCodesRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {VerificationCodesEntity}
 */
export const verificationCodesRowToEntity = (row: VerificationCodesRow): VerificationCodesEntity => {
    return {
        id: row.id,
        userId: row.user_id,
        channel: row.channel,
        purpose: row.purpose,
        destination: row.destination,
        codeHash: row.code_hash,
        attemptsUsed: row.attempts_used,
        maxAttempts: row.max_attempts,
        expiresAt: toDate(row.expires_at),
        consumedAt: row.consumed_at ? toDate(row.consumed_at) : null,
        lastSentAt: toDate(row.last_sent_at),
        createdAt: toDate(row.created_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {VerificationCodesInsert} d - Дані для створення запису.
 * @returns {Partial<VerificationCodesRow>}
 */
export const toInsertVerificationCodes = (d: VerificationCodesInsert) => {
    const out: Partial<VerificationCodesRow> = {
        user_id: d.userId,
        channel: d.channel,
        purpose: d.purpose,
        destination: d.destination,
        code_hash: d.codeHash,
        attempts_used: d.attemptsUsed ?? undefined,
        max_attempts: d.maxAttempts ?? undefined,
        expires_at: toDate(d.expiresAt),
        consumed_at: d.consumedAt ? toDate(d.consumedAt) : null,
        last_sent_at: d.lastSentAt ? toDate(d.lastSentAt) : undefined,
    };

    return out satisfies Partial<VerificationCodesRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {VerificationCodesUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<VerificationCodesRow>}
 */
export const toUpdateVerificationCodes = (patch?: VerificationCodesUpdate) => {
    const out: Partial<VerificationCodesRow> = {};

    if (!patch) return out;

    if ("userId" in patch && patch.userId !== undefined) {
        out.user_id = patch.userId;
    }

    if ("channel" in patch && patch.channel !== undefined) {
        out.channel = patch.channel;
    }

    if ("purpose" in patch && patch.purpose !== undefined) {
        out.purpose = patch.purpose;
    }

    if ("destination" in patch && patch.destination !== undefined) {
        out.destination = patch.destination;
    }

    if ("codeHash" in patch && patch.codeHash !== undefined) {
        out.code_hash = patch.codeHash;
    }

    if ("attemptsUsed" in patch && patch.attemptsUsed !== undefined) {
        out.attempts_used = patch.attemptsUsed;
    }

    if ("maxAttempts" in patch && patch.maxAttempts !== undefined) {
        out.max_attempts = patch.maxAttempts;
    }

    if ("expiresAt" in patch && patch.expiresAt !== undefined) {
        out.expires_at = toDate(patch.expiresAt);
    }

    if ("consumedAt" in patch && patch.consumedAt !== undefined) {
        out.consumed_at = patch.consumedAt ? toDate(patch.consumedAt) : null;
    }

    if ("lastSentAt" in patch && patch.lastSentAt !== undefined) {
        out.last_sent_at = toDate(patch.lastSentAt);
    }

    return out satisfies Partial<VerificationCodesRow>;
};
