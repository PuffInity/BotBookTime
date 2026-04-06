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

export const BOOKING_SERVICES_SELECT_COLUMNS = `
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

export const SQL_GET_BOOKING_META_BY_MASTER_SERVICE = `
  SELECT
    ms.studio_id,
    st.name AS studio_name,
    st.timezone AS studio_timezone,
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

export const SQL_LIST_BOOKABLE_SERVICES_FOR_BOOKING = `
  SELECT
    ${BOOKING_SERVICES_SELECT_COLUMNS}
  FROM services s
  WHERE s.is_active = TRUE
    AND ($1::bigint IS NULL OR s.studio_id = $1::bigint)
    AND EXISTS (
      SELECT 1
      FROM master_services ms
      INNER JOIN masters m
        ON m.studio_id = ms.studio_id
       AND m.user_id = ms.master_id
      WHERE ms.studio_id = s.studio_id
        AND ms.service_id = s.id
        AND ms.is_active = TRUE
        AND m.is_bookable = TRUE
    )
  ORDER BY s.id ASC
  LIMIT $2
`;

export const SQL_CHECK_MASTER_WORK_SCHEDULE_AT_SLOT = `
  WITH local_slot AS (
    SELECT
      ($2::timestamptz AT TIME ZONE $4)::date AS local_date,
      EXTRACT(ISODOW FROM ($2::timestamptz AT TIME ZONE $4))::int AS local_weekday,
      ($2::timestamptz AT TIME ZONE $4)::time AS local_start_time,
      ($3::timestamptz AT TIME ZONE $4)::time AS local_end_time
  ),
  day_off AS (
    SELECT EXISTS(
      SELECT 1
      FROM master_days_off d, local_slot l
      WHERE d.master_id = $1::bigint
        AND d.off_date = l.local_date
    ) AS value
  ),
  vacation AS (
    SELECT EXISTS(
      SELECT 1
      FROM master_vacations v, local_slot l
      WHERE v.master_id = $1::bigint
        AND l.local_date BETWEEN v.date_from AND v.date_to
    ) AS value
  ),
  temporary_rule AS (
    SELECT
      t.is_working,
      t.open_time,
      t.close_time
    FROM master_temporary_hours t, local_slot l
    WHERE t.master_id = $1::bigint
      AND l.local_date BETWEEN t.date_from AND t.date_to
      AND t.weekday = l.local_weekday
    ORDER BY t.date_from DESC, t.id DESC
    LIMIT 1
  ),
  weekly_rule AS (
    SELECT
      w.is_working,
      w.open_time,
      w.close_time
    FROM master_weekly_hours w, local_slot l
    WHERE w.master_id = $1::bigint
      AND w.weekday = l.local_weekday
    LIMIT 1
  ),
  effective_rule AS (
    SELECT
      CASE
        WHEN (SELECT value FROM day_off) THEN FALSE
        WHEN (SELECT value FROM vacation) THEN FALSE
        WHEN EXISTS(SELECT 1 FROM temporary_rule) THEN (SELECT is_working FROM temporary_rule)
        WHEN EXISTS(SELECT 1 FROM weekly_rule) THEN (SELECT is_working FROM weekly_rule)
        ELSE FALSE
      END AS is_working,
      CASE
        WHEN EXISTS(SELECT 1 FROM temporary_rule) THEN (SELECT open_time FROM temporary_rule)
        ELSE (SELECT open_time FROM weekly_rule)
      END AS open_time,
      CASE
        WHEN EXISTS(SELECT 1 FROM temporary_rule) THEN (SELECT close_time FROM temporary_rule)
        ELSE (SELECT close_time FROM weekly_rule)
      END AS close_time
  )
  SELECT
    CASE
      WHEN NOT er.is_working THEN FALSE
      WHEN er.open_time IS NULL OR er.close_time IS NULL THEN FALSE
      WHEN l.local_start_time < er.open_time THEN FALSE
      WHEN l.local_end_time > er.close_time THEN FALSE
      ELSE TRUE
    END AS is_available,
    CASE
      WHEN (SELECT value FROM day_off) THEN 'day_off'
      WHEN (SELECT value FROM vacation) THEN 'vacation'
      WHEN NOT er.is_working THEN 'not_working'
      WHEN er.open_time IS NULL OR er.close_time IS NULL THEN 'no_hours'
      WHEN l.local_start_time < er.open_time OR l.local_end_time > er.close_time THEN 'outside_hours'
      ELSE NULL
    END AS reason_code
  FROM local_slot l
  CROSS JOIN effective_rule er
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

export const SQL_LIST_AVAILABLE_TIME_CODES_FOR_BOOKING_DATE = `
  WITH candidates AS (
    SELECT
      m.user_id AS master_id,
      m.studio_id,
      m.display_name,
      m.rating_avg,
      m.rating_count,
      m.experience_years,
      COALESCE(ms.custom_duration_minutes, s.duration_minutes) AS duration_minutes,
      st.timezone AS studio_timezone
    FROM master_services ms
    INNER JOIN masters m
      ON m.studio_id = ms.studio_id
     AND m.user_id = ms.master_id
    INNER JOIN services s
      ON s.studio_id = ms.studio_id
     AND s.id = ms.service_id
    INNER JOIN studios st
      ON st.id = ms.studio_id
    WHERE ms.studio_id = $1::bigint
      AND ms.service_id = $2::bigint
      AND ms.is_active = TRUE
      AND s.is_active = TRUE
      AND m.is_bookable = TRUE
  ),
  slot_inputs AS (
    SELECT unnest($4::text[]) AS time_code
  ),
  base_slots AS (
    SELECT
      c.*,
      $3::date AS local_date,
      EXTRACT(ISODOW FROM $3::date)::int AS local_weekday,
      si.time_code,
      (
        $3::date::timestamp
        + make_interval(
          hours => SUBSTRING(si.time_code, 1, 2)::int,
          mins => SUBSTRING(si.time_code, 3, 2)::int
        )
      ) AS local_start_at
    FROM candidates c
    CROSS JOIN slot_inputs si
  ),
  slot_windows AS (
    SELECT
      bs.*,
      (bs.local_start_at + (bs.duration_minutes * interval '1 minute')) AS local_end_at,
      (bs.local_start_at AT TIME ZONE bs.studio_timezone) AS start_at_utc,
      ((bs.local_start_at + (bs.duration_minutes * interval '1 minute')) AT TIME ZONE bs.studio_timezone) AS end_at_utc
    FROM base_slots bs
  ),
  schedule_eval AS (
    SELECT
      sw.*,
      EXISTS(
        SELECT 1
        FROM master_days_off d
        WHERE d.master_id = sw.master_id
          AND d.off_date = sw.local_date
      ) AS is_day_off,
      EXISTS(
        SELECT 1
        FROM master_vacations v
        WHERE v.master_id = sw.master_id
          AND sw.local_date BETWEEN v.date_from AND v.date_to
      ) AS is_vacation,
      tr.is_working AS temp_is_working,
      tr.open_time AS temp_open_time,
      tr.close_time AS temp_close_time,
      wr.is_working AS week_is_working,
      wr.open_time AS week_open_time,
      wr.close_time AS week_close_time
    FROM slot_windows sw
    LEFT JOIN LATERAL (
      SELECT
        t.is_working,
        t.open_time,
        t.close_time
      FROM master_temporary_hours t
      WHERE t.master_id = sw.master_id
        AND sw.local_date BETWEEN t.date_from AND t.date_to
        AND t.weekday = sw.local_weekday
      ORDER BY t.date_from DESC, t.id DESC
      LIMIT 1
    ) tr ON TRUE
    LEFT JOIN LATERAL (
      SELECT
        w.is_working,
        w.open_time,
        w.close_time
      FROM master_weekly_hours w
      WHERE w.master_id = sw.master_id
        AND w.weekday = sw.local_weekday
      LIMIT 1
    ) wr ON TRUE
  ),
  effective AS (
    SELECT
      se.*,
      CASE
        WHEN se.is_day_off OR se.is_vacation THEN FALSE
        WHEN se.temp_is_working IS NOT NULL THEN se.temp_is_working
        WHEN se.week_is_working IS NOT NULL THEN se.week_is_working
        ELSE FALSE
      END AS is_working,
      CASE
        WHEN se.temp_is_working IS NOT NULL THEN se.temp_open_time
        ELSE se.week_open_time
      END AS open_time,
      CASE
        WHEN se.temp_is_working IS NOT NULL THEN se.temp_close_time
        ELSE se.week_close_time
      END AS close_time
    FROM schedule_eval se
  ),
  available AS (
    SELECT
      e.time_code
    FROM effective e
    WHERE e.is_working = TRUE
      AND e.open_time IS NOT NULL
      AND e.close_time IS NOT NULL
      AND e.local_start_at::time >= e.open_time
      AND e.local_end_at::time <= e.close_time
      AND NOT EXISTS (
        SELECT 1
        FROM appointments a
        WHERE a.master_id = e.master_id
          AND a.deleted_at IS NULL
          AND a.status IN ('pending', 'confirmed')
          AND tstzrange(a.start_at, a.end_at, '[)')
              && tstzrange(e.start_at_utc, e.end_at_utc, '[)')
      )
  )
  SELECT DISTINCT
    a.time_code
  FROM available a
  ORDER BY a.time_code ASC
