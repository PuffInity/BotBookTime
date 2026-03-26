import type {
  AdminPanelStatsOverview,
  AdminPanelStatsOverviewRow,
} from '../../types/db-helpers/db-admin-stats.types.js';
import { queryOne, withTransaction } from '../db.helper.js';
import { SQL_GET_ADMIN_PANEL_STATS_OVERVIEW } from '../db-sql/db-admin-stats.sql.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';

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
