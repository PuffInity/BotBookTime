import type {
  MasterFinanceBestMonthRow,
  MasterFinanceOverviewRow,
  MasterFinanceTopServiceRow,
  MasterPanelFinanceData,
} from '../../types/db-helpers/db-master-finance.types.js';
import { queryOne, withTransaction } from '../db.helper.js';
import {
  SQL_GET_MASTER_FINANCE_BEST_MONTH,
  SQL_GET_MASTER_FINANCE_OVERVIEW,
  SQL_GET_MASTER_FINANCE_TOP_SERVICE,
} from '../db-sql/db-master-finance.sql.js';
import { ValidationError } from '../../utils/error.utils.js';

/**
 * @file db-master-finance.helper.ts
 * @summary DB helper для фінансового блоку статистики майстра.
 */

/**
 * uk: Внутрішній helper метод normalizeMasterId.
 * en: Internal helper method normalizeMasterId.
 * cz: Interní helper metoda normalizeMasterId.
 */
function normalizeMasterId(masterIdInput: string | number): string {
  const normalized = String(masterIdInput).trim();
  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError('Некоректний masterId', { masterId: masterIdInput });
  }
  return normalized;
}

/**
 * uk: Внутрішній helper метод toNumber.
 * en: Internal helper method toNumber.
 * cz: Interní helper metoda toNumber.
 */
function toNumber(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return parsed;
}

/**
 * uk: Внутрішній helper метод mapOverviewRow.
 * en: Internal helper method mapOverviewRow.
 * cz: Interní helper metoda mapOverviewRow.
 */
function mapOverviewRow(row: MasterFinanceOverviewRow): Omit<
  MasterPanelFinanceData,
  'bestServiceName' | 'bestServiceAmount' | 'bestMonthStart' | 'bestMonthAmount'
> {
  return {
    grossMonth: toNumber(row.gross_month),
    gross3m: toNumber(row.gross_3m),
    gross6m: toNumber(row.gross_6m),
    grossYear: toNumber(row.gross_year),
    grossAllTime: toNumber(row.gross_all_time),
    salonMonth: toNumber(row.salon_month),
    salon3m: toNumber(row.salon_3m),
    salon6m: toNumber(row.salon_6m),
    salonYear: toNumber(row.salon_year),
    masterAllTime: toNumber(row.master_all_time),
    avgCheck: toNumber(row.avg_check),
  };
}

/**
 * @summary Повертає фінансову статистику майстра.
 */
export async function getMasterPanelFinance(masterIdInput: string | number): Promise<MasterPanelFinanceData> {
  const masterId = normalizeMasterId(masterIdInput);

  return await withTransaction(async (client) => {
    const overview = await queryOne<MasterFinanceOverviewRow, Omit<
      MasterPanelFinanceData,
      'bestServiceName' | 'bestServiceAmount' | 'bestMonthStart' | 'bestMonthAmount'
    >>(
      SQL_GET_MASTER_FINANCE_OVERVIEW,
      [masterId],
      mapOverviewRow,
      client,
    );

    if (!overview) {
      throw new ValidationError('Фінансову статистику майстра не знайдено');
    }

    const topService = await queryOne<MasterFinanceTopServiceRow, {
      name: string;
      amount: number;
    }>(
      SQL_GET_MASTER_FINANCE_TOP_SERVICE,
      [masterId],
      (row) => ({
        name: row.service_name,
        amount: toNumber(row.gross_amount),
      }),
      client,
    );

    const bestMonth = await queryOne<MasterFinanceBestMonthRow, {
      monthStart: Date;
      amount: number;
    }>(
      SQL_GET_MASTER_FINANCE_BEST_MONTH,
      [masterId],
      (row) => ({
        monthStart: new Date(row.month_start),
        amount: toNumber(row.gross_amount),
      }),
      client,
    );

    return {
      ...overview,
      bestServiceName: topService?.name ?? null,
      bestServiceAmount: topService?.amount ?? 0,
      bestMonthStart: bestMonth?.monthStart ?? null,
      bestMonthAmount: bestMonth?.amount ?? 0,
    };
  });
}