`;

export const SQL_LIST_AVAILABLE_MASTERS_FOR_BOOKING_SLOT = `
  WITH candidates AS (
    SELECT
      m.user_id AS master_id,
      m.studio_id,
      m.display_name,
      m.rating_avg,
      m.rating_count,
      m.experience_years,
      COALESCE(ms.custom_duration_minutes, s.duration_minutes) AS duration_minutes,
      st.timezone AS studio_timezone
    FROM master_services ms
    INNER JOIN masters m
      ON m.studio_id = ms.studio_id
     AND m.user_id = ms.master_id
    INNER JOIN services s
      ON s.studio_id = ms.studio_id
     AND s.id = ms.service_id
    INNER JOIN studios st
      ON st.id = ms.studio_id
    WHERE ms.studio_id = $1::bigint
      AND ms.service_id = $2::bigint
      AND ms.is_active = TRUE
      AND s.is_active = TRUE
      AND m.is_bookable = TRUE
  ),
  slot_window AS (
    SELECT
      c.*,
      $3::date AS local_date,
      EXTRACT(ISODOW FROM $3::date)::int AS local_weekday,
      $4::text AS time_code,
      (
        $3::date::timestamp
        + make_interval(
          hours => SUBSTRING($4::text, 1, 2)::int,
          mins => SUBSTRING($4::text, 3, 2)::int
        )
      ) AS local_start_at
    FROM candidates c
  ),
  slot_window_calc AS (
    SELECT
      sw.*,
      (sw.local_start_at + (sw.duration_minutes * interval '1 minute')) AS local_end_at,
      (sw.local_start_at AT TIME ZONE sw.studio_timezone) AS start_at_utc,
      ((sw.local_start_at + (sw.duration_minutes * interval '1 minute')) AT TIME ZONE sw.studio_timezone) AS end_at_utc
    FROM slot_window sw
  ),
  schedule_eval AS (
    SELECT
      sw.*,
      EXISTS(
        SELECT 1
        FROM master_days_off d
        WHERE d.master_id = sw.master_id
          AND d.off_date = sw.local_date
      ) AS is_day_off,
      EXISTS(
        SELECT 1
        FROM master_vacations v
        WHERE v.master_id = sw.master_id
          AND sw.local_date BETWEEN v.date_from AND v.date_to
      ) AS is_vacation,
      tr.is_working AS temp_is_working,
      tr.open_time AS temp_open_time,
      tr.close_time AS temp_close_time,
      wr.is_working AS week_is_working,
      wr.open_time AS week_open_time,
      wr.close_time AS week_close_time
    FROM slot_window_calc sw
    LEFT JOIN LATERAL (
      SELECT
        t.is_working,
        t.open_time,
        t.close_time
      FROM master_temporary_hours t
      WHERE t.master_id = sw.master_id
        AND sw.local_date BETWEEN t.date_from AND t.date_to
        AND t.weekday = sw.local_weekday
      ORDER BY t.date_from DESC, t.id DESC
      LIMIT 1
    ) tr ON TRUE
    LEFT JOIN LATERAL (
      SELECT
        w.is_working,
        w.open_time,
        w.close_time
      FROM master_weekly_hours w
      WHERE w.master_id = sw.master_id
        AND w.weekday = sw.local_weekday
      LIMIT 1
    ) wr ON TRUE
  ),
  effective AS (
    SELECT
      se.*,
      CASE
        WHEN se.is_day_off OR se.is_vacation THEN FALSE
        WHEN se.temp_is_working IS NOT NULL THEN se.temp_is_working
        WHEN se.week_is_working IS NOT NULL THEN se.week_is_working
        ELSE FALSE
      END AS is_working,
      CASE
        WHEN se.temp_is_working IS NOT NULL THEN se.temp_open_time
        ELSE se.week_open_time
      END AS open_time,
      CASE
        WHEN se.temp_is_working IS NOT NULL THEN se.temp_close_time
        ELSE se.week_close_time
      END AS close_time
    FROM schedule_eval se
  )
  SELECT
    e.master_id,
    e.studio_id,
    e.display_name,
    e.rating_avg,
    e.rating_count,
    e.experience_years
  FROM effective e
  WHERE e.is_working = TRUE
    AND e.open_time IS NOT NULL
    AND e.close_time IS NOT NULL
    AND e.local_start_at::time >= e.open_time
    AND e.local_end_at::time <= e.close_time
    AND NOT EXISTS (
      SELECT 1
      FROM appointments a
      WHERE a.master_id = e.master_id
        AND a.deleted_at IS NULL
        AND a.status IN ('pending', 'confirmed')
        AND tstzrange(a.start_at, a.end_at, '[)')
            && tstzrange(e.start_at_utc, e.end_at_utc, '[)')
    )
  ORDER BY e.rating_avg DESC, e.rating_count DESC, e.master_id ASC
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
