import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 004_create_studios_table.ts
 * @summary Створення таблиці studios з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `004_create_studios_table` для керування структурою БД.
 */
export class Migration004CreateStudiosTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS studios (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  address_line TEXT,
  phone_e164 TEXT,
  email CITEXT,
  timezone TEXT NOT NULL DEFAULT 'Europe/Prague',
  currency_code CHAR(3) NOT NULL DEFAULT 'CZK',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (phone_e164 IS NULL OR phone_e164 ~ '^[+][1-9][0-9]{6,14}$')
);
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_studios_set_updated_at ON studios;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_studios_set_updated_at
BEFORE UPDATE ON studios
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            migrationLogger.info('Міграція 004_create_studios_table виконана');
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
DROP TRIGGER IF EXISTS trg_studios_set_updated_at ON studios;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS studios;
`);

            migrationLogger.info('Міграція 004_create_studios_table скинута');
        } finally {}
    }
}

export default Migration004CreateStudiosTable;
