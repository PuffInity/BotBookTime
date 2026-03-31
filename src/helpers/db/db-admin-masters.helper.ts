import type {
  AdminMasterCandidateLookup,
  AdminMasterCandidateLookupRow,
  AdminMasterCreateScheduleDayInput,
  CreateAdminMasterInput,
  CreatedAdminMasterResult,
  FindAdminMasterCandidateByTelegramInput,
} from '../../types/db-helpers/db-admin-masters.types.js';
import { executeOne, executeVoid, queryMany, queryOne, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import { normalizeTelegramId } from '../../utils/db/db-profile.js';
import {
  normalizeMasterBio,
  normalizeMasterContactEmail,
  normalizeMasterContactPhone,
  normalizeMasterDisplayName,
  normalizeMasterMaterialsInfo,
  normalizeMasterProceduresDoneTotal,
} from '../../utils/db/db-master-profile.js';
import {
  SQL_ASSIGN_ADMIN_MASTER_SERVICES,
  SQL_FIND_ADMIN_MASTER_CANDIDATE_BY_TELEGRAM_ID,
  SQL_GET_ADMIN_MASTER_CANDIDATE_BY_USER_ID,
  SQL_INSERT_ADMIN_MASTER_PROFILE,
  SQL_INSERT_MASTER_ROLE,
  SQL_UPSERT_ADMIN_MASTER_WEEKLY_DAY,
} from '../db-sql/db-admin-masters.sql.js';

/**
 * @file db-admin-masters.helper.ts
 * @summary DB helper блоку "Майстри" в адмін-панелі (створення майстра).
 */

type InsertedMasterIdRow = { master_id: string };
type AssignedServiceRow = { service_id: string };

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

function mapCandidateRow(row: AdminMasterCandidateLookupRow): AdminMasterCandidateLookup {
  return {
    userId: row.user_id,
    telegramUserId: row.telegram_user_id,
    telegramUsername: row.telegram_username,
    firstName: row.first_name,
    lastName: row.last_name,
    displayName: toDisplayName(row.first_name, row.last_name),
    isActive: row.is_active,
    isMaster: row.is_master,
  };
}

function normalizeExperienceYears(value: number): number {
  if (!Number.isFinite(value)) {
    throw new ValidationError('Досвід роботи має бути числом');
  }
  const normalized = Math.trunc(value);
  if (normalized < 0 || normalized > 50) {
    throw new ValidationError('Досвід роботи має бути в діапазоні 0..50 років');
  }
  return normalized;
}

function normalizeServiceIds(serviceIds: Array<string | number>): string[] {
  if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
    throw new ValidationError('Потрібно обрати щонайменше одну послугу для майстра');
  }

  const unique = new Set<string>();
  for (const serviceId of serviceIds) {
    unique.add(normalizePositiveBigintId(serviceId, 'serviceId'));
  }

  return [...unique];
}

