/**
 * @file db-admin-stats.sql.ts
 * @summary SQL constants для блоку статистики адмін-панелі.
 */

export const SQL_GET_ADMIN_PANEL_STATS_OVERVIEW = `
  WITH context AS (
    SELECT
      st.id AS studio_id,
      st.timezone AS timezone,
      st.currency_code AS currency_code,
      date_trunc('month', now() AT TIME ZONE st.timezone)::date AS month_start,
      (date_trunc('month', now() AT TIME ZONE st.timezone) - interval '2 month')::date AS month_start_3m,
      (date_trunc('month', now() AT TIME ZONE st.timezone) - interval '5 month')::date AS month_start_6m,
      (date_trunc('month', now() AT TIME ZONE st.timezone) - interval '11 month')::date AS month_start_year,
      (date_trunc('month', now() AT TIME ZONE st.timezone) + interval '1 month')::date AS next_month_start
    FROM studios st
    WHERE st.id = $1::bigint
    LIMIT 1
  ),
  completed AS (
    SELECT
      a.client_id,
      (a.start_at AT TIME ZONE ctx.timezone)::date AS local_date,
      COALESCE(af.amount_total, a.price_amount)::numeric AS gross_amount,
      COALESCE(
        af.salon_share_amount,
        COALESCE(af.amount_total, a.price_amount)::numeric * 0.15
      )::numeric AS salon_amount
    FROM appointments a
    INNER JOIN context ctx
      ON ctx.studio_id = a.studio_id
    LEFT JOIN appointment_financials af
      ON af.appointment_id = a.id
    WHERE a.studio_id = $1::bigint
      AND a.deleted_at IS NULL
      AND a.status = 'completed'
  ),
  month_completed AS (
    SELECT c.*
    FROM completed c
    CROSS JOIN context ctx
    WHERE c.local_date >= ctx.month_start
      AND c.local_date < ctx.next_month_start
  )
  SELECT
    (SELECT currency_code FROM context) AS currency_code,
    COALESCE(SUM(gross_amount) FILTER (WHERE local_date >= (SELECT month_start FROM context)), 0)::numeric(12,2) AS gross_month,
    COALESCE(SUM(gross_amount) FILTER (WHERE local_date >= (SELECT month_start_3m FROM context)), 0)::numeric(12,2) AS gross_3m,
    COALESCE(SUM(gross_amount) FILTER (WHERE local_date >= (SELECT month_start_6m FROM context)), 0)::numeric(12,2) AS gross_6m,
    COALESCE(SUM(gross_amount) FILTER (WHERE local_date >= (SELECT month_start_year FROM context)), 0)::numeric(12,2) AS gross_year,
    COALESCE(SUM(salon_amount) FILTER (WHERE local_date >= (SELECT month_start FROM context)), 0)::numeric(12,2) AS salon_month,
    COALESCE(SUM(salon_amount) FILTER (WHERE local_date >= (SELECT month_start_3m FROM context)), 0)::numeric(12,2) AS salon_3m,
    COALESCE(SUM(salon_amount) FILTER (WHERE local_date >= (SELECT month_start_6m FROM context)), 0)::numeric(12,2) AS salon_6m,
    COALESCE(SUM(salon_amount) FILTER (WHERE local_date >= (SELECT month_start_year FROM context)), 0)::numeric(12,2) AS salon_year,
    COALESCE((SELECT COUNT(*)::int FROM month_completed), 0) AS completed_procedures_month,
    COALESCE((SELECT COUNT(DISTINCT client_id)::int FROM month_completed), 0) AS unique_clients_month,
    COALESCE((SELECT AVG(gross_amount)::numeric(12,2) FROM month_completed), 0)::numeric(12,2) AS avg_check_month
  FROM completed
`;

