/**
 * @file db-notification-settings.sql.ts
 * @summary SQL constants for notification settings and user delivery profile.
 */

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const USER_NOTIFICATION_SETTINGS_SELECT_COLUMNS = `
  user_id,
  notification_type,
  enabled,
  updated_at
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const USER_DELIVERY_PROFILE_SELECT_COLUMNS = `
  id,
  telegram_user_id,
  first_name,
  preferred_language,
  phone_e164,
  phone_verified_at,
  email,
  email_verified_at
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_SELECT_USER_NOTIFICATION_SETTINGS_BY_USER_ID = `
  SELECT
    ${USER_NOTIFICATION_SETTINGS_SELECT_COLUMNS}
  FROM user_notification_settings
  WHERE user_id = $1::bigint
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_UPSERT_USER_NOTIFICATION_SETTING = `
  INSERT INTO user_notification_settings (
    user_id,
    notification_type,
    enabled
  )
  VALUES ($1::bigint, $2::notification_type, $3::boolean)
  ON CONFLICT (user_id, notification_type)
  DO UPDATE
  SET enabled = EXCLUDED.enabled,
      updated_at = now()
  RETURNING
    ${USER_NOTIFICATION_SETTINGS_SELECT_COLUMNS}
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_UPSERT_ALL_USER_NOTIFICATION_SETTINGS = `
  INSERT INTO user_notification_settings (
    user_id,
    notification_type,
    enabled
  )
  VALUES
    ($1::bigint, 'booking_confirmation'::notification_type, $2::boolean),
    ($1::bigint, 'status_change'::notification_type, $2::boolean),
    ($1::bigint, 'visit_reminder'::notification_type, $2::boolean),
    ($1::bigint, 'promo_news'::notification_type, $2::boolean)
  ON CONFLICT (user_id, notification_type)
  DO UPDATE
  SET enabled = EXCLUDED.enabled,
      updated_at = now()
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_SELECT_USER_DELIVERY_PROFILE_BY_ID = `
  SELECT
    ${USER_DELIVERY_PROFILE_SELECT_COLUMNS}
  FROM app_users
  WHERE id = $1::bigint
  LIMIT 1
`;
