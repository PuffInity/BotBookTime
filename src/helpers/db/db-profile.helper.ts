import type { PoolClient } from 'pg';
import type { MyContext } from '../../types/bot.types.js';
import type { AppUsersEntity, AppUsersInsert, AppUsersRow } from '../../types/db/index.js';
import { appUsersRowToEntity, toInsertAppUsers } from '../../utils/mappers/appUsers.mapp.js';
import { queryOne, executeOne, withTransaction } from '../db.helper.js';
import { telegramUserIdSchema } from '../../validator/bot-input.schema.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';

/**
 * @file db-profile.helper.ts
 * @summary DB helper for Telegram user profile lifecycle (get/create/get-or-create).
 */

export type CreateUserInput = {
  telegramId: number | string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

type NormalizedTelegramProfile = {
  telegramUserId: string;
  telegramUsername: string | null;
  firstName: string;
  lastName: string | null;
};

const APP_USERS_SELECT_COLUMNS = `
  id,
  studio_id,
  telegram_user_id,
  telegram_username,
  first_name,
  last_name,
  phone_e164,
  phone_verified_at,
  email,
  email_verified_at,
  preferred_language,
  timezone,
  is_active,
  created_at,
  updated_at
`;

const SQL_GET_USER_BY_TELEGRAM_ID = `
  SELECT
    ${APP_USERS_SELECT_COLUMNS}
  FROM app_users
  WHERE telegram_user_id = $1
  LIMIT 1
`;

const SQL_CREATE_USER = `
  INSERT INTO app_users (
    telegram_user_id,
    telegram_username,
    first_name,
    last_name
  )
  VALUES ($1, $2, $3, $4)
  RETURNING
    ${APP_USERS_SELECT_COLUMNS}
`;

function normalizeTelegramUsername(username?: string | null): string | null {
  if (!username) return null;
  const normalized = username.trim().replace(/^@+/, '');
  return normalized.length > 0 ? normalized : null;
}

function normalizeFirstName(firstName?: string | null): string {
  const normalized = (firstName ?? '').trim();
  return normalized.length > 0 ? normalized : 'User';
}

function normalizeLastName(lastName?: string | null): string | null {
  const normalized = (lastName ?? '').trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeTelegramId(telegramId: number | string): string {
  const value = typeof telegramId === 'string' ? Number(telegramId) : telegramId;
  const parsed = telegramUserIdSchema.safeParse(value);

  if (!parsed.success) {
    throw new ValidationError('Invalid telegram user id', { telegramId });
  }

  return String(parsed.data);
}

function normalizeCreateUserInput(input: CreateUserInput): NormalizedTelegramProfile {
  return {
    telegramUserId: normalizeTelegramId(input.telegramId),
    telegramUsername: normalizeTelegramUsername(input.username),
    firstName: normalizeFirstName(input.firstName),
    lastName: normalizeLastName(input.lastName),
  };
}

function normalizeCtxFrom(ctx: MyContext): NormalizedTelegramProfile {
  if (!ctx.from) {
    throw new ValidationError('Telegram user payload is missing in context');
  }

  return {
    telegramUserId: normalizeTelegramId(ctx.from.id),
    telegramUsername: normalizeTelegramUsername(ctx.from.username),
    firstName: normalizeFirstName(ctx.from.first_name),
    lastName: normalizeLastName(ctx.from.last_name),
  };
}

function isUniqueViolationError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  return (error as { code?: unknown }).code === '23505';
}

async function getUserByTelegramIdTx(
  client: PoolClient,
  telegramUserId: string,
): Promise<AppUsersEntity | null> {
  return queryOne<AppUsersRow, AppUsersEntity>(
    SQL_GET_USER_BY_TELEGRAM_ID,
    [telegramUserId],
    appUsersRowToEntity,
    client,
  );
}

/**
 * @summary Returns one app user by telegram id or null.
 */
export async function getUserByTelegramId(telegramId: number | string): Promise<AppUsersEntity | null> {
  const telegramUserId = normalizeTelegramId(telegramId);

  try {
    return await withTransaction(async (client) => getUserByTelegramIdTx(client, telegramUserId));
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-profile.helper',
      action: 'Failed to get user by telegram id',
      error,
      meta: { telegramUserId },
    });
    throw error;
  }
}

/**
 * @summary Creates a new app user from Telegram profile fields.
 */
export async function createUser(data: CreateUserInput): Promise<AppUsersEntity> {
  const normalized = normalizeCreateUserInput(data);
  const insertPayload: AppUsersInsert = {
    telegramUserId: normalized.telegramUserId,
    telegramUsername: normalized.telegramUsername,
    firstName: normalized.firstName,
    lastName: normalized.lastName,
  };
  const rowPayload = toInsertAppUsers(insertPayload);

  try {
    return await withTransaction(async (client) =>
      executeOne<AppUsersRow, AppUsersEntity>(
        SQL_CREATE_USER,
        [
          rowPayload.telegram_user_id,
          rowPayload.telegram_username ?? null,
          rowPayload.first_name,
          rowPayload.last_name ?? null,
        ],
        appUsersRowToEntity,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-profile.helper',
      action: 'Failed to create user',
      error,
      meta: { telegramUserId: normalized.telegramUserId },
    });
    throw error;
  }
}

/**
 * @summary Reads a user from DB by telegram id or creates it on first visit.
 */
export async function getOrCreateUser(ctx: MyContext): Promise<AppUsersEntity> {
  const normalized = normalizeCtxFrom(ctx);

  const existingUser = await getUserByTelegramId(normalized.telegramUserId);
  if (existingUser) {
    return existingUser;
  }

  try {
    return await createUser({
      telegramId: normalized.telegramUserId,
      username: normalized.telegramUsername,
      firstName: normalized.firstName,
      lastName: normalized.lastName,
    });
  } catch (error) {
    if (isUniqueViolationError(error)) {
      loggerDb.warn('[db-profile.helper] User already created concurrently, loading existing user', {
        telegramUserId: normalized.telegramUserId,
      });

      const userAfterConflict = await getUserByTelegramId(normalized.telegramUserId);
      if (userAfterConflict) {
        return userAfterConflict;
      }
    }

    handleError({
      logger: loggerDb,
      scope: 'db-profile.helper',
      action: 'Failed to get or create user',
      error,
      meta: { telegramUserId: normalized.telegramUserId },
    });
    throw error;
  }
}

