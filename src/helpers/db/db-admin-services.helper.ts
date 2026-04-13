import type {
  ServiceGuaranteesEntity,
  ServiceGuaranteesRow,
  ServiceStepsEntity,
  ServiceStepsRow,
} from '../../types/db/index.js';
import type {
  AdminEditableService,
  AdminEditableServiceRow,
  CreateAdminServiceInput,
  CreateAdminServiceResult,
  DeactivateAdminServiceInput,
  GetAdminEditableServiceInput,
  UpdateAdminServiceBasePriceInput,
  UpdateAdminServiceDescriptionInput,
  UpdateAdminServiceDurationInput,
  UpdateAdminServiceGuaranteeTextInput,
  UpdateAdminServiceNameInput,
  UpdateAdminServiceResultDescriptionInput,
  UpdateAdminServiceStepDescriptionInput,
  UpdateAdminServiceStepDurationInput,
  UpdateAdminServiceStepTitleInput,
} from '../../types/db-helpers/db-admin-services.types.js';
import { executeOne, executeVoid, queryOne, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import { serviceGuaranteesRowToEntity } from '../../utils/mappers/serviceGuarantees.mapp.js';
import { serviceStepsRowToEntity } from '../../utils/mappers/serviceSteps.mapp.js';
import {
  SQL_DEACTIVATE_ADMIN_SERVICE,
  SQL_GET_ADMIN_EDITABLE_SERVICE_BY_ID,
  SQL_INSERT_ADMIN_SERVICE,
  SQL_INSERT_ADMIN_SERVICE_GUARANTEE,
  SQL_INSERT_ADMIN_SERVICE_STEP,
  SQL_UPDATE_ADMIN_SERVICE_BASE_PRICE,
  SQL_UPDATE_ADMIN_SERVICE_DESCRIPTION,
  SQL_UPDATE_ADMIN_SERVICE_DURATION,
  SQL_UPDATE_ADMIN_SERVICE_GUARANTEE_TEXT,
  SQL_UPDATE_ADMIN_SERVICE_NAME,
  SQL_UPDATE_ADMIN_SERVICE_RESULT_DESCRIPTION,
  SQL_UPDATE_ADMIN_SERVICE_STEP_DESCRIPTION,
  SQL_UPDATE_ADMIN_SERVICE_STEP_DURATION,
  SQL_UPDATE_ADMIN_SERVICE_STEP_TITLE,
} from '../db-sql/db-admin-services.sql.js';

/**
 * @file db-admin-services.helper.ts
 * @summary uk: DB helper блоку "Послуги" в адмін-панелі.
 * en: DB helper module.
 * cz: DB helper module.
 */

/**
 * uk: Внутрішній helper метод normalizePositiveBigintId.
 * en: Internal helper method normalizePositiveBigintId.
 * cz: Interní helper metoda normalizePositiveBigintId.
 */
function normalizePositiveBigintId(value: string | number, fieldName: string): string {
  const normalized = String(value).trim();
  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError(`Некоректний ${fieldName}`, { [fieldName]: value });
  }
  return normalized;
}

/**
 * uk: Внутрішній helper метод normalizeServiceResultDescription.
 * en: Internal helper method normalizeServiceResultDescription.
 * cz: Interní helper metoda normalizeServiceResultDescription.
 */
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

/**
 * uk: Внутрішній helper метод normalizeServiceDescription.
 * en: Internal helper method normalizeServiceDescription.
 * cz: Interní helper metoda normalizeServiceDescription.
 */
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

/**
 * uk: Внутрішній helper метод normalizeServiceName.
 * en: Internal helper method normalizeServiceName.
 * cz: Interní helper metoda normalizeServiceName.
 */
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

/**
 * uk: Внутрішній helper метод normalizeGuaranteeNo.
 * en: Internal helper method normalizeGuaranteeNo.
 * cz: Interní helper metoda normalizeGuaranteeNo.
 */
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

/**
 * uk: Внутрішній helper метод normalizeStepNo.
 * en: Internal helper method normalizeStepNo.
 * cz: Interní helper metoda normalizeStepNo.
 */
function normalizeStepNo(value: number): number {
  if (!Number.isFinite(value)) {
    throw new ValidationError('Некоректний номер етапу');
  }
  const normalized = Math.trunc(value);
  if (normalized < 1 || normalized > 20) {
    throw new ValidationError('Номер етапу має бути в діапазоні 1..20');
  }
  return normalized;
}

/**
 * uk: Внутрішній helper метод normalizeServiceGuaranteeText.
 * en: Internal helper method normalizeServiceGuaranteeText.
 * cz: Interní helper metoda normalizeServiceGuaranteeText.
 */
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

