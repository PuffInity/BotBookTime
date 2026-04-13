import dotenv from 'dotenv';
import type { PoolClient } from 'pg';

/**
 * @file seed-custom-data.script.ts
 * @summary Окремий скрипт для додавання custom data в існуючі таблиці.
 * Якщо таблиці не створені, повертає зрозумілу помилку з інструкцією.
 */

dotenv.config();

type RequiredTableCheckRow = {
  table_name: string;
  regclass_name: string | null;
};

// uk: OPS/CLI константа REQUIRED_TABLES / en: OPS/CLI constant REQUIRED_TABLES / cz: OPS/CLI konstanta REQUIRED_TABLES
const REQUIRED_TABLES = [
  'schema_migrations',
  'studios',
  'app_users',
  'user_roles',
  'masters',
  'services',
  'master_services',
  'appointments',
] as const;

// uk: OPS/CLI константа HELP_TEXT / en: OPS/CLI constant HELP_TEXT / cz: OPS/CLI konstanta HELP_TEXT
const HELP_TEXT = [
  'Usage:',
  '  npm run script:seed-custom-data',
  '',
  'Description:',
  '  Додає custom data у таблиці. Перед запуском мають бути виконані міграції.',
].join('\n');

/**
 * uk: Публічна функція hasHelpFlag.
 * en: Public function hasHelpFlag.
 * cz: Veřejná funkce hasHelpFlag.
 */
function hasHelpFlag(): boolean {
  return process.argv.includes('--help') || process.argv.includes('-h');
}

/**
 * uk: Публічна функція ensureRequiredTablesExist.
 * en: Public function ensureRequiredTablesExist.
 * cz: Veřejná funkce ensureRequiredTablesExist.
 */
async function ensureRequiredTablesExist(client: PoolClient): Promise<void> {
  const sql = `
    SELECT
      t.table_name,
      to_regclass('public.' || t.table_name)::text AS regclass_name
    FROM unnest($1::text[]) AS t(table_name)
  `;

  const result = await client.query<RequiredTableCheckRow>(sql, [REQUIRED_TABLES]);
  const missing = result.rows
    .filter((row) => row.regclass_name === null)
    .map((row) => row.table_name);

  if (missing.length > 0) {
    throw new Error(
      `Не знайдено обовʼязкові таблиці: ${missing.join(', ')}. ` +
        `Спочатку запустіть міграції: npm run migrate`,
    );
  }
}

/**
 * uk: Публічна функція main.
 * en: Public function main.
 * cz: Veřejná funkce main.
 */
async function main(): Promise<void> {
  const [{ pool }, { loggerScripts }, { handleError }, { SQL_CUSTOM_DATA_UP }] = await Promise.all([
    import('../config/database.config.js'),
    import('../utils/logger/loggers-list.js'),
    import('../utils/error.utils.js'),
    import('../migration/custom-data.seed.js'),
  ]);

  if (hasHelpFlag()) {
    loggerScripts.info(HELP_TEXT);
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await ensureRequiredTablesExist(client);
    await client.query(SQL_CUSTOM_DATA_UP);

    await client.query('COMMIT');
    loggerScripts.info('[seed-custom-data-script] Custom data успішно додано');
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // no-op
    }
    handleError({
      logger: loggerScripts,
      scope: 'seed-custom-data-script',
      action: 'Помилка додавання custom data',
      error,
    });
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

await main();
