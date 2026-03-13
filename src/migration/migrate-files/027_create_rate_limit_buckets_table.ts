import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 027_create_rate_limit_buckets_table.ts
 * @summary Створення таблиці rate_limit_buckets з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `027_create_rate_limit_buckets_table` для керування структурою БД.
 */
export class Migration027CreateRateLimitBucketsTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subject_type rate_limit_subject NOT NULL,
  subject_key TEXT NOT NULL,
  action_key TEXT NOT NULL,
  window_started_at TIMESTAMPTZ NOT NULL,
  window_ends_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  max_attempts INTEGER NOT NULL CHECK (max_attempts > 0),
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (window_ends_at > window_started_at),
  UNIQUE (subject_type, subject_key, action_key, window_started_at)
);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_rate_limit_lookup
  ON rate_limit_buckets(subject_type, subject_key, action_key, window_ends_at DESC);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_rate_limit_blocked_until
  ON rate_limit_buckets(blocked_until)
  WHERE blocked_until IS NOT NULL;
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_rate_limit_buckets_set_updated_at ON rate_limit_buckets;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_rate_limit_buckets_set_updated_at
BEFORE UPDATE ON rate_limit_buckets
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            migrationLogger.info('Міграція 027_create_rate_limit_buckets_table виконана');
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
DROP TRIGGER IF EXISTS trg_rate_limit_buckets_set_updated_at ON rate_limit_buckets;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_rate_limit_lookup;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_rate_limit_blocked_until;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS rate_limit_buckets;
`);

            migrationLogger.info('Міграція 027_create_rate_limit_buckets_table скинута');
        } finally {}
    }
}

export default Migration027CreateRateLimitBucketsTable;
