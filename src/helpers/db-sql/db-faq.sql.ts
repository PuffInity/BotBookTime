/**
 * @file db-faq.sql.ts
 * @summary SQL constants for db-faq helper.
 */

export const FAQ_ENTRIES_SELECT_COLUMNS = `
  id,
  studio_id,
  sort_order,
  is_active,
  created_at,
  updated_at
`;

export const FAQ_TRANSLATIONS_SELECT_COLUMNS = `
  faq_id,
  language,
  question,
  answer,
  updated_at
`;

export const SQL_LIST_ACTIVE_FAQ_ENTRIES = `
  SELECT
    ${FAQ_ENTRIES_SELECT_COLUMNS}
  FROM faq_entries
  WHERE is_active = TRUE
    AND ($1::bigint IS NULL OR studio_id = $1::bigint)
  ORDER BY sort_order ASC
  LIMIT $2
`;

export const SQL_LIST_FAQ_TRANSLATIONS_BY_IDS_AND_LANG = `
  SELECT
    ${FAQ_TRANSLATIONS_SELECT_COLUMNS}
  FROM faq_entry_translations
  WHERE faq_id = ANY($1::bigint[])
    AND language IN ($2::language_code, 'uk'::language_code)
`;

