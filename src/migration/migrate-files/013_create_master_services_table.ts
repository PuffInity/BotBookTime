import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 013_create_master_services_table.ts
 * @summary Створення таблиці master_services з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `013_create_master_services_table` для керування структурою БД.
 */
export class Migration013CreateMasterServicesTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS master_services (
  studio_id BIGINT NOT NULL,
  master_id BIGINT NOT NULL,
  service_id BIGINT NOT NULL,
  custom_price NUMERIC(12,2) CHECK (custom_price IS NULL OR custom_price >= 0),
  custom_duration_minutes INTEGER CHECK (custom_duration_minutes IS NULL OR custom_duration_minutes BETWEEN 5 AND 720),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (studio_id, master_id, service_id),
  CONSTRAINT fk_master_services_master
    FOREIGN KEY (studio_id, master_id)
    REFERENCES masters(studio_id, user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_master_services_service
    FOREIGN KEY (studio_id, service_id)
    REFERENCES services(studio_id, id)
    ON DELETE CASCADE
);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_master_services_master_active ON master_services(studio_id, master_id) WHERE is_active;
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_master_services_service_active ON master_services(studio_id, service_id) WHERE is_active;
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_master_services_set_updated_at ON master_services;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_master_services_set_updated_at
BEFORE UPDATE ON master_services
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            migrationLogger.info('Міграція 013_create_master_services_table виконана');
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
DROP TRIGGER IF EXISTS trg_master_services_set_updated_at ON master_services;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_master_services_master_active;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_master_services_service_active;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS master_services;
`);

            migrationLogger.info('Міграція 013_create_master_services_table скинута');
        } finally {}
    }
}

export default Migration013CreateMasterServicesTable;
