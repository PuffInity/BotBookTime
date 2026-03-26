import type {
  AdminPanelStatsMasterDetails,
  AdminPanelStatsMasterFeedItem,
  AdminPanelStatsMasterFeedRow,
  AdminPanelStatsMastersFeedPage,
  AdminPanelStatsOverview,
  AdminPanelStatsOverviewRow,
  AdminPanelStatsServiceDetails,
  AdminPanelStatsServiceDetailsRow,
  AdminPanelStatsServiceFeedItem,
  AdminPanelStatsServiceFeedRow,
  AdminPanelStatsServiceTopMasterItem,
  AdminPanelStatsServiceTopMasterRow,
  AdminPanelStatsServicesFeedPage,
  GetAdminPanelStatsServiceDetailsInput,
  GetAdminPanelStatsMasterDetailsInput,
  ListAdminPanelStatsMastersFeedInput,
  ListAdminPanelStatsServicesFeedInput,
} from '../../types/db-helpers/db-admin-stats.types.js';
import { queryMany, queryOne, withTransaction } from '../db.helper.js';
import {
  SQL_GET_ADMIN_PANEL_STATS_SERVICE_DETAILS,
  SQL_GET_ADMIN_PANEL_STATS_OVERVIEW,
  SQL_LIST_ADMIN_PANEL_STATS_SERVICE_TOP_MASTERS,
  SQL_LIST_ADMIN_PANEL_STATS_SERVICES_FEED,
  SQL_GET_STUDIO_CURRENCY_CODE,
  SQL_LIST_ADMIN_PANEL_STATS_MASTERS_FEED,
} from '../db-sql/db-admin-stats.sql.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import { getMasterCatalogDetailsById } from './db-masters.helper.js';
import { getMasterPanelFinance } from './db-master-finance.helper.js';
import { getMasterPanelStats } from './db-master-stats.helper.js';

/**
 * @file db-admin-stats.helper.ts
 * @summary DB helper для блоку статистики адмін-панелі.
 */

function normalizeStudioId(value: string | number): string {
  const normalized = String(value).trim();
  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError('Некоректний studioId', { studioId: value });
  }
  return normalized;
}

function toNumber(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return parsed;
}

function normalizeMasterId(value: string | number): string {
  const normalized = String(value).trim();
  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError('Некоректний masterId', { masterId: value });
  }
  return normalized;
}

function normalizeServiceId(value: string | number): string {
  const normalized = String(value).trim();
  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError('Некоректний serviceId', { serviceId: value });
  }
  return normalized;
}

function normalizeLimit(limit?: number): number {
  if (limit == null || !Number.isFinite(limit)) return 5;
  const normalized = Math.trunc(limit);
  if (normalized < 1) return 5;
  if (normalized > 20) return 20;
  return normalized;
}

function normalizeOffset(offset?: number): number {
  if (offset == null || !Number.isFinite(offset)) return 0;
  const normalized = Math.trunc(offset);
  if (normalized < 0) return 0;
  return normalized;
}

function mapOverviewRow(row: AdminPanelStatsOverviewRow): AdminPanelStatsOverview {
  return {
    currencyCode: row.currency_code,
    grossMonth: toNumber(row.gross_month),
    gross3m: toNumber(row.gross_3m),
    gross6m: toNumber(row.gross_6m),
    grossYear: toNumber(row.gross_year),
    salonMonth: toNumber(row.salon_month),
    salon3m: toNumber(row.salon_3m),
    salon6m: toNumber(row.salon_6m),
    salonYear: toNumber(row.salon_year),
    completedProceduresMonth: row.completed_procedures_month,
    uniqueClientsMonth: row.unique_clients_month,
    avgCheckMonth: toNumber(row.avg_check_month),
  };
}

function mapMasterFeedRow(row: AdminPanelStatsMasterFeedRow): AdminPanelStatsMasterFeedItem {
  return {
    masterId: row.master_id,
    displayName: row.display_name,
    currencyCode: row.currency_code,
    completedProceduresMonth: row.completed_procedures_month,
    clientsServedMonth: row.clients_served_month,
    grossMonth: toNumber(row.gross_month),
    salonMonth: toNumber(row.salon_month),
    avgCheckMonth: toNumber(row.avg_check_month),
  };
}

