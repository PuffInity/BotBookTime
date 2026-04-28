import dotenv from 'dotenv';

/**
 * @file grant-admin-by-telegram-id.script.ts
 * @summary CLI-скрипт для видачі ролі адміністратора користувачу за Telegram ID.
 *
 * Приклади запуску:
 * - npm run script:grant-admin -- --telegram-id=6712153038
 * - npm run script:grant-admin -- --telegram-id=6712153038 --granted-by-telegram-id=123456789
 */

dotenv.config();

type ScriptArgs = {
  telegramId: string;
  grantedByTelegramId?: string;
};

type UserRow = {
  id: string;
  telegram_user_id: string;
  first_name: string;
  last_name: string | null;
  is_active: boolean;
};

type RoleExistsRow = {
  has_role: boolean;
};

// uk: OPS/CLI константа HELP_TEXT / en: OPS/CLI constant HELP_TEXT / cz: OPS/CLI konstanta HELP_TEXT
const HELP_TEXT = [
  'Usage:',
  '  npm run script:grant-admin -- --telegram-id=<TELEGRAM_ID> [--granted-by-telegram-id=<TELEGRAM_ID>]',
  '',
  'Options:',
  '  --telegram-id               Telegram ID користувача, якому видаємо admin',
  '  --granted-by-telegram-id    Telegram ID адміністратора-ініціатора (optional)',
].join('\n');

/**
 * uk: Публічна функція getArgValue.
 * en: Public function getArgValue.
 * cz: Veřejná funkce getArgValue.
 */
function getArgValue(flag: string): string | undefined {
  const direct = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (direct) return direct.slice(flag.length + 1).trim();

  const index = process.argv.findIndex((arg) => arg === flag);
  if (index >= 0) {
    return process.argv[index + 1]?.trim();
  }

  return undefined;
}

/**
 * uk: Публічна функція hasHelpFlag.
 * en: Public function hasHelpFlag.
 * cz: Veřejná funkce hasHelpFlag.
 */
function hasHelpFlag(): boolean {
  return process.argv.includes('--help') || process.argv.includes('-h');
}

/**
 * uk: Публічна функція parseArgs.
 * en: Public function parseArgs.
 * cz: Veřejná funkce parseArgs.
 */
function parseArgs(): ScriptArgs {
  const telegramIdRaw = getArgValue('--telegram-id');
  const grantedByTelegramIdRaw = getArgValue('--granted-by-telegram-id');

  if (!telegramIdRaw) {
    throw new Error('Потрібно передати --telegram-id=<TELEGRAM_ID>');
  }

  return {
    telegramId: telegramIdRaw,
    grantedByTelegramId: grantedByTelegramIdRaw || undefined,
  };
}

/**
 * uk: Публічна функція findUserByTelegramId.
 * en: Public function findUserByTelegramId.
 * cz: Veřejná funkce findUserByTelegramId.
 */
async function findUserByTelegramId(
  client: { query: <T>(sql: string, params: readonly unknown[]) => Promise<{ rows: T[]; rowCount: number | null }> },
  telegramUserId: string,
): Promise<UserRow | null> {
  const sql = `
    SELECT
      id,
      telegram_user_id,
      first_name,
      last_name,
      is_active
    FROM app_users
    WHERE telegram_user_id = $1::bigint
    LIMIT 1
  `;

  const result = await client.query<UserRow>(sql, [telegramUserId]);
  return result.rows[0] ?? null;
}

/**
 * uk: Публічна функція hasAdminRole.
 * en: Public function hasAdminRole.
 * cz: Veřejná funkce hasAdminRole.
 */
async function hasAdminRole(
  client: { query: <T>(sql: string, params: readonly unknown[]) => Promise<{ rows: T[]; rowCount: number | null }> },
  userId: string,
): Promise<boolean> {
  const sql = `
    SELECT EXISTS(
      SELECT 1
      FROM user_roles
      WHERE user_id = $1::bigint
        AND role = 'admin'
    ) AS has_role
  `;

  const result = await client.query<RoleExistsRow>(sql, [userId]);
  return Boolean(result.rows[0]?.has_role);
}

/**
 * uk: Публічна функція grantAdminRole.
 * en: Public function grantAdminRole.
 * cz: Veřejná funkce grantAdminRole.
 */
async function grantAdminRole(
  client: { query: <T>(sql: string, params: readonly unknown[]) => Promise<{ rows: T[]; rowCount: number | null }> },
  userId: string,
  grantedByUserId: string | null,
): Promise<void> {
  const sql = `
    INSERT INTO user_roles (user_id, role, granted_by)
    VALUES ($1::bigint, 'admin', $2::bigint)
    ON CONFLICT (user_id, role) DO NOTHING
  `;

  await client.query(sql, [userId, grantedByUserId]);
}

/**
 * uk: Публічна функція main.
 * en: Public function main.
 * cz: Veřejná funkce main.
 */
async function main(): Promise<void> {
  const [{ pool }, { normalizeTelegramId }, { loggerScripts }] = await Promise.all([
    import('../config/database.config.js'),
    import('../utils/db/db-profile.js'),
    import('../utils/logger/loggers-list.js'),
  ]);

  const logger = loggerScripts;

  if (hasHelpFlag()) {
    logger.info(HELP_TEXT);
    return;
  }

  let args: ScriptArgs;
  try {
    args = parseArgs();
  } catch (error) {
    logger.error('[grant-admin-script] Невірні аргументи запуску', { error });
    process.exitCode = 1;
    return;
  }

  const telegramUserId = normalizeTelegramId(args.telegramId);
  const grantedByTelegramUserId = args.grantedByTelegramId
    ? normalizeTelegramId(args.grantedByTelegramId)
    : null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const target = await findUserByTelegramId(client, telegramUserId);
    if (!target) {
      throw new Error(`Користувача з telegram_id=${telegramUserId} не знайдено в app_users`);
    }
    if (!target.is_active) {
      throw new Error(`Користувач telegram_id=${telegramUserId} неактивний (is_active=false)`);
    }

    let grantedByUserId: string | null = null;
    if (grantedByTelegramUserId) {
      const grantedByUser = await findUserByTelegramId(client, grantedByTelegramUserId);
      if (!grantedByUser) {
        throw new Error(
          `Користувача, який видає роль, не знайдено (telegram_id=${grantedByTelegramUserId})`,
        );
      }
      if (!grantedByUser.is_active) {
        throw new Error(
          `Користувач, який видає роль, неактивний (telegram_id=${grantedByTelegramUserId})`,
        );
      }

      const granterIsAdmin = await hasAdminRole(client, grantedByUser.id);
      if (!granterIsAdmin) {
        throw new Error(
          `Користувач, який видає роль (telegram_id=${grantedByTelegramUserId}), не має ролі admin`,
        );
      }

      grantedByUserId = grantedByUser.id;
    }

    const alreadyAdmin = await hasAdminRole(client, target.id);
    if (alreadyAdmin) {
      await client.query('ROLLBACK');
      logger.info('[grant-admin-script] Роль admin вже надана, змін не потрібно', {
        telegramUserId,
        userId: target.id,
      });
      return;
    }

    await grantAdminRole(client, target.id, grantedByUserId);
    await client.query('COMMIT');

    logger.info('[grant-admin-script] Роль admin успішно надано', {
      telegramUserId,
      userId: target.id,
      grantedByUserId,
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // no-op
    }
    logger.error('[grant-admin-script] Помилка видачі ролі admin', { error, telegramUserId });
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

await main();
