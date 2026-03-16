import {
    UserNotificationSettingsRow,
    UserNotificationSettingsEntity,
    UserNotificationSettingsInsert,
    UserNotificationSettingsUpdate
} from '../../types/db/userNotificationSettings.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file userNotificationSettings.mapp.ts
 * @summary Mapper для таблиці `userNotificationSettings` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {UserNotificationSettingsRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {UserNotificationSettingsEntity}
 */
export const userNotificationSettingsRowToEntity = (row: UserNotificationSettingsRow): UserNotificationSettingsEntity => {
    return {
        userId: row.user_id,
        notificationType: row.notification_type,
        enabled: row.enabled,
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {UserNotificationSettingsInsert} d - Дані для створення запису.
 * @returns {Partial<UserNotificationSettingsRow>}
 */
export const toInsertUserNotificationSettings = (d: UserNotificationSettingsInsert) => {
    const out: Partial<UserNotificationSettingsRow> = {
        user_id: d.userId,
        notification_type: d.notificationType,
        enabled: d.enabled ?? undefined,
    };

    return out satisfies Partial<UserNotificationSettingsRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {UserNotificationSettingsUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<UserNotificationSettingsRow>}
 */
export const toUpdateUserNotificationSettings = (patch?: UserNotificationSettingsUpdate) => {
    const out: Partial<UserNotificationSettingsRow> = {};

    if (!patch) return out;

    if ("userId" in patch && patch.userId !== undefined) {
        out.user_id = patch.userId;
    }

    if ("notificationType" in patch && patch.notificationType !== undefined) {
        out.notification_type = patch.notificationType;
    }

    if ("enabled" in patch && patch.enabled !== undefined) {
        out.enabled = patch.enabled;
    }

    return out satisfies Partial<UserNotificationSettingsRow>;
};
