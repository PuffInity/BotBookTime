/**
 * @file db-master-clients.sql.ts
 * @summary SQL constants for master-client profile helper.
 */

export const SQL_GET_MASTER_CLIENT_PROFILE_BY_BOOKING = `
  SELECT
    u.id AS client_id,
    u.first_name,
    u.last_name,
    u.telegram_username,
    u.phone_e164,
    (u.phone_verified_at IS NOT NULL) AS phone_verified,
    u.email,
    (u.email_verified_at IS NOT NULL) AS email_verified,
    u.preferred_language,
    u.created_at AS profile_created_at,
    COALESCE(BOOL_OR(ns.enabled), FALSE) AS notifications_enabled,
    COALESCE(COUNT(a.id), 0)::int AS bookings_total,
    COALESCE(COUNT(*) FILTER (WHERE a.status = 'confirmed'), 0)::int AS bookings_confirmed,
    COALESCE(COUNT(*) FILTER (WHERE a.status = 'completed'), 0)::int AS bookings_completed,
    COALESCE(COUNT(*) FILTER (WHERE a.status = 'canceled'), 0)::int AS bookings_canceled,
    MAX(a.start_at) FILTER (WHERE a.status = 'completed') AS last_visit_at
  FROM appointments target
  INNER JOIN app_users u
    ON u.id = target.client_id
  LEFT JOIN appointments a
    ON a.client_id = u.id
   AND a.master_id = $1::bigint
   AND a.deleted_at IS NULL
  LEFT JOIN user_notification_settings ns
    ON ns.user_id = u.id
  WHERE target.id = $2::bigint
    AND target.master_id = $1::bigint
    AND target.deleted_at IS NULL
  GROUP BY
    u.id,
    u.first_name,
    u.last_name,
    u.telegram_username,
    u.phone_e164,
    u.phone_verified_at,
    u.email,
    u.email_verified_at,
    u.preferred_language,
    u.created_at
  LIMIT 1
`;
