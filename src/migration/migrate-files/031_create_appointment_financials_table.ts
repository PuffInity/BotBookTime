import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 031_create_appointment_financials_table.ts
 * @summary Створення таблиці appointment_financials з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `031_create_appointment_financials_table` для керування структурою БД.
 */
export class Migration031CreateAppointmentFinancialsTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS appointment_financials (
  appointment_id BIGINT PRIMARY KEY REFERENCES appointments(id) ON DELETE CASCADE,
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  amount_total NUMERIC(12,2) NOT NULL CHECK (amount_total >= 0),
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  salon_share_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (salon_share_amount >= 0),
  master_share_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (master_share_amount >= 0),
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (amount_paid <= amount_total),
  CHECK (salon_share_amount + master_share_amount <= amount_total)
);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_appointment_financials_payment_status
  ON appointment_financials(payment_status, paid_at);
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_appointment_financials_set_updated_at ON appointment_financials;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_appointment_financials_set_updated_at
BEFORE UPDATE ON appointment_financials
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            migrationLogger.info('Міграція 031_create_appointment_financials_table виконана');
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
DROP TRIGGER IF EXISTS trg_appointment_financials_set_updated_at ON appointment_financials;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_appointment_financials_payment_status;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS appointment_financials;
`);

            migrationLogger.info('Міграція 031_create_appointment_financials_table скинута');
        } finally {}
    }
}

export default Migration031CreateAppointmentFinancialsTable;
