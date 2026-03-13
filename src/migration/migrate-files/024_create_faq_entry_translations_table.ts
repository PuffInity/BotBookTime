import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 024_create_faq_entry_translations_table.ts
 * @summary Створення таблиці faq_entry_translations з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `024_create_faq_entry_translations_table` для керування структурою БД.
 */
export class Migration024CreateFaqEntryTranslationsTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS faq_entry_translations (
  faq_id BIGINT NOT NULL REFERENCES faq_entries(id) ON DELETE CASCADE,
  language language_code NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (faq_id, language)
);
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_faq_entry_translations_set_updated_at ON faq_entry_translations;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_faq_entry_translations_set_updated_at
BEFORE UPDATE ON faq_entry_translations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            migrationLogger.info('Міграція 024_create_faq_entry_translations_table виконана');
        } finally {}
    }
    /**
     * @summary Виконує rollback міграції (down).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async down(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_faq_entry_translations_set_updated_at ON faq_entry_translations;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS faq_entry_translations;
`);

            migrationLogger.info('Міграція 024_create_faq_entry_translations_table скинута');
        } finally {}
    }
}

export default Migration024CreateFaqEntryTranslationsTable;
