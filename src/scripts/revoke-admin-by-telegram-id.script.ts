import dotenv from 'dotenv';

/**
 * @file revoke-admin-by-telegram-id.script.ts
 * @summary CLI-скрипт для безпечного зняття ролі адміністратора за Telegram ID.
 *
 * Приклади запуску:
 * - npm run script:revoke-admin -- --telegram-id=6712153038
 * - npm run script:revoke-admin -- --telegram-id=6712153038 --revoked-by-telegram-id=123456789
 */

dotenv.config();

type ScriptArgs = {
  telegramId: string;
  revokedByTelegramId?: string;
};

type UserRow = {
  id: string;
  telegram_user_id: string;
  first_name: string;
  last_name: string | null;
  studio_id: string | null;
  is_active: boolean;
};

type ExistsRow = {
  has_role: boolean;
};

type AdminsCountRow = {
  total: string;
};

function getArgValue(flag: string): string | undefined {
  const direct = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (direct) return direct.slice(flag.length + 1).trim();

  const index = process.argv.findIndex((arg) => arg === flag);
  if (index >= 0) return process.argv[index + 1]?.trim();

  return undefined;
}

function parseArgs(): ScriptArgs {
  const telegramIdRaw = getArgValue('--telegram-id');
  const revokedByTelegramIdRaw = getArgValue('--revoked-by-telegram-id');

  if (!telegramIdRaw) {
    throw new Error('Потрібно передати --telegram-id=<TELEGRAM_ID>');
  }

  return {
    telegramId: telegramIdRaw,
    revokedByTelegramId: revokedByTelegramIdRaw || undefined,
  };
}

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
      studio_id,
      is_active
    FROM app_users
    WHERE telegram_user_id = $1::bigint
    LIMIT 1
  `;

  const result = await client.query<UserRow>(sql, [telegramUserId]);
  return result.rows[0] ?? null;
}

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

  const result = await client.query<ExistsRow>(sql, [userId]);
  return Boolean(result.rows[0]?.has_role);
}

async function countActiveStudioAdmins(
  client: { query: <T>(sql: string, params: readonly unknown[]) => Promise<{ rows: T[]; rowCount: number | null }> },
  studioId: string,
): Promise<number> {
  const sql = `
    SELECT COUNT(*)::text AS total
    FROM user_roles ur
    INNER JOIN app_users u ON u.id = ur.user_id
    WHERE ur.role = 'admin'
      AND u.studio_id = $1::bigint
      AND u.is_active = TRUE
  `;

  const result = await client.query<AdminsCountRow>(sql, [studioId]);
  const total = Number(result.rows[0]?.total ?? '0');
  return Number.isFinite(total) ? total : 0;
}

async function revokeAdminRole(
  client: { query: <T>(sql: string, params: readonly unknown[]) => Promise<{ rows: T[]; rowCount: number | null }> },
  userId: string,
): Promise<void> {
  const sql = `
    DELETE FROM user_roles
    WHERE user_id = $1::bigint
      AND role = 'admin'
  `;
  await client.query(sql, [userId]);
}

async function main(): Promise<void> {
  const [{ pool }, { normalizeTelegramId }, { loggerScripts }] = await Promise.all([
    import('../config/database.config.js'),
    import('../utils/db/db-profile.js'),
    import('../utils/logger/loggers-list.js'),
  ]);

  const logger = loggerScripts;
  let args: ScriptArgs;

  try {
    args = parseArgs();
  } catch (error) {
    logger.error('[revoke-admin-script] Невірні аргументи запуску', { error });
    process.exitCode = 1;
    return;
  }

  const telegramUserId = normalizeTelegramId(args.telegramId);
  const revokedByTelegramUserId = args.revokedByTelegramId
    ? normalizeTelegramId(args.revokedByTelegramId)
    : null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const target = await findUserByTelegramId(client, telegramUserId);
    if (!target) {
      throw new Error(`Користувача з telegram_id=${telegramUserId} не знайдено в app_users`);
    }
    if (!target.studio_id) {
      throw new Error(`Користувач telegram_id=${telegramUserId} не прив'язаний до студії`);
    }

    if (revokedByTelegramUserId) {
      const actor = await findUserByTelegramId(client, revokedByTelegramUserId);
      if (!actor) {
        throw new Error(`Користувача-ініціатора не знайдено (telegram_id=${revokedByTelegramUserId})`);
      }

      const actorIsAdmin = await hasAdminRole(client, actor.id);
      if (!actorIsAdmin) {
        throw new Error(`Користувач-ініціатор не має ролі admin (telegram_id=${revokedByTelegramUserId})`);
      }
      if (actor.id === target.id) {
        throw new Error('Не можна знімати роль admin у власного профілю цим скриптом');
      }
    }

    const targetIsAdmin = await hasAdminRole(client, target.id);
    if (!targetIsAdmin) {
      await client.query('ROLLBACK');
      logger.info('[revoke-admin-script] Роль admin уже відсутня, змін не потрібно', {
        telegramUserId,
        userId: target.id,
      });
      return;
    }

    const totalAdmins = await countActiveStudioAdmins(client, target.studio_id);
    if (totalAdmins <= 1) {
      throw new Error('Неможливо зняти останнього адміністратора студії');
    }

    await revokeAdminRole(client, target.id);
    await client.query('COMMIT');

    logger.info('[revoke-admin-script] Роль admin успішно знято', {
      telegramUserId,
      userId: target.id,
      studioId: target.studio_id,
      revokedByTelegramUserId,
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // no-op
    }
    logger.error('[revoke-admin-script] Помилка зняття ролі admin', {
      error,
      telegramUserId,
      revokedByTelegramUserId,
    });
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

await main();
