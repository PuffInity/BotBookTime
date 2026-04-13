import type {
  MasterDaysOffEntity,
  MasterDaysOffRow,
  MasterCertificatesEntity,
  MasterCertificatesRow,
  MasterTemporaryHoursEntity,
  MasterTemporaryHoursRow,
  MasterVacationsEntity,
  MasterVacationsRow,
  MasterWeeklyHoursEntity,
  MasterWeeklyHoursRow,
} from '../../types/db/index.js';
import type {
  GetMasterCatalogDetailsInput,
  ListMastersByServiceInput,
  ListMastersCatalogInput,
  MasterBookingOption,
  MasterBookingOptionRow,
  MasterCatalogCertificate,
  MasterCatalogDetails,
  MasterCatalogItem,
  MasterUpcomingScheduleException,
  MasterWeeklyScheduleItem,
  MastersCatalogRow,
  MasterSpecializationItem,
  MasterSpecializationRow,
} from '../../types/db-helpers/db-masters.types.js';
import { queryMany, queryOne, withTransaction } from '../db.helper.js';
import { masterCertificatesRowToEntity } from '../../utils/mappers/masterCertificates.mapp.js';
import { masterDaysOffRowToEntity } from '../../utils/mappers/masterDaysOff.mapp.js';
import { masterTemporaryHoursRowToEntity } from '../../utils/mappers/masterTemporaryHours.mapp.js';
import { masterVacationsRowToEntity } from '../../utils/mappers/masterVacations.mapp.js';
import { masterWeeklyHoursRowToEntity } from '../../utils/mappers/masterWeeklyHours.mapp.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import {
  SQL_GET_ACTIVE_MASTER_BY_ID,
  SQL_LIST_ACTIVE_MASTERS_CATALOG,
  SQL_LIST_ACTIVE_MASTERS_BY_SERVICE_ID,
  SQL_LIST_MASTER_CERTIFICATES_BY_ID,
  SQL_LIST_MASTER_UPCOMING_DAYS_OFF_BY_ID,
  SQL_LIST_MASTER_UPCOMING_TEMPORARY_HOURS_BY_ID,
  SQL_LIST_MASTER_UPCOMING_VACATIONS_BY_ID,
  SQL_LIST_MASTER_SPECIALIZATIONS_BY_ID,
  SQL_LIST_MASTER_WEEKLY_HOURS_BY_ID,
} from '../db-sql/db-masters.sql.js';

/**
 * @file db-masters.helper.ts
 * @summary DB helper для каталогу майстрів і вибору майстра у flow бронювання.
 */

const DEFAULT_CATALOG_LIMIT = 20;
const MAX_CATALOG_LIMIT = 50;
const DEFAULT_SCHEDULE_EXCEPTIONS_LIMIT = 5;

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
  if (normalized < 1) return DEFAULT_CATALOG_LIMIT;
  if (normalized > MAX_CATALOG_LIMIT) return MAX_CATALOG_LIMIT;
  return normalized;
}

/**
 * uk: Внутрішній helper метод mastersCatalogRowToItem.
 * en: Internal helper method mastersCatalogRowToItem.
 * cz: Interní helper metoda mastersCatalogRowToItem.
 */
function mastersCatalogRowToItem(row: MastersCatalogRow): MasterCatalogItem {
  return {
    userId: row.user_id,
    studioId: row.studio_id,
    displayName: row.display_name,
    bio: row.bio,
    experienceYears: row.experience_years,
    proceduresDoneTotal: row.procedures_done_total,
    ratingAvg: row.rating_avg,
    ratingCount: row.rating_count,
    isBookable: row.is_bookable,
  };
}

/**
 * uk: Внутрішній helper метод masterSpecializationRowToItem.
 * en: Internal helper method masterSpecializationRowToItem.
 * cz: Interní helper metoda masterSpecializationRowToItem.
 */
function masterSpecializationRowToItem(row: MasterSpecializationRow): MasterSpecializationItem {
  return {
    serviceId: row.service_id,
    serviceName: row.service_name,
    durationMinutes: row.duration_minutes,
    priceAmount: row.price_amount,
    currencyCode: row.currency_code,
  };
}

/**
 * uk: Внутрішній helper метод masterBookingOptionRowToItem.
 * en: Internal helper method masterBookingOptionRowToItem.
 * cz: Interní helper metoda masterBookingOptionRowToItem.
 */
