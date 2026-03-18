/**
 * @file db-services.sql.ts
 * @summary SQL constants for db-services helper.
 */

export const SERVICES_SELECT_COLUMNS = `
  s.id,
  s.studio_id,
  s.name,
  s.description,
  s.duration_minutes,
  s.base_price,
  s.currency_code,
  s.result_description,
  s.is_active,
  s.created_at,
  s.updated_at
`;

export const SERVICE_STEPS_SELECT_COLUMNS = `
  service_id,
  step_no,
  title,
  description,
  created_at,
  updated_at
`;

export const SERVICE_GUARANTEES_SELECT_COLUMNS = `
  service_id,
  guarantee_no,
  guarantee_text,
  valid_days,
  created_at,
  updated_at
`;

export const SQL_LIST_ACTIVE_SERVICES_CATALOG = `
  SELECT
    ${SERVICES_SELECT_COLUMNS}
  FROM services s
  WHERE s.is_active = TRUE
    AND ($1::bigint IS NULL OR s.studio_id = $1::bigint)
  ORDER BY s.id ASC
  LIMIT $2
`;

export const SQL_GET_ACTIVE_SERVICE_BY_ID = `
  SELECT
    ${SERVICES_SELECT_COLUMNS}
  FROM services s
  WHERE s.id = $1::bigint
    AND s.is_active = TRUE
    AND ($2::bigint IS NULL OR s.studio_id = $2::bigint)
  LIMIT 1
`;

export const SQL_LIST_SERVICE_STEPS_BY_SERVICE_ID = `
  SELECT
    ${SERVICE_STEPS_SELECT_COLUMNS}
  FROM service_steps
  WHERE service_id = $1::bigint
  ORDER BY step_no ASC
`;

export const SQL_LIST_SERVICE_GUARANTEES_BY_SERVICE_ID = `
  SELECT
    ${SERVICE_GUARANTEES_SELECT_COLUMNS}
  FROM service_guarantees
  WHERE service_id = $1::bigint
  ORDER BY guarantee_no ASC
`;

