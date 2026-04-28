import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 023_create_faq_entries_table.ts
 * @summary Створення таблиці faq_entries з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `023_create_faq_entries_table` для керування структурою БД.
 */
export class Migration023CreateFaqEntriesTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS faq_entries (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  studio_id BIGINT NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (studio_id, sort_order)
);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_faq_entries_studio_sort ON faq_entries(studio_id, sort_order) WHERE is_active;
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_faq_entries_set_updated_at ON faq_entries;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_faq_entries_set_updated_at
BEFORE UPDATE ON faq_entries
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            migrationLogger.info('Міграція 023_create_faq_entries_table виконана');
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
DROP TRIGGER IF EXISTS trg_faq_entries_set_updated_at ON faq_entries;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_faq_entries_studio_sort;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS faq_entries;
`);

            migrationLogger.info('Міграція 023_create_faq_entries_table скинута');
        } finally {}
    }
}

export default Migration023CreateFaqEntriesTable;
