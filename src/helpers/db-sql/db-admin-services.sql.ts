/**
 * @file db-admin-services.sql.ts
 * @summary SQL-запити для блоку "Послуги" в адмін-панелі.
 */

export const SQL_GET_ADMIN_EDITABLE_SERVICE_BY_ID = `
  SELECT
    s.id,
    s.studio_id,
    s.name,
    s.base_price,
    s.currency_code,
    s.description,
    s.result_description
  FROM services s
  WHERE s.id = $1::bigint
    AND s.studio_id = $2::bigint
  LIMIT 1
`;

export const SQL_UPDATE_ADMIN_SERVICE_RESULT_DESCRIPTION = `
  UPDATE services
  SET
    result_description = $3,
    updated_at = NOW()
  WHERE id = $1::bigint
    AND studio_id = $2::bigint
  RETURNING id, studio_id, name, base_price, currency_code, description, result_description
`;

export const SQL_UPDATE_ADMIN_SERVICE_DESCRIPTION = `
  UPDATE services
  SET
    description = $3,
    updated_at = NOW()
  WHERE id = $1::bigint
    AND studio_id = $2::bigint
  RETURNING id, studio_id, name, base_price, currency_code, description, result_description
`;

export const SQL_UPDATE_ADMIN_SERVICE_BASE_PRICE = `
  UPDATE services
  SET
    base_price = $3::numeric(12,2),
    updated_at = NOW()
  WHERE id = $1::bigint
    AND studio_id = $2::bigint
  RETURNING id, studio_id, name, base_price, currency_code, description, result_description
`;
