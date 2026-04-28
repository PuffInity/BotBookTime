import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 026_create_verification_codes_table.ts
 * @summary Створення таблиці verification_codes з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `026_create_verification_codes_table` для керування структурою БД.
 */
export class Migration026CreateVerificationCodesTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  channel verification_channel NOT NULL,
  purpose verification_purpose NOT NULL,
  destination TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  attempts_used SMALLINT NOT NULL DEFAULT 0 CHECK (attempts_used >= 0),
  max_attempts SMALLINT NOT NULL DEFAULT 3 CHECK (max_attempts BETWEEN 1 AND 10),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (expires_at > created_at),
  CHECK (consumed_at IS NULL OR consumed_at <= expires_at)
);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_verification_codes_lookup
  ON verification_codes(user_id, purpose, channel, created_at DESC);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_verification_codes_unconsumed
  ON verification_codes(user_id, purpose, channel)
  WHERE consumed_at IS NULL;
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);
`);

            migrationLogger.info('Міграція 026_create_verification_codes_table виконана');
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
DROP INDEX IF EXISTS idx_verification_codes_lookup;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_verification_codes_unconsumed;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_verification_codes_expires_at;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS verification_codes;
`);

            migrationLogger.info('Міграція 026_create_verification_codes_table скинута');
        } finally {}
    }
}

export default Migration026CreateVerificationCodesTable;