/**
 * uk: Внутрішній helper метод normalizeServiceStepTitle.
 * en: Internal helper method normalizeServiceStepTitle.
 * cz: Interní helper metoda normalizeServiceStepTitle.
 */
function normalizeServiceStepTitle(value: string): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length < 2) {
    throw new ValidationError('Назва етапу має містити щонайменше 2 символи');
  }
  if (normalized.length > 120) {
    throw new ValidationError('Назва етапу занадто довга (максимум 120 символів)');
  }
  return normalized;
}

/**
 * uk: Внутрішній helper метод normalizeServiceStepDescription.
 * en: Internal helper method normalizeServiceStepDescription.
 * cz: Interní helper metoda normalizeServiceStepDescription.
 */
function normalizeServiceStepDescription(value: string): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length < 10) {
    throw new ValidationError('Опис етапу має містити щонайменше 10 символів');
  }
  if (normalized.length > 500) {
    throw new ValidationError('Опис етапу занадто довгий (максимум 500 символів)');
  }
  return normalized;
}

/**
 * uk: Внутрішній helper метод normalizeServiceStepDurationMinutes.
 * en: Internal helper method normalizeServiceStepDurationMinutes.
 * cz: Interní helper metoda normalizeServiceStepDurationMinutes.
 */
function normalizeServiceStepDurationMinutes(value: number): number {
  if (!Number.isFinite(value)) {
    throw new ValidationError('Тривалість етапу має бути числом');
  }
  const normalized = Math.trunc(value);
  if (normalized < 1 || normalized > 720) {
    throw new ValidationError('Тривалість етапу має бути в діапазоні 1..720 хв');
  }
  return normalized;
}

/**
 * uk: Внутрішній helper метод normalizeServiceBasePrice.
 * en: Internal helper method normalizeServiceBasePrice.
 * cz: Interní helper metoda normalizeServiceBasePrice.
 */
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

/**
 * uk: Внутрішній helper метод normalizeServiceDurationMinutes.
 * en: Internal helper method normalizeServiceDurationMinutes.
 * cz: Interní helper metoda normalizeServiceDurationMinutes.
 */
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

/**
 * uk: Внутрішній helper метод normalizeCurrencyCode.
 * en: Internal helper method normalizeCurrencyCode.
 * cz: Interní helper metoda normalizeCurrencyCode.
 */
function normalizeCurrencyCode(value?: string): string {
  const normalized = (value ?? 'CZK').trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new ValidationError('Код валюти має складатися з 3 латинських літер');
  }
  return normalized;
}

/**
 * uk: Внутрішній helper метод normalizeServiceGuaranteeValidDays.
 * en: Internal helper method normalizeServiceGuaranteeValidDays.
 * cz: Interní helper metoda normalizeServiceGuaranteeValidDays.
 */
function normalizeServiceGuaranteeValidDays(value: number | null | undefined): number | null {
  if (value == null) return null;
  if (!Number.isFinite(value)) {
    throw new ValidationError('Термін гарантії має бути числом');
  }
  const normalized = Math.trunc(value);
  if (normalized < 0) {
    throw new ValidationError('Термін гарантії не може бути відʼємним');
  }
  if (normalized > 3650) {
    throw new ValidationError('Термін гарантії занадто великий');
  }
  return normalized;
}

/**
 * uk: Внутрішній helper метод mapAdminEditableServiceRow.
 * en: Internal helper method mapAdminEditableServiceRow.
 * cz: Interní helper metoda mapAdminEditableServiceRow.
 */
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

type InsertAdminServiceIdRow = { id: string };

/**
 * @summary Створює нову послугу студії з етапами та гарантіями в адмін-панелі.
 */
