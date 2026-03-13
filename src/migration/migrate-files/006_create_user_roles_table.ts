import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 006_create_user_roles_table.ts
 * @summary Створення таблиці user_roles з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `006_create_user_roles_table` для керування структурою БД.
 */
export class Migration006CreateUserRolesTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  granted_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);
`);

            await this.executeQuery(client, `
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
`);

            migrationLogger.info('Міграція 006_create_user_roles_table виконана');
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
DROP INDEX IF EXISTS idx_user_roles_role;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS user_roles;
`);

            migrationLogger.info('Міграція 006_create_user_roles_table скинута');
        } finally {}
    }
}

export default Migration006CreateUserRolesTable;
