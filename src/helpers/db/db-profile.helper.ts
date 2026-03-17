import type { PoolClient } from 'pg';
import type { MyContext } from '../../types/bot.types.js';
import type { AppUsersEntity, AppUsersInsert, AppUsersRow } from '../../types/db/index.js';
import type {
  CreateUserInput,
  UpdateUserNameInput,
} from '../../types/db-helpers/db-profile.types.js';
import { appUsersRowToEntity, toInsertAppUsers } from '../../utils/mappers/appUsers.mapp.js';
import { queryOne, executeOne, withTransaction } from '../db.helper.js';
import { handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import {
  normalizeCreateUserInput,
  normalizeCtxFrom,
  normalizeFirstName,
  normalizeTelegramId,
} from '../../utils/db/db-profile.js';
import {
  SQL_CREATE_USER,
  SQL_GET_USER_BY_TELEGRAM_ID,
  SQL_UPDATE_USER_NAME_BY_TELEGRAM_ID,
} from '../db-sql/db-profile.sql.js';

/**
 * @file db-profile.helper.ts
 * @summary DB helper for Telegram user profile lifecycle (get/create/get-or-create).
 */

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
 * @summary Updates user first name by telegram id and returns fresh user entity.
 */
export async function updateUserNameByTelegramId(data: UpdateUserNameInput): Promise<AppUsersEntity> {
  const telegramUserId = normalizeTelegramId(data.telegramId);
  const firstName = normalizeFirstName(data.firstName);

  try {
    return await withTransaction(async (client) =>
      executeOne<AppUsersRow, AppUsersEntity>(
        SQL_UPDATE_USER_NAME_BY_TELEGRAM_ID,
        [telegramUserId, firstName],
        appUsersRowToEntity,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-profile.helper',
      action: 'Failed to update user first name',
      error,
      meta: { telegramUserId },
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
