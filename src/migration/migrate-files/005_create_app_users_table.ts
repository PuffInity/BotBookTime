import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 005_create_app_users_table.ts
 * @summary Створення таблиці app_users з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `005_create_app_users_table` для керування структурою БД.
 */
export class Migration005CreateAppUsersTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS app_users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  studio_id BIGINT REFERENCES studios(id) ON DELETE SET NULL,
  telegram_user_id BIGINT NOT NULL UNIQUE CHECK (telegram_user_id > 0),
  telegram_username TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT,
  phone_e164 TEXT,
  phone_verified_at TIMESTAMPTZ,
  email CITEXT,
  email_verified_at TIMESTAMPTZ,
  preferred_language language_code NOT NULL DEFAULT 'uk',
  timezone TEXT NOT NULL DEFAULT 'Europe/Prague',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (phone_e164 IS NULL OR phone_e164 ~ '^[+][1-9][0-9]{6,14}$')
);
`);

            await this.executeQuery(client, `
CREATE UNIQUE INDEX IF NOT EXISTS uq_app_users_email ON app_users(email) WHERE email IS NOT NULL;
`);

            await this.executeQuery(client, `
CREATE UNIQUE INDEX IF NOT EXISTS uq_app_users_phone ON app_users(phone_e164) WHERE phone_e164 IS NOT NULL;
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_app_users_studio ON app_users(studio_id);
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_app_users_set_updated_at ON app_users;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_app_users_set_updated_at
BEFORE UPDATE ON app_users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            migrationLogger.info('Міграція 005_create_app_users_table виконана');
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
DROP TRIGGER IF EXISTS trg_app_users_set_updated_at ON app_users;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS uq_app_users_email;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS uq_app_users_phone;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_app_users_studio;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS app_users;
`);

            migrationLogger.info('Міграція 005_create_app_users_table скинута');
        } finally {}
    }
}

export default Migration005CreateAppUsersTable;
