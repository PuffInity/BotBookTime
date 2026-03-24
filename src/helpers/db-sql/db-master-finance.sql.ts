/**
 * @file db-master-finance.sql.ts
 * @summary SQL constants для фінансового блоку статистики майстра.
 */

export const SQL_GET_MASTER_FINANCE_OVERVIEW = `
  WITH context AS (
    SELECT
      st.timezone AS timezone,
      (now() AT TIME ZONE st.timezone) AS now_local,
      date_trunc('month', now() AT TIME ZONE st.timezone)::date AS month_start,
      (date_trunc('month', now() AT TIME ZONE st.timezone) - interval '2 month')::date AS month_start_3m,
      (date_trunc('month', now() AT TIME ZONE st.timezone) - interval '5 month')::date AS month_start_6m,
      (date_trunc('month', now() AT TIME ZONE st.timezone) - interval '11 month')::date AS month_start_year
    FROM masters m
    INNER JOIN studios st
      ON st.id = m.studio_id
    WHERE m.user_id = $1::bigint
    LIMIT 1
  ),
  completed AS (
    SELECT
      (a.start_at AT TIME ZONE ctx.timezone)::date AS local_date,
      COALESCE(af.amount_total, a.price_amount)::numeric AS gross_amount,
      COALESCE(af.salon_share_amount, COALESCE(af.amount_total, a.price_amount)::numeric * 0.15)::numeric AS salon_amount,
      COALESCE(
        af.master_share_amount,
        COALESCE(af.amount_total, a.price_amount)::numeric
          - COALESCE(af.salon_share_amount, COALESCE(af.amount_total, a.price_amount)::numeric * 0.15)::numeric
      )::numeric AS master_amount
    FROM appointments a
    INNER JOIN masters m
      ON m.user_id = a.master_id
    INNER JOIN studios st
      ON st.id = m.studio_id
    INNER JOIN context ctx
      ON ctx.timezone = st.timezone
    LEFT JOIN appointment_financials af
      ON af.appointment_id = a.id
    WHERE a.master_id = $1::bigint
      AND a.deleted_at IS NULL
      AND a.status = 'completed'
  )
  SELECT
    COALESCE(SUM(gross_amount) FILTER (WHERE local_date >= (SELECT month_start FROM context)), 0)::numeric(12,2) AS gross_month,
    COALESCE(SUM(gross_amount) FILTER (WHERE local_date >= (SELECT month_start_3m FROM context)), 0)::numeric(12,2) AS gross_3m,
    COALESCE(SUM(gross_amount) FILTER (WHERE local_date >= (SELECT month_start_6m FROM context)), 0)::numeric(12,2) AS gross_6m,
    COALESCE(SUM(gross_amount) FILTER (WHERE local_date >= (SELECT month_start_year FROM context)), 0)::numeric(12,2) AS gross_year,
    COALESCE(SUM(gross_amount), 0)::numeric(12,2) AS gross_all_time,
    COALESCE(SUM(salon_amount) FILTER (WHERE local_date >= (SELECT month_start FROM context)), 0)::numeric(12,2) AS salon_month,
    COALESCE(SUM(salon_amount) FILTER (WHERE local_date >= (SELECT month_start_3m FROM context)), 0)::numeric(12,2) AS salon_3m,
    COALESCE(SUM(salon_amount) FILTER (WHERE local_date >= (SELECT month_start_6m FROM context)), 0)::numeric(12,2) AS salon_6m,
    COALESCE(SUM(salon_amount) FILTER (WHERE local_date >= (SELECT month_start_year FROM context)), 0)::numeric(12,2) AS salon_year,
    COALESCE(SUM(master_amount), 0)::numeric(12,2) AS master_all_time,
    COALESCE(AVG(gross_amount), 0)::numeric(12,2) AS avg_check
  FROM completed
`;

export const SQL_GET_MASTER_FINANCE_TOP_SERVICE = `
  WITH context AS (
    SELECT st.timezone AS timezone
    FROM masters m
    INNER JOIN studios st
      ON st.id = m.studio_id
    WHERE m.user_id = $1::bigint
    LIMIT 1
  )
  SELECT
    s.name AS service_name,
    SUM(COALESCE(af.amount_total, a.price_amount)::numeric)::numeric(12,2) AS gross_amount
  FROM appointments a
  INNER JOIN services s
    ON s.id = a.service_id
  INNER JOIN context ctx
    ON true
  LEFT JOIN appointment_financials af
    ON af.appointment_id = a.id
  WHERE a.master_id = $1::bigint
    AND a.deleted_at IS NULL
    AND a.status = 'completed'
  GROUP BY s.name
  ORDER BY gross_amount DESC, s.name ASC
  LIMIT 1
`;

export const SQL_GET_MASTER_FINANCE_BEST_MONTH = `
  WITH context AS (
    SELECT st.timezone AS timezone
    FROM masters m
    INNER JOIN studios st
      ON st.id = m.studio_id
    WHERE m.user_id = $1::bigint
    LIMIT 1
  ),
  grouped AS (
    SELECT
      date_trunc('month', (a.start_at AT TIME ZONE ctx.timezone))::date AS month_start,
      SUM(COALESCE(af.amount_total, a.price_amount)::numeric)::numeric(12,2) AS gross_amount
    FROM appointments a
    INNER JOIN context ctx
      ON true
    LEFT JOIN appointment_financials af
      ON af.appointment_id = a.id
    WHERE a.master_id = $1::bigint
      AND a.deleted_at IS NULL
      AND a.status = 'completed'
    GROUP BY month_start
  )
  SELECT month_start, gross_amount
  FROM grouped
  ORDER BY gross_amount DESC, month_start DESC
  LIMIT 1
`;

