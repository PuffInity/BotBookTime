import {
    UserRolesRow,
    UserRolesEntity,
    UserRolesInsert,
    UserRolesUpdate
} from '../../types/db/userRoles.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file userRoles.mapp.ts
 * @summary Mapper для таблиці `userRoles` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {UserRolesRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {UserRolesEntity}
 */
export const userRolesRowToEntity = (row: UserRolesRow): UserRolesEntity => {
    return {
        userId: row.user_id,
        role: row.role,
        grantedBy: row.granted_by,
        grantedAt: toDate(row.granted_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {UserRolesInsert} d - Дані для створення запису.
 * @returns {Partial<UserRolesRow>}
 */
export const toInsertUserRoles = (d: UserRolesInsert) => {
    const out: Partial<UserRolesRow> = {
        user_id: d.userId,
        role: d.role,
        granted_by: d.grantedBy ?? null,
        granted_at: d.grantedAt ? toDate(d.grantedAt) : undefined,
    };

    return out satisfies Partial<UserRolesRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {UserRolesUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<UserRolesRow>}
 */
export const toUpdateUserRoles = (patch?: UserRolesUpdate) => {
    const out: Partial<UserRolesRow> = {};

    if (!patch) return out;

    if ("userId" in patch && patch.userId !== undefined) {
        out.user_id = patch.userId;
    }

    if ("role" in patch && patch.role !== undefined) {
        out.role = patch.role;
    }

    if ("grantedBy" in patch && patch.grantedBy !== undefined) {
        out.granted_by = patch.grantedBy;
    }

    if ("grantedAt" in patch && patch.grantedAt !== undefined) {
        out.granted_at = toDate(patch.grantedAt);
    }

    return out satisfies Partial<UserRolesRow>;
};
