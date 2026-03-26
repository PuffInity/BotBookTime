import type {
  AdminStudioAdminMember,
  AdminStudioAdminRow,
  AdminStudioAdminsCountRow,
  AdminPanelLanguageRow,
  AdminStudioUserLookup,
  AdminStudioUserLookupRow,
  FindAdminStudioUserByTelegramInput,
  GetAdminPanelLanguageInput,
  GrantStudioAdminRoleInput,
  ListAdminStudioAdminsInput,
  RevokeStudioAdminRoleInput,
  SetAdminPanelLanguageInput,
} from '../../types/db-helpers/db-admin-settings.types.js';
import type { LanguageCode } from '../../types/db/dbEnums.type.js';
import { executeVoid, queryMany, queryOne, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import { normalizeTelegramId } from '../../utils/db/db-profile.js';
import {
  SQL_COUNT_STUDIO_ADMINS,
  SQL_DELETE_ADMIN_ROLE,
  SQL_FIND_STUDIO_USER_BY_TELEGRAM_ID,
  SQL_GET_ADMIN_PANEL_LANGUAGE_BY_USER_ID,
  SQL_INSERT_ADMIN_ROLE,
  SQL_LIST_STUDIO_ADMINS,
  SQL_SET_ADMIN_PANEL_LANGUAGE_BY_USER_ID,
} from '../db-sql/db-admin-settings.sql.js';

/**
 * @file db-admin-settings.helper.ts
 * @summary DB helper блоку "Налаштування" в адмін-панелі (підрозділ адміністраторів).
 */

function normalizePositiveBigintId(value: string | number, fieldName: string): string {
  const normalized = String(value).trim();
  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError(`Некоректний ${fieldName}`, { [fieldName]: value });
  }
  return normalized;
}

function toDisplayName(firstName: string, lastName: string | null): string {
  return `${firstName}${lastName ? ` ${lastName}` : ''}`.trim();
}

function mapAdminStudioAdminRow(row: AdminStudioAdminRow): AdminStudioAdminMember {
  return {
    userId: row.user_id,
    telegramUserId: row.telegram_user_id,
    telegramUsername: row.telegram_username,
    firstName: row.first_name,
    lastName: row.last_name,
    displayName: toDisplayName(row.first_name, row.last_name),
    grantedAt: new Date(row.granted_at),
    grantedBy: row.granted_by,
  };
}

function mapAdminStudioUserLookupRow(row: AdminStudioUserLookupRow): AdminStudioUserLookup {
  return {
    userId: row.user_id,
    telegramUserId: row.telegram_user_id,
    telegramUsername: row.telegram_username,
    firstName: row.first_name,
    lastName: row.last_name,
    displayName: toDisplayName(row.first_name, row.last_name),
    isAdmin: row.is_admin,
    isActive: row.is_active,
  };
}

function mapAdminsCountRow(row: AdminStudioAdminsCountRow): number {
  const total = Number(row.total);
  return Number.isFinite(total) && total >= 0 ? Math.trunc(total) : 0;
}

function mapAdminPanelLanguageRow(row: AdminPanelLanguageRow): LanguageCode {
  return row.preferred_language;
}

/**
 * @summary Повертає список адміністраторів поточної студії.
 */
export async function listAdminStudioAdmins(
  input: ListAdminStudioAdminsInput,
): Promise<AdminStudioAdminMember[]> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');

  try {
    return await withTransaction(async (client) =>
      queryMany<AdminStudioAdminRow, AdminStudioAdminMember>(
        SQL_LIST_STUDIO_ADMINS,
        [studioId],
        mapAdminStudioAdminRow,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-settings.helper',
      action: 'Failed to list studio admins',
      error,
      meta: { studioId },
    });
    throw error;
  }
}

/**
 * @summary Шукає користувача студії за Telegram ID.
 */
export async function findAdminStudioUserByTelegramId(
  input: FindAdminStudioUserByTelegramInput,
): Promise<AdminStudioUserLookup | null> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const telegramUserId = normalizeTelegramId(input.telegramId);

  try {
    return await withTransaction(async (client) =>
      queryOne<AdminStudioUserLookupRow, AdminStudioUserLookup>(
        SQL_FIND_STUDIO_USER_BY_TELEGRAM_ID,
        [studioId, telegramUserId],
        mapAdminStudioUserLookupRow,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-settings.helper',
      action: 'Failed to find studio user by telegram id',
      error,
      meta: { studioId, telegramUserId },
    });
    throw error;
  }
}

/**
 * @summary Надає роль адміністратора користувачу студії.
 */
