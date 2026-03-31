/**
 * @file db-admin-services.sql.ts
 * @summary SQL-запити для блоку "Послуги" в адмін-панелі.
 */

export const SQL_GET_ADMIN_EDITABLE_SERVICE_BY_ID = `
  SELECT
    s.id,
    s.studio_id,
    s.name,
    s.duration_minutes,
    s.base_price,
    s.currency_code,
    s.description,
    s.result_description
  FROM services s
  WHERE s.id = $1::bigint
    AND s.studio_id = $2::bigint
  LIMIT 1
`;

export const SQL_INSERT_ADMIN_SERVICE = `
  INSERT INTO services (
    studio_id,
    name,
    description,
    duration_minutes,
    base_price,
    currency_code,
    result_description,
    is_active
  )
  VALUES (
    $1::bigint,
    $2,
    $3,
    $4::integer,
    $5::numeric(12,2),
    $6,
    $7,
    TRUE
  )
  RETURNING id
`;

export const SQL_INSERT_ADMIN_SERVICE_STEP = `
  INSERT INTO service_steps (
    service_id,
    step_no,
    duration_minutes,
    title,
    description
  )
  VALUES (
    $1::bigint,
    $2::smallint,
    $3::integer,
    $4,
    $5
  )
`;

export const SQL_INSERT_ADMIN_SERVICE_GUARANTEE = `
  INSERT INTO service_guarantees (
    service_id,
    guarantee_no,
    guarantee_text,
    valid_days
  )
  VALUES (
    $1::bigint,
    $2::smallint,
    $3,
    $4::integer
  )
`;

export const SQL_UPDATE_ADMIN_SERVICE_RESULT_DESCRIPTION = `
  UPDATE services
  SET
    result_description = $3,
    updated_at = NOW()
  WHERE id = $1::bigint
    AND studio_id = $2::bigint
  RETURNING id, studio_id, name, duration_minutes, base_price, currency_code, description, result_description
`;

export const SQL_UPDATE_ADMIN_SERVICE_NAME = `
  UPDATE services
  SET
    name = $3,
    updated_at = NOW()
  WHERE id = $1::bigint
    AND studio_id = $2::bigint
  RETURNING id, studio_id, name, duration_minutes, base_price, currency_code, description, result_description
`;

export const SQL_UPDATE_ADMIN_SERVICE_DESCRIPTION = `
  UPDATE services
  SET
    description = $3,
    updated_at = NOW()
  WHERE id = $1::bigint
    AND studio_id = $2::bigint
  RETURNING id, studio_id, name, duration_minutes, base_price, currency_code, description, result_description
`;

export const SQL_UPDATE_ADMIN_SERVICE_BASE_PRICE = `
  UPDATE services
  SET
    base_price = $3::numeric(12,2),
    updated_at = NOW()
  WHERE id = $1::bigint
    AND studio_id = $2::bigint
  RETURNING id, studio_id, name, duration_minutes, base_price, currency_code, description, result_description
`;

export const SQL_UPDATE_ADMIN_SERVICE_DURATION = `
  UPDATE services
  SET
    duration_minutes = $3::integer,
    updated_at = NOW()
  WHERE id = $1::bigint
    AND studio_id = $2::bigint
  RETURNING id, studio_id, name, duration_minutes, base_price, currency_code, description, result_description
`;

export const SQL_DEACTIVATE_ADMIN_SERVICE = `
  UPDATE services
  SET
    is_active = FALSE,
    updated_at = NOW()
  WHERE id = $1::bigint
    AND studio_id = $2::bigint
  RETURNING id, studio_id, name, duration_minutes, base_price, currency_code, description, result_description
`;

export const SQL_UPDATE_ADMIN_SERVICE_GUARANTEE_TEXT = `
  UPDATE service_guarantees sg
  SET
    guarantee_text = $3,
    updated_at = NOW()
  WHERE sg.service_id = $1::bigint
    AND sg.guarantee_no = $2::smallint
    AND EXISTS (
      SELECT 1
      FROM services s
      WHERE s.id = sg.service_id
        AND s.studio_id = $4::bigint
    )
  RETURNING sg.service_id, sg.guarantee_no, sg.guarantee_text, sg.valid_days, sg.created_at, sg.updated_at
`;

export const SQL_UPDATE_ADMIN_SERVICE_STEP_TITLE = `
  UPDATE service_steps ss
  SET
    title = $3,
    updated_at = NOW()
  WHERE ss.service_id = $1::bigint
    AND ss.step_no = $2::smallint
    AND EXISTS (
      SELECT 1
      FROM services s
      WHERE s.id = ss.service_id
        AND s.studio_id = $4::bigint
    )
  RETURNING ss.service_id, ss.step_no, ss.duration_minutes, ss.title, ss.description, ss.created_at, ss.updated_at
`;

export const SQL_UPDATE_ADMIN_SERVICE_STEP_DESCRIPTION = `
  UPDATE service_steps ss
  SET
    description = $3,
    updated_at = NOW()
  WHERE ss.service_id = $1::bigint
    AND ss.step_no = $2::smallint
    AND EXISTS (
      SELECT 1
      FROM services s
      WHERE s.id = ss.service_id
        AND s.studio_id = $4::bigint
    )
  RETURNING ss.service_id, ss.step_no, ss.duration_minutes, ss.title, ss.description, ss.created_at, ss.updated_at
`;

export const SQL_UPDATE_ADMIN_SERVICE_STEP_DURATION = `
  UPDATE service_steps ss
  SET
    duration_minutes = $3::integer,
    updated_at = NOW()
  WHERE ss.service_id = $1::bigint
    AND ss.step_no = $2::smallint
    AND EXISTS (
      SELECT 1
      FROM services s
      WHERE s.id = ss.service_id
        AND s.studio_id = $4::bigint
    )
  RETURNING ss.service_id, ss.step_no, ss.duration_minutes, ss.title, ss.description, ss.created_at, ss.updated_at
`;
