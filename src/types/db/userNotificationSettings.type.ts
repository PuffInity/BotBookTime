/**
 * @file userNotificationSettings.type.ts
 * @summary Database table type definitions.
 */
import type { NotificationType } from './dbEnums.type.js';

export type UserNotificationSettingsRow = {
    user_id: string,
    notification_type: NotificationType,
    enabled: boolean,
    updated_at: Date,
}

export type UserNotificationSettingsEntity = {
    userId: string,
    notificationType: NotificationType,
    enabled: boolean,
    updatedAt: Date,
}

export type UserNotificationSettingsInsert = {
    userId: string,
    notificationType: NotificationType,
    enabled?: boolean,
}

export type UserNotificationSettingsUpdate = Partial<{
    userId: string,
    notificationType: NotificationType,
    enabled: boolean,
}>
