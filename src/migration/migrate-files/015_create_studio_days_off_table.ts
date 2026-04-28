import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 015_create_studio_days_off_table.ts
 * @summary Створення таблиці studio_days_off з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `015_create_studio_days_off_table` для керування структурою БД.
 */
export class Migration015CreateStudioDaysOffTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS studio_days_off (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  studio_id BIGINT NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  off_date DATE NOT NULL,
  reason TEXT,
  created_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (studio_id, off_date)
);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_studio_days_off_date ON studio_days_off(studio_id, off_date);
`);

            migrationLogger.info('Міграція 015_create_studio_days_off_table виконана');
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
DROP INDEX IF EXISTS idx_studio_days_off_date;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS studio_days_off;
`);

            migrationLogger.info('Міграція 015_create_studio_days_off_table скинута');
        } finally {}
    }
}

export default Migration015CreateStudioDaysOffTable;
