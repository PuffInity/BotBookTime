import type {
  AdminPanelStatsClientDetails,
  AdminPanelStatsClientDetailsRow,
  AdminPanelStatsClientFeedItem,
  AdminPanelStatsClientFeedRow,
  AdminPanelStatsClientsFeedPage,
  AdminPanelStatsMasterDetails,
  AdminPanelStatsMasterFeedItem,
  AdminPanelStatsMasterFeedRow,
  AdminPanelStatsMastersFeedPage,
  AdminPanelStatsMonthlyFeedItem,
  AdminPanelStatsMonthlyFeedRow,
  AdminPanelStatsMonthlyFeedPage,
  AdminPanelStatsMonthlyReportDetails,
  AdminPanelStatsMonthlyReportDetailsRow,
  AdminPanelStatsMonthlyTopMasterItem,
  AdminPanelStatsMonthlyTopMasterRow,
  AdminPanelStatsMonthlyTopServiceItem,
  AdminPanelStatsMonthlyTopServiceRow,
  AdminPanelStatsOverview,
  AdminPanelStatsOverviewRow,
  AdminPanelStatsServiceDetails,
  AdminPanelStatsServiceDetailsRow,
  AdminPanelStatsServiceFeedItem,
  AdminPanelStatsServiceFeedRow,
  AdminPanelStatsServiceTopMasterItem,
  AdminPanelStatsServiceTopMasterRow,
  AdminPanelStatsServicesFeedPage,
  GetAdminPanelStatsMonthlyReportDetailsInput,
  GetAdminPanelStatsClientDetailsInput,
  GetAdminPanelStatsServiceDetailsInput,
  GetAdminPanelStatsMasterDetailsInput,
  ListAdminPanelStatsClientsFeedInput,
  ListAdminPanelStatsMonthlyFeedInput,
  ListAdminPanelStatsMastersFeedInput,
  ListAdminPanelStatsServicesFeedInput,
} from '../../types/db-helpers/db-admin-stats.types.js';
import { queryMany, queryOne, withTransaction } from '../db.helper.js';
import {
  SQL_GET_ADMIN_PANEL_STATS_CLIENT_DETAILS,
  SQL_GET_ADMIN_PANEL_STATS_MONTHLY_REPORT_DETAILS,
  SQL_GET_ADMIN_PANEL_STATS_SERVICE_DETAILS,
  SQL_GET_ADMIN_PANEL_STATS_OVERVIEW,
  SQL_LIST_ADMIN_PANEL_STATS_CLIENTS_FEED,
  SQL_LIST_ADMIN_PANEL_STATS_MONTHLY_FEED,
  SQL_LIST_ADMIN_PANEL_STATS_MONTHLY_TOP_MASTERS,
  SQL_LIST_ADMIN_PANEL_STATS_MONTHLY_TOP_SERVICES,
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

function normalizeClientId(value: string | number): string {
  const normalized = String(value).trim();
  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError('Некоректний clientId', { clientId: value });
  }
  return normalized;
}

