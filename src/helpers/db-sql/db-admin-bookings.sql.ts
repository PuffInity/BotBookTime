/**
 * @file db-admin-bookings.sql.ts
 * @summary uk: SQL constants for db-admin-bookings helper.
 * en: Module summary.
 * cz: Shrnutí modulu.
 */

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const ADMIN_BOOKING_SELECT_COLUMNS = `
  a.id AS appointment_id,
  a.studio_id,
  a.client_id,
  a.master_id,
  a.service_id,
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

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_CONFIRM_ADMIN_PENDING_BOOKING = `
  WITH updated AS (
    UPDATE appointments a
    SET status = 'confirmed',
        updated_by = $3::bigint
    WHERE a.id = $1::bigint
      AND a.studio_id = $2::bigint
      AND a.deleted_at IS NULL
      AND a.status = 'pending'
    RETURNING a.*
  )
  SELECT
    ${ADMIN_BOOKING_SELECT_COLUMNS}
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

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_CANCEL_ADMIN_BOOKING = `
  WITH updated AS (
    UPDATE appointments a
    SET status = 'canceled',
        canceled_reason = $4,
        updated_by = $3::bigint
    WHERE a.id = $1::bigint
      AND a.studio_id = $2::bigint
      AND a.deleted_at IS NULL
      AND a.status IN ('pending', 'confirmed')
    RETURNING a.*
  )
  SELECT
    ${ADMIN_BOOKING_SELECT_COLUMNS}
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

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_HARD_DELETE_ADMIN_BOOKING = `
  DELETE FROM appointments a
  WHERE a.id = $1::bigint
    AND a.studio_id = $2::bigint
    AND a.deleted_at IS NULL
    AND a.status IN ('canceled', 'completed', 'transferred')
  RETURNING a.id
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_CLEAR_CANCELED_ADMIN_BOOKINGS = `
  WITH deleted AS (
    DELETE FROM appointments a
    WHERE a.studio_id = $1::bigint
      AND a.deleted_at IS NULL
      AND a.status = 'canceled'
    RETURNING 1
  )
  SELECT COUNT(*)::int AS deleted_count
  FROM deleted
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_GET_ADMIN_BOOKING_FOR_RESCHEDULE = `
  SELECT
    ${ADMIN_BOOKING_SELECT_COLUMNS},
    st.timezone AS studio_timezone,
    a.booked_for_user_id,
    a.source,
    a.internal_comment,
    a.created_by
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
  WHERE a.id = $1::bigint
    AND a.studio_id = $2::bigint
    AND a.deleted_at IS NULL
    AND a.status IN ('pending', 'confirmed')
  FOR UPDATE
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_CHECK_APPOINTMENT_CONFLICT_EXCLUDING_ID = `
  SELECT EXISTS (
    SELECT 1
    FROM appointments a
    WHERE a.master_id = $1::bigint
      AND a.deleted_at IS NULL
      AND a.status IN ('pending', 'confirmed')
      AND a.id <> $4::bigint
      AND tstzrange(a.start_at, a.end_at, '[)')
          && tstzrange($2::timestamptz, $3::timestamptz, '[)')
  ) AS has_conflict
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_INSERT_RESCHEDULED_APPOINTMENT = `
  INSERT INTO appointments (
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
    $5::bigint,
    'admin_panel',
    $6::appointment_status,
    $7,
    $8,
    $9,
    $10,
    $11,
    $12::timestamptz,
    $13::timestamptz,
    $14,
    $15,
    $16::bigint,
    $17::bigint
  )
  RETURNING id
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_MARK_ADMIN_APPOINTMENT_AS_TRANSFERRED = `
  UPDATE appointments
  SET status = 'transferred',
      updated_by = $3::bigint
  WHERE id = $1::bigint
    AND studio_id = $2::bigint
    AND deleted_at IS NULL
    AND status IN ('pending', 'confirmed')
  RETURNING id
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_INSERT_APPOINTMENT_TRANSFER_LINK = `
  INSERT INTO appointment_transfers (
    from_appointment_id,
    to_appointment_id,
    transferred_by,
    reason
  )
  VALUES (
    $1::bigint,
    $2::bigint,
    $3::bigint,
    $4
  )
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_REASSIGN_ADMIN_BOOKING_MASTER = `
  WITH updated AS (
    UPDATE appointments a
    SET master_id = $3::bigint,
        updated_by = $4::bigint
    WHERE a.id = $1::bigint
      AND a.studio_id = $2::bigint
      AND a.deleted_at IS NULL
      AND a.status IN ('pending', 'confirmed')
    RETURNING a.*
  )
  SELECT
    ${ADMIN_BOOKING_SELECT_COLUMNS}
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

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_LIST_ADMIN_BOOKINGS_FEED = `
  WITH context AS (
    SELECT
      st.timezone AS studio_timezone,
      (now() AT TIME ZONE st.timezone)::date AS today_local
    FROM studios st
    WHERE st.id = $1::bigint
    LIMIT 1
  )
  SELECT
    ${ADMIN_BOOKING_SELECT_COLUMNS},
    COUNT(*) OVER()::int AS total_count
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
  INNER JOIN context ctx
    ON true
  WHERE a.studio_id = $1::bigint
    AND a.deleted_at IS NULL
    AND ($5::bigint IS NULL OR a.master_id = $5::bigint)
    AND (
      ($2::text = 'pending'
        AND a.status = 'pending')
      OR
      ($2::text = 'today'
        AND a.status IN ('pending', 'confirmed', 'completed', 'canceled')
        AND (a.start_at AT TIME ZONE ctx.studio_timezone)::date = ctx.today_local)
      OR
      ($2::text = 'tomorrow'
        AND a.status IN ('pending', 'confirmed', 'completed', 'canceled')
        AND (a.start_at AT TIME ZONE ctx.studio_timezone)::date = (ctx.today_local + 1))
      OR
      ($2::text = 'all'
        AND a.status IN ('pending', 'confirmed', 'completed', 'canceled'))
      OR
      ($2::text = 'canceled'
        AND a.status = 'canceled')
    )
  ORDER BY
    CASE
      WHEN $2::text = 'pending' THEN 0
      WHEN $2::text = 'all' THEN
        CASE
          WHEN a.status = 'canceled' THEN 2
          WHEN a.start_at >= now() THEN 0
          ELSE 1
        END
      WHEN a.status = 'canceled' THEN 1
      ELSE 0
    END ASC,
    CASE
      WHEN $2::text = 'pending' THEN a.created_at
      WHEN a.start_at >= now() THEN a.start_at
      ELSE NULL
    END ASC,
    CASE
      WHEN $2::text <> 'pending' AND a.start_at < now() THEN a.start_at
      ELSE NULL
    END DESC,
    a.id DESC
  LIMIT $3::int
  OFFSET $4::int
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_GET_ADMIN_BOOKING_CARD_BY_ID = `
  SELECT
    ${ADMIN_BOOKING_SELECT_COLUMNS}
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
  WHERE a.id = $1::bigint
    AND a.studio_id = $2::bigint
    AND a.deleted_at IS NULL
  LIMIT 1
`;
