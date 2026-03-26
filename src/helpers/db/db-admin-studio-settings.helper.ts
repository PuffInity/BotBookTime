import type { ContentBlockKey, LanguageCode } from '../../types/db/dbEnums.type.js';
import type {
  AdminStudioProfileSettings,
  AdminStudioSettingsContentBlock,
  AdminStudioSettingsContentBlockRow,
  AdminStudioSettingsStudio,
  AdminStudioSettingsStudioRow,
  AdminStudioSettingsWeeklyHours,
  AdminStudioSettingsWeeklyHoursRow,
  GetAdminStudioProfileSettingsInput,
  UpsertAdminStudioContentBlockInput,
} from '../../types/db-helpers/db-admin-studio-settings.types.js';
import { executeVoid, queryMany, queryOne, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import {
  SQL_GET_ADMIN_STUDIO_SETTINGS_STUDIO,
  SQL_LIST_ADMIN_STUDIO_SETTINGS_CONTENT_BLOCKS,
  SQL_LIST_ADMIN_STUDIO_SETTINGS_WEEKLY_HOURS,
  SQL_UPSERT_ADMIN_STUDIO_SETTINGS_CONTENT_BLOCK,
} from '../db-sql/db-admin-studio-settings.sql.js';

/**
 * @file db-admin-studio-settings.helper.ts
 * @summary DB helper блоку "Параметри салону" у адмін-панелі.
 */

const DEFAULT_LANGUAGE: LanguageCode = 'uk';
const CONTENT_MIN_LENGTH = 10;
const CONTENT_MAX_LENGTH = 4000;

const CONTENT_BLOCK_KEYS: ContentBlockKey[] = [
  'about',
  'contacts',
  'booking_rules',
  'cancellation_policy',
  'preparation',
  'comfort',
  'guarantee_service',
];

const CONTENT_DEFAULTS: Record<ContentBlockKey, string> = {
  about:
    'Ми працюємо за попереднім записом, щоб кожен клієнт отримував комфортний візит без очікування.',
  contacts:
    'Для звʼязку використовуйте телефон студії або напишіть нам у Telegram-бот.',
  booking_rules:
    'Запис вважається активним після підтвердження майстром. Просимо приходити вчасно.',
  cancellation_policy:
    'Скасування або перенесення запису потрібно зробити не пізніше ніж за 24 години до візиту.',
  preparation:
    'Перед процедурою дотримуйтесь рекомендацій майстра для найкращого результату.',
  comfort:
    'Просимо приходити без супроводу, якщо це не узгоджено заздалегідь.',
  guarantee_service:
    'У разі технічних питань після процедури зверніться до студії для вирішення ситуації.',
};

function normalizePositiveBigintId(value: string | number, fieldName: string): string {
  const normalized = String(value).trim();
  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError(`Некоректний ${fieldName}`, { [fieldName]: value });
  }
  return normalized;
}

function normalizeLanguage(language?: LanguageCode): LanguageCode {
  return language ?? DEFAULT_LANGUAGE;
}

function normalizeStudioContent(content: string): string {
  const normalized = content.trim().replace(/\r/g, '');
  if (normalized.length < CONTENT_MIN_LENGTH) {
    throw new ValidationError(`Текст занадто короткий (мінімум ${CONTENT_MIN_LENGTH} символів)`);
  }
  if (normalized.length > CONTENT_MAX_LENGTH) {
    throw new ValidationError(`Текст занадто довгий (максимум ${CONTENT_MAX_LENGTH} символів)`);
  }
  return normalized;
}

function mapStudioRow(row: AdminStudioSettingsStudioRow): AdminStudioSettingsStudio {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    addressLine: row.address_line,
    phoneE164: row.phone_e164,
    email: row.email,
    timezone: row.timezone,
    currencyCode: row.currency_code,
    isActive: row.is_active,
  };
}

function mapWeeklyHoursRow(row: AdminStudioSettingsWeeklyHoursRow): AdminStudioSettingsWeeklyHours {
  return {
    weekday: row.weekday,
    isOpen: row.is_open,
    openTime: row.open_time,
    closeTime: row.close_time,
  };
}

function mapContentBlockRow(
  row: AdminStudioSettingsContentBlockRow,
): AdminStudioSettingsContentBlock {
  return {
    blockKey: row.block_key,
    content: row.content,
    language: row.language,
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * @summary Завантажує параметри профілю салону для адмін-панелі.
 */
export async function getAdminStudioProfileSettings(
  input: GetAdminStudioProfileSettingsInput,
): Promise<AdminStudioProfileSettings> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const language = normalizeLanguage(input.language);

  try {
    return await withTransaction(async (client) => {
      const studio = await queryOne<AdminStudioSettingsStudioRow, AdminStudioSettingsStudio>(
        SQL_GET_ADMIN_STUDIO_SETTINGS_STUDIO,
        [studioId],
        mapStudioRow,
        client,
      );

      if (!studio) {
        throw new ValidationError('Студію не знайдено або вона неактивна');
      }

      const weeklyHours = await queryMany<AdminStudioSettingsWeeklyHoursRow, AdminStudioSettingsWeeklyHours>(
        SQL_LIST_ADMIN_STUDIO_SETTINGS_WEEKLY_HOURS,
        [studioId],
        mapWeeklyHoursRow,
        client,
      );

      const rows = await queryMany<
        AdminStudioSettingsContentBlockRow,
        AdminStudioSettingsContentBlock
      >(
        SQL_LIST_ADMIN_STUDIO_SETTINGS_CONTENT_BLOCKS,
        [studioId, language],
        mapContentBlockRow,
        client,
      );

      const contentBlocks: Record<ContentBlockKey, string> = {
        ...CONTENT_DEFAULTS,
      };

      for (const row of rows) {
        contentBlocks[row.blockKey] = row.content;
      }

      return {
        studio,
        weeklyHours,
        contentBlocks,
        language,
      };
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-studio-settings.helper',
      action: 'Failed to get admin studio profile settings',
      error,
      meta: { studioId, language },
    });
    throw error;
  }
}

/**
 * @summary Оновлює текст контент-блоку профілю салону.
 */
export async function upsertAdminStudioContentBlock(
  input: UpsertAdminStudioContentBlockInput,
): Promise<void> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const updatedBy = normalizePositiveBigintId(input.updatedBy, 'updatedBy');
  const language = normalizeLanguage(input.language);
  const blockKey = input.blockKey;
  if (!CONTENT_BLOCK_KEYS.includes(blockKey)) {
    throw new ValidationError('Некоректний блок контенту салону', { blockKey });
  }
  const content = normalizeStudioContent(input.content);

  try {
    await withTransaction(async (client) => {
      await executeVoid(
        SQL_UPSERT_ADMIN_STUDIO_SETTINGS_CONTENT_BLOCK,
        [studioId, blockKey, language, content, updatedBy],
        client,
      );
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-studio-settings.helper',
      action: 'Failed to upsert admin studio content block',
      error,
      meta: { studioId, language, blockKey, updatedBy },
    });
    throw error;
  }
}
