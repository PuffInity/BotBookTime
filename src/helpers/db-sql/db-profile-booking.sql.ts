/**
 * @file db-profile-booking.sql.ts
 * @summary SQL constants for profile booking status helper.
 */

export const PROFILE_BOOKING_STATUS_SELECT_COLUMNS = `
  a.id AS appointment_id,
  a.status,
  a.start_at,
  a.end_at,
  st.name AS studio_name,
  s.name AS service_name,
  m.display_name AS master_name,
  a.price_amount,
  a.currency_code
`;

export const SQL_GET_UPCOMING_BOOKING_BY_CLIENT_ID = `
  SELECT
    ${PROFILE_BOOKING_STATUS_SELECT_COLUMNS}
  FROM appointments a
  INNER JOIN studios st
    ON st.id = a.studio_id
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
  INNER JOIN studios st
    ON st.id = a.studio_id
  INNER JOIN services s
    ON s.id = a.service_id
   AND s.studio_id = a.studio_id
  INNER JOIN masters m
    ON m.user_id = a.master_id
   AND m.studio_id = a.studio_id
  WHERE a.client_id = $1::bigint
    AND a.deleted_at IS NULL
  ORDER BY
    CASE WHEN a.status = 'canceled' THEN 1 ELSE 0 END ASC,
    CASE WHEN a.start_at >= now() THEN 0 ELSE 1 END ASC,
    CASE WHEN a.start_at >= now() THEN a.start_at END ASC,
    CASE WHEN a.start_at < now() THEN a.start_at END DESC
  LIMIT $2
`;

export const SQL_CANCEL_ACTIVE_BOOKING_BY_CLIENT_ID = `
  UPDATE appointments a
  SET
    status = 'canceled',
    canceled_at = COALESCE(a.canceled_at, now()),
    updated_by = $2::bigint,
    updated_at = now()
  WHERE a.id = $1::bigint
    AND a.client_id = $2::bigint
    AND a.deleted_at IS NULL
    AND a.status IN ('pending', 'confirmed')
    AND a.start_at > now()
  RETURNING a.id AS appointment_id
`;
