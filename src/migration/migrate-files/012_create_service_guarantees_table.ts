import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 012_create_service_guarantees_table.ts
 * @summary Створення таблиці service_guarantees з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `012_create_service_guarantees_table` для керування структурою БД.
 */
export class Migration012CreateServiceGuaranteesTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS service_guarantees (
  service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  guarantee_no SMALLINT NOT NULL CHECK (guarantee_no BETWEEN 1 AND 10),
  guarantee_text TEXT NOT NULL,
  valid_days INTEGER CHECK (valid_days IS NULL OR valid_days >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (service_id, guarantee_no)
);
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_service_guarantees_set_updated_at ON service_guarantees;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_service_guarantees_set_updated_at
BEFORE UPDATE ON service_guarantees
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            migrationLogger.info('Міграція 012_create_service_guarantees_table виконана');
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
DROP TRIGGER IF EXISTS trg_service_guarantees_set_updated_at ON service_guarantees;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS service_guarantees;
`);

            migrationLogger.info('Міграція 012_create_service_guarantees_table скинута');
        } finally {}
    }
}

export default Migration012CreateServiceGuaranteesTable;