export async function createAdminService(
  input: CreateAdminServiceInput,
): Promise<CreateAdminServiceResult> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const name = normalizeServiceName(input.name);
  const durationMinutes = normalizeServiceDurationMinutes(input.durationMinutes);
  const basePrice = normalizeServiceBasePrice(input.basePrice);
  const currencyCode = normalizeCurrencyCode(input.currencyCode);
  const description = normalizeServiceDescription(input.description);
  const resultDescription = normalizeServiceResultDescription(input.resultDescription);

  if (!Array.isArray(input.steps) || input.steps.length === 0) {
    throw new ValidationError('Потрібно додати щонайменше 1 етап послуги');
  }
  if (input.steps.length > 20) {
    throw new ValidationError('Максимальна кількість етапів: 20');
  }

  if (!Array.isArray(input.guarantees) || input.guarantees.length === 0) {
    throw new ValidationError('Потрібно додати щонайменше 1 гарантію послуги');
  }
  if (input.guarantees.length > 10) {
    throw new ValidationError('Максимальна кількість гарантій: 10');
  }

  const steps = input.steps.map((step) => ({
    title: normalizeServiceStepTitle(step.title),
    description: normalizeServiceStepDescription(step.description),
    durationMinutes: normalizeServiceStepDurationMinutes(step.durationMinutes),
  }));

  const guarantees = input.guarantees.map((guarantee) => ({
    guaranteeText: normalizeServiceGuaranteeText(guarantee.guaranteeText),
    validDays: normalizeServiceGuaranteeValidDays(guarantee.validDays),
  }));

  try {
    return await withTransaction(async (client) => {
      const inserted = await executeOne<InsertAdminServiceIdRow, InsertAdminServiceIdRow>(
        SQL_INSERT_ADMIN_SERVICE,
        [studioId, name, description, durationMinutes, basePrice, currencyCode, resultDescription],
        (row) => row,
        client,
      );

      const serviceId = inserted.id;
      for (let index = 0; index < steps.length; index += 1) {
        const step = steps[index];
        await executeVoid(
          SQL_INSERT_ADMIN_SERVICE_STEP,
          [serviceId, index + 1, step.durationMinutes, step.title, step.description],
          client,
        );
      }

      for (let index = 0; index < guarantees.length; index += 1) {
        const guarantee = guarantees[index];
        await executeVoid(
          SQL_INSERT_ADMIN_SERVICE_GUARANTEE,
          [serviceId, index + 1, guarantee.guaranteeText, guarantee.validDays],
          client,
        );
      }

      return {
        serviceId,
        name,
        durationMinutes,
        basePrice,
        currencyCode,
        stepsCount: steps.length,
        guaranteesCount: guarantees.length,
      };
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-services.helper',
      action: 'Failed to create service from admin panel',
      error,
      meta: { studioId, name },
    });
    throw error;
  }
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
 * @summary Оновлює назву етапу послуги з адмін-панелі.
 */
export async function updateAdminServiceStepTitle(
  input: UpdateAdminServiceStepTitleInput,
): Promise<ServiceStepsEntity> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const serviceId = normalizePositiveBigintId(input.serviceId, 'serviceId');
  const stepNo = normalizeStepNo(input.stepNo);
  const title = normalizeServiceStepTitle(input.title);

  try {
    return await withTransaction(async (client) =>
      executeOne<ServiceStepsRow, ServiceStepsEntity>(
        SQL_UPDATE_ADMIN_SERVICE_STEP_TITLE,
        [serviceId, stepNo, title, studioId],
        serviceStepsRowToEntity,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-services.helper',
      action: 'Failed to update service step title from admin panel',
      error,
      meta: { studioId, serviceId, stepNo },
    });
    throw error;
  }
}

/**
 * @summary Оновлює опис етапу послуги з адмін-панелі.
 */
export async function updateAdminServiceStepDescription(
  input: UpdateAdminServiceStepDescriptionInput,
): Promise<ServiceStepsEntity> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const serviceId = normalizePositiveBigintId(input.serviceId, 'serviceId');
  const stepNo = normalizeStepNo(input.stepNo);
  const description = normalizeServiceStepDescription(input.description);

  try {
    return await withTransaction(async (client) =>
      executeOne<ServiceStepsRow, ServiceStepsEntity>(
        SQL_UPDATE_ADMIN_SERVICE_STEP_DESCRIPTION,
        [serviceId, stepNo, description, studioId],
        serviceStepsRowToEntity,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-services.helper',
      action: 'Failed to update service step description from admin panel',
      error,
      meta: { studioId, serviceId, stepNo },
    });
    throw error;
  }
}

/**
 * @summary Оновлює тривалість етапу послуги з адмін-панелі.
 */
export async function updateAdminServiceStepDuration(
  input: UpdateAdminServiceStepDurationInput,
): Promise<ServiceStepsEntity> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const serviceId = normalizePositiveBigintId(input.serviceId, 'serviceId');
  const stepNo = normalizeStepNo(input.stepNo);
  const durationMinutes = normalizeServiceStepDurationMinutes(input.durationMinutes);

  try {
    return await withTransaction(async (client) =>
      executeOne<ServiceStepsRow, ServiceStepsEntity>(
        SQL_UPDATE_ADMIN_SERVICE_STEP_DURATION,
        [serviceId, stepNo, durationMinutes, studioId],
        serviceStepsRowToEntity,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-services.helper',
      action: 'Failed to update service step duration from admin panel',
      error,
      meta: { studioId, serviceId, stepNo, durationMinutes },
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