function normalizeMonthCode(value: string): string {
  const normalized = String(value).trim();
  const match = normalized.match(/^(\d{4})(\d{2})$/);
  if (!match) {
    throw new ValidationError('Некоректний monthCode', { monthCode: value });
  }

  const month = Number(match[2]);
  if (month < 1 || month > 12) {
    throw new ValidationError('Некоректний monthCode', { monthCode: value });
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

function mapClientFeedRow(row: AdminPanelStatsClientFeedRow): AdminPanelStatsClientFeedItem {
  const firstName = row.first_name.trim();
  const lastName = row.last_name?.trim() ?? '';
  const fullName = `${firstName}${lastName ? ` ${lastName}` : ''}`.trim();

  return {
    clientId: row.client_id,
    fullName: fullName || `ID ${row.client_id}`,
    currencyCode: row.currency_code,
    spentTotal: toNumber(row.spent_total),
    proceduresTotal: row.procedures_total,
    avgCheck: toNumber(row.avg_check),
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

function mapMonthlyFeedRow(row: AdminPanelStatsMonthlyFeedRow): AdminPanelStatsMonthlyFeedItem {
  return {
    monthCode: row.month_code,
    currencyCode: row.currency_code,
    grossMonth: toNumber(row.gross_month),
    salonMonth: toNumber(row.salon_month),
    completedProceduresMonth: row.completed_procedures_month,
  };
}

function mapMonthlyTopServiceRow(
  row: AdminPanelStatsMonthlyTopServiceRow,
): AdminPanelStatsMonthlyTopServiceItem {
  return {
    serviceId: row.service_id,
    serviceName: row.service_name,
    grossAmount: toNumber(row.gross_amount),
  };
}

function mapMonthlyTopMasterRow(
  row: AdminPanelStatsMonthlyTopMasterRow,
): AdminPanelStatsMonthlyTopMasterItem {
  return {
    masterId: row.master_id,
    displayName: row.display_name,
    grossAmount: toNumber(row.gross_amount),
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

/**
 * @summary Повертає сторінку місячних фінансових звітів студії.
 */
export async function listAdminPanelStatsMonthlyFeed(
  input: ListAdminPanelStatsMonthlyFeedInput,
): Promise<AdminPanelStatsMonthlyFeedPage> {
  const studioId = normalizeStudioId(input.studioId);
  const limit = normalizeLimit(input.limit);
  const offset = normalizeOffset(input.offset);

  try {
    return await withTransaction(async (client) => {
      const rows = await queryMany<AdminPanelStatsMonthlyFeedRow, AdminPanelStatsMonthlyFeedRow>(
        SQL_LIST_ADMIN_PANEL_STATS_MONTHLY_FEED,
        [studioId, limit, offset],
        (row) => row,
        client,
      );

      const total = rows.length > 0 ? rows[0].total_count : 0;
      const items = rows.map(mapMonthlyFeedRow);
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
      action: 'Failed to list admin panel monthly stats feed',
      error,
      meta: { studioId, limit, offset },
    });
    throw error;
  }
}

/**
 * @summary Повертає детальний фінансовий звіт по вибраному місяцю.
 */
export async function getAdminPanelStatsMonthlyReportDetails(
  input: GetAdminPanelStatsMonthlyReportDetailsInput,
): Promise<AdminPanelStatsMonthlyReportDetails> {
  const studioId = normalizeStudioId(input.studioId);
  const monthCode = normalizeMonthCode(input.monthCode);

  try {
    return await withTransaction(async (client) => {
      const summary = await queryOne<
        AdminPanelStatsMonthlyReportDetailsRow,
        AdminPanelStatsMonthlyReportDetails
      >(
        SQL_GET_ADMIN_PANEL_STATS_MONTHLY_REPORT_DETAILS,
        [studioId, monthCode],
        (row) => ({
          monthCode: row.month_code,
          currencyCode: row.currency_code,
          grossMonth: toNumber(row.gross_month),
          salonMonth: toNumber(row.salon_month),
          masterEarningsMonth: toNumber(row.master_earnings_month),
          completedProceduresMonth: row.completed_procedures_month,
          clientsCountMonth: row.clients_count_month,
          avgCheckMonth: toNumber(row.avg_check_month),
          topServices: [],
          topMasters: [],
        }),
        client,
      );

      if (!summary) {
        throw new ValidationError('Не вдалося сформувати звіт за обраний місяць', {
          studioId,
          monthCode,
        });
      }

      const [topServices, topMasters] = await Promise.all([
        queryMany<AdminPanelStatsMonthlyTopServiceRow, AdminPanelStatsMonthlyTopServiceItem>(
          SQL_LIST_ADMIN_PANEL_STATS_MONTHLY_TOP_SERVICES,
          [studioId, monthCode, 3],
          mapMonthlyTopServiceRow,
          client,
        ),
        queryMany<AdminPanelStatsMonthlyTopMasterRow, AdminPanelStatsMonthlyTopMasterItem>(
          SQL_LIST_ADMIN_PANEL_STATS_MONTHLY_TOP_MASTERS,
          [studioId, monthCode, 3],
          mapMonthlyTopMasterRow,
          client,
        ),
      ]);

      return {
        ...summary,
        topServices,
        topMasters,
      };
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-stats.helper',
      action: 'Failed to get admin panel monthly report details',
      error,
      meta: { studioId, monthCode },
    });
    throw error;
  }
}

/**
 * @summary Повертає сторінку фінансової статистики клієнтів студії.
 */
export async function listAdminPanelStatsClientsFeed(
  input: ListAdminPanelStatsClientsFeedInput,
): Promise<AdminPanelStatsClientsFeedPage> {
  const studioId = normalizeStudioId(input.studioId);
  const limit = normalizeLimit(input.limit);
  const offset = normalizeOffset(input.offset);

  try {
    return await withTransaction(async (client) => {
      const rows = await queryMany<AdminPanelStatsClientFeedRow, AdminPanelStatsClientFeedRow>(
        SQL_LIST_ADMIN_PANEL_STATS_CLIENTS_FEED,
        [studioId, limit, offset],
        (row) => row,
        client,
      );

      const total = rows.length > 0 ? rows[0].total_count : 0;
      const items = rows.map(mapClientFeedRow);
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
      action: 'Failed to list admin panel clients stats feed',
      error,
      meta: { studioId, limit, offset },
    });
    throw error;
  }
}

/**
 * @summary Повертає деталізовану фінансову статистику конкретного клієнта.
 */
export async function getAdminPanelStatsClientDetails(
  input: GetAdminPanelStatsClientDetailsInput,
): Promise<AdminPanelStatsClientDetails> {
  const studioId = normalizeStudioId(input.studioId);
  const clientId = normalizeClientId(input.clientId);

  try {
    return await withTransaction(async (dbClient) => {
      const details = await queryOne<AdminPanelStatsClientDetailsRow, AdminPanelStatsClientDetails>(
        SQL_GET_ADMIN_PANEL_STATS_CLIENT_DETAILS,
        [studioId, clientId],
        (row) => {
          const firstName = row.first_name.trim();
          const lastName = row.last_name?.trim() ?? '';
          const fullName = `${firstName}${lastName ? ` ${lastName}` : ''}`.trim();

          return {
            clientId: row.client_id,
            fullName: fullName || `ID ${row.client_id}`,
            currencyCode: row.currency_code,
            spentMonth: toNumber(row.spent_month),
            spent3m: toNumber(row.spent_3m),
            spent6m: toNumber(row.spent_6m),
            spentYear: toNumber(row.spent_year),
            spentTotal: toNumber(row.spent_total),
            salonMonth: toNumber(row.salon_month),
            salon3m: toNumber(row.salon_3m),
            salon6m: toNumber(row.salon_6m),
            salonYear: toNumber(row.salon_year),
            salonTotal: toNumber(row.salon_total),
            avgCheck: toNumber(row.avg_check),
            proceduresTotal: row.procedures_total,
            lastVisitAt: row.last_visit_at ? new Date(row.last_visit_at) : null,
            mostExpensiveServiceName: row.most_expensive_service_name,
            mostExpensiveServiceAmount: toNumber(row.most_expensive_service_amount),
          };
        },
        dbClient,
      );

      if (!details) {
        throw new ValidationError('Клієнта не знайдено у цій студії', {
          studioId,
          clientId,
        });
      }

      return details;
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-stats.helper',
      action: 'Failed to get admin panel client stats details',
      error,
      meta: { studioId, clientId },
    });
    throw error;
  }
}
