import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 018_create_master_weekly_hours_table.ts
 * @summary Створення таблиці master_weekly_hours з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `018_create_master_weekly_hours_table` для керування структурою БД.
 */
export class Migration018CreateMasterWeeklyHoursTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS master_weekly_hours (
  master_id BIGINT NOT NULL REFERENCES masters(user_id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  is_working BOOLEAN NOT NULL DEFAULT TRUE,
  open_time TIME,
  close_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (master_id, weekday),
  CHECK (
    (is_working = TRUE AND open_time IS NOT NULL AND close_time IS NOT NULL AND open_time < close_time)
    OR
    (is_working = FALSE AND open_time IS NULL AND close_time IS NULL)
  )
);
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_master_weekly_hours_set_updated_at ON master_weekly_hours;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_master_weekly_hours_set_updated_at
BEFORE UPDATE ON master_weekly_hours
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            migrationLogger.info('Міграція 018_create_master_weekly_hours_table виконана');
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
DROP TRIGGER IF EXISTS trg_master_weekly_hours_set_updated_at ON master_weekly_hours;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS master_weekly_hours;
`);

            migrationLogger.info('Міграція 018_create_master_weekly_hours_table скинута');
        } finally {}
    }
}

export default Migration018CreateMasterWeeklyHoursTable;