function mapServiceFeedRow(row: AdminPanelStatsServiceFeedRow): AdminPanelStatsServiceFeedItem {
  return {
    serviceId: row.service_id,
    serviceName: row.service_name,
    currencyCode: row.currency_code,
    completedProceduresMonth: row.completed_procedures_month,
    clientsServedMonth: row.clients_served_month,
    grossMonth: toNumber(row.gross_month),
    salonMonth: toNumber(row.salon_month),
    avgCheckMonth: toNumber(row.avg_check_month),
  };
}

function mapServiceTopMasterRow(
  row: AdminPanelStatsServiceTopMasterRow,
): AdminPanelStatsServiceTopMasterItem {
  return {
    masterId: row.master_id,
    displayName: row.display_name,
    completedCount: row.completed_count,
  };
}

/**
 * @summary Повертає оглядову статистику салону для адмін-панелі.
 */
export async function getAdminPanelStatsOverview(
  studioIdInput: string | number,
): Promise<AdminPanelStatsOverview> {
  const studioId = normalizeStudioId(studioIdInput);

  try {
    return await withTransaction(async (client) => {
      const row = await queryOne<AdminPanelStatsOverviewRow, AdminPanelStatsOverview>(
        SQL_GET_ADMIN_PANEL_STATS_OVERVIEW,
        [studioId],
        mapOverviewRow,
        client,
      );

      if (!row) {
        throw new ValidationError('Статистику студії не знайдено');
      }

      return row;
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-stats.helper',
      action: 'Failed to get admin panel stats overview',
      error,
      meta: { studioId },
    });
    throw error;
  }
}

/**
 * @summary Повертає сторінку статистики майстрів студії за поточний місяць.
 */
export async function listAdminPanelStatsMastersFeed(
  input: ListAdminPanelStatsMastersFeedInput,
): Promise<AdminPanelStatsMastersFeedPage> {
  const studioId = normalizeStudioId(input.studioId);
  const limit = normalizeLimit(input.limit);
  const offset = normalizeOffset(input.offset);

  try {
    return await withTransaction(async (client) => {
      const rows = await queryMany<AdminPanelStatsMasterFeedRow, AdminPanelStatsMasterFeedRow>(
        SQL_LIST_ADMIN_PANEL_STATS_MASTERS_FEED,
        [studioId, limit, offset],
        (row) => row,
        client,
      );

      const total = rows.length > 0 ? rows[0].total_count : 0;
      const items = rows.map(mapMasterFeedRow);
      const currencyCode =
        rows[0]?.currency_code ??
        (await queryOne<{ currency_code: string }, string>(
          SQL_GET_STUDIO_CURRENCY_CODE,
          [studioId],
          (row) => row.currency_code,
          client,
        )) ??
        'CZK';

      return {
        limit,
        offset,
        total,
        currencyCode,
        items,
        hasPrevPage: offset > 0,
        hasNextPage: offset + items.length < total,
      };
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-stats.helper',
      action: 'Failed to list admin panel masters stats feed',
      error,
      meta: { studioId, limit, offset },
    });
    throw error;
  }
}

/**
 * @summary Повертає детальну статистику конкретного майстра в контексті адмін-панелі.
 */
export async function getAdminPanelStatsMasterDetails(
  input: GetAdminPanelStatsMasterDetailsInput,
): Promise<AdminPanelStatsMasterDetails> {
  const studioId = normalizeStudioId(input.studioId);
  const masterId = normalizeMasterId(input.masterId);

  try {
    const [masterProfile, finance, stats, currencyCode] = await Promise.all([
      getMasterCatalogDetailsById({ masterId, studioId }),
      getMasterPanelFinance(masterId),
      getMasterPanelStats(masterId),
      withTransaction(async (client) =>
        queryOne<{ currency_code: string }, string>(
          SQL_GET_STUDIO_CURRENCY_CODE,
          [studioId],
          (row) => row.currency_code,
          client,
        ),
      ),
    ]);

    if (!masterProfile) {
      throw new ValidationError('Майстра не знайдено у цій студії', {
        studioId,
        masterId,
      });
    }

    return {
      masterId,
      displayName: masterProfile.master.displayName,
      currencyCode: currencyCode ?? 'CZK',
      grossMonth: finance.grossMonth,
      gross3m: finance.gross3m,
      gross6m: finance.gross6m,
      grossYear: finance.grossYear,
      grossAllTime: finance.grossAllTime,
      salonMonth: finance.salonMonth,
      salon3m: finance.salon3m,
      salon6m: finance.salon6m,
      salonYear: finance.salonYear,
      masterAllTime: finance.masterAllTime,
      avgCheck: finance.avgCheck,
      bestServiceName: finance.bestServiceName,
      bestServiceAmount: finance.bestServiceAmount,
      bestMonthStart: finance.bestMonthStart,
      bestMonthAmount: finance.bestMonthAmount,
      completedProceduresMonth: stats.completedProceduresMonth,
      clientsServedMonth: stats.clientsServedMonth,
      workloadPercentMonth: stats.workloadPercentMonth,
      repeatClientsPercentMonth: stats.repeatClientsPercentMonth,
      newClientsMonth: stats.newClientsMonth,
      bookingsThisWeek: stats.bookingsThisWeek,
      bookingsToday: stats.bookingsToday,
      topServices: stats.topServices.map((item) => ({
        serviceName: item.serviceName,
        completedCount: item.completedCount,
      })),
    };
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-stats.helper',
      action: 'Failed to get admin panel master stats details',
      error,
      meta: { studioId, masterId },
    });
    throw error;
  }
}

