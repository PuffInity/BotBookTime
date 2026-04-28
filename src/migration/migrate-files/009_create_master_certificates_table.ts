import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 009_create_master_certificates_table.ts
 * @summary Створення таблиці master_certificates з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `009_create_master_certificates_table` для керування структурою БД.
 */
export class Migration009CreateMasterCertificatesTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS master_certificates (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  master_id BIGINT NOT NULL REFERENCES masters(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuer TEXT,
  issued_on DATE,
  expires_on DATE,
  document_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (expires_on IS NULL OR issued_on IS NULL OR expires_on >= issued_on),
  UNIQUE (master_id, title, issued_on)
);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_master_certificates_master ON master_certificates(master_id);
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_master_certificates_set_updated_at ON master_certificates;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_master_certificates_set_updated_at
BEFORE UPDATE ON master_certificates
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            migrationLogger.info('Міграція 009_create_master_certificates_table виконана');
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
DROP TRIGGER IF EXISTS trg_master_certificates_set_updated_at ON master_certificates;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_master_certificates_master;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS master_certificates;
`);

            migrationLogger.info('Міграція 009_create_master_certificates_table скинута');
        } finally {}
    }
}

export default Migration009CreateMasterCertificatesTable;
