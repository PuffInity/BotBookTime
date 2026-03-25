/**
 * @file db-master-profile.sql.ts
 * @summary SQL constants для блоку "Мій профіль майстра".
 */

export const SQL_GET_MASTER_OWN_PROFILE_OVERVIEW = `
  SELECT
    m.user_id,
    m.studio_id,
    m.display_name,
    m.is_bookable,
    u.first_name,
    u.last_name,
    u.telegram_username,
    m.bio,
    m.started_on,
    m.experience_years,
    m.procedures_done_total,
    m.materials_info,
    m.contact_phone_e164,
    m.contact_email,
    m.created_at AS master_created_at
  FROM masters m
  INNER JOIN app_users u
    ON u.id = m.user_id
  WHERE m.user_id = $1::bigint
  LIMIT 1
`;

export const SQL_LIST_MASTER_OWN_PROFILE_SERVICES = `
  SELECT
    s.id AS service_id,
    s.name AS service_name
  FROM master_services ms
  INNER JOIN services s
    ON s.id = ms.service_id
   AND s.studio_id = ms.studio_id
  WHERE ms.master_id = $1::bigint
    AND ms.is_active = TRUE
    AND s.is_active = TRUE
  ORDER BY s.name ASC
`;

export const SQL_LIST_MASTER_OWN_PROFILE_SERVICES_MANAGE = `
  SELECT
    s.id AS service_id,
    s.name AS service_name,
    ms.is_active,
    COALESCE(ms.custom_duration_minutes, s.duration_minutes) AS duration_minutes,
    COALESCE(ms.custom_price, s.base_price)::text AS price_amount,
    s.currency_code
  FROM master_services ms
  INNER JOIN services s
    ON s.id = ms.service_id
   AND s.studio_id = ms.studio_id
  INNER JOIN masters m
    ON m.user_id = ms.master_id
   AND m.studio_id = ms.studio_id
  WHERE m.user_id = $1::bigint
    AND s.is_active = TRUE
  ORDER BY ms.is_active DESC, s.name ASC
`;

export const SQL_LIST_MASTER_OWN_PROFILE_SERVICES_ADD_CANDIDATES = `
  SELECT
    s.id AS service_id,
    s.name AS service_name,
    COALESCE(ms.is_active, FALSE) AS is_active,
    COALESCE(ms.custom_duration_minutes, s.duration_minutes) AS duration_minutes,
    COALESCE(ms.custom_price, s.base_price)::text AS price_amount,
    s.currency_code
  FROM masters m
  INNER JOIN services s
    ON s.studio_id = m.studio_id
   AND s.is_active = TRUE
  LEFT JOIN master_services ms
    ON ms.studio_id = s.studio_id
   AND ms.service_id = s.id
   AND ms.master_id = m.user_id
  WHERE m.user_id = $1::bigint
    AND COALESCE(ms.is_active, FALSE) = FALSE
  ORDER BY s.name ASC
`;

export const SQL_LIST_MASTER_OWN_PROFILE_SERVICES_REMOVE_CANDIDATES = `
  SELECT
    s.id AS service_id,
    s.name AS service_name,
    ms.is_active,
    COALESCE(ms.custom_duration_minutes, s.duration_minutes) AS duration_minutes,
    COALESCE(ms.custom_price, s.base_price)::text AS price_amount,
    s.currency_code
  FROM master_services ms
  INNER JOIN services s
    ON s.id = ms.service_id
   AND s.studio_id = ms.studio_id
  INNER JOIN masters m
    ON m.user_id = ms.master_id
   AND m.studio_id = ms.studio_id
  WHERE m.user_id = $1::bigint
    AND ms.is_active = TRUE
    AND s.is_active = TRUE
  ORDER BY s.name ASC
`;

export const SQL_LIST_MASTER_OWN_PROFILE_CERTIFICATES = `
  SELECT
    mc.id AS certificate_id,
    mc.title,
    mc.issuer,
    mc.issued_on
  FROM master_certificates mc
  WHERE mc.master_id = $1::bigint
  ORDER BY mc.issued_on DESC NULLS LAST, mc.id DESC
`;

export const SQL_LIST_MASTER_OWN_PROFILE_CERTIFICATES_MANAGE = `
  SELECT
    mc.id AS certificate_id,
    mc.title,
    mc.issuer,
    mc.issued_on
  FROM master_certificates mc
  WHERE mc.master_id = $1::bigint
  ORDER BY mc.issued_on DESC NULLS LAST, mc.id DESC
`;

export const SQL_FIND_MASTER_OWN_CERTIFICATE_BY_TITLE = `
  SELECT
    mc.id AS certificate_id
  FROM master_certificates mc
  WHERE mc.master_id = $1::bigint
    AND lower(mc.title) = lower($2)
    AND mc.issued_on IS NULL
  LIMIT 1
`;

