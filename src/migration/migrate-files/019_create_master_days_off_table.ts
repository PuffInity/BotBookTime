import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 019_create_master_days_off_table.ts
 * @summary Створення таблиці master_days_off з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `019_create_master_days_off_table` для керування структурою БД.
 */
export class Migration019CreateMasterDaysOffTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS master_days_off (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  master_id BIGINT NOT NULL REFERENCES masters(user_id) ON DELETE CASCADE,
  off_date DATE NOT NULL,
  reason TEXT,
  created_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (master_id, off_date)
);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_master_days_off_date ON master_days_off(master_id, off_date);
`);

            migrationLogger.info('Міграція 019_create_master_days_off_table виконана');
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
DROP INDEX IF EXISTS idx_master_days_off_date;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS master_days_off;
`);

            migrationLogger.info('Міграція 019_create_master_days_off_table скинута');
        } finally {}
    }
}

export default Migration019CreateMasterDaysOffTable;
