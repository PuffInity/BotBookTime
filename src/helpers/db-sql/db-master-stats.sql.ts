/**
 * @file db-master-stats.sql.ts
 * @summary uk: SQL constants для блоку статистики панелі майстра.
 * en: Module summary.
 * cz: Shrnutí modulu.
 */

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_GET_MASTER_PANEL_STATS_OVERVIEW = `
  WITH context AS (
    SELECT
      st.timezone AS timezone,
      (now() AT TIME ZONE st.timezone) AS now_local,
      date_trunc('month', now() AT TIME ZONE st.timezone)::date AS month_start_date,
      (date_trunc('month', now() AT TIME ZONE st.timezone) + interval '1 month')::date AS next_month_start_date,
      date_trunc('week', now() AT TIME ZONE st.timezone)::date AS week_start_date,
      (now() AT TIME ZONE st.timezone)::date AS today_date
    FROM masters m
    INNER JOIN studios st
      ON st.id = m.studio_id
    WHERE m.user_id = $1::bigint
    LIMIT 1
  ),
  scoped AS (
    SELECT
      a.client_id,
      a.service_id,
      a.status,
      (a.start_at AT TIME ZONE ctx.timezone)::date AS local_date
    FROM appointments a
    CROSS JOIN context ctx
    WHERE a.master_id = $1::bigint
      AND a.deleted_at IS NULL
  ),
  month_all AS (
    SELECT s.*
    FROM scoped s
    CROSS JOIN context ctx
    WHERE s.local_date >= ctx.month_start_date
      AND s.local_date < ctx.next_month_start_date
  ),
  month_completed AS (
    SELECT *
    FROM month_all
    WHERE status = 'completed'
  ),
  month_active AS (
    SELECT *
    FROM month_all
    WHERE status IN ('pending', 'confirmed', 'completed', 'transferred')
  ),
  month_clients AS (
    SELECT DISTINCT client_id
    FROM month_completed
  ),
  repeat_clients AS (
    SELECT mc.client_id
    FROM month_clients mc
    CROSS JOIN context ctx
    WHERE EXISTS (
      SELECT 1
      FROM scoped s
      WHERE s.client_id = mc.client_id
        AND s.status = 'completed'
        AND s.local_date < ctx.month_start_date
    )
  ),
  week_activity AS (
    SELECT COUNT(*)::int AS bookings_this_week
    FROM scoped s
    CROSS JOIN context ctx
    WHERE s.local_date >= ctx.week_start_date
      AND s.local_date < (ctx.week_start_date + interval '7 days')::date
      AND s.status IN ('pending', 'confirmed', 'completed', 'transferred')
  ),
  today_activity AS (
    SELECT COUNT(*)::int AS bookings_today
    FROM scoped s
    CROSS JOIN context ctx
    WHERE s.local_date = ctx.today_date
      AND s.status IN ('pending', 'confirmed', 'completed', 'transferred')
  )
  SELECT
    (SELECT COUNT(*)::int FROM month_completed) AS completed_procedures_month,
    (SELECT COUNT(DISTINCT client_id)::int FROM month_completed) AS clients_served_month,
    CASE
      WHEN (SELECT COUNT(*) FROM month_all) = 0 THEN 0
      ELSE ROUND(
        (SELECT COUNT(*)::numeric FROM month_active) * 100
        / (SELECT COUNT(*)::numeric FROM month_all)
      )::int
    END AS workload_percent_month,
    CASE
      WHEN (SELECT COUNT(*) FROM month_clients) = 0 THEN 0
      ELSE ROUND(
        (SELECT COUNT(*)::numeric FROM repeat_clients) * 100
        / (SELECT COUNT(*)::numeric FROM month_clients)
      )::int
    END AS repeat_clients_percent_month,
    (
      (SELECT COUNT(*)::int FROM month_clients)
      - (SELECT COUNT(*)::int FROM repeat_clients)
    ) AS new_clients_month,
    (SELECT bookings_this_week FROM week_activity) AS bookings_this_week,
    (SELECT bookings_today FROM today_activity) AS bookings_today
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_GET_MASTER_PANEL_STATS_TOP_SERVICES = `
  WITH context AS (
    SELECT
      st.timezone AS timezone,
      date_trunc('month', now() AT TIME ZONE st.timezone)::date AS month_start_date,
      (date_trunc('month', now() AT TIME ZONE st.timezone) + interval '1 month')::date AS next_month_start_date
    FROM masters m
    INNER JOIN studios st
      ON st.id = m.studio_id
    WHERE m.user_id = $1::bigint
    LIMIT 1
  ),
  scoped AS (
    SELECT
      a.service_id
    FROM appointments a
    CROSS JOIN context ctx
    WHERE a.master_id = $1::bigint
      AND a.deleted_at IS NULL
      AND a.status = 'completed'
      AND (a.start_at AT TIME ZONE ctx.timezone)::date >= ctx.month_start_date
      AND (a.start_at AT TIME ZONE ctx.timezone)::date < ctx.next_month_start_date
  )
  SELECT
    s.name AS service_name,
    COUNT(*)::int AS completed_count
  FROM scoped sc
  INNER JOIN services s
    ON s.id = sc.service_id
  GROUP BY s.name
  ORDER BY completed_count DESC, s.name ASC
  LIMIT 3
`;

