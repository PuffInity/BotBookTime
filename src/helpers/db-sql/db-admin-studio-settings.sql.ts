/**
 * @file db-admin-studio-settings.sql.ts
 * @summary uk: SQL constants for admin studio settings helper.
 * en: Module summary.
 * cz: Shrnutí modulu.
 */

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_GET_ADMIN_STUDIO_SETTINGS_STUDIO = `
  SELECT
    s.id,
    s.name,
    s.city,
    s.address_line,
    s.phone_e164,
    s.email,
    s.timezone,
    s.currency_code,
    s.is_active
  FROM studios s
  WHERE s.id = $1::bigint
    AND s.is_active = TRUE
  LIMIT 1
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_LIST_ADMIN_STUDIO_SETTINGS_WEEKLY_HOURS = `
  SELECT
    swh.weekday,
    swh.is_open,
    swh.open_time,
    swh.close_time
  FROM studio_weekly_hours swh
  WHERE swh.studio_id = $1::bigint
  ORDER BY swh.weekday ASC
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_LIST_ADMIN_STUDIO_SETTINGS_CONTENT_BLOCKS = `
  SELECT
    scb.block_key,
    scb.content,
    scb.language,
    scb.updated_at
  FROM studio_content_blocks scb
  WHERE scb.studio_id = $1::bigint
    AND scb.language = $2::language_code
`;

// uk: SQL константа / en: SQL constant / cz: SQL konstanta
export const SQL_UPSERT_ADMIN_STUDIO_SETTINGS_CONTENT_BLOCK = `
  INSERT INTO studio_content_blocks (
    studio_id,
    block_key,
    language,
    content,
    updated_by
  ) VALUES (
    $1::bigint,
    $2::content_block_key,
    $3::language_code,
    $4::text,
    $5::bigint
  )
  ON CONFLICT (studio_id, block_key, language)
  DO UPDATE
    SET content = EXCLUDED.content,
        updated_by = EXCLUDED.updated_by,
        updated_at = now()
`;
