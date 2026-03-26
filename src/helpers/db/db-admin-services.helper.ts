import type {
  AdminEditableService,
  AdminEditableServiceRow,
  GetAdminEditableServiceInput,
  UpdateAdminServiceResultDescriptionInput,
} from '../../types/db-helpers/db-admin-services.types.js';
import { executeOne, queryOne, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import {
  SQL_GET_ADMIN_EDITABLE_SERVICE_BY_ID,
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

function mapAdminEditableServiceRow(row: AdminEditableServiceRow): AdminEditableService {
  return {
    id: row.id,
    studioId: row.studio_id,
    name: row.name,
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
