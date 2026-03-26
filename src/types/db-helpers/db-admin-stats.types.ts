/**
 * @file db-admin-stats.types.ts
 * @summary Типи для блоку статистики адмін-панелі.
 */

export type AdminPanelStatsOverviewRow = {
  currency_code: string;
  gross_month: string;
  gross_3m: string;
  gross_6m: string;
  gross_year: string;
  salon_month: string;
  salon_3m: string;
  salon_6m: string;
  salon_year: string;
  completed_procedures_month: number;
  unique_clients_month: number;
  avg_check_month: string;
};

export type AdminPanelStatsOverview = {
  currencyCode: string;
  grossMonth: number;
  gross3m: number;
  gross6m: number;
  grossYear: number;
  salonMonth: number;
  salon3m: number;
  salon6m: number;
  salonYear: number;
  completedProceduresMonth: number;
  uniqueClientsMonth: number;
  avgCheckMonth: number;
};
