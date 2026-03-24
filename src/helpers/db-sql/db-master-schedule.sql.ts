/**
 * @file db-master-schedule.sql.ts
 * @summary SQL constants for master schedule panel helper.
 */

export const SQL_LIST_MASTER_WEEKLY_HOURS_FOR_PANEL = `
  SELECT
    weekday,
    is_working,
    open_time,
    close_time
  FROM master_weekly_hours
  WHERE master_id = $1::bigint
  ORDER BY weekday ASC
`;

export const SQL_LIST_MASTER_UPCOMING_DAYS_OFF_FOR_PANEL = `
  SELECT
    id,
    off_date,
    reason
  FROM master_days_off
  WHERE master_id = $1::bigint
    AND off_date >= CURRENT_DATE
  ORDER BY off_date ASC
  LIMIT $2
`;

export const SQL_LIST_MASTER_UPCOMING_VACATIONS_FOR_PANEL = `
  SELECT
    id,
    date_from,
    date_to,
    reason
  FROM master_vacations
  WHERE master_id = $1::bigint
    AND date_to >= CURRENT_DATE
  ORDER BY date_from ASC
  LIMIT $2
`;

export const SQL_LIST_MASTER_UPCOMING_TEMPORARY_HOURS_FOR_PANEL = `
  SELECT
    id,
    date_from,
    date_to,
    weekday,
    is_working,
    open_time,
    close_time,
    note
  FROM master_temporary_hours
  WHERE master_id = $1::bigint
    AND date_to >= CURRENT_DATE
  ORDER BY date_from ASC, weekday ASC
  LIMIT $2
`;

export const SQL_CHECK_MASTER_DAY_OFF_EXISTS_FOR_DATE = `
  SELECT EXISTS (
    SELECT 1
    FROM master_days_off
    WHERE master_id = $1::bigint
      AND off_date = $2::date
  ) AS already_exists
`;

export const SQL_COUNT_MASTER_ACTIVE_BOOKINGS_ON_DAY_OFF_DATE = `
  SELECT COUNT(*)::int AS active_count
  FROM appointments a
  INNER JOIN masters m
    ON m.user_id = a.master_id
   AND m.studio_id = a.studio_id
  INNER JOIN studios st
    ON st.id = a.studio_id
  WHERE a.master_id = $1::bigint
    AND a.deleted_at IS NULL
    AND a.status IN ('pending', 'confirmed')
    AND (a.start_at AT TIME ZONE st.timezone)::date = $2::date
`;

export const SQL_INSERT_MASTER_DAY_OFF = `
  INSERT INTO master_days_off (
    master_id,
    off_date,
    reason,
    created_by
  )
  VALUES (
    $1::bigint,
    $2::date,
    $3,
    $4::bigint
  )
  RETURNING id, off_date, reason
`;

export const SQL_CHECK_MASTER_VACATION_OVERLAP = `
  SELECT EXISTS (
    SELECT 1
    FROM master_vacations
    WHERE master_id = $1::bigint
      AND daterange(date_from, date_to + 1, '[)')
          && daterange($2::date, $3::date + 1, '[)')
  ) AS already_exists
`;

export const SQL_COUNT_MASTER_ACTIVE_BOOKINGS_IN_VACATION_RANGE = `
  SELECT COUNT(*)::int AS active_count
  FROM appointments a
  INNER JOIN masters m
    ON m.user_id = a.master_id
   AND m.studio_id = a.studio_id
  INNER JOIN studios st
    ON st.id = a.studio_id
  WHERE a.master_id = $1::bigint
    AND a.deleted_at IS NULL
    AND a.status IN ('pending', 'confirmed')
    AND (a.start_at AT TIME ZONE st.timezone)::date BETWEEN $2::date AND $3::date
`;

export const SQL_INSERT_MASTER_VACATION = `
  INSERT INTO master_vacations (
    master_id,
    date_from,
    date_to,
    reason,
    created_by
  )
  VALUES (
    $1::bigint,
    $2::date,
    $3::date,
    $4,
    $5::bigint
  )
  RETURNING id, date_from, date_to, reason
`;

export const SQL_CHECK_MASTER_TEMPORARY_HOURS_OVERLAP = `
  SELECT EXISTS (
    SELECT 1
    FROM master_temporary_hours
    WHERE master_id = $1::bigint
      AND daterange(date_from, date_to + 1, '[)')
          && daterange($2::date, $3::date + 1, '[)')
  ) AS already_exists
`;

export const SQL_INSERT_MASTER_TEMPORARY_HOURS = `
  INSERT INTO master_temporary_hours (
    master_id,
    date_from,
    date_to,
    weekday,
    is_working,
    open_time,
    close_time,
    note,
    created_by
  )
  VALUES (
    $1::bigint,
    $2::date,
    $3::date,
    $4::smallint,
    $5::boolean,
    $6::time,
    $7::time,
    $8,
    $9::bigint
  )
`;

export const SQL_UPSERT_MASTER_WEEKLY_HOURS = `
  INSERT INTO master_weekly_hours (
    master_id,
    weekday,
    is_working,
    open_time,
    close_time
  )
  VALUES (
    $1::bigint,
    $2::smallint,
    $3::boolean,
    $4::time,
    $5::time
  )
  ON CONFLICT (master_id, weekday)
  DO UPDATE SET
    is_working = EXCLUDED.is_working,
    open_time = EXCLUDED.open_time,
    close_time = EXCLUDED.close_time
  RETURNING weekday, is_working, open_time, close_time
`;

export const SQL_DELETE_MASTER_DAY_OFF_BY_ID = `
  DELETE FROM master_days_off
  WHERE id = $1::bigint
    AND master_id = $2::bigint
  RETURNING id
`;

export const SQL_DELETE_MASTER_VACATION_BY_ID = `
  DELETE FROM master_vacations
  WHERE id = $1::bigint
    AND master_id = $2::bigint
  RETURNING id
`;

export const SQL_DELETE_MASTER_TEMPORARY_HOURS_PERIOD = `
  DELETE FROM master_temporary_hours
  WHERE master_id = $1::bigint
    AND date_from = $2::date
    AND date_to = $3::date
  RETURNING id
`;
