import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 016_create_studio_holidays_table.ts
 * @summary Створення таблиці studio_holidays з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `016_create_studio_holidays_table` для керування структурою БД.
 */
export class Migration016CreateStudioHolidaysTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS studio_holidays (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  studio_id BIGINT NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  holiday_date DATE NOT NULL,
  holiday_name TEXT NOT NULL,
  created_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (studio_id, holiday_date)
);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_studio_holidays_date ON studio_holidays(studio_id, holiday_date);
`);

            migrationLogger.info('Міграція 016_create_studio_holidays_table виконана');
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
DROP INDEX IF EXISTS idx_studio_holidays_date;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS studio_holidays;
`);

            migrationLogger.info('Міграція 016_create_studio_holidays_table скинута');
        } finally {}
    }
}

export default Migration016CreateStudioHolidaysTable;
