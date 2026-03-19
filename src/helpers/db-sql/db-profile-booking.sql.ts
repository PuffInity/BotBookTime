/**
 * @file db-profile-booking.sql.ts
 * @summary SQL constants for profile booking status helper.
 */

export const PROFILE_BOOKING_STATUS_SELECT_COLUMNS = `
  a.id AS appointment_id,
  a.status,
  a.start_at,
  a.end_at,
  s.name AS service_name,
  m.display_name AS master_name,
  a.price_amount,
  a.currency_code
`;

export const SQL_GET_UPCOMING_BOOKING_BY_CLIENT_ID = `
  SELECT
    ${PROFILE_BOOKING_STATUS_SELECT_COLUMNS}
  FROM appointments a
  INNER JOIN services s
    ON s.id = a.service_id
   AND s.studio_id = a.studio_id
  INNER JOIN masters m
    ON m.user_id = a.master_id
   AND m.studio_id = a.studio_id
  WHERE a.client_id = $1::bigint
    AND a.deleted_at IS NULL
    AND a.status IN ('pending', 'confirmed')
    AND a.start_at >= now()
  ORDER BY a.start_at ASC
  LIMIT 1
`;

export const SQL_LIST_RECENT_BOOKINGS_BY_CLIENT_ID = `
  SELECT
    ${PROFILE_BOOKING_STATUS_SELECT_COLUMNS}
  FROM appointments a
  INNER JOIN services s
    ON s.id = a.service_id
   AND s.studio_id = a.studio_id
  INNER JOIN masters m
    ON m.user_id = a.master_id
   AND m.studio_id = a.studio_id
  WHERE a.client_id = $1::bigint
    AND a.deleted_at IS NULL
  ORDER BY a.start_at DESC
  LIMIT $2
`;