export async function grantStudioAdminRole(
  input: GrantStudioAdminRoleInput,
): Promise<AdminStudioUserLookup> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const telegramUserId = normalizeTelegramId(input.telegramId);
  const grantedByUserId = normalizePositiveBigintId(input.grantedByUserId, 'grantedByUserId');

  try {
    return await withTransaction(async (client) => {
      const target = await queryOne<AdminStudioUserLookupRow, AdminStudioUserLookup>(
        SQL_FIND_STUDIO_USER_BY_TELEGRAM_ID,
        [studioId, telegramUserId],
        mapAdminStudioUserLookupRow,
        client,
      );

      if (!target) {
        throw new ValidationError('Користувача з таким Telegram ID не знайдено в цьому салоні');
      }
      if (target.isAdmin) {
        throw new ValidationError('Користувач уже має роль адміністратора');
      }

      await executeVoid(SQL_INSERT_ADMIN_ROLE, [target.userId, grantedByUserId], client);

      const updated = await queryOne<AdminStudioUserLookupRow, AdminStudioUserLookup>(
        SQL_FIND_STUDIO_USER_BY_TELEGRAM_ID,
        [studioId, telegramUserId],
        mapAdminStudioUserLookupRow,
        client,
      );
      if (!updated || !updated.isAdmin) {
        throw new ValidationError('Не вдалося надати роль адміністратора');
      }

      return updated;
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-settings.helper',
      action: 'Failed to grant studio admin role',
      error,
      meta: { studioId, telegramUserId, grantedByUserId },
    });
    throw error;
  }
}

/**
 * @summary Забирає роль адміністратора у користувача студії.
 */
export async function revokeStudioAdminRole(
  input: RevokeStudioAdminRoleInput,
): Promise<AdminStudioUserLookup> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const telegramUserId = normalizeTelegramId(input.telegramId);
  const revokedByUserId = normalizePositiveBigintId(input.revokedByUserId, 'revokedByUserId');

  try {
    return await withTransaction(async (client) => {
      const target = await queryOne<AdminStudioUserLookupRow, AdminStudioUserLookup>(
        SQL_FIND_STUDIO_USER_BY_TELEGRAM_ID,
        [studioId, telegramUserId],
        mapAdminStudioUserLookupRow,
        client,
      );

      if (!target) {
        throw new ValidationError('Користувача з таким Telegram ID не знайдено в цьому салоні');
      }
      if (!target.isAdmin) {
        throw new ValidationError('Цей користувач не має ролі адміністратора');
      }
      if (target.userId === revokedByUserId) {
        throw new ValidationError('Не можна забрати роль адміністратора у власного профілю');
      }

      const totalAdmins = await queryOne<AdminStudioAdminsCountRow, number>(
        SQL_COUNT_STUDIO_ADMINS,
        [studioId],
        mapAdminsCountRow,
        client,
      );
      if ((totalAdmins ?? 0) <= 1) {
        throw new ValidationError('У салоні має залишитися щонайменше один адміністратор');
      }

      await executeVoid(SQL_DELETE_ADMIN_ROLE, [target.userId], client);
      return target;
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-settings.helper',
      action: 'Failed to revoke studio admin role',
      error,
      meta: { studioId, telegramUserId, revokedByUserId },
    });
    throw error;
  }
}

/**
 * @summary Повертає поточну мову адмін-панелі для користувача.
 */
export async function getAdminPanelLanguage(
  input: GetAdminPanelLanguageInput,
): Promise<LanguageCode> {
  const userId = normalizePositiveBigintId(input.userId, 'userId');

  try {
    return await withTransaction(async (client) => {
      const language = await queryOne<AdminPanelLanguageRow, LanguageCode>(
        SQL_GET_ADMIN_PANEL_LANGUAGE_BY_USER_ID,
        [userId],
        mapAdminPanelLanguageRow,
        client,
      );

      if (!language) {
        throw new ValidationError('Користувача для налаштування мови не знайдено');
      }

      return language;
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-settings.helper',
      action: 'Failed to get admin panel language',
      error,
      meta: { userId },
    });
    throw error;
  }
}

/**
 * @summary Оновлює мову адмін-панелі для користувача.
 */
export async function setAdminPanelLanguage(
  input: SetAdminPanelLanguageInput,
): Promise<LanguageCode> {
  const userId = normalizePositiveBigintId(input.userId, 'userId');
  const language = input.language;

  try {
    return await withTransaction(async (client) => {
      const updated = await queryOne<AdminPanelLanguageRow, LanguageCode>(
        SQL_SET_ADMIN_PANEL_LANGUAGE_BY_USER_ID,
        [userId, language],
        mapAdminPanelLanguageRow,
        client,
      );

      if (!updated) {
        throw new ValidationError('Не вдалося оновити мову адмін-панелі');
      }

      return updated;
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-settings.helper',
      action: 'Failed to set admin panel language',
      error,
      meta: { userId, language },
    });
    throw error;
  }
}
