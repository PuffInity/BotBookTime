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

