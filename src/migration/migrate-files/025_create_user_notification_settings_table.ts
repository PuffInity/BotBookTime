import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 025_create_user_notification_settings_table.ts
 * @summary Створення таблиці user_notification_settings з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `025_create_user_notification_settings_table` для керування структурою БД.
 */
export class Migration025CreateUserNotificationSettingsTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS user_notification_settings (
  user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, notification_type)
);
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_user_notification_settings_set_updated_at ON user_notification_settings;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_user_notification_settings_set_updated_at
BEFORE UPDATE ON user_notification_settings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            migrationLogger.info('Міграція 025_create_user_notification_settings_table виконана');
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
DROP TRIGGER IF EXISTS trg_user_notification_settings_set_updated_at ON user_notification_settings;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS user_notification_settings;
`);

            migrationLogger.info('Міграція 025_create_user_notification_settings_table скинута');
        } finally {}
    }
}

export default Migration025CreateUserNotificationSettingsTable;
