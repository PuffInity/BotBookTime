import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 022_create_studio_content_blocks_table.ts
 * @summary Створення таблиці studio_content_blocks з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `022_create_studio_content_blocks_table` для керування структурою БД.
 */
export class Migration022CreateStudioContentBlocksTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS studio_content_blocks (
  studio_id BIGINT NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  block_key content_block_key NOT NULL,
  language language_code NOT NULL,
  content TEXT NOT NULL,
  updated_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (studio_id, block_key, language)
);
`);

            await this.executeQuery(client, `
DROP TRIGGER IF EXISTS trg_studio_content_blocks_set_updated_at ON studio_content_blocks;
`);

            await this.executeQuery(client, `
CREATE TRIGGER trg_studio_content_blocks_set_updated_at
BEFORE UPDATE ON studio_content_blocks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
`);

            migrationLogger.info('Міграція 022_create_studio_content_blocks_table виконана');
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
DROP TRIGGER IF EXISTS trg_studio_content_blocks_set_updated_at ON studio_content_blocks;
`);

            await this.executeQuery(client, `
DROP TABLE IF EXISTS studio_content_blocks;
`);

            migrationLogger.info('Міграція 022_create_studio_content_blocks_table скинута');
        } finally {}
    }
}

export default Migration022CreateStudioContentBlocksTable;
