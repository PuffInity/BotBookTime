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
