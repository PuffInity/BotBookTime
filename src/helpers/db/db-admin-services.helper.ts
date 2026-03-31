import type {
  ServiceGuaranteesEntity,
  ServiceGuaranteesRow,
} from '../../types/db/index.js';
import type {
  AdminEditableService,
  AdminEditableServiceRow,
  DeactivateAdminServiceInput,
  GetAdminEditableServiceInput,
  UpdateAdminServiceBasePriceInput,
  UpdateAdminServiceDescriptionInput,
  UpdateAdminServiceDurationInput,
  UpdateAdminServiceGuaranteeTextInput,
  UpdateAdminServiceNameInput,
  UpdateAdminServiceResultDescriptionInput,
} from '../../types/db-helpers/db-admin-services.types.js';
import { executeOne, queryOne, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import { serviceGuaranteesRowToEntity } from '../../utils/mappers/serviceGuarantees.mapp.js';
import {
  SQL_DEACTIVATE_ADMIN_SERVICE,
  SQL_GET_ADMIN_EDITABLE_SERVICE_BY_ID,
  SQL_UPDATE_ADMIN_SERVICE_BASE_PRICE,
  SQL_UPDATE_ADMIN_SERVICE_DESCRIPTION,
  SQL_UPDATE_ADMIN_SERVICE_DURATION,
  SQL_UPDATE_ADMIN_SERVICE_GUARANTEE_TEXT,
  SQL_UPDATE_ADMIN_SERVICE_NAME,
  SQL_UPDATE_ADMIN_SERVICE_RESULT_DESCRIPTION,
} from '../db-sql/db-admin-services.sql.js';

/**
 * @file db-admin-services.helper.ts
 * @summary DB helper блоку "Послуги" в адмін-панелі.
 */

function normalizePositiveBigintId(value: string | number, fieldName: string): string {
  const normalized = String(value).trim();
  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError(`Некоректний ${fieldName}`, { [fieldName]: value });
  }
  return normalized;
}

function normalizeServiceResultDescription(value: string | null): string | null {
  if (value == null) {
    throw new ValidationError('Результат послуги не може бути порожнім');
  }

  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length < 10) {
    throw new ValidationError('Результат послуги має містити щонайменше 10 символів');
  }
  if (normalized.length > 1200) {
    throw new ValidationError('Результат послуги занадто довгий (максимум 1200 символів)');
  }

  return normalized;
}

function normalizeServiceDescription(value: string | null): string | null {
  if (value == null) {
    throw new ValidationError('Опис послуги не може бути порожнім');
  }

  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length < 10) {
    throw new ValidationError('Опис послуги має містити щонайменше 10 символів');
  }
  if (normalized.length > 1600) {
    throw new ValidationError('Опис послуги занадто довгий (максимум 1600 символів)');
  }

  return normalized;
}

function normalizeServiceName(value: string): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length < 2) {
    throw new ValidationError('Назва послуги має містити щонайменше 2 символи');
  }
  if (normalized.length > 120) {
    throw new ValidationError('Назва послуги занадто довга (максимум 120 символів)');
  }
  return normalized;
}

function normalizeGuaranteeNo(value: number): number {
  if (!Number.isFinite(value)) {
    throw new ValidationError('Некоректний номер гарантії');
  }
  const normalized = Math.trunc(value);
  if (normalized < 1 || normalized > 10) {
    throw new ValidationError('Номер гарантії має бути в діапазоні 1..10');
  }
  return normalized;
}

function normalizeServiceGuaranteeText(value: string): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length < 3) {
    throw new ValidationError('Текст гарантії має містити щонайменше 3 символи');
  }
  if (normalized.length > 500) {
    throw new ValidationError('Текст гарантії занадто довгий (максимум 500 символів)');
  }
  return normalized;
}

function normalizeServiceBasePrice(value: string): string {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new ValidationError('Ціна має бути числом у форматі 750 або 750.50');
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new ValidationError('Ціна не може бути відʼємною');
  }
  if (amount > 99_999_999.99) {
    throw new ValidationError('Ціна занадто велика');
  }

  return amount.toFixed(2);
}

function normalizeServiceDurationMinutes(value: number): number {
  if (!Number.isFinite(value)) {
    throw new ValidationError('Тривалість послуги має бути числом');
  }
  const normalized = Math.trunc(value);
  if (normalized < 5 || normalized > 720) {
    throw new ValidationError('Тривалість послуги має бути в діапазоні 5..720 хв');
  }
  return normalized;
}

function mapAdminEditableServiceRow(row: AdminEditableServiceRow): AdminEditableService {
  return {
    id: row.id,
    studioId: row.studio_id,
    name: row.name,
    durationMinutes: row.duration_minutes,
    basePrice: row.base_price,
    currencyCode: row.currency_code,
    description: row.description,
    resultDescription: row.result_description,
  };
}

/**
 * @summary Повертає послугу студії для редагування з адмін-панелі.
 */
export async function getAdminEditableServiceById(
  input: GetAdminEditableServiceInput,
): Promise<AdminEditableService | null> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const serviceId = normalizePositiveBigintId(input.serviceId, 'serviceId');

  try {
    return await withTransaction(async (client) =>
      queryOne<AdminEditableServiceRow, AdminEditableService>(
        SQL_GET_ADMIN_EDITABLE_SERVICE_BY_ID,
        [serviceId, studioId],
        mapAdminEditableServiceRow,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-services.helper',
      action: 'Failed to load editable service by id',
      error,
      meta: { studioId, serviceId },
    });
    throw error;
  }
}

/**
 * @summary Оновлює текст гарантії послуги з адмін-панелі.
 */
