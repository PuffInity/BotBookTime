/**
 * @file db-admin-settings.sql.ts
 * @summary SQL constants for admin settings helper.
 */

const ADMIN_SETTINGS_USER_COLUMNS = `
  u.id AS user_id,
  u.telegram_user_id,
  u.telegram_username,
  u.first_name,
  u.last_name
`;

export const SQL_LIST_STUDIO_ADMINS = `
  SELECT
    ${ADMIN_SETTINGS_USER_COLUMNS},
    ur.granted_at,
    ur.granted_by
  FROM app_users u
  INNER JOIN user_roles ur
    ON ur.user_id = u.id
   AND ur.role = 'admin'::user_role
  WHERE u.studio_id = $1::bigint
    AND u.is_active = TRUE
  ORDER BY ur.granted_at DESC, u.id DESC
`;

export const SQL_FIND_STUDIO_USER_BY_TELEGRAM_ID = `
  SELECT
    ${ADMIN_SETTINGS_USER_COLUMNS},
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.user_id = u.id
        AND ur.role = 'admin'::user_role
    ) AS is_admin,
    u.is_active
  FROM app_users u
  WHERE u.studio_id = $1::bigint
    AND u.telegram_user_id = $2::bigint
    AND u.is_active = TRUE
  LIMIT 1
`;

export const SQL_INSERT_ADMIN_ROLE = `
  INSERT INTO user_roles (user_id, role, granted_by)
  VALUES ($1::bigint, 'admin'::user_role, $2::bigint)
  ON CONFLICT (user_id, role) DO NOTHING
`;

export const SQL_DELETE_ADMIN_ROLE = `
  DELETE FROM user_roles
  WHERE user_id = $1::bigint
    AND role = 'admin'::user_role
`;

export const SQL_COUNT_STUDIO_ADMINS = `
  SELECT COUNT(*)::int AS total
  FROM app_users u
  INNER JOIN user_roles ur
    ON ur.user_id = u.id
   AND ur.role = 'admin'::user_role
  WHERE u.studio_id = $1::bigint
    AND u.is_active = TRUE
`;

export const SQL_GET_ADMIN_PANEL_LANGUAGE_BY_USER_ID = `
  SELECT
    u.preferred_language
  FROM app_users u
  WHERE u.id = $1::bigint
    AND u.is_active = TRUE
  LIMIT 1
`;

export const SQL_SET_ADMIN_PANEL_LANGUAGE_BY_USER_ID = `
  UPDATE app_users
  SET
    preferred_language = $2::language_code,
    updated_at = now()
  WHERE id = $1::bigint
    AND is_active = TRUE
  RETURNING preferred_language
`;
