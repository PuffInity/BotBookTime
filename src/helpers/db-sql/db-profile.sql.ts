/**
 * @file db-profile.sql.ts
 * @summary SQL constants for db-profile helper.
 */

export const APP_USERS_SELECT_COLUMNS = `
  id,
  studio_id,
  telegram_user_id,
  telegram_username,
  first_name,
  last_name,
  phone_e164,
  phone_verified_at,
  email,
  email_verified_at,
  preferred_language,
  timezone,
  is_active,
  created_at,
  updated_at
`;

export const SQL_GET_USER_BY_TELEGRAM_ID = `
  SELECT
    ${APP_USERS_SELECT_COLUMNS}
  FROM app_users
  WHERE telegram_user_id = $1
  LIMIT 1
`;

export const SQL_CREATE_USER = `
  INSERT INTO app_users (
    telegram_user_id,
    telegram_username,
    first_name,
    last_name
  )
  VALUES ($1, $2, $3, $4)
  RETURNING
    ${APP_USERS_SELECT_COLUMNS}
`;

