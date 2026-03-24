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
