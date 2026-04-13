/**
 * @file db-reminder.sql.ts
 * @summary SQL запити для нагадувань про візити.
 */

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_GET_STUDIO_REMINDER_SETTINGS = `
  SELECT
    reminder_before_hours
  FROM studio_global_settings
  WHERE studio_id = $1
  LIMIT 1;
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_LIST_UPCOMING_CONFIRMED_APPOINTMENTS_FOR_REMINDER = `
  SELECT
    a.id,
    a.studio_id,
    a.client_id,
    a.booked_for_user_id,
    a.master_id,
    a.service_id,
    a.source,
    a.status,
    a.attendee_name,
    a.attendee_phone_e164,
    a.attendee_email,
    a.client_comment,
    a.internal_comment,
    a.start_at,
    a.end_at,
    a.slot,
    a.price_amount,
    a.currency_code,
    a.created_by,
    a.updated_by,
    a.confirmed_at,
    a.canceled_at,
    a.completed_at,
    a.transferred_at,
    a.canceled_reason,
    a.deleted_at,
    a.deleted_by,
    a.created_at,
    a.updated_at,
    st.name AS studio_name,
    st.timezone AS studio_timezone,
    svc.name AS service_name,
    m.display_name AS master_display_name
  FROM appointments a
  JOIN studios st
    ON st.id = a.studio_id
   AND st.is_active = true
  JOIN services svc
    ON svc.id = a.service_id
   AND svc.studio_id = a.studio_id
  JOIN masters m
    ON m.user_id = a.master_id
   AND m.studio_id = a.studio_id
  WHERE a.studio_id = $1
    AND a.status = 'confirmed'
    AND a.start_at > $2
    AND a.start_at <= $3
    AND a.deleted_at IS NULL
  ORDER BY a.start_at ASC;
`;
