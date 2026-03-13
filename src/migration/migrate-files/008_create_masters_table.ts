import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 008_create_masters_table.ts
 * @summary Створення таблиці masters з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `008_create_masters_table` для керування структурою БД.
 */
export class Migration008CreateMastersTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS masters (
  user_id BIGINT PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  studio_id BIGINT NOT NULL REFERENCES studios(id) ON DELETE RESTRICT,
  display_name TEXT NOT NULL,
  bio TEXT,
  experience_years SMALLINT CHECK (experience_years IS NULL OR experience_years >= 0),
  procedures_done_total INTEGER NOT NULL DEFAULT 0 CHECK (procedures_done_total >= 0),
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating_avg BETWEEN 0 AND 5),
  rating_count INTEGER NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
  started_on DATE,
  materials_info TEXT,
  contact_phone_e164 TEXT,
  contact_email CITEXT,
  is_bookable BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_masters_studio_user UNIQUE (studio_id, user_id),
  CHECK (contact_phone_e164 IS NULL OR contact_phone_e164 ~ '^[+][1-9][0-9]{6,14}$')
);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_masters_studio_bookable ON masters(studio_id, is_bookable);
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_masters_set_updated_at ON masters;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_masters_set_updated_at
BEFORE UPDATE ON masters
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            migrationLogger.info('Міграція 008_create_masters_table виконана');
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
DROP TRIGGER IF EXISTS trg_masters_set_updated_at ON masters;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_masters_studio_bookable;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS masters;
`);

            migrationLogger.info('Міграція 008_create_masters_table скинута');
        } finally {}
    }
}

export default Migration008CreateMastersTable;
