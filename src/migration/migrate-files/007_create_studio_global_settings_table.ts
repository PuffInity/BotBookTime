import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 007_create_studio_global_settings_table.ts
 * @summary Створення таблиці studio_global_settings з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `007_create_studio_global_settings_table` для керування структурою БД.
 */
export class Migration007CreateStudioGlobalSettingsTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS studio_global_settings (
  studio_id BIGINT PRIMARY KEY REFERENCES studios(id) ON DELETE CASCADE,
  booking_horizon_days INTEGER NOT NULL DEFAULT 60 CHECK (booking_horizon_days BETWEEN 1 AND 365),
  min_cancel_notice_hours INTEGER NOT NULL DEFAULT 24 CHECK (min_cancel_notice_hours BETWEEN 0 AND 168),
  reminder_before_hours INTEGER NOT NULL DEFAULT 24 CHECK (reminder_before_hours BETWEEN 1 AND 168),
  slot_step_minutes INTEGER NOT NULL DEFAULT 15 CHECK (slot_step_minutes IN (5, 10, 15, 20, 30, 60)),
  allow_booking_without_phone_verification BOOLEAN NOT NULL DEFAULT FALSE,
  no_show_limit INTEGER NOT NULL DEFAULT 3 CHECK (no_show_limit >= 0),
  default_language language_code NOT NULL DEFAULT 'uk',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_studio_global_settings_set_updated_at ON studio_global_settings;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_studio_global_settings_set_updated_at
BEFORE UPDATE ON studio_global_settings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            migrationLogger.info('Міграція 007_create_studio_global_settings_table виконана');
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
DROP TRIGGER IF EXISTS trg_studio_global_settings_set_updated_at ON studio_global_settings;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS studio_global_settings;
`);

            migrationLogger.info('Міграція 007_create_studio_global_settings_table скинута');
        } finally {}
    }
}

export default Migration007CreateStudioGlobalSettingsTable;
