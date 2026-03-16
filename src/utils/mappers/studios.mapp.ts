import {
    StudiosRow,
    StudiosEntity,
    StudiosInsert,
    StudiosUpdate
} from '../../types/db/studios.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file studios.mapp.ts
 * @summary Mapper для таблиці `studios` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {StudiosRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {StudiosEntity}
 */
export const studiosRowToEntity = (row: StudiosRow): StudiosEntity => {
    return {
        id: row.id,
        name: row.name,
        city: row.city,
        addressLine: row.address_line,
        phoneE164: row.phone_e164,
        email: row.email,
        timezone: row.timezone,
        currencyCode: row.currency_code,
        isActive: row.is_active,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {StudiosInsert} d - Дані для створення запису.
 * @returns {Partial<StudiosRow>}
 */
export const toInsertStudios = (d: StudiosInsert) => {
    const out: Partial<StudiosRow> = {
        name: d.name,
        city: d.city ?? null,
        address_line: d.addressLine ?? null,
        phone_e164: d.phoneE164 ?? null,
        email: d.email ?? null,
        timezone: d.timezone ?? undefined,
        currency_code: d.currencyCode ?? undefined,
        is_active: d.isActive ?? undefined,
    };

    return out satisfies Partial<StudiosRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {StudiosUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<StudiosRow>}
 */
export const toUpdateStudios = (patch?: StudiosUpdate) => {
    const out: Partial<StudiosRow> = {};

    if (!patch) return out;

    if ("name" in patch && patch.name !== undefined) {
        out.name = patch.name;
    }

    if ("city" in patch && patch.city !== undefined) {
        out.city = patch.city;
    }

    if ("addressLine" in patch && patch.addressLine !== undefined) {
        out.address_line = patch.addressLine;
    }

    if ("phoneE164" in patch && patch.phoneE164 !== undefined) {
        out.phone_e164 = patch.phoneE164;
    }

    if ("email" in patch && patch.email !== undefined) {
        out.email = patch.email;
    }

    if ("timezone" in patch && patch.timezone !== undefined) {
        out.timezone = patch.timezone;
    }

    if ("currencyCode" in patch && patch.currencyCode !== undefined) {
        out.currency_code = patch.currencyCode;
    }

    if ("isActive" in patch && patch.isActive !== undefined) {
        out.is_active = patch.isActive;
    }

    return out satisfies Partial<StudiosRow>;
};