export const SQL_LIST_ADMIN_PANEL_STATS_MASTERS_FEED = `
  WITH context AS (
    SELECT
      st.id AS studio_id,
      st.timezone AS timezone,
      st.currency_code AS currency_code,
      date_trunc('month', now() AT TIME ZONE st.timezone)::date AS month_start,
      (date_trunc('month', now() AT TIME ZONE st.timezone) + interval '1 month')::date AS next_month_start
    FROM studios st
    WHERE st.id = $1::bigint
    LIMIT 1
  ),
  completed_month AS (
    SELECT
      a.master_id,
      a.client_id,
      COALESCE(af.amount_total, a.price_amount)::numeric AS gross_amount,
      COALESCE(
        af.salon_share_amount,
        COALESCE(af.amount_total, a.price_amount)::numeric * 0.15
      )::numeric AS salon_amount
    FROM appointments a
    INNER JOIN context ctx
      ON ctx.studio_id = a.studio_id
    LEFT JOIN appointment_financials af
      ON af.appointment_id = a.id
    WHERE a.studio_id = $1::bigint
      AND a.deleted_at IS NULL
      AND a.status = 'completed'
      AND (a.start_at AT TIME ZONE ctx.timezone)::date >= ctx.month_start
      AND (a.start_at AT TIME ZONE ctx.timezone)::date < ctx.next_month_start
  ),
  grouped AS (
    SELECT
      m.user_id AS master_id,
      m.display_name,
      (SELECT currency_code FROM context) AS currency_code,
      COALESCE(COUNT(cm.master_id), 0)::int AS completed_procedures_month,
      COALESCE(COUNT(DISTINCT cm.client_id), 0)::int AS clients_served_month,
      COALESCE(SUM(cm.gross_amount), 0)::numeric(12,2) AS gross_month,
      COALESCE(SUM(cm.salon_amount), 0)::numeric(12,2) AS salon_month,
      COALESCE(AVG(cm.gross_amount), 0)::numeric(12,2) AS avg_check_month
    FROM masters m
    INNER JOIN context ctx
      ON ctx.studio_id = m.studio_id
    LEFT JOIN completed_month cm
      ON cm.master_id = m.user_id
    WHERE m.studio_id = $1::bigint
    GROUP BY m.user_id, m.display_name
  )
  SELECT
    g.*,
    COUNT(*) OVER()::int AS total_count
  FROM grouped g
  ORDER BY g.gross_month DESC, g.completed_procedures_month DESC, g.display_name ASC
  LIMIT $2
  OFFSET $3
`;

export const SQL_LIST_ADMIN_PANEL_STATS_SERVICES_FEED = `
  WITH context AS (
    SELECT
      st.id AS studio_id,
      st.timezone AS timezone,
      st.currency_code AS currency_code,
      date_trunc('month', now() AT TIME ZONE st.timezone)::date AS month_start,
      (date_trunc('month', now() AT TIME ZONE st.timezone) + interval '1 month')::date AS next_month_start
    FROM studios st
    WHERE st.id = $1::bigint
    LIMIT 1
  ),
  completed_month AS (
    SELECT
      a.service_id,
      a.client_id,
      COALESCE(af.amount_total, a.price_amount)::numeric AS gross_amount,
      COALESCE(
        af.salon_share_amount,
        COALESCE(af.amount_total, a.price_amount)::numeric * 0.15
      )::numeric AS salon_amount
    FROM appointments a
    INNER JOIN context ctx
      ON ctx.studio_id = a.studio_id
    LEFT JOIN appointment_financials af
      ON af.appointment_id = a.id
    WHERE a.studio_id = $1::bigint
      AND a.deleted_at IS NULL
      AND a.status = 'completed'
      AND (a.start_at AT TIME ZONE ctx.timezone)::date >= ctx.month_start
      AND (a.start_at AT TIME ZONE ctx.timezone)::date < ctx.next_month_start
  ),
  grouped AS (
    SELECT
      s.id AS service_id,
      s.name AS service_name,
      (SELECT currency_code FROM context) AS currency_code,
      COALESCE(COUNT(cm.service_id), 0)::int AS completed_procedures_month,
      COALESCE(COUNT(DISTINCT cm.client_id), 0)::int AS clients_served_month,
      COALESCE(SUM(cm.gross_amount), 0)::numeric(12,2) AS gross_month,
      COALESCE(SUM(cm.salon_amount), 0)::numeric(12,2) AS salon_month,
      COALESCE(AVG(cm.gross_amount), 0)::numeric(12,2) AS avg_check_month
    FROM services s
    INNER JOIN context ctx
      ON ctx.studio_id = s.studio_id
    LEFT JOIN completed_month cm
      ON cm.service_id = s.id
    WHERE s.studio_id = $1::bigint
      AND s.is_active = TRUE
    GROUP BY s.id, s.name
  )
  SELECT
    g.*,
    COUNT(*) OVER()::int AS total_count
  FROM grouped g
  ORDER BY g.gross_month DESC, g.completed_procedures_month DESC, g.service_name ASC
  LIMIT $2
  OFFSET $3
`;