export async function updateAdminServiceGuaranteeText(
  input: UpdateAdminServiceGuaranteeTextInput,
): Promise<ServiceGuaranteesEntity> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const serviceId = normalizePositiveBigintId(input.serviceId, 'serviceId');
  const guaranteeNo = normalizeGuaranteeNo(input.guaranteeNo);
  const guaranteeText = normalizeServiceGuaranteeText(input.guaranteeText);

  try {
    return await withTransaction(async (client) =>
      executeOne<ServiceGuaranteesRow, ServiceGuaranteesEntity>(
        SQL_UPDATE_ADMIN_SERVICE_GUARANTEE_TEXT,
        [serviceId, guaranteeNo, guaranteeText, studioId],
        serviceGuaranteesRowToEntity,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-services.helper',
      action: 'Failed to update service guarantee text from admin panel',
      error,
      meta: { studioId, serviceId, guaranteeNo },
    });
    throw error;
  }
}

/**
 * @summary Оновлює поле "результат послуги" з адмін-панелі.
 */
export async function updateAdminServiceResultDescription(
  input: UpdateAdminServiceResultDescriptionInput,
): Promise<AdminEditableService> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const serviceId = normalizePositiveBigintId(input.serviceId, 'serviceId');
  const resultDescription = normalizeServiceResultDescription(input.resultDescription);

  try {
    return await withTransaction(async (client) =>
      executeOne<AdminEditableServiceRow, AdminEditableService>(
        SQL_UPDATE_ADMIN_SERVICE_RESULT_DESCRIPTION,
        [serviceId, studioId, resultDescription],
        mapAdminEditableServiceRow,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-services.helper',
      action: 'Failed to update service result description from admin panel',
      error,
      meta: { studioId, serviceId },
    });
    throw error;
  }
}

/**
 * @summary Оновлює поле "назва послуги" з адмін-панелі.
 */
export async function updateAdminServiceName(
  input: UpdateAdminServiceNameInput,
): Promise<AdminEditableService> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const serviceId = normalizePositiveBigintId(input.serviceId, 'serviceId');
  const name = normalizeServiceName(input.name);

  try {
    return await withTransaction(async (client) =>
      executeOne<AdminEditableServiceRow, AdminEditableService>(
        SQL_UPDATE_ADMIN_SERVICE_NAME,
        [serviceId, studioId, name],
        mapAdminEditableServiceRow,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-services.helper',
      action: 'Failed to update service name from admin panel',
      error,
      meta: { studioId, serviceId },
    });
    throw error;
  }
}

/**
 * @summary Оновлює поле "опис послуги" з адмін-панелі.
 */
export async function updateAdminServiceDescription(
  input: UpdateAdminServiceDescriptionInput,
): Promise<AdminEditableService> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const serviceId = normalizePositiveBigintId(input.serviceId, 'serviceId');
  const description = normalizeServiceDescription(input.description);

  try {
    return await withTransaction(async (client) =>
      executeOne<AdminEditableServiceRow, AdminEditableService>(
        SQL_UPDATE_ADMIN_SERVICE_DESCRIPTION,
        [serviceId, studioId, description],
        mapAdminEditableServiceRow,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-services.helper',
      action: 'Failed to update service description from admin panel',
      error,
      meta: { studioId, serviceId },
    });
    throw error;
  }
}

/**
 * @summary Оновлює поле "ціна послуги" з адмін-панелі.
 */
export async function updateAdminServiceBasePrice(
  input: UpdateAdminServiceBasePriceInput,
): Promise<AdminEditableService> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const serviceId = normalizePositiveBigintId(input.serviceId, 'serviceId');
  const basePrice = normalizeServiceBasePrice(input.basePrice);

  try {
    return await withTransaction(async (client) =>
      executeOne<AdminEditableServiceRow, AdminEditableService>(
        SQL_UPDATE_ADMIN_SERVICE_BASE_PRICE,
        [serviceId, studioId, basePrice],
        mapAdminEditableServiceRow,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-services.helper',
      action: 'Failed to update service base price from admin panel',
      error,
      meta: { studioId, serviceId },
    });
    throw error;
  }
}

/**
 * @summary Оновлює поле "тривалість послуги" з адмін-панелі.
 */
export async function updateAdminServiceDuration(
  input: UpdateAdminServiceDurationInput,
): Promise<AdminEditableService> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const serviceId = normalizePositiveBigintId(input.serviceId, 'serviceId');
  const durationMinutes = normalizeServiceDurationMinutes(input.durationMinutes);

  try {
    return await withTransaction(async (client) =>
      executeOne<AdminEditableServiceRow, AdminEditableService>(
        SQL_UPDATE_ADMIN_SERVICE_DURATION,
        [serviceId, studioId, durationMinutes],
        mapAdminEditableServiceRow,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-services.helper',
      action: 'Failed to update service duration from admin panel',
      error,
      meta: { studioId, serviceId, durationMinutes },
    });
    throw error;
  }
}

/**
 * @summary Деактивує послугу студії (псевдо-видалення) з адмін-панелі.
 */
export async function deactivateAdminService(
  input: DeactivateAdminServiceInput,
): Promise<AdminEditableService> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const serviceId = normalizePositiveBigintId(input.serviceId, 'serviceId');

  try {
    return await withTransaction(async (client) =>
      executeOne<AdminEditableServiceRow, AdminEditableService>(
        SQL_DEACTIVATE_ADMIN_SERVICE,
        [serviceId, studioId],
        mapAdminEditableServiceRow,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-services.helper',
      action: 'Failed to deactivate service from admin panel',
      error,
      meta: { studioId, serviceId },
    });
    throw error;
  }
}
