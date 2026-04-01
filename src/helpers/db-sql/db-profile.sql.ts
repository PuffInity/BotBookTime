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

export const SQL_UPDATE_USER_NAME_BY_TELEGRAM_ID = `
  UPDATE app_users
  SET first_name = $2
  WHERE telegram_user_id = $1
  RETURNING
    ${APP_USERS_SELECT_COLUMNS}
`;

export const SQL_UPDATE_USER_EMAIL_BY_TELEGRAM_ID = `
  UPDATE app_users
  SET email = $2,
      email_verified_at = NULL
  WHERE telegram_user_id = $1
  RETURNING
    ${APP_USERS_SELECT_COLUMNS}
`;

export const SQL_UPDATE_USER_LANGUAGE_BY_TELEGRAM_ID = `
  UPDATE app_users
  SET preferred_language = $2::language_code
  WHERE telegram_user_id = $1
  RETURNING
    ${APP_USERS_SELECT_COLUMNS}
`;

export const VERIFICATION_CODES_SELECT_COLUMNS = `
  id,
  user_id,
  channel,
  purpose,
  destination,
  code_hash,
  attempts_used,
  max_attempts,
  expires_at,
  consumed_at,
  last_sent_at,
  created_at
`;

export const SQL_CONSUME_ACTIVE_EMAIL_VERIFY_OTPS = `
  UPDATE verification_codes
  SET consumed_at = LEAST(now(), expires_at)
  WHERE user_id = $1
    AND channel = 'email'
    AND purpose = 'email_verify'
    AND destination = $2
    AND consumed_at IS NULL
`;

export const SQL_INSERT_EMAIL_VERIFY_OTP = `
  INSERT INTO verification_codes (
    user_id,
    channel,
    purpose,
    destination,
    code_hash,
    attempts_used,
    max_attempts,
    expires_at
  )
  VALUES ($1, 'email', 'email_verify', $2, $3, 0, $4, $5)
  RETURNING
    ${VERIFICATION_CODES_SELECT_COLUMNS}
`;

export const SQL_GET_ACTIVE_EMAIL_VERIFY_OTP = `
  SELECT
    ${VERIFICATION_CODES_SELECT_COLUMNS}
  FROM verification_codes
  WHERE user_id = $1
    AND channel = 'email'
    AND purpose = 'email_verify'
    AND destination = $2
    AND consumed_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1
`;

export const SQL_INCREMENT_OTP_ATTEMPTS_BY_ID = `
  UPDATE verification_codes
  SET attempts_used = attempts_used + 1
  WHERE id = $1
  RETURNING
    ${VERIFICATION_CODES_SELECT_COLUMNS}
`;

export const SQL_CONSUME_OTP_BY_ID = `
  UPDATE verification_codes
  SET consumed_at = now()
  WHERE id = $1
  RETURNING
    ${VERIFICATION_CODES_SELECT_COLUMNS}
`;

export const SQL_MARK_EMAIL_VERIFIED_BY_USER_ID = `
  UPDATE app_users
  SET email_verified_at = now()
  WHERE id = $1
    AND email = $2
    AND email_verified_at IS NULL
  RETURNING
    ${APP_USERS_SELECT_COLUMNS}
`;
