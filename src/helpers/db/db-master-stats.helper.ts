import type {
  MasterPanelStatsData,
  MasterStatsOverviewRow,
  MasterStatsTopServiceItem,
  MasterStatsTopServiceRow,
} from '../../types/db-helpers/db-master-stats.types.js';
import { queryMany, queryOne, withTransaction } from '../db.helper.js';
import {
  SQL_GET_MASTER_PANEL_STATS_OVERVIEW,
  SQL_GET_MASTER_PANEL_STATS_TOP_SERVICES,
} from '../db-sql/db-master-stats.sql.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';

/**
 * @file db-master-stats.helper.ts
 * @summary DB helper для блоку "Моя статистика" у панелі майстра.
 */

function normalizeMasterId(masterIdInput: string | number): string {
  const normalized = String(masterIdInput).trim();
  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError('Некоректний masterId', { masterId: masterIdInput });
  }
  return normalized;
}

function mapOverviewRow(row: MasterStatsOverviewRow): Omit<MasterPanelStatsData, 'topServices'> {
  return {
    completedProceduresMonth: row.completed_procedures_month,
    clientsServedMonth: row.clients_served_month,
    workloadPercentMonth: row.workload_percent_month,
    repeatClientsPercentMonth: row.repeat_clients_percent_month,
    newClientsMonth: row.new_clients_month,
    bookingsThisWeek: row.bookings_this_week,
    bookingsToday: row.bookings_today,
  };
}

function mapTopServiceRow(row: MasterStatsTopServiceRow): MasterStatsTopServiceItem {
  return {
    serviceName: row.service_name,
    completedCount: row.completed_count,
  };
}

/**
 * @summary Повертає статистику майстра за поточний місяць.
 */
export async function getMasterPanelStats(masterIdInput: string | number): Promise<MasterPanelStatsData> {
  const masterId = normalizeMasterId(masterIdInput);

  try {
    return await withTransaction(async (client) => {
      const overview = await queryOne<MasterStatsOverviewRow, Omit<MasterPanelStatsData, 'topServices'>>(
        SQL_GET_MASTER_PANEL_STATS_OVERVIEW,
        [masterId],
        mapOverviewRow,
        client,
      );

      if (!overview) {
        throw new ValidationError('Статистику майстра не знайдено');
      }

      const topServices = await queryMany<MasterStatsTopServiceRow, MasterStatsTopServiceItem>(
        SQL_GET_MASTER_PANEL_STATS_TOP_SERVICES,
        [masterId],
        mapTopServiceRow,
        client,
      );

      return {
        ...overview,
        topServices,
      };
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-stats.helper',
      action: 'Failed to load master panel stats',
      error,
      meta: { masterId },
    });
    throw error;
  }
}

