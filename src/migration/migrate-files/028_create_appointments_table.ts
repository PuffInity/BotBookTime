import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 028_create_appointments_table.ts
 * @summary Створення таблиці appointments з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `028_create_appointments_table` для керування структурою БД.
 */
export class Migration028CreateAppointmentsTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS appointments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  studio_id BIGINT NOT NULL REFERENCES studios(id) ON DELETE RESTRICT,
  client_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  booked_for_user_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  master_id BIGINT NOT NULL,
  service_id BIGINT NOT NULL,
  source appointment_source NOT NULL DEFAULT 'telegram_bot',
  status appointment_status NOT NULL DEFAULT 'pending',
  attendee_name TEXT,
  attendee_phone_e164 TEXT,
  attendee_email CITEXT,
  client_comment TEXT,
  internal_comment TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  slot TSTZRANGE GENERATED ALWAYS AS (tstzrange(start_at, end_at, '[)')) STORED,
  price_amount NUMERIC(12,2) NOT NULL CHECK (price_amount >= 0),
  currency_code CHAR(3) NOT NULL DEFAULT 'CZK',
  created_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  confirmed_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  transferred_at TIMESTAMPTZ,
  canceled_reason TEXT,
  deleted_at TIMESTAMPTZ,
  deleted_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_appointments_master
    FOREIGN KEY (studio_id, master_id)
    REFERENCES masters(studio_id, user_id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_appointments_service
    FOREIGN KEY (studio_id, service_id)
    REFERENCES services(studio_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_appointments_master_service
    FOREIGN KEY (studio_id, master_id, service_id)
    REFERENCES master_services(studio_id, master_id, service_id)
    ON DELETE RESTRICT,
  CHECK (end_at > start_at),
  CHECK (attendee_phone_e164 IS NULL OR attendee_phone_e164 ~ '^[+][1-9][0-9]{6,14}$'),
  CHECK (status <> 'confirmed' OR confirmed_at IS NOT NULL),
  CHECK (status <> 'canceled' OR canceled_at IS NOT NULL),
  CHECK (status <> 'completed' OR completed_at IS NOT NULL),
  CHECK (status <> 'transferred' OR transferred_at IS NOT NULL),
  CHECK (deleted_at IS NULL OR deleted_at >= created_at)
);
`);

            await this.executeQuery(client, `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_no_overlap_for_master') THEN
    ALTER TABLE appointments
      ADD CONSTRAINT appointments_no_overlap_for_master
      EXCLUDE USING gist (
        master_id WITH =,
        slot WITH &&
      )
      WHERE (deleted_at IS NULL AND status IN ('pending', 'confirmed'));
  END IF;
END $$;
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_appointments_master_upcoming
  ON appointments(master_id, start_at)
  WHERE deleted_at IS NULL AND status IN ('pending', 'confirmed');
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_appointments_client_upcoming
  ON appointments(client_id, start_at)
  WHERE deleted_at IS NULL AND status IN ('pending', 'confirmed');
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_appointments_client_history
  ON appointments(client_id, start_at DESC)
  WHERE deleted_at IS NULL;
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_appointments_status_start
  ON appointments(status, start_at)
  WHERE deleted_at IS NULL;
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_appointments_studio_start
  ON appointments(studio_id, start_at)
  WHERE deleted_at IS NULL;
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_appointments_service_completed
  ON appointments(service_id, completed_at DESC)
  WHERE deleted_at IS NULL AND status = 'completed';
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_appointments_set_updated_at ON appointments;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_appointments_set_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_appointments_set_status_timestamps ON appointments;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_appointments_set_status_timestamps
BEFORE INSERT OR UPDATE OF status
ON appointments
FOR EACH ROW
EXECUTE FUNCTION set_appointment_status_timestamps();
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_appointments_log_status_change ON appointments;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_appointments_log_status_change
AFTER INSERT OR UPDATE OF status
ON appointments
FOR EACH ROW
EXECUTE FUNCTION log_appointment_status_change();
`);

            migrationLogger.info('Міграція 028_create_appointments_table виконана');
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
DROP TRIGGER IF EXISTS trg_appointments_set_updated_at ON appointments;
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_appointments_log_status_change ON appointments;
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_appointments_set_status_timestamps ON appointments;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_appointments_master_upcoming;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_appointments_client_upcoming;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_appointments_client_history;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_appointments_status_start;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_appointments_studio_start;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_appointments_service_completed;
`);

            await this.executeQuery(client, `
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_no_overlap_for_master;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS appointments;
`);

            migrationLogger.info('Міграція 028_create_appointments_table скинута');
        } finally {}
    }
}

export default Migration028CreateAppointmentsTable;