/**
 * @summary Повертає сторінку статистики послуг студії за поточний місяць.
 */
export async function listAdminPanelStatsServicesFeed(
  input: ListAdminPanelStatsServicesFeedInput,
): Promise<AdminPanelStatsServicesFeedPage> {
  const studioId = normalizeStudioId(input.studioId);
  const limit = normalizeLimit(input.limit);
  const offset = normalizeOffset(input.offset);

  try {
    return await withTransaction(async (client) => {
      const rows = await queryMany<AdminPanelStatsServiceFeedRow, AdminPanelStatsServiceFeedRow>(
        SQL_LIST_ADMIN_PANEL_STATS_SERVICES_FEED,
        [studioId, limit, offset],
        (row) => row,
        client,
      );

      const total = rows.length > 0 ? rows[0].total_count : 0;
      const items = rows.map(mapServiceFeedRow);
      const currencyCode =
        rows[0]?.currency_code ??
        (await queryOne<{ currency_code: string }, string>(
          SQL_GET_STUDIO_CURRENCY_CODE,
          [studioId],
          (row) => row.currency_code,
          client,
        )) ??
        'CZK';

      return {
        limit,
        offset,
        total,
        currencyCode,
        items,
        hasPrevPage: offset > 0,
        hasNextPage: offset + items.length < total,
      };
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-stats.helper',
      action: 'Failed to list admin panel services stats feed',
      error,
      meta: { studioId, limit, offset },
    });
    throw error;
  }
}

/**
 * @summary Повертає детальну статистику конкретної послуги в контексті адмін-панелі.
 */
export async function getAdminPanelStatsServiceDetails(
  input: GetAdminPanelStatsServiceDetailsInput,
): Promise<AdminPanelStatsServiceDetails> {
  const studioId = normalizeStudioId(input.studioId);
  const serviceId = normalizeServiceId(input.serviceId);

  try {
    return await withTransaction(async (client) => {
      const details = await queryOne<AdminPanelStatsServiceDetailsRow, AdminPanelStatsServiceDetails>(
        SQL_GET_ADMIN_PANEL_STATS_SERVICE_DETAILS,
        [studioId, serviceId],
        (row) => ({
          serviceId: row.service_id,
          serviceName: row.service_name,
          durationMinutes: row.duration_minutes,
          basePrice: toNumber(row.base_price),
          currencyCode: row.currency_code,
          grossMonth: toNumber(row.gross_month),
          gross3m: toNumber(row.gross_3m),
          gross6m: toNumber(row.gross_6m),
          grossYear: toNumber(row.gross_year),
          salonMonth: toNumber(row.salon_month),
          salon3m: toNumber(row.salon_3m),
          salon6m: toNumber(row.salon_6m),
          salonYear: toNumber(row.salon_year),
          completedProceduresMonth: row.completed_procedures_month,
          clientsServedMonth: row.clients_served_month,
          avgCheckMonth: toNumber(row.avg_check_month),
          topMasters: [],
        }),
        client,
      );

      if (!details) {
        throw new ValidationError('Послугу не знайдено у цій студії', {
          studioId,
          serviceId,
        });
      }

      const topMasters = await queryMany<
        AdminPanelStatsServiceTopMasterRow,
        AdminPanelStatsServiceTopMasterItem
      >(
        SQL_LIST_ADMIN_PANEL_STATS_SERVICE_TOP_MASTERS,
        [studioId, serviceId, 5],
        mapServiceTopMasterRow,
        client,
      );

      return {
        ...details,
        topMasters,
      };
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-stats.helper',
      action: 'Failed to get admin panel service stats details',
      error,
      meta: { studioId, serviceId },
    });
    throw error;
  }
}
