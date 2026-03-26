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
