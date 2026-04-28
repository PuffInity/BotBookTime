import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 010_create_services_table.ts
 * @summary Створення таблиці services з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `010_create_services_table` для керування структурою БД.
 */
export class Migration010CreateServicesTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS services (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  studio_id BIGINT NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes BETWEEN 5 AND 720),
  base_price NUMERIC(12,2) NOT NULL CHECK (base_price >= 0),
  currency_code CHAR(3) NOT NULL DEFAULT 'CZK',
  result_description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_services_studio_id UNIQUE (studio_id, id),
  CONSTRAINT uq_services_studio_name UNIQUE (studio_id, name)
);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_services_studio_active ON services(studio_id, is_active);
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_services_set_updated_at ON services;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_services_set_updated_at
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            migrationLogger.info('Міграція 010_create_services_table виконана');
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
DROP TRIGGER IF EXISTS trg_services_set_updated_at ON services;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_services_studio_active;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS services;
`);

            migrationLogger.info('Міграція 010_create_services_table скинута');
        } finally {}
    }
}

export default Migration010CreateServicesTable;
