/**
 * @file db-masters.sql.ts
 * @summary SQL constants for db-masters helper.
 */

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

export const MASTER_SPECIALIZATIONS_SELECT_COLUMNS = `
  s.id AS service_id,
  s.name AS service_name,
  COALESCE(ms.custom_duration_minutes, s.duration_minutes) AS duration_minutes,
  COALESCE(ms.custom_price, s.base_price) AS price_amount,
  s.currency_code AS currency_code
`;

export const MASTER_BOOKING_OPTION_SELECT_COLUMNS = `
  m.user_id,
  m.studio_id,
  m.display_name,
  m.experience_years,
  m.procedures_done_total,
  m.rating_avg,
  m.rating_count
`;

export const SQL_LIST_ACTIVE_MASTERS_CATALOG = `
  SELECT
    ${MASTERS_CATALOG_SELECT_COLUMNS}
  FROM masters m
  WHERE m.is_bookable = TRUE
    AND ($1::bigint IS NULL OR m.studio_id = $1::bigint)
  ORDER BY m.rating_avg DESC, m.rating_count DESC, m.user_id ASC
  LIMIT $2
`;

export const SQL_GET_ACTIVE_MASTER_BY_ID = `
  SELECT
    ${MASTERS_CATALOG_SELECT_COLUMNS}
  FROM masters m
  WHERE m.user_id = $1::bigint
    AND m.is_bookable = TRUE
    AND ($2::bigint IS NULL OR m.studio_id = $2::bigint)
  LIMIT 1
`;

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

export const SQL_LIST_MASTER_CERTIFICATES_BY_ID = `
  SELECT
    ${MASTER_CERTIFICATES_SELECT_COLUMNS}
  FROM master_certificates
  WHERE master_id = $1::bigint
  ORDER BY issued_on DESC NULLS LAST, id DESC
`;

export const SQL_LIST_ACTIVE_MASTERS_BY_SERVICE_ID = `
  SELECT
    ${MASTER_BOOKING_OPTION_SELECT_COLUMNS}
  FROM master_services ms
  INNER JOIN masters m
    ON m.user_id = ms.master_id
   AND m.studio_id = ms.studio_id
  WHERE ms.service_id = $1::bigint
    AND ms.is_active = TRUE
    AND m.is_bookable = TRUE
    AND ($2::bigint IS NULL OR m.studio_id = $2::bigint)
  ORDER BY m.rating_avg DESC, m.rating_count DESC, m.user_id ASC
  LIMIT $3
`;
