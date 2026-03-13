import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 017_create_studio_temporary_hours_table.ts
 * @summary Створення таблиці studio_temporary_hours з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `017_create_studio_temporary_hours_table` для керування структурою БД.
 */
export class Migration017CreateStudioTemporaryHoursTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS studio_temporary_hours (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  studio_id BIGINT NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  open_time TIME,
  close_time TIME,
  note TEXT,
  created_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (date_to >= date_from),
  CHECK (
    (is_open = TRUE AND open_time IS NOT NULL AND close_time IS NOT NULL AND open_time < close_time)
    OR
    (is_open = FALSE AND open_time IS NULL AND close_time IS NULL)
  ),
  UNIQUE (studio_id, date_from, date_to, weekday)
);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_studio_temp_hours_period ON studio_temporary_hours(studio_id, date_from, date_to, weekday);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_studio_temp_hours_range_gist
  ON studio_temporary_hours USING gist (studio_id, daterange(date_from, date_to + 1, '[)'));
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_studio_temporary_hours_set_updated_at ON studio_temporary_hours;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_studio_temporary_hours_set_updated_at
BEFORE UPDATE ON studio_temporary_hours
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            migrationLogger.info('Міграція 017_create_studio_temporary_hours_table виконана');
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
DROP TRIGGER IF EXISTS trg_studio_temporary_hours_set_updated_at ON studio_temporary_hours;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_studio_temp_hours_period;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_studio_temp_hours_range_gist;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS studio_temporary_hours;
`);

            migrationLogger.info('Міграція 017_create_studio_temporary_hours_table скинута');
        } finally {}
    }
}

export default Migration017CreateStudioTemporaryHoursTable;