export const SQL_UPDATE_MASTER_OWN_PROFILE_BIO = `
  UPDATE masters
  SET bio = $2,
      updated_at = now()
  WHERE user_id = $1::bigint
  RETURNING user_id
`;

export const SQL_UPDATE_MASTER_OWN_PROFILE_MATERIALS = `
  UPDATE masters
  SET materials_info = $2,
      updated_at = now()
  WHERE user_id = $1::bigint
  RETURNING user_id
`;

export const SQL_UPDATE_MASTER_OWN_PROFILE_PHONE = `
  UPDATE masters
  SET contact_phone_e164 = $2,
      updated_at = now()
  WHERE user_id = $1::bigint
  RETURNING user_id
`;

export const SQL_UPDATE_MASTER_OWN_PROFILE_EMAIL = `
  UPDATE masters
  SET contact_email = $2,
      updated_at = now()
  WHERE user_id = $1::bigint
  RETURNING user_id
`;

export const SQL_UPDATE_MASTER_OWN_PROFILE_DISPLAY_NAME = `
  UPDATE masters
  SET display_name = $2,
      updated_at = now()
  WHERE user_id = $1::bigint
  RETURNING user_id
`;

export const SQL_UPDATE_MASTER_OWN_PROFILE_STARTED_ON = `
  UPDATE masters
  SET started_on = $2::date,
      updated_at = now()
  WHERE user_id = $1::bigint
  RETURNING user_id
`;

export const SQL_UPDATE_MASTER_OWN_PROFILE_PROCEDURES_DONE_TOTAL = `
  UPDATE masters
  SET procedures_done_total = $2::int,
      updated_at = now()
  WHERE user_id = $1::bigint
  RETURNING user_id
`;

export const SQL_ADD_MASTER_OWN_SERVICE = `
  WITH target AS (
    SELECT
      m.studio_id,
      m.user_id AS master_id,
      s.id AS service_id,
      s.name AS service_name
    FROM masters m
    INNER JOIN services s
      ON s.id = $2::bigint
     AND s.studio_id = m.studio_id
     AND s.is_active = TRUE
    WHERE m.user_id = $1::bigint
  ),
  upserted AS (
    INSERT INTO master_services (
      studio_id,
      master_id,
      service_id,
      is_active,
      created_at,
      updated_at
    )
    SELECT
      t.studio_id,
      t.master_id,
      t.service_id,
      TRUE,
      now(),
      now()
    FROM target t
    ON CONFLICT (studio_id, master_id, service_id)
    DO UPDATE SET
      is_active = TRUE,
      updated_at = now()
    RETURNING
      studio_id,
      master_id,
      service_id,
      is_active
  )
  SELECT
    u.service_id,
    t.service_name,
    u.is_active
  FROM upserted u
  INNER JOIN target t
    ON t.studio_id = u.studio_id
   AND t.master_id = u.master_id
   AND t.service_id = u.service_id
`;

export const SQL_REMOVE_MASTER_OWN_SERVICE = `
  UPDATE master_services ms
  SET is_active = FALSE,
      updated_at = now()
  FROM masters m, services s
  WHERE m.user_id = $1::bigint
    AND ms.master_id = m.user_id
    AND ms.studio_id = m.studio_id
    AND ms.service_id = $2::bigint
    AND ms.is_active = TRUE
    AND s.id = ms.service_id
    AND s.studio_id = ms.studio_id
  RETURNING ms.service_id, s.name AS service_name, ms.is_active
`;

export const SQL_INSERT_MASTER_OWN_CERTIFICATE = `
  INSERT INTO master_certificates (
    master_id,
    title,
    created_at,
    updated_at
  )
  VALUES (
    $1::bigint,
    $2,
    now(),
    now()
  )
  RETURNING id AS certificate_id, title
`;

export const SQL_DELETE_MASTER_OWN_CERTIFICATE = `
  DELETE FROM master_certificates mc
  USING masters m
  WHERE m.user_id = $1::bigint
    AND mc.master_id = m.user_id
    AND mc.id = $2::bigint
  RETURNING mc.id AS certificate_id, mc.title
`;

export const SQL_TOGGLE_MASTER_OWN_SERVICE_AVAILABILITY = `
  UPDATE master_services ms
  SET is_active = NOT ms.is_active,
      updated_at = now()
  FROM masters m, services s
  WHERE m.user_id = $1::bigint
    AND ms.master_id = m.user_id
    AND ms.studio_id = m.studio_id
    AND ms.service_id = $2::bigint
    AND s.id = ms.service_id
    AND s.studio_id = ms.studio_id
    AND s.is_active = TRUE
  RETURNING ms.service_id, s.name AS service_name, ms.is_active
`;
