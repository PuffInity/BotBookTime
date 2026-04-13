/**
 * @file db-masters.sql.ts
 * @summary uk: SQL constants for db-masters helper.
 * en: Module summary.
 * cz: Shrnutí modulu.
 */

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const MASTERS_CATALOG_SELECT_COLUMNS = `
  m.user_id,
  m.studio_id,
  m.display_name,
  m.bio,
  m.experience_years,
  m.procedures_done_total,
  m.rating_avg,
  m.rating_count,
  m.is_bookable,
  m.contact_phone_e164,
  m.contact_email,
  m.materials_info
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const MASTER_CERTIFICATES_SELECT_COLUMNS = `
  id,
  master_id,
  title,
  issuer,
  issued_on,
  expires_on,
  document_url,
  created_at,
  updated_at
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const MASTER_SPECIALIZATIONS_SELECT_COLUMNS = `
  s.id AS service_id,
  s.name AS service_name,
  COALESCE(ms.custom_duration_minutes, s.duration_minutes) AS duration_minutes,
  COALESCE(ms.custom_price, s.base_price) AS price_amount,
  s.currency_code AS currency_code
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const MASTER_BOOKING_OPTION_SELECT_COLUMNS = `
  m.user_id AS master_id,
  m.studio_id,
  m.display_name,
  m.rating_avg,
  m.rating_count,
  m.experience_years
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const MASTER_WEEKLY_HOURS_SELECT_COLUMNS = `
  master_id,
  weekday,
  is_working,
  open_time,
  close_time,
  created_at,
  updated_at
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const MASTER_DAYS_OFF_SELECT_COLUMNS = `
  id,
  master_id,
  off_date,
  reason,
  created_by,
  created_at
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const MASTER_VACATIONS_SELECT_COLUMNS = `
  id,
  master_id,
  date_from,
  date_to,
  reason,
  created_by,
  created_at,
  updated_at
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const MASTER_TEMPORARY_HOURS_SELECT_COLUMNS = `
  id,
  master_id,
  date_from,
  date_to,
  weekday,
  is_working,
  open_time,
  close_time,
  note,
  created_by,
  created_at,
  updated_at
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_LIST_ACTIVE_MASTERS_CATALOG = `
  SELECT
    ${MASTERS_CATALOG_SELECT_COLUMNS}
  FROM masters m
  WHERE m.is_bookable = TRUE
    AND ($1::bigint IS NULL OR m.studio_id = $1::bigint)
  ORDER BY m.rating_avg DESC, m.rating_count DESC, m.user_id ASC
  LIMIT $2
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_GET_ACTIVE_MASTER_BY_ID = `
  SELECT
    ${MASTERS_CATALOG_SELECT_COLUMNS}
  FROM masters m
  WHERE m.user_id = $1::bigint
    AND m.is_bookable = TRUE
    AND ($2::bigint IS NULL OR m.studio_id = $2::bigint)
  LIMIT 1
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_LIST_MASTER_SPECIALIZATIONS_BY_ID = `
  SELECT
    ${MASTER_SPECIALIZATIONS_SELECT_COLUMNS}
  FROM master_services ms
  INNER JOIN services s
    ON s.id = ms.service_id
   AND s.studio_id = ms.studio_id
  WHERE ms.master_id = $1::bigint
    AND ms.is_active = TRUE
    AND s.is_active = TRUE
  ORDER BY s.name ASC
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_LIST_MASTER_CERTIFICATES_BY_ID = `
  SELECT
    ${MASTER_CERTIFICATES_SELECT_COLUMNS}
  FROM master_certificates
  WHERE master_id = $1::bigint
  ORDER BY issued_on DESC NULLS LAST, id DESC
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_LIST_MASTER_WEEKLY_HOURS_BY_ID = `
  SELECT
    ${MASTER_WEEKLY_HOURS_SELECT_COLUMNS}
  FROM master_weekly_hours
  WHERE master_id = $1::bigint
  ORDER BY weekday ASC
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_LIST_MASTER_UPCOMING_DAYS_OFF_BY_ID = `
  SELECT
    ${MASTER_DAYS_OFF_SELECT_COLUMNS}
  FROM master_days_off
  WHERE master_id = $1::bigint
    AND off_date >= CURRENT_DATE
  ORDER BY off_date ASC
  LIMIT $2
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_LIST_MASTER_UPCOMING_VACATIONS_BY_ID = `
  SELECT
    ${MASTER_VACATIONS_SELECT_COLUMNS}
  FROM master_vacations
  WHERE master_id = $1::bigint
    AND date_to >= CURRENT_DATE
  ORDER BY date_from ASC
  LIMIT $2
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_LIST_MASTER_UPCOMING_TEMPORARY_HOURS_BY_ID = `
  SELECT
    ${MASTER_TEMPORARY_HOURS_SELECT_COLUMNS}
  FROM master_temporary_hours
  WHERE master_id = $1::bigint
    AND date_to >= CURRENT_DATE
  ORDER BY date_from ASC, weekday ASC
  LIMIT $2
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_LIST_ACTIVE_MASTERS_BY_SERVICE_ID = `
  SELECT
    ${MASTER_BOOKING_OPTION_SELECT_COLUMNS}
  FROM master_services ms
  INNER JOIN masters m
    ON m.studio_id = ms.studio_id
   AND m.user_id = ms.master_id
  INNER JOIN services s
    ON s.studio_id = ms.studio_id
   AND s.id = ms.service_id
  WHERE ms.studio_id = $1::bigint
    AND ms.service_id = $2::bigint
    AND ms.is_active = TRUE
    AND m.is_bookable = TRUE
    AND s.is_active = TRUE
  ORDER BY
    m.rating_avg DESC,
    m.rating_count DESC,
    m.user_id ASC
  LIMIT $3
`;
