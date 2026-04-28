import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 030_create_appointment_status_history_table.ts
 * @summary Створення таблиці appointment_status_history з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `030_create_appointment_status_history_table` для керування структурою БД.
 */
export class Migration030CreateAppointmentStatusHistoryTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS appointment_status_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  appointment_id BIGINT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  old_status appointment_status,
  new_status appointment_status NOT NULL,
  changed_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_appointment_status_history_appt_time
  ON appointment_status_history(appointment_id, created_at DESC);
`);

            migrationLogger.info('Міграція 030_create_appointment_status_history_table виконана');
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
DROP INDEX IF EXISTS idx_appointment_status_history_appt_time;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS appointment_status_history;
`);

            migrationLogger.info('Міграція 030_create_appointment_status_history_table скинута');
        } finally {}
    }
}

export default Migration030CreateAppointmentStatusHistoryTable;
