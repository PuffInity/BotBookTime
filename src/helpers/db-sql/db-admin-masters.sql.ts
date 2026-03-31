/**
 * @file db-admin-masters.sql.ts
 * @summary SQL constants for admin masters helper.
 */

const ADMIN_MASTER_CANDIDATE_COLUMNS = `
  u.id AS user_id,
  u.telegram_user_id,
  u.telegram_username,
  u.first_name,
  u.last_name,
  u.is_active,
  EXISTS (
    SELECT 1
    FROM masters m
    WHERE m.user_id = u.id
      AND m.studio_id = u.studio_id
  ) AS is_master
`;

export const SQL_FIND_ADMIN_MASTER_CANDIDATE_BY_TELEGRAM_ID = `
  SELECT
    ${ADMIN_MASTER_CANDIDATE_COLUMNS}
  FROM app_users u
  WHERE u.studio_id = $1::bigint
    AND u.telegram_user_id = $2::bigint
    AND u.is_active = TRUE
  LIMIT 1
`;

export const SQL_GET_ADMIN_MASTER_CANDIDATE_BY_USER_ID = `
  SELECT
    ${ADMIN_MASTER_CANDIDATE_COLUMNS}
  FROM app_users u
  WHERE u.studio_id = $1::bigint
    AND u.id = $2::bigint
    AND u.is_active = TRUE
  LIMIT 1
`;

export const SQL_INSERT_MASTER_ROLE = `
  INSERT INTO user_roles (user_id, role, granted_by)
  VALUES ($1::bigint, 'master'::user_role, $2::bigint)
  ON CONFLICT (user_id, role) DO NOTHING
`;

export const SQL_INSERT_ADMIN_MASTER_PROFILE = `
  INSERT INTO masters (
    user_id,
    studio_id,
    display_name,
    bio,
    experience_years,
    procedures_done_total,
    materials_info,
    contact_phone_e164,
    contact_email,
    is_bookable
  )
  VALUES (
    $1::bigint,
    $2::bigint,
    $3,
    $4,
    $5::smallint,
    $6::integer,
    $7,
    $8,
    $9,
    TRUE
  )
  RETURNING user_id AS master_id
`;

export const SQL_ASSIGN_ADMIN_MASTER_SERVICES = `
  INSERT INTO master_services (
    studio_id,
    master_id,
    service_id,
    custom_price,
    custom_duration_minutes,
    is_active
  )
  SELECT
    $1::bigint,
    $2::bigint,
    s.id,
    NULL,
    NULL,
    TRUE
  FROM services s
  WHERE s.studio_id = $1::bigint
    AND s.is_active = TRUE
    AND s.id = ANY($3::bigint[])
  ON CONFLICT (studio_id, master_id, service_id)
  DO UPDATE SET
    is_active = TRUE,
    updated_at = now()
  RETURNING service_id
`;

export const SQL_UPSERT_ADMIN_MASTER_WEEKLY_DAY = `
  INSERT INTO master_weekly_hours (
    master_id,
    weekday,
    is_working,
    open_time,
    close_time
  )
  VALUES (
    $1::bigint,
    $2::smallint,
    $3::boolean,
    $4::time,
    $5::time
  )
  ON CONFLICT (master_id, weekday)
  DO UPDATE SET
    is_working = EXCLUDED.is_working,
    open_time = EXCLUDED.open_time,
    close_time = EXCLUDED.close_time
`;
