/**
 * @file db-master-bookings.sql.ts
 * @summary SQL constants for db-master-bookings helper.
 */

export const MASTER_PENDING_BOOKING_SELECT_COLUMNS = `
  a.id AS appointment_id,
  a.client_id,
  a.status,
  a.start_at,
  a.end_at,
  a.price_amount::text AS price_amount,
  a.currency_code,
  a.attendee_name,
  COALESCE(a.attendee_phone_e164, u.phone_e164) AS attendee_phone_e164,
  COALESCE(a.attendee_email, u.email) AS attendee_email,
  u.first_name AS client_first_name,
  u.last_name AS client_last_name,
  u.telegram_username AS client_telegram_username,
  a.client_comment,
  s.name AS service_name,
  st.name AS studio_name,
  m.display_name AS master_name
`;

export const SQL_LIST_MASTER_PENDING_BOOKINGS = `
  SELECT
    ${MASTER_PENDING_BOOKING_SELECT_COLUMNS}
  FROM appointments a
  INNER JOIN app_users u
    ON u.id = a.client_id
  INNER JOIN services s
    ON s.id = a.service_id
   AND s.studio_id = a.studio_id
  INNER JOIN studios st
    ON st.id = a.studio_id
  INNER JOIN masters m
    ON m.user_id = a.master_id
   AND m.studio_id = a.studio_id
  WHERE a.master_id = $1::bigint
    AND a.deleted_at IS NULL
    AND a.status = 'pending'
    AND a.start_at >= now()
  ORDER BY a.start_at ASC
  LIMIT $2
`;

export const SQL_CONFIRM_MASTER_PENDING_BOOKING = `
  WITH updated AS (
    UPDATE appointments a
    SET status = 'confirmed',
        updated_by = $2::bigint
    WHERE a.id = $1::bigint
      AND a.master_id = $2::bigint
      AND a.deleted_at IS NULL
      AND a.status = 'pending'
    RETURNING a.*
  )
  SELECT
    ${MASTER_PENDING_BOOKING_SELECT_COLUMNS}
  FROM updated a
  INNER JOIN app_users u
    ON u.id = a.client_id
  INNER JOIN services s
    ON s.id = a.service_id
   AND s.studio_id = a.studio_id
  INNER JOIN studios st
    ON st.id = a.studio_id
  INNER JOIN masters m
    ON m.user_id = a.master_id
   AND m.studio_id = a.studio_id
  LIMIT 1
`;

export const SQL_CANCEL_MASTER_PENDING_BOOKING = `
  WITH updated AS (
    UPDATE appointments a
    SET status = 'canceled',
        canceled_reason = $3,
        updated_by = $2::bigint
    WHERE a.id = $1::bigint
      AND a.master_id = $2::bigint
      AND a.deleted_at IS NULL
      AND a.status = 'pending'
    RETURNING a.*
  )
  SELECT
    ${MASTER_PENDING_BOOKING_SELECT_COLUMNS}
  FROM updated a
  INNER JOIN app_users u
    ON u.id = a.client_id
  INNER JOIN services s
    ON s.id = a.service_id
   AND s.studio_id = a.studio_id
  INNER JOIN studios st
    ON st.id = a.studio_id
  INNER JOIN masters m
    ON m.user_id = a.master_id
   AND m.studio_id = a.studio_id
  LIMIT 1
`;

