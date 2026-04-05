/**
 * @file db-booking-expiration.sql.ts
 * @summary SQL constants для авто-скасування pending-бронювань після старту слота.
 */

export const SQL_EXPIRE_PENDING_APPOINTMENTS = `
  WITH candidate AS (
    SELECT a.id
    FROM appointments a
    WHERE a.deleted_at IS NULL
      AND a.status = 'pending'
      AND a.start_at <= now()
    ORDER BY a.start_at ASC
    LIMIT $1::int
    FOR UPDATE SKIP LOCKED
  ),
  updated AS (
    UPDATE appointments a
    SET
      status = 'canceled',
      canceled_at = COALESCE(a.canceled_at, now()),
      canceled_reason = CASE
        WHEN a.canceled_reason IS NULL OR btrim(a.canceled_reason) = '' THEN $2::text
        ELSE a.canceled_reason
      END,
      updated_by = NULL,
      updated_at = now()
    FROM candidate c
    WHERE a.id = c.id
    RETURNING
      a.id,
      a.client_id,
      a.start_at,
      a.studio_id,
      a.service_id,
      a.master_id,
      a.attendee_name,
      a.attendee_email
  )
  SELECT
    u.id AS appointment_id,
    u.client_id,
    u.start_at,
    COALESCE(NULLIF(btrim(u.attendee_name), ''), c.first_name) AS recipient_name,
    COALESCE(NULLIF(btrim(u.attendee_email), ''), c.email::text) AS recipient_email,
    c.preferred_language,
    st.name AS studio_name,
    s.name AS service_name,
    m.display_name AS master_name
  FROM updated u
  INNER JOIN app_users c
    ON c.id = u.client_id
  INNER JOIN studios st
    ON st.id = u.studio_id
  INNER JOIN services s
    ON s.id = u.service_id
   AND s.studio_id = u.studio_id
  INNER JOIN masters m
    ON m.user_id = u.master_id
   AND m.studio_id = u.studio_id
  ORDER BY u.start_at ASC
`;
