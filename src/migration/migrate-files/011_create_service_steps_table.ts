import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 011_create_service_steps_table.ts
 * @summary Створення таблиці service_steps з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `011_create_service_steps_table` для керування структурою БД.
 */
export class Migration011CreateServiceStepsTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS service_steps (
  service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  step_no SMALLINT NOT NULL CHECK (step_no BETWEEN 1 AND 20),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (service_id, step_no)
);
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_service_steps_set_updated_at ON service_steps;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_service_steps_set_updated_at
BEFORE UPDATE ON service_steps
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            migrationLogger.info('Міграція 011_create_service_steps_table виконана');
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
DROP TRIGGER IF EXISTS trg_service_steps_set_updated_at ON service_steps;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS service_steps;
`);

            migrationLogger.info('Міграція 011_create_service_steps_table скинута');
        } finally {}
    }
}

export default Migration011CreateServiceStepsTable;
