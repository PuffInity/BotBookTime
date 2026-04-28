import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 020_create_master_vacations_table.ts
 * @summary Створення таблиці master_vacations з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `020_create_master_vacations_table` для керування структурою БД.
 */
export class Migration020CreateMasterVacationsTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS master_vacations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  master_id BIGINT NOT NULL REFERENCES masters(user_id) ON DELETE CASCADE,
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  reason TEXT,
  created_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (date_to >= date_from)
);
`);

            await this.executeQuery(client, `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'master_vacations_no_overlap') THEN
    ALTER TABLE master_vacations
      ADD CONSTRAINT master_vacations_no_overlap
      EXCLUDE USING gist (
        master_id WITH =,
        daterange(date_from, date_to + 1, '[)') WITH &&
      );
  END IF;
END $$;
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_master_vacations_period ON master_vacations(master_id, date_from, date_to);
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_master_vacations_set_updated_at ON master_vacations;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_master_vacations_set_updated_at
BEFORE UPDATE ON master_vacations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            migrationLogger.info('Міграція 020_create_master_vacations_table виконана');
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
DROP TRIGGER IF EXISTS trg_master_vacations_set_updated_at ON master_vacations;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_master_vacations_period;
`);

            await this.executeQuery(client, `
ALTER TABLE master_vacations DROP CONSTRAINT IF EXISTS master_vacations_no_overlap;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS master_vacations;
`);

            migrationLogger.info('Міграція 020_create_master_vacations_table скинута');
        } finally {}
    }
}

export default Migration020CreateMasterVacationsTable;
