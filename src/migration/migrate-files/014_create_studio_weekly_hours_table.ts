import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 014_create_studio_weekly_hours_table.ts
 * @summary Створення таблиці studio_weekly_hours з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `014_create_studio_weekly_hours_table` для керування структурою БД.
 */
export class Migration014CreateStudioWeeklyHoursTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS studio_weekly_hours (
  studio_id BIGINT NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  open_time TIME,
  close_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (studio_id, weekday),
  CHECK (
    (is_open = TRUE AND open_time IS NOT NULL AND close_time IS NOT NULL AND open_time < close_time)
    OR
    (is_open = FALSE AND open_time IS NULL AND close_time IS NULL)
  )
);
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_studio_weekly_hours_set_updated_at ON studio_weekly_hours;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_studio_weekly_hours_set_updated_at
BEFORE UPDATE ON studio_weekly_hours
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            migrationLogger.info('Міграція 014_create_studio_weekly_hours_table виконана');
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
DROP TRIGGER IF EXISTS trg_studio_weekly_hours_set_updated_at ON studio_weekly_hours;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS studio_weekly_hours;
`);

            migrationLogger.info('Міграція 014_create_studio_weekly_hours_table скинута');
        } finally {}
    }
}

export default Migration014CreateStudioWeeklyHoursTable;
