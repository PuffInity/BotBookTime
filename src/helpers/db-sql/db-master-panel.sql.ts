/**
 * @file db-master-panel.sql.ts
 * @summary SQL constants for db-master-panel helper.
 */

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const MASTER_PANEL_ACCESS_SELECT_COLUMNS = `
  u.id AS user_id,
  u.telegram_user_id,
  m.studio_id,
  m.user_id AS master_id,
  m.display_name,
  m.is_bookable,
  u.first_name,
  u.last_name
`;

/**
 * Перевіряє, чи користувач Telegram має доступ до панелі майстра:
 * - існує app_users
 * - має роль master у user_roles
 * - має запис у masters
 */
export const SQL_GET_MASTER_PANEL_ACCESS_BY_TELEGRAM_ID = `
  SELECT
    ${MASTER_PANEL_ACCESS_SELECT_COLUMNS}
  FROM app_users u
  INNER JOIN user_roles ur
    ON ur.user_id = u.id
   AND ur.role = 'master'
  INNER JOIN masters m
    ON m.user_id = u.id
  WHERE u.telegram_user_id = $1::bigint
    AND u.is_active = TRUE
  LIMIT 1
`;