function masterBookingOptionRowToItem(row: MasterBookingOptionRow): MasterBookingOption {
  return {
    masterId: row.master_id,
    studioId: row.studio_id,
    displayName: row.display_name,
    experienceYears: row.experience_years,
    ratingAvg: row.rating_avg,
    ratingCount: row.rating_count,
  };
}

/**
 * uk: Внутрішній helper метод mapCertificateEntityToCatalog.
 * en: Internal helper method mapCertificateEntityToCatalog.
 * cz: Interní helper metoda mapCertificateEntityToCatalog.
 */
function mapCertificateEntityToCatalog(entity: MasterCertificatesEntity): MasterCatalogCertificate {
  return {
    id: entity.id,
    title: entity.title,
    issuer: entity.issuer,
    issuedOn: entity.issuedOn,
    expiresOn: entity.expiresOn,
    documentUrl: entity.documentUrl,
  };
}

/**
 * uk: Внутрішній helper метод mapWeeklyHoursEntityToSchedule.
 * en: Internal helper method mapWeeklyHoursEntityToSchedule.
 * cz: Interní helper metoda mapWeeklyHoursEntityToSchedule.
 */
function mapWeeklyHoursEntityToSchedule(
  entity: MasterWeeklyHoursEntity,
): MasterWeeklyScheduleItem {
  return {
    weekday: entity.weekday,
    isWorking: entity.isWorking,
    openTime: entity.openTime,
    closeTime: entity.closeTime,
  };
}

/**
 * uk: Внутрішній helper метод mapDayOffEntityToException.
 * en: Internal helper method mapDayOffEntityToException.
 * cz: Interní helper metoda mapDayOffEntityToException.
 */
function mapDayOffEntityToException(
  entity: MasterDaysOffEntity,
): MasterUpcomingScheduleException {
  return {
    type: 'day_off',
    offDate: entity.offDate,
    reason: entity.reason,
  };
}

/**
 * uk: Внутрішній helper метод mapVacationEntityToException.
 * en: Internal helper method mapVacationEntityToException.
 * cz: Interní helper metoda mapVacationEntityToException.
 */
function mapVacationEntityToException(
  entity: MasterVacationsEntity,
): MasterUpcomingScheduleException {
  return {
    type: 'vacation',
    dateFrom: entity.dateFrom,
    dateTo: entity.dateTo,
    reason: entity.reason,
  };
}

/**
 * uk: Внутрішній helper метод mapTemporaryHoursEntityToException.
 * en: Internal helper method mapTemporaryHoursEntityToException.
 * cz: Interní helper metoda mapTemporaryHoursEntityToException.
 */
function mapTemporaryHoursEntityToException(
  entity: MasterTemporaryHoursEntity,
): MasterUpcomingScheduleException {
  return {
    type: 'temporary',
    dateFrom: entity.dateFrom,
    dateTo: entity.dateTo,
    weekday: entity.weekday,
    isWorking: entity.isWorking,
    openTime: entity.openTime,
    closeTime: entity.closeTime,
    note: entity.note,
  };
}

/**
 * uk: Внутрішній helper метод getExceptionTimestamp.
 * en: Internal helper method getExceptionTimestamp.
 * cz: Interní helper metoda getExceptionTimestamp.
 */
function getExceptionTimestamp(item: MasterUpcomingScheduleException): number {
  if (item.type === 'day_off') return item.offDate.getTime();
  return item.dateFrom.getTime();
}

/**
 * @summary Повертає список активних майстрів для каталогу клієнта.
 */
export async function listActiveMastersCatalog(
  input: ListMastersCatalogInput = {},
): Promise<MasterCatalogItem[]> {
  const studioId = normalizeOptionalStudioId(input.studioId);
  const limit = normalizeCatalogLimit(input.limit);

  try {
    return await withTransaction(async (client) =>
      queryMany<MastersCatalogRow, MasterCatalogItem>(
        SQL_LIST_ACTIVE_MASTERS_CATALOG,
        [studioId, limit],
        mastersCatalogRowToItem,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-masters.helper',
      action: 'Failed to list active masters catalog',
      error,
      meta: { studioId, limit },
    });
    throw error;
  }
}

/**
 * @summary Повертає список активних майстрів, які виконують конкретну послугу.
 */
