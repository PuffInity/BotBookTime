import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 033_create_notification_queue_table.ts
 * @summary Створення таблиці notification_queue з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `033_create_notification_queue_table` для керування структурою БД.
 */
export class Migration033CreateNotificationQueueTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS notification_queue (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  appointment_id BIGINT REFERENCES appointments(id) ON DELETE SET NULL,
  notification_type notification_type NOT NULL,
  channel notification_channel NOT NULL DEFAULT 'telegram',
  status queue_status NOT NULL DEFAULT 'pending',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_notification_queue_pending
  ON notification_queue(scheduled_for)
  WHERE status = 'pending';
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_time
  ON notification_queue(user_id, scheduled_for DESC);
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_notification_queue_set_updated_at ON notification_queue;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_notification_queue_set_updated_at
BEFORE UPDATE ON notification_queue
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            migrationLogger.info('Міграція 033_create_notification_queue_table виконана');
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
DROP TRIGGER IF EXISTS trg_notification_queue_set_updated_at ON notification_queue;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_notification_queue_pending;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_notification_queue_user_time;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS notification_queue;
`);

            migrationLogger.info('Міграція 033_create_notification_queue_table скинута');
        } finally {}
    }
}

export default Migration033CreateNotificationQueueTable;
