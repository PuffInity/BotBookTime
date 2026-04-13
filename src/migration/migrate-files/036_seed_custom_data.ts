import { PoolClient } from 'pg';
import { BaseMigration, migrationLogger } from '../base.migration.js';
import { SQL_CUSTOM_DATA_DOWN, SQL_CUSTOM_DATA_UP } from '../custom-data.seed.js';

/**
 * @file 036_seed_custom_data.ts
 * @summary Seed migration: базові custom-дані для dev/staging середовища.
 */
export class Migration036SeedCustomData extends BaseMigration {
  async up(client: PoolClient): Promise<void> {
    try {
      await this.executeQuery(client, SQL_CUSTOM_DATA_UP);
      migrationLogger.info('Міграція 036 (custom data) виконана');
    } finally {
    }
  }

  async down(client: PoolClient): Promise<void> {
    try {
      await this.executeQuery(client, SQL_CUSTOM_DATA_DOWN);
      migrationLogger.info('Міграція 036 (custom data) скинута');
    } finally {
    }
  }
}

export default Migration036SeedCustomData;
