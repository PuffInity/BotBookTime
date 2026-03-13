import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 001_create_extensions.ts
 * @summary Створення PostgreSQL extension для проєкту.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `001_create_extensions` для керування структурою БД.
 */
export class Migration001CreateExtensions extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE EXTENSION IF NOT EXISTS citext;
`);

            await this.executeQuery(client, `
CREATE EXTENSION IF NOT EXISTS pgcrypto;
`);

            await this.executeQuery(client, `
CREATE EXTENSION IF NOT EXISTS btree_gist;
`);

            migrationLogger.info('Міграція 001_create_extensions виконана');
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
DROP EXTENSION IF EXISTS btree_gist;
`);

            await this.executeQuery(client, `
DROP EXTENSION IF EXISTS pgcrypto;
`);

            await this.executeQuery(client, `
DROP EXTENSION IF EXISTS citext;
`);

            migrationLogger.info('Міграція 001_create_extensions скинута');
        } finally {}
    }
}

export default Migration001CreateExtensions;