export const SQL_GET_ADMIN_PANEL_STATS_SERVICE_DETAILS = `
  WITH context AS (
    SELECT
      st.id AS studio_id,
      st.timezone AS timezone,
      st.currency_code AS currency_code,
      date_trunc('month', now() AT TIME ZONE st.timezone)::date AS month_start,
      (date_trunc('month', now() AT TIME ZONE st.timezone) - interval '2 month')::date AS month_start_3m,
      (date_trunc('month', now() AT TIME ZONE st.timezone) - interval '5 month')::date AS month_start_6m,
      (date_trunc('month', now() AT TIME ZONE st.timezone) - interval '11 month')::date AS month_start_year,
      (date_trunc('month', now() AT TIME ZONE st.timezone) + interval '1 month')::date AS next_month_start
    FROM studios st
    WHERE st.id = $1::bigint
    LIMIT 1
  ),
  service_scope AS (
    SELECT
      s.id AS service_id,
      s.name AS service_name,
      s.duration_minutes,
      s.base_price::numeric AS base_price
    FROM services s
    WHERE s.id = $2::bigint
      AND s.studio_id = $1::bigint
    LIMIT 1
  ),
  completed AS (
    SELECT
      a.client_id,
      (a.start_at AT TIME ZONE ctx.timezone)::date AS local_date,
      COALESCE(af.amount_total, a.price_amount)::numeric AS gross_amount,
      COALESCE(
        af.salon_share_amount,
        COALESCE(af.amount_total, a.price_amount)::numeric * 0.15
      )::numeric AS salon_amount
    FROM appointments a
    INNER JOIN context ctx
      ON ctx.studio_id = a.studio_id
    INNER JOIN service_scope ss
      ON ss.service_id = a.service_id
    LEFT JOIN appointment_financials af
      ON af.appointment_id = a.id
    WHERE a.studio_id = $1::bigint
      AND a.service_id = $2::bigint
      AND a.deleted_at IS NULL
      AND a.status = 'completed'
  )
  SELECT
    ss.service_id,
    ss.service_name,
    ss.duration_minutes,
    ss.base_price::numeric(12,2) AS base_price,
    ctx.currency_code,
    COALESCE(SUM(c.gross_amount) FILTER (WHERE c.local_date >= ctx.month_start), 0)::numeric(12,2) AS gross_month,
    COALESCE(SUM(c.gross_amount) FILTER (WHERE c.local_date >= ctx.month_start_3m), 0)::numeric(12,2) AS gross_3m,
    COALESCE(SUM(c.gross_amount) FILTER (WHERE c.local_date >= ctx.month_start_6m), 0)::numeric(12,2) AS gross_6m,
    COALESCE(SUM(c.gross_amount) FILTER (WHERE c.local_date >= ctx.month_start_year), 0)::numeric(12,2) AS gross_year,
    COALESCE(SUM(c.salon_amount) FILTER (WHERE c.local_date >= ctx.month_start), 0)::numeric(12,2) AS salon_month,
    COALESCE(SUM(c.salon_amount) FILTER (WHERE c.local_date >= ctx.month_start_3m), 0)::numeric(12,2) AS salon_3m,
    COALESCE(SUM(c.salon_amount) FILTER (WHERE c.local_date >= ctx.month_start_6m), 0)::numeric(12,2) AS salon_6m,
    COALESCE(SUM(c.salon_amount) FILTER (WHERE c.local_date >= ctx.month_start_year), 0)::numeric(12,2) AS salon_year,
    COALESCE(COUNT(*) FILTER (WHERE c.local_date >= ctx.month_start), 0)::int AS completed_procedures_month,
    COALESCE(COUNT(DISTINCT c.client_id) FILTER (WHERE c.local_date >= ctx.month_start), 0)::int AS clients_served_month,
    COALESCE(AVG(c.gross_amount) FILTER (WHERE c.local_date >= ctx.month_start), 0)::numeric(12,2) AS avg_check_month
  FROM service_scope ss
  CROSS JOIN context ctx
  LEFT JOIN completed c
    ON TRUE
  GROUP BY
    ss.service_id,
    ss.service_name,
    ss.duration_minutes,
    ss.base_price,
    ctx.currency_code
`;

export const SQL_LIST_ADMIN_PANEL_STATS_SERVICE_TOP_MASTERS = `
  WITH context AS (
    SELECT
      st.id AS studio_id,
      st.timezone AS timezone,
      date_trunc('month', now() AT TIME ZONE st.timezone)::date AS month_start,
      (date_trunc('month', now() AT TIME ZONE st.timezone) + interval '1 month')::date AS next_month_start
    FROM studios st
    WHERE st.id = $1::bigint
    LIMIT 1
  ),
  scoped AS (
    SELECT
      a.master_id
    FROM appointments a
    INNER JOIN context ctx
      ON ctx.studio_id = a.studio_id
    WHERE a.studio_id = $1::bigint
      AND a.service_id = $2::bigint
      AND a.deleted_at IS NULL
      AND a.status = 'completed'
      AND (a.start_at AT TIME ZONE ctx.timezone)::date >= ctx.month_start
      AND (a.start_at AT TIME ZONE ctx.timezone)::date < ctx.next_month_start
  )
  SELECT
    m.user_id AS master_id,
    m.display_name,
    COUNT(*)::int AS completed_count
  FROM scoped s
  INNER JOIN masters m
    ON m.user_id = s.master_id
  GROUP BY m.user_id, m.display_name
  ORDER BY completed_count DESC, m.display_name ASC
  LIMIT $3
`;

export const SQL_GET_STUDIO_CURRENCY_CODE = `
  SELECT
    st.currency_code
  FROM studios st
  WHERE st.id = $1::bigint
  LIMIT 1
`;
