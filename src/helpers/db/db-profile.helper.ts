import type { PoolClient } from 'pg';
import type { MyContext } from '../../types/bot.types.js';
import type {
  AppUsersEntity,
  AppUsersInsert,
  AppUsersRow,
  VerificationCodesEntity,
  VerificationCodesRow,
} from '../../types/db/index.js';
import type {
  CreateUserInput,
  SaveEmailOtpInput,
  UpdateUserEmailInput,
  UpdateUserLanguageInput,
  UpdateUserNameInput,
  UpdateUserPhoneInput,
} from '../../types/db-helpers/db-profile.types.js';
import { appUsersRowToEntity, toInsertAppUsers } from '../../utils/mappers/appUsers.mapp.js';
import { verificationCodesRowToEntity } from '../../utils/mappers/verificationCodes.mapp.js';
import { queryOne, executeOne, executeVoid, withTransaction } from '../db.helper.js';
import { handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import {
  normalizeCreateUserInput,
  normalizeCtxFrom,
  normalizeFirstName,
  normalizeProfileLanguage,
  normalizeProfileEmail,
  normalizeProfilePhone,
  normalizeTelegramId,
} from '../../utils/db/db-profile.js';
import {
  SQL_CREATE_USER,
  SQL_CONSUME_ACTIVE_EMAIL_VERIFY_OTPS,
  SQL_CONSUME_ACTIVE_PHONE_VERIFY_OTPS,
  SQL_CONSUME_OTP_BY_ID,
  SQL_GET_USER_BY_TELEGRAM_ID,
  SQL_GET_ACTIVE_EMAIL_VERIFY_OTP,
  SQL_GET_ACTIVE_PHONE_VERIFY_OTP,
  SQL_INCREMENT_OTP_ATTEMPTS_BY_ID,
  SQL_INSERT_EMAIL_VERIFY_OTP,
  SQL_INSERT_PHONE_VERIFY_OTP,
  SQL_MARK_EMAIL_VERIFIED_BY_USER_ID,
  SQL_MARK_PHONE_VERIFIED_BY_USER_ID,
  SQL_UPDATE_USER_EMAIL_BY_TELEGRAM_ID,
  SQL_UPDATE_USER_LANGUAGE_BY_TELEGRAM_ID,
  SQL_UPDATE_USER_NAME_BY_TELEGRAM_ID,
  SQL_UPDATE_USER_PHONE_BY_TELEGRAM_ID,
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
 * @summary Updates user email by telegram id and resets email verification mark.
 */
export async function updateUserEmailByTelegramId(data: UpdateUserEmailInput): Promise<AppUsersEntity> {
  const telegramUserId = normalizeTelegramId(data.telegramId);
  const email = normalizeProfileEmail(data.email);

  try {
    return await withTransaction(async (client) =>
      executeOne<AppUsersRow, AppUsersEntity>(
        SQL_UPDATE_USER_EMAIL_BY_TELEGRAM_ID,
        [telegramUserId, email],
        appUsersRowToEntity,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-profile.helper',
      action: 'Failed to update user email',
      error,
      meta: { telegramUserId },
    });
    throw error;
  }
}

/**
 * @summary Updates user phone by telegram id and resets phone verification mark.
 */
export async function updateUserPhoneByTelegramId(data: UpdateUserPhoneInput): Promise<AppUsersEntity> {
  const telegramUserId = normalizeTelegramId(data.telegramId);
  const phone = normalizeProfilePhone(data.phone);

  try {
    return await withTransaction(async (client) =>
      executeOne<AppUsersRow, AppUsersEntity>(
        SQL_UPDATE_USER_PHONE_BY_TELEGRAM_ID,
        [telegramUserId, phone],
        appUsersRowToEntity,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-profile.helper',
      action: 'Failed to update user phone',
      error,
      meta: { telegramUserId },
    });
    throw error;
  }
}

/**
 * @summary Updates user interface language by telegram id.
 */
export async function updateUserLanguageByTelegramId(
  data: UpdateUserLanguageInput,
): Promise<AppUsersEntity> {
  const telegramUserId = normalizeTelegramId(data.telegramId);
  const language = normalizeProfileLanguage(data.language);

  try {
    return await withTransaction(async (client) =>
      executeOne<AppUsersRow, AppUsersEntity>(
        SQL_UPDATE_USER_LANGUAGE_BY_TELEGRAM_ID,
        [telegramUserId, language],
        appUsersRowToEntity,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-profile.helper',
      action: 'Failed to update user language',
      error,
      meta: { telegramUserId, language },
    });
    throw error;
  }
}

/**
 * @summary Saves a fresh email OTP and deactivates previous active OTPs for this user+email.
 */
export async function saveEmailOtp(data: SaveEmailOtpInput): Promise<VerificationCodesEntity> {
  const maxAttempts = data.maxAttempts ?? 3;

  try {
    return await withTransaction(async (client) => {
      await executeVoid(SQL_CONSUME_ACTIVE_EMAIL_VERIFY_OTPS, [data.userId, data.destination], client);

      return executeOne<VerificationCodesRow, VerificationCodesEntity>(
        SQL_INSERT_EMAIL_VERIFY_OTP,
        [data.userId, data.destination, data.codeHash, maxAttempts, data.expiresAt],
        verificationCodesRowToEntity,
        client,
      );
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-profile.helper',
      action: 'Failed to save email OTP',
      error,
      meta: { userId: data.userId },
    });
    throw error;
  }
}

/**
 * @summary Saves a fresh phone OTP and deactivates previous active OTPs for this user+phone.
 */
export async function savePhoneOtp(data: SaveEmailOtpInput): Promise<VerificationCodesEntity> {
  const maxAttempts = data.maxAttempts ?? 3;

  try {
    return await withTransaction(async (client) => {
      await executeVoid(SQL_CONSUME_ACTIVE_PHONE_VERIFY_OTPS, [data.userId, data.destination], client);

      return executeOne<VerificationCodesRow, VerificationCodesEntity>(
        SQL_INSERT_PHONE_VERIFY_OTP,
        [data.userId, data.destination, data.codeHash, maxAttempts, data.expiresAt],
        verificationCodesRowToEntity,
        client,
      );
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-profile.helper',
      action: 'Failed to save phone OTP',
      error,
      meta: { userId: data.userId },
    });
    throw error;
  }
}

/**
 * @summary Reads active email OTP for user+email.
 */
export async function getActiveEmailOtp(
  userId: string,
  destination: string,
): Promise<VerificationCodesEntity | null> {
  try {
    return await withTransaction(async (client) =>
      queryOne<VerificationCodesRow, VerificationCodesEntity>(
        SQL_GET_ACTIVE_EMAIL_VERIFY_OTP,
        [userId, destination],
        verificationCodesRowToEntity,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-profile.helper',
      action: 'Failed to load active email OTP',
      error,
      meta: { userId },
    });
    throw error;
  }
}

/**
 * @summary Reads active phone OTP for user+phone.
 */
export async function getActivePhoneOtp(
  userId: string,
  destination: string,
): Promise<VerificationCodesEntity | null> {
  try {
    return await withTransaction(async (client) =>
      queryOne<VerificationCodesRow, VerificationCodesEntity>(
        SQL_GET_ACTIVE_PHONE_VERIFY_OTP,
        [userId, destination],
        verificationCodesRowToEntity,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-profile.helper',
      action: 'Failed to load active phone OTP',
      error,
      meta: { userId },
    });
    throw error;
  }
}

/**
 * @summary Increments OTP attempts counter and returns updated entity.
 */
export async function incrementOtpAttempts(otpId: string): Promise<VerificationCodesEntity> {
  try {
    return await withTransaction(async (client) =>
      executeOne<VerificationCodesRow, VerificationCodesEntity>(
        SQL_INCREMENT_OTP_ATTEMPTS_BY_ID,
        [otpId],
        verificationCodesRowToEntity,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-profile.helper',
      action: 'Failed to increment OTP attempts',
      error,
      meta: { otpId },
    });
    throw error;
  }
}

/**
 * @summary Marks OTP consumed by id and returns updated entity.
 */
export async function consumeOtpById(otpId: string): Promise<VerificationCodesEntity> {
  try {
    return await withTransaction(async (client) =>
      executeOne<VerificationCodesRow, VerificationCodesEntity>(
        SQL_CONSUME_OTP_BY_ID,
        [otpId],
        verificationCodesRowToEntity,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-profile.helper',
      action: 'Failed to consume OTP',
      error,
      meta: { otpId },
    });
    throw error;
  }
}

/**
 * @summary Marks app user email as verified. Returns updated user or null when already verified.
 */
export async function markEmailVerified(userId: string, destination: string): Promise<AppUsersEntity | null> {
  try {
    return await withTransaction(async (client) =>
      queryOne<AppUsersRow, AppUsersEntity>(
        SQL_MARK_EMAIL_VERIFIED_BY_USER_ID,
        [userId, destination],
        appUsersRowToEntity,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-profile.helper',
      action: 'Failed to mark email verified',
      error,
      meta: { userId },
    });
    throw error;
  }
}

/**
 * @summary Marks app user phone as verified. Returns updated user or null when already verified.
 */
export async function markPhoneVerified(userId: string, destination: string): Promise<AppUsersEntity | null> {
  try {
    return await withTransaction(async (client) =>
      queryOne<AppUsersRow, AppUsersEntity>(
        SQL_MARK_PHONE_VERIFIED_BY_USER_ID,
        [userId, destination],
        appUsersRowToEntity,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-profile.helper',
      action: 'Failed to mark phone verified',
      error,
      meta: { userId },
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
