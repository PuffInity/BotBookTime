/**
 * @file db-admin-panel.sql.ts
 * @summary SQL constants for db-admin-panel helper.
 */

export const ADMIN_PANEL_ACCESS_SELECT_COLUMNS = `
  u.id AS user_id,
  u.telegram_user_id,
  u.first_name,
  u.last_name
`;

/**
 * Перевіряє, чи користувач Telegram має доступ до адмін-панелі:
 * - існує app_users
 * - має роль admin у user_roles
 */
export const SQL_GET_ADMIN_PANEL_ACCESS_BY_TELEGRAM_ID = `
  SELECT
    ${ADMIN_PANEL_ACCESS_SELECT_COLUMNS}
  FROM app_users u
  INNER JOIN user_roles ur
    ON ur.user_id = u.id
   AND ur.role = 'admin'
  WHERE u.telegram_user_id = $1::bigint
    AND u.is_active = TRUE
  LIMIT 1
`;