function isValidTimeHHMM(value: string): boolean {
  return /^(?:\d|[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function timeToMinutes(value: string): number {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

function normalizeWeeklySchedule(days: AdminMasterCreateScheduleDayInput[]): AdminMasterCreateScheduleDayInput[] {
  if (!Array.isArray(days) || days.length !== 7) {
    throw new ValidationError('Потрібно заповнити графік для всіх 7 днів тижня');
  }

  const byWeekday = new Map<number, AdminMasterCreateScheduleDayInput>();
  for (const day of days) {
    if (!Number.isInteger(day.weekday) || day.weekday < 1 || day.weekday > 7) {
      throw new ValidationError('Некоректний день тижня в графіку майстра');
    }
    if (byWeekday.has(day.weekday)) {
      throw new ValidationError('У графіку майстра є дубльований день тижня');
    }

    if (!day.isWorking) {
      byWeekday.set(day.weekday, {
        weekday: day.weekday,
        isWorking: false,
        openTime: null,
        closeTime: null,
      });
      continue;
    }

    if (!day.openTime || !day.closeTime || !isValidTimeHHMM(day.openTime) || !isValidTimeHHMM(day.closeTime)) {
      throw new ValidationError('Для робочого дня потрібно вказати коректний час у форматі HH:MM');
    }
    if (timeToMinutes(day.closeTime) <= timeToMinutes(day.openTime)) {
      throw new ValidationError('Час завершення має бути пізніше часу початку');
    }

    byWeekday.set(day.weekday, {
      weekday: day.weekday,
      isWorking: true,
      openTime: day.openTime,
      closeTime: day.closeTime,
    });
  }

  const normalized: AdminMasterCreateScheduleDayInput[] = [];
  for (let weekday = 1; weekday <= 7; weekday += 1) {
    const day = byWeekday.get(weekday);
    if (!day) {
      throw new ValidationError('Потрібно заповнити графік для всіх 7 днів тижня');
    }
    normalized.push(day);
  }

  return normalized;
}

function isPgError(error: unknown): error is { code?: string; constraint?: string } {
  return typeof error === 'object' && error !== null;
}

/**
 * @summary Шукає кандидата в майстри у межах студії за Telegram ID.
 */
export async function findAdminMasterCandidateByTelegramId(
  input: FindAdminMasterCandidateByTelegramInput,
): Promise<AdminMasterCandidateLookup | null> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const telegramUserId = normalizeTelegramId(input.telegramId);

  try {
    return await withTransaction(async (client) =>
      queryOne<AdminMasterCandidateLookupRow, AdminMasterCandidateLookup>(
        SQL_FIND_ADMIN_MASTER_CANDIDATE_BY_TELEGRAM_ID,
        [studioId, telegramUserId],
        mapCandidateRow,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-masters.helper',
      action: 'Failed to find admin master candidate by telegram id',
      error,
      meta: { studioId, telegramUserId },
    });
    throw error;
  }
}

/**
 * @summary Створює нового майстра в студії з базовим профілем, послугами та тижневим графіком.
 */
export async function createAdminMaster(input: CreateAdminMasterInput): Promise<CreatedAdminMasterResult> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const targetUserId = normalizePositiveBigintId(input.targetUserId, 'targetUserId');
  const createdByUserId = normalizePositiveBigintId(input.createdByUserId, 'createdByUserId');
  const displayName = normalizeMasterDisplayName(input.displayName);
  const bio = normalizeMasterBio(input.bio);
  const experienceYears = normalizeExperienceYears(input.experienceYears);
  const proceduresDoneTotal = normalizeMasterProceduresDoneTotal(input.proceduresDoneTotal);
  const materialsInfo = normalizeMasterMaterialsInfo(input.materialsInfo);
  const contactPhoneE164 = normalizeMasterContactPhone(input.contactPhoneE164);
  const contactEmail = normalizeMasterContactEmail(input.contactEmail);
  const serviceIds = normalizeServiceIds(input.serviceIds);
  const weeklySchedule = normalizeWeeklySchedule(input.weeklySchedule);

  try {
    return await withTransaction(async (client) => {
      const candidate = await queryOne<AdminMasterCandidateLookupRow, AdminMasterCandidateLookup>(
        SQL_GET_ADMIN_MASTER_CANDIDATE_BY_USER_ID,
        [studioId, targetUserId],
        mapCandidateRow,
        client,
      );

      if (!candidate) {
        throw new ValidationError('Користувача не знайдено в цій студії або профіль неактивний');
      }
      if (candidate.isMaster) {
        throw new ValidationError('Цей користувач уже має профіль майстра');
      }

      await executeVoid(SQL_INSERT_MASTER_ROLE, [candidate.userId, createdByUserId], client);

      const insertedMasterId = await executeOne<InsertedMasterIdRow, string>(
        SQL_INSERT_ADMIN_MASTER_PROFILE,
        [
          candidate.userId,
          studioId,
          displayName,
          bio,
          experienceYears,
          proceduresDoneTotal,
          materialsInfo,
          contactPhoneE164,
          contactEmail,
        ],
        (row) => row.master_id,
        client,
      );

      const assignedServiceIds = await queryMany<AssignedServiceRow, string>(
        SQL_ASSIGN_ADMIN_MASTER_SERVICES,
        [studioId, insertedMasterId, serviceIds],
        (row) => row.service_id,
        client,
      );

      if (assignedServiceIds.length !== serviceIds.length) {
        throw new ValidationError(
          'Не всі вибрані послуги доступні в цій студії або активні для призначення',
        );
      }

      for (const day of weeklySchedule) {
        await executeVoid(
          SQL_UPSERT_ADMIN_MASTER_WEEKLY_DAY,
          [
            insertedMasterId,
            day.weekday,
            day.isWorking,
            day.isWorking ? day.openTime : null,
            day.isWorking ? day.closeTime : null,
          ],
          client,
        );
      }

      return {
        masterId: insertedMasterId,
        telegramUserId: candidate.telegramUserId,
        displayName,
        assignedServicesCount: assignedServiceIds.length,
      };
    });
  } catch (error) {
    const adaptedError =
      isPgError(error) && error.code === '23505'
        ? new ValidationError('Цей користувач уже має профіль майстра у студії')
        : error;

    handleError({
      logger: loggerDb,
      scope: 'db-admin-masters.helper',
      action: 'Failed to create admin master',
      error: adaptedError,
      meta: { studioId, targetUserId, createdByUserId },
    });
    throw adaptedError;
  }
}
