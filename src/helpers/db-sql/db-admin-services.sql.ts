/**
 * @file db-admin-services.sql.ts
 * @summary SQL-запити для блоку "Послуги" в адмін-панелі.
 */

export const SQL_GET_ADMIN_EDITABLE_SERVICE_BY_ID = `
  SELECT
    s.id,
    s.studio_id,
    s.name,
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
  RETURNING id, studio_id, name, result_description
`;
