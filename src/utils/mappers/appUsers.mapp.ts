import {
    AppUsersRow,
    AppUsersEntity,
    AppUsersInsert,
    AppUsersUpdate
} from '../../types/db/appUsers.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file appUsers.mapp.ts
 * @summary Mapper для таблиці `appUsers` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {AppUsersRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {AppUsersEntity}
 */
export const appUsersRowToEntity = (row: AppUsersRow): AppUsersEntity => {
    return {
        id: row.id,
        studioId: row.studio_id,
        telegramUserId: row.telegram_user_id,
        telegramUsername: row.telegram_username,
        firstName: row.first_name,
        lastName: row.last_name,
        phoneE164: row.phone_e164,
        phoneVerifiedAt: row.phone_verified_at ? toDate(row.phone_verified_at) : null,
        email: row.email,
        emailVerifiedAt: row.email_verified_at ? toDate(row.email_verified_at) : null,
        preferredLanguage: row.preferred_language,
        timezone: row.timezone,
        isActive: row.is_active,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {AppUsersInsert} d - Дані для створення запису.
 * @returns {Partial<AppUsersRow>}
 */
export const toInsertAppUsers = (d: AppUsersInsert) => {
    const out: Partial<AppUsersRow> = {
        studio_id: d.studioId ?? null,
        telegram_user_id: d.telegramUserId,
        telegram_username: d.telegramUsername ?? null,
        first_name: d.firstName,
        last_name: d.lastName ?? null,
        phone_e164: d.phoneE164 ?? null,
        phone_verified_at: d.phoneVerifiedAt ? toDate(d.phoneVerifiedAt) : null,
        email: d.email ?? null,
        email_verified_at: d.emailVerifiedAt ? toDate(d.emailVerifiedAt) : null,
        preferred_language: d.preferredLanguage ?? undefined,
        timezone: d.timezone ?? undefined,
        is_active: d.isActive ?? undefined,
    };

    return out satisfies Partial<AppUsersRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {AppUsersUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<AppUsersRow>}
 */
export const toUpdateAppUsers = (patch?: AppUsersUpdate) => {
    const out: Partial<AppUsersRow> = {};

    if (!patch) return out;

    if ("studioId" in patch && patch.studioId !== undefined) {
        out.studio_id = patch.studioId;
    }

    if ("telegramUserId" in patch && patch.telegramUserId !== undefined) {
        out.telegram_user_id = patch.telegramUserId;
    }

    if ("telegramUsername" in patch && patch.telegramUsername !== undefined) {
        out.telegram_username = patch.telegramUsername;
    }

    if ("firstName" in patch && patch.firstName !== undefined) {
        out.first_name = patch.firstName;
    }

    if ("lastName" in patch && patch.lastName !== undefined) {
        out.last_name = patch.lastName;
    }

    if ("phoneE164" in patch && patch.phoneE164 !== undefined) {
        out.phone_e164 = patch.phoneE164;
    }

    if ("phoneVerifiedAt" in patch && patch.phoneVerifiedAt !== undefined) {
        out.phone_verified_at = patch.phoneVerifiedAt ? toDate(patch.phoneVerifiedAt) : null;
    }

    if ("email" in patch && patch.email !== undefined) {
        out.email = patch.email;
    }

    if ("emailVerifiedAt" in patch && patch.emailVerifiedAt !== undefined) {
        out.email_verified_at = patch.emailVerifiedAt ? toDate(patch.emailVerifiedAt) : null;
    }

    if ("preferredLanguage" in patch && patch.preferredLanguage !== undefined) {
        out.preferred_language = patch.preferredLanguage;
    }

    if ("timezone" in patch && patch.timezone !== undefined) {
        out.timezone = patch.timezone;
    }

    if ("isActive" in patch && patch.isActive !== undefined) {
        out.is_active = patch.isActive;
    }

    return out satisfies Partial<AppUsersRow>;
};
