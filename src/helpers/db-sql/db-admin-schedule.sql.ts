/**
 * @file db-admin-schedule.sql.ts
 * @summary SQL constants for admin schedule panel helper.
 */

export const SQL_LIST_STUDIO_WEEKLY_HOURS_FOR_ADMIN_PANEL = `
  SELECT
    weekday,
    is_open,
    open_time,
    close_time
  FROM studio_weekly_hours
  WHERE studio_id = $1::bigint
  ORDER BY weekday ASC
`;

export const SQL_LIST_STUDIO_UPCOMING_DAYS_OFF_FOR_ADMIN_PANEL = `
  SELECT
    id,
    off_date,
    reason
  FROM studio_days_off
  WHERE studio_id = $1::bigint
    AND off_date >= CURRENT_DATE
  ORDER BY off_date ASC
  LIMIT $2
`;

export const SQL_LIST_STUDIO_UPCOMING_HOLIDAYS_FOR_ADMIN_PANEL = `
  SELECT
    id,
    holiday_date,
    holiday_name
  FROM studio_holidays
  WHERE studio_id = $1::bigint
    AND holiday_date >= CURRENT_DATE
  ORDER BY holiday_date ASC
  LIMIT $2
`;

export const SQL_LIST_STUDIO_UPCOMING_TEMPORARY_HOURS_FOR_ADMIN_PANEL = `
  SELECT
    id,
    date_from,
    date_to,
    weekday,
    is_open,
    open_time,
    close_time,
    note
  FROM studio_temporary_hours
  WHERE studio_id = $1::bigint
    AND date_to >= CURRENT_DATE
  ORDER BY date_from ASC, weekday ASC
  LIMIT $2
`;

export const SQL_CHECK_STUDIO_DAY_OFF_EXISTS_FOR_DATE = `
  SELECT EXISTS (
    SELECT 1
    FROM studio_days_off
    WHERE studio_id = $1::bigint
      AND off_date = $2::date
  ) AS already_exists
`;

export const SQL_CHECK_STUDIO_HOLIDAY_EXISTS_FOR_DATE = `
  SELECT EXISTS (
    SELECT 1
    FROM studio_holidays
    WHERE studio_id = $1::bigint
      AND holiday_date = $2::date
  ) AS already_exists
`;

export const SQL_COUNT_STUDIO_ACTIVE_BOOKINGS_ON_DATE = `
  SELECT COUNT(*)::int AS active_count
  FROM appointments a
  INNER JOIN studios st
    ON st.id = a.studio_id
  WHERE a.studio_id = $1::bigint
    AND a.deleted_at IS NULL
    AND a.status IN ('pending', 'confirmed')
    AND (a.start_at AT TIME ZONE st.timezone)::date = $2::date
`;

export const SQL_INSERT_STUDIO_DAY_OFF = `
  INSERT INTO studio_days_off (
    studio_id,
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

export const SQL_INSERT_STUDIO_HOLIDAY = `
  INSERT INTO studio_holidays (
    studio_id,
    holiday_date,
    holiday_name,
    created_by
  )
  VALUES (
    $1::bigint,
    $2::date,
    $3,
    $4::bigint
  )
  RETURNING id, holiday_date, holiday_name
`;

export const SQL_DELETE_STUDIO_DAY_OFF_BY_ID = `
  DELETE FROM studio_days_off
  WHERE id = $1::bigint
    AND studio_id = $2::bigint
  RETURNING id
`;

export const SQL_DELETE_STUDIO_HOLIDAY_BY_ID = `
  DELETE FROM studio_holidays
  WHERE id = $1::bigint
    AND studio_id = $2::bigint
  RETURNING id
`;
