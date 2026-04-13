import type {
  ServiceGuaranteesEntity,
  ServiceGuaranteesRow,
  ServiceStepsEntity,
  ServiceStepsRow,
  ServicesEntity,
  ServicesRow,
} from '../../types/db/index.js';
import type {
  GetServiceCatalogDetailsInput,
  ListServicesCatalogInput,
  ServicesCatalogDetails,
  ServicesCatalogItem,
} from '../../types/db-helpers/db-services.types.js';
import { queryMany, queryOne, withTransaction } from '../db.helper.js';
import { servicesRowToEntity } from '../../utils/mappers/services.mapp.js';
import { serviceStepsRowToEntity } from '../../utils/mappers/serviceSteps.mapp.js';
import { serviceGuaranteesRowToEntity } from '../../utils/mappers/serviceGuarantees.mapp.js';
import { ValidationError } from '../../utils/error.utils.js';
import {
  SQL_GET_ACTIVE_SERVICE_BY_ID,
  SQL_LIST_ACTIVE_SERVICES_CATALOG,
  SQL_LIST_SERVICE_GUARANTEES_BY_SERVICE_ID,
  SQL_LIST_SERVICE_STEPS_BY_SERVICE_ID,
} from '../db-sql/db-services.sql.js';

/**
 * @file db-services.helper.ts
 * @summary DB helper для каталогу послуг у Telegram-боті.
 */

const DEFAULT_CATALOG_LIMIT = 20;
const MIN_CATALOG_LIMIT = 1;
const MAX_CATALOG_LIMIT = 50;

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
 * uk: Внутрішній helper метод normalizeOptionalStudioId.
 * en: Internal helper method normalizeOptionalStudioId.
 * cz: Interní helper metoda normalizeOptionalStudioId.
 */
function normalizeOptionalStudioId(studioId?: string | null): string | null {
  if (studioId == null) return null;
  return normalizePositiveBigintId(studioId, 'studioId');
}

/**
 * uk: Внутрішній helper метод normalizeCatalogLimit.
 * en: Internal helper method normalizeCatalogLimit.
 * cz: Interní helper metoda normalizeCatalogLimit.
 */
function normalizeCatalogLimit(limit?: number): number {
  if (limit == null) return DEFAULT_CATALOG_LIMIT;
  if (!Number.isFinite(limit)) return DEFAULT_CATALOG_LIMIT;

  const normalized = Math.trunc(limit);
  if (normalized < MIN_CATALOG_LIMIT) return DEFAULT_CATALOG_LIMIT;
  if (normalized > MAX_CATALOG_LIMIT) return MAX_CATALOG_LIMIT;
  return normalized;
}

/**
 * uk: Внутрішній helper метод toCatalogItem.
 * en: Internal helper method toCatalogItem.
 * cz: Interní helper metoda toCatalogItem.
 */
function toCatalogItem(service: ServicesEntity): ServicesCatalogItem {
  return {
    id: service.id,
    studioId: service.studioId,
    name: service.name,
    description: service.description,
    durationMinutes: service.durationMinutes,
    basePrice: service.basePrice,
    currencyCode: service.currencyCode,
    resultDescription: service.resultDescription,
    isActive: service.isActive,
  };
}

/**
 * @summary Повертає список активних послуг для каталогу клієнта.
 */
export async function listActiveServicesCatalog(
  input: ListServicesCatalogInput = {},
): Promise<ServicesCatalogItem[]> {
  const studioId = normalizeOptionalStudioId(input.studioId);
  const limit = normalizeCatalogLimit(input.limit);

  return await withTransaction(async (client) => {
    const services = await queryMany<ServicesRow, ServicesEntity>(
      SQL_LIST_ACTIVE_SERVICES_CATALOG,
      [studioId, limit],
      servicesRowToEntity,
      client,
    );

    return services.map(toCatalogItem);
  });
}

/**
 * @summary Повертає деталі послуги для каталогу (послуга + кроки + гарантії).
 */
export async function getServiceCatalogDetailsById(
  input: GetServiceCatalogDetailsInput,
): Promise<ServicesCatalogDetails | null> {
  const serviceId = normalizePositiveBigintId(input.serviceId, 'serviceId');
  const studioId = normalizeOptionalStudioId(input.studioId);

  return await withTransaction(async (client) => {
    const service = await queryOne<ServicesRow, ServicesEntity>(
      SQL_GET_ACTIVE_SERVICE_BY_ID,
      [serviceId, studioId],
      servicesRowToEntity,
      client,
    );

    if (!service) {
      return null;
    }

    const steps = await queryMany<ServiceStepsRow, ServiceStepsEntity>(
      SQL_LIST_SERVICE_STEPS_BY_SERVICE_ID,
      [serviceId],
      serviceStepsRowToEntity,
      client,
    );

    const guarantees = await queryMany<ServiceGuaranteesRow, ServiceGuaranteesEntity>(
      SQL_LIST_SERVICE_GUARANTEES_BY_SERVICE_ID,
      [serviceId],
      serviceGuaranteesRowToEntity,
      client,
    );

    return {
      service: toCatalogItem(service),
      steps,
      guarantees,
    };
  });
}
