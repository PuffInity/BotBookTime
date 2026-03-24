/**
 * @file db-master-finance.types.ts
 * @summary Типи для фінансового підблоку статистики майстра.
 */

export type MasterFinanceOverviewRow = {
  gross_month: string | number;
  gross_3m: string | number;
  gross_6m: string | number;
  gross_year: string | number;
  gross_all_time: string | number;
  salon_month: string | number;
  salon_3m: string | number;
  salon_6m: string | number;
  salon_year: string | number;
  master_all_time: string | number;
  avg_check: string | number;
};

export type MasterFinanceTopServiceRow = {
  service_name: string;
  gross_amount: string | number;
};

export type MasterFinanceBestMonthRow = {
  month_start: Date;
  gross_amount: string | number;
};

export type MasterPanelFinanceData = {
  grossMonth: number;
  gross3m: number;
  gross6m: number;
  grossYear: number;
  grossAllTime: number;
  salonMonth: number;
  salon3m: number;
  salon6m: number;
  salonYear: number;
  masterAllTime: number;
  avgCheck: number;
  bestServiceName: string | null;
  bestServiceAmount: number;
  bestMonthStart: Date | null;
  bestMonthAmount: number;
};