export async function listActiveMastersByService(
  input: ListMastersByServiceInput,
): Promise<MasterBookingOption[]> {
  const studioId = normalizePositiveBigintId(input.studioId, 'studioId');
  const serviceId = normalizePositiveBigintId(input.serviceId, 'serviceId');
  const limit = normalizeCatalogLimit(input.limit);

  try {
    return await withTransaction(async (client) =>
      queryMany<MasterBookingOptionRow, MasterBookingOption>(
        SQL_LIST_ACTIVE_MASTERS_BY_SERVICE_ID,
        [studioId, serviceId, limit],
        masterBookingOptionRowToItem,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-masters.helper',
      action: 'Failed to list active masters by service',
      error,
      meta: { serviceId, studioId, limit },
    });
    throw error;
  }
}

/**
 * @summary Повертає деталі майстра (профіль + спеціалізації + сертифікати).
 */
export async function getMasterCatalogDetailsById(
  input: GetMasterCatalogDetailsInput,
): Promise<MasterCatalogDetails | null> {
  const masterId = normalizePositiveBigintId(input.masterId, 'masterId');
  const studioId = normalizeOptionalStudioId(input.studioId);

  try {
    return await withTransaction(async (client) => {
      const masterRow = await queryOne<MastersCatalogRow, MastersCatalogRow>(
        SQL_GET_ACTIVE_MASTER_BY_ID,
        [masterId, studioId],
        (row) => row,
        client,
      );

      if (!masterRow) {
        return null;
      }

      const specializations = await queryMany<MasterSpecializationRow, MasterSpecializationItem>(
        SQL_LIST_MASTER_SPECIALIZATIONS_BY_ID,
        [masterId],
        masterSpecializationRowToItem,
        client,
      );

      const certificates = await queryMany<MasterCertificatesRow, MasterCertificatesEntity>(
        SQL_LIST_MASTER_CERTIFICATES_BY_ID,
        [masterId],
        masterCertificatesRowToEntity,
        client,
      );

      const weeklySchedule = await queryMany<MasterWeeklyHoursRow, MasterWeeklyHoursEntity>(
        SQL_LIST_MASTER_WEEKLY_HOURS_BY_ID,
        [masterId],
        masterWeeklyHoursRowToEntity,
        client,
      );

      const upcomingDaysOff = await queryMany<MasterDaysOffRow, MasterDaysOffEntity>(
        SQL_LIST_MASTER_UPCOMING_DAYS_OFF_BY_ID,
        [masterId, DEFAULT_SCHEDULE_EXCEPTIONS_LIMIT],
        masterDaysOffRowToEntity,
        client,
      );

      const upcomingVacations = await queryMany<MasterVacationsRow, MasterVacationsEntity>(
        SQL_LIST_MASTER_UPCOMING_VACATIONS_BY_ID,
        [masterId, DEFAULT_SCHEDULE_EXCEPTIONS_LIMIT],
        masterVacationsRowToEntity,
        client,
      );

      const upcomingTemporaryHours = await queryMany<
        MasterTemporaryHoursRow,
        MasterTemporaryHoursEntity
      >(
        SQL_LIST_MASTER_UPCOMING_TEMPORARY_HOURS_BY_ID,
        [masterId, DEFAULT_SCHEDULE_EXCEPTIONS_LIMIT],
        masterTemporaryHoursRowToEntity,
        client,
      );

      const upcomingScheduleExceptions = [
        ...upcomingDaysOff.map(mapDayOffEntityToException),
        ...upcomingVacations.map(mapVacationEntityToException),
        ...upcomingTemporaryHours.map(mapTemporaryHoursEntityToException),
      ].sort((a, b) => getExceptionTimestamp(a) - getExceptionTimestamp(b));

      return {
        master: mastersCatalogRowToItem(masterRow),
        specializations,
        certificates: certificates.map(mapCertificateEntityToCatalog),
        weeklySchedule: weeklySchedule.map(mapWeeklyHoursEntityToSchedule),
        upcomingScheduleExceptions,
        contactPhoneE164: masterRow.contact_phone_e164,
        contactEmail: masterRow.contact_email,
        materialsInfo: masterRow.materials_info,
      };
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-masters.helper',
      action: 'Failed to load master catalog details by id',
      error,
      meta: { masterId, studioId },
    });
    throw error;
  }
}
