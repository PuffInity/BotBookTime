import type {
  UserNotificationSettingsEntity,
  UserNotificationSettingsRow,
} from '../../types/db/index.js';
import type {
  NotificationSettingsState,
  SetAllNotificationSettingsInput,
  SetNotificationSettingInput,
  UserDeliveryProfile,
  UserDeliveryProfileRow,
} from '../../types/db-helpers/db-notification-settings.types.js';
import { userNotificationSettingsRowToEntity } from '../../utils/mappers/userNotificationSettings.mapp.js';
import { executeOne, executeVoid, queryMany, queryOne, withTransaction } from '../db.helper.js';
import {
  normalizeNotificationEnabled,
  normalizeNotificationType,
  normalizeNotificationUserId,
} from '../../utils/db/db-notification-settings.js';
import { NOTIFICATION_TYPES } from '../../types/db-helpers/db-notification-settings.types.js';
import {
  SQL_SELECT_USER_DELIVERY_PROFILE_BY_ID,
  SQL_SELECT_USER_NOTIFICATION_SETTINGS_BY_USER_ID,
  SQL_UPSERT_ALL_USER_NOTIFICATION_SETTINGS,
  SQL_UPSERT_USER_NOTIFICATION_SETTING,
} from '../db-sql/db-notification-settings.sql.js';

/**
 * @file db-notification-settings.helper.ts
 * @summary DB helper для читання і оновлення налаштувань сповіщень.
 */

function createDefaultSettingsState(): NotificationSettingsState {
  return {
    booking_confirmation: true,
    status_change: true,
    visit_reminder: true,
    promo_news: true,
  };
}

function mapUserDeliveryProfileRow(row: UserDeliveryProfileRow): UserDeliveryProfile {
  return {
    userId: row.id,
    telegramUserId: row.telegram_user_id,
    firstName: row.first_name,
    preferredLanguage: row.preferred_language,
    phoneE164: row.phone_e164,
    phoneVerifiedAt: row.phone_verified_at,
    email: row.email,
    emailVerifiedAt: row.email_verified_at,
  };
}

async function readSettingsStateTx(userId: string): Promise<NotificationSettingsState> {
  return withTransaction(async (client) => {
    const rows = await queryMany<UserNotificationSettingsRow, UserNotificationSettingsEntity>(
      SQL_SELECT_USER_NOTIFICATION_SETTINGS_BY_USER_ID,
      [userId],
      userNotificationSettingsRowToEntity,
      client,
    );

    const state = createDefaultSettingsState();
    for (const row of rows) {
      state[row.notificationType] = row.enabled;
    }

    for (const notificationType of NOTIFICATION_TYPES) {
      if (typeof state[notificationType] !== 'boolean') {
        state[notificationType] = true;
      }
    }

    return state;
  });
}

/**
 * @summary Повертає поточний стан налаштувань сповіщень користувача.
 */
export async function getUserNotificationSettingsState(
  userIdInput: string | number,
): Promise<NotificationSettingsState> {
  const userId = normalizeNotificationUserId(userIdInput);

  return await readSettingsStateTx(userId);
}

/**
 * @summary Оновлює один тип сповіщень для користувача.
 */
export async function upsertUserNotificationSetting(
  input: SetNotificationSettingInput,
): Promise<NotificationSettingsState> {
  const userId = normalizeNotificationUserId(input.userId);
  const notificationType = normalizeNotificationType(input.notificationType);
  const enabled = normalizeNotificationEnabled(input.enabled);

  return await withTransaction(async (client) => {
    await executeOne<UserNotificationSettingsRow, UserNotificationSettingsEntity>(
      SQL_UPSERT_USER_NOTIFICATION_SETTING,
      [userId, notificationType, enabled],
      userNotificationSettingsRowToEntity,
      client,
    );

    const rows = await queryMany<UserNotificationSettingsRow, UserNotificationSettingsEntity>(
      SQL_SELECT_USER_NOTIFICATION_SETTINGS_BY_USER_ID,
      [userId],
      userNotificationSettingsRowToEntity,
      client,
    );

    const state = createDefaultSettingsState();
    for (const row of rows) {
      state[row.notificationType] = row.enabled;
    }
    return state;
  });
}

/**
 * @summary Масово вмикає/вимикає всі типи сповіщень для користувача.
 */
export async function setAllUserNotificationSettings(
  input: SetAllNotificationSettingsInput,
): Promise<NotificationSettingsState> {
  const userId = normalizeNotificationUserId(input.userId);
  const enabled = normalizeNotificationEnabled(input.enabled);

  return await withTransaction(async (client) => {
    await executeVoid(SQL_UPSERT_ALL_USER_NOTIFICATION_SETTINGS, [userId, enabled], client);

    const rows = await queryMany<UserNotificationSettingsRow, UserNotificationSettingsEntity>(
      SQL_SELECT_USER_NOTIFICATION_SETTINGS_BY_USER_ID,
      [userId],
      userNotificationSettingsRowToEntity,
      client,
    );

    const state = createDefaultSettingsState();
    for (const row of rows) {
      state[row.notificationType] = row.enabled;
    }
    return state;
  });
}

/**
 * @summary Повертає профіль каналів доставки (telegram/email/phone + verified-at).
 */
export async function getUserDeliveryProfileById(
  userIdInput: string | number,
): Promise<UserDeliveryProfile | null> {
  const userId = normalizeNotificationUserId(userIdInput);

  return await withTransaction(async (client) =>
    queryOne<UserDeliveryProfileRow, UserDeliveryProfile>(
      SQL_SELECT_USER_DELIVERY_PROFILE_BY_ID,
      [userId],
      mapUserDeliveryProfileRow,
      client,
    ),
  );
}
