/**
 * @file db-booking.sql.ts
 * @summary SQL constants for db-booking helper.
 */

export const APPOINTMENTS_SELECT_COLUMNS = `
  id,
  studio_id,
  client_id,
  booked_for_user_id,
  master_id,
  service_id,
  source,
  status,
  attendee_name,
  attendee_phone_e164,
  attendee_email,
  client_comment,
  internal_comment,
  start_at,
  end_at,
  slot,
  price_amount,
  currency_code,
  created_by,
  updated_by,
  confirmed_at,
  canceled_at,
  completed_at,
  transferred_at,
  canceled_reason,
  deleted_at,
  deleted_by,
  created_at,
  updated_at
`;

export const SQL_GET_BOOKING_META_BY_MASTER_SERVICE = `
  SELECT
    ms.studio_id,
    st.name AS studio_name,
    ms.service_id,
    s.name AS service_name,
    ms.master_id,
    m.display_name AS master_display_name,
    COALESCE(ms.custom_duration_minutes, s.duration_minutes) AS duration_minutes,
    COALESCE(ms.custom_price, s.base_price)::text AS price_amount,
    s.currency_code
  FROM master_services ms
  INNER JOIN services s
    ON s.studio_id = ms.studio_id
   AND s.id = ms.service_id
  INNER JOIN studios st
    ON st.id = ms.studio_id
  INNER JOIN masters m
    ON m.studio_id = ms.studio_id
   AND m.user_id = ms.master_id
  WHERE ms.studio_id = $1::bigint
    AND ms.service_id = $2::bigint
    AND ms.master_id = $3::bigint
    AND ms.is_active = TRUE
    AND s.is_active = TRUE
    AND m.is_bookable = TRUE
  LIMIT 1
`;

export const SQL_CHECK_APPOINTMENT_CONFLICT = `
  SELECT EXISTS (
    SELECT 1
    FROM appointments a
    WHERE a.master_id = $1::bigint
      AND a.deleted_at IS NULL
      AND a.status IN ('pending', 'confirmed')
      AND tstzrange(a.start_at, a.end_at, '[)')
          && tstzrange($2::timestamptz, $3::timestamptz, '[)')
  ) AS has_conflict
`;

export const SQL_INSERT_PENDING_APPOINTMENT = `
  INSERT INTO appointments (
    studio_id,
    client_id,
    master_id,
    service_id,
    source,
    status,
    attendee_name,
    attendee_phone_e164,
    start_at,
    end_at,
    price_amount,
    currency_code,
    created_by,
    updated_by
  )
  VALUES (
    $1::bigint,
    $2::bigint,
    $3::bigint,
    $4::bigint,
    'telegram_bot',
    'pending',
    $5,
    $6,
    $7::timestamptz,
    $8::timestamptz,
    $9,
    $10,
    $2::bigint,
    $2::bigint
  )
  RETURNING
    ${APPOINTMENTS_SELECT_COLUMNS}
`;
