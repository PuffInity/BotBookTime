import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 034_create_audit_logs_table.ts
 * @summary Створення таблиці audit_logs з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `034_create_audit_logs_table` для керування структурою БД.
 */
export class Migration034CreateAuditLogsTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_user_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_time
  ON audit_logs(actor_user_id, created_at DESC);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON audit_logs(entity_type, entity_id, created_at DESC);
`);

            migrationLogger.info('Міграція 034_create_audit_logs_table виконана');
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
DROP INDEX IF EXISTS idx_audit_logs_actor_time;
`);

            await this.executeQuery(client, `
DROP INDEX IF EXISTS idx_audit_logs_entity;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS audit_logs;
`);

            migrationLogger.info('Міграція 034_create_audit_logs_table скинута');
        } finally {}
    }
}

export default Migration034CreateAuditLogsTable;
