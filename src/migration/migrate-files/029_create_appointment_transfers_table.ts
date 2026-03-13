import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 029_create_appointment_transfers_table.ts
 * @summary Створення таблиці appointment_transfers з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `029_create_appointment_transfers_table` для керування структурою БД.
 */
export class Migration029CreateAppointmentTransfersTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS appointment_transfers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  from_appointment_id BIGINT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  to_appointment_id BIGINT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  transferred_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_appointment_id),
  UNIQUE (to_appointment_id),
  CHECK (from_appointment_id <> to_appointment_id)
);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_appointment_transfers_to ON appointment_transfers(to_appointment_id);
`);

            migrationLogger.info('Міграція 029_create_appointment_transfers_table виконана');
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
DROP INDEX IF EXISTS idx_appointment_transfers_to;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS appointment_transfers;
`);

            migrationLogger.info('Міграція 029_create_appointment_transfers_table скинута');
        } finally {}
    }
}

export default Migration029CreateAppointmentTransfersTable;
