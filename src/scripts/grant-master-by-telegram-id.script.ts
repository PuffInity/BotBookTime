import dotenv from 'dotenv';

/**
 * @file grant-master-by-telegram-id.script.ts
 * @summary CLI-скрипт для видачі ролі master + створення/активації профілю майстра за Telegram ID.
 *
 * Приклади запуску:
 * - npm run script:grant-master -- --telegram-id=6712153038
 * - npm run script:grant-master -- --telegram-id=6712153038 --granted-by-telegram-id=123456789
 * - npm run script:grant-master -- --telegram-id=6712153038 --display-name="Anna Master"
 */

dotenv.config();

type ScriptArgs = {
  telegramId: string;
  grantedByTelegramId?: string;
  displayName?: string;
};

type UserRow = {
  id: string;
  telegram_user_id: string;
  first_name: string;
  last_name: string | null;
  studio_id: string | null;
  phone_e164: string | null;
  email: string | null;
  is_active: boolean;
};

type ExistsRow = {
  has_role: boolean;
};

type MasterRow = {
  user_id: string;
  studio_id: string;
  display_name: string;
  is_bookable: boolean;
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
  const grantedByTelegramIdRaw = getArgValue('--granted-by-telegram-id');
  const displayNameRaw = getArgValue('--display-name');

  if (!telegramIdRaw) {
    throw new Error('Потрібно передати --telegram-id=<TELEGRAM_ID>');
  }

  return {
    telegramId: telegramIdRaw,
    grantedByTelegramId: grantedByTelegramIdRaw || undefined,
    displayName: displayNameRaw || undefined,
  };
}

function makeDisplayName(firstName: string, lastName: string | null, override?: string): string {
  if (override && override.trim().length > 0) {
    return override.trim();
  }
  const fallback = `${firstName}${lastName ? ` ${lastName}` : ''}`.trim();
  return fallback || 'Master';
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
      phone_e164,
      email,
      is_active
    FROM app_users
    WHERE telegram_user_id = $1::bigint
    LIMIT 1
  `;

  const result = await client.query<UserRow>(sql, [telegramUserId]);
  return result.rows[0] ?? null;
}

async function hasMasterRole(
  client: { query: <T>(sql: string, params: readonly unknown[]) => Promise<{ rows: T[]; rowCount: number | null }> },
  userId: string,
): Promise<boolean> {
  const sql = `
    SELECT EXISTS(
      SELECT 1
      FROM user_roles
      WHERE user_id = $1::bigint
        AND role = 'master'
    ) AS has_role
  `;

  const result = await client.query<ExistsRow>(sql, [userId]);
  return Boolean(result.rows[0]?.has_role);
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

async function getMasterProfileByUserId(
  client: { query: <T>(sql: string, params: readonly unknown[]) => Promise<{ rows: T[]; rowCount: number | null }> },
  userId: string,
): Promise<MasterRow | null> {
  const sql = `
    SELECT
      user_id,
      studio_id,
      display_name,
      is_bookable
    FROM masters
    WHERE user_id = $1::bigint
    LIMIT 1
  `;

  const result = await client.query<MasterRow>(sql, [userId]);
  return result.rows[0] ?? null;
}

async function insertMasterRole(
  client: { query: <T>(sql: string, params: readonly unknown[]) => Promise<{ rows: T[]; rowCount: number | null }> },
  userId: string,
  grantedByUserId: string | null,
): Promise<void> {
  const sql = `
    INSERT INTO user_roles (user_id, role, granted_by)
    VALUES ($1::bigint, 'master'::user_role, $2::bigint)
    ON CONFLICT (user_id, role) DO NOTHING
  `;
  await client.query(sql, [userId, grantedByUserId]);
}

async function insertMasterProfile(
  client: { query: <T>(sql: string, params: readonly unknown[]) => Promise<{ rows: T[]; rowCount: number | null }> },
  input: {
    userId: string;
    studioId: string;
    displayName: string;
    phone: string | null;
    email: string | null;
  },
): Promise<void> {
  const sql = `
    INSERT INTO masters (
      user_id,
      studio_id,
      display_name,
      bio,
      experience_years,
      procedures_done_total,
      materials_info,
      contact_phone_e164,
      contact_email,
      is_bookable
    )
    VALUES (
      $1::bigint,
      $2::bigint,
      $3,
      '',
      0,
      0,
      '',
      $4,
      $5,
      TRUE
    )
  `;
  await client.query(sql, [input.userId, input.studioId, input.displayName, input.phone, input.email]);
}

async function activateMasterProfile(
  client: { query: <T>(sql: string, params: readonly unknown[]) => Promise<{ rows: T[]; rowCount: number | null }> },
  input: {
    userId: string;
    displayName: string;
    phone: string | null;
    email: string | null;
  },
): Promise<void> {
  const sql = `
    UPDATE masters
    SET
      is_bookable = TRUE,
      display_name = CASE
        WHEN trim($2) <> '' THEN $2
        ELSE display_name
      END,
      contact_phone_e164 = COALESCE($3, contact_phone_e164),
      contact_email = COALESCE($4, contact_email),
      updated_at = now()
    WHERE user_id = $1::bigint
  `;
  await client.query(sql, [input.userId, input.displayName, input.phone, input.email]);
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
    logger.error('[grant-master-script] Невірні аргументи запуску', { error });
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
    if (!target.studio_id) {
      throw new Error(`Користувач telegram_id=${telegramUserId} не прив'язаний до студії`);
    }

    let grantedByUserId: string | null = null;
    if (grantedByTelegramUserId) {
      const actor = await findUserByTelegramId(client, grantedByTelegramUserId);
      if (!actor) {
        throw new Error(`Користувача-ініціатора не знайдено (telegram_id=${grantedByTelegramUserId})`);
      }
      const actorIsAdmin = await hasAdminRole(client, actor.id);
      if (!actorIsAdmin) {
        throw new Error(`Користувач-ініціатор не має ролі admin (telegram_id=${grantedByTelegramUserId})`);
      }
      grantedByUserId = actor.id;
    }

    const displayName = makeDisplayName(target.first_name, target.last_name, args.displayName);
    const masterProfile = await getMasterProfileByUserId(client, target.id);
    const hasRole = await hasMasterRole(client, target.id);

    if (masterProfile && masterProfile.studio_id !== target.studio_id) {
      throw new Error(
        `Профіль майстра вже існує в іншій студії (master.studio_id=${masterProfile.studio_id}, user.studio_id=${target.studio_id})`,
      );
    }

    await insertMasterRole(client, target.id, grantedByUserId);

    if (!masterProfile) {
      await insertMasterProfile(client, {
        userId: target.id,
        studioId: target.studio_id,
        displayName,
        phone: target.phone_e164,
        email: target.email,
      });
    } else {
      await activateMasterProfile(client, {
        userId: target.id,
        displayName,
        phone: target.phone_e164,
        email: target.email,
      });
    }

    await client.query('COMMIT');
    logger.info('[grant-master-script] Роль master успішно надано', {
      telegramUserId,
      userId: target.id,
      studioId: target.studio_id,
      grantedByUserId,
      roleAlreadyExisted: hasRole,
      profileAlreadyExisted: Boolean(masterProfile),
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // no-op
    }
    logger.error('[grant-master-script] Помилка видачі ролі master', {
      error,
      telegramUserId,
      grantedByTelegramUserId,
    });
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

await main();
