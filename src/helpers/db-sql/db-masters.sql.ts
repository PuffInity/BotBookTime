/**
 * @file db-masters.sql.ts
 * @summary SQL constants for db-masters helper.
 */

export const MASTER_BOOKING_OPTION_SELECT_COLUMNS = `
  m.user_id AS master_id,
  m.studio_id,
  m.display_name,
  m.rating_avg,
  m.rating_count,
  m.experience_years
`;

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
