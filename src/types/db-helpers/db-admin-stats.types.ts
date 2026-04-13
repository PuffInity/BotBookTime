/**
 * @file db-admin-stats.types.ts
 * @summary uk: Типи для блоку статистики адмін-панелі.
 * en: DB helper type definitions.
 * cz: DB helper type definitions.
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

export type AdminPanelStatsMasterFeedRow = {
  master_id: string;
  display_name: string;
  currency_code: string;
  completed_procedures_month: number;
  clients_served_month: number;
  gross_month: string;
  salon_month: string;
  avg_check_month: string;
  total_count: number;
};

export type AdminPanelStatsMasterFeedItem = {
  masterId: string;
  displayName: string;
  currencyCode: string;
  completedProceduresMonth: number;
  clientsServedMonth: number;
  grossMonth: number;
  salonMonth: number;
  avgCheckMonth: number;
};

export type AdminPanelStatsMastersFeedPage = {
  limit: number;
  offset: number;
  total: number;
  currencyCode: string;
  items: AdminPanelStatsMasterFeedItem[];
  hasPrevPage: boolean;
  hasNextPage: boolean;
};

export type ListAdminPanelStatsMastersFeedInput = {
  studioId: string | number;
  limit?: number;
  offset?: number;
};

export type GetAdminPanelStatsMasterDetailsInput = {
  studioId: string | number;
  masterId: string | number;
};

export type AdminPanelStatsMasterTopServiceItem = {
  serviceName: string;
  completedCount: number;
};

export type AdminPanelStatsMasterDetails = {
  masterId: string;
  displayName: string;
  currencyCode: string;
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
  completedProceduresMonth: number;
  clientsServedMonth: number;
  workloadPercentMonth: number;
  repeatClientsPercentMonth: number;
  newClientsMonth: number;
  bookingsThisWeek: number;
  bookingsToday: number;
  topServices: AdminPanelStatsMasterTopServiceItem[];
};

export type AdminPanelStatsServiceFeedRow = {
  service_id: string;
  service_name: string;
  currency_code: string;
  completed_procedures_month: number;
  clients_served_month: number;
  gross_month: string;
  salon_month: string;
  avg_check_month: string;
  total_count: number;
};

export type AdminPanelStatsServiceFeedItem = {
  serviceId: string;
  serviceName: string;
  currencyCode: string;
  completedProceduresMonth: number;
  clientsServedMonth: number;
  grossMonth: number;
  salonMonth: number;
  avgCheckMonth: number;
};

export type AdminPanelStatsServicesFeedPage = {
  limit: number;
  offset: number;
  total: number;
  currencyCode: string;
  items: AdminPanelStatsServiceFeedItem[];
  hasPrevPage: boolean;
  hasNextPage: boolean;
};

export type ListAdminPanelStatsServicesFeedInput = {
  studioId: string | number;
  limit?: number;
  offset?: number;
};

export type GetAdminPanelStatsServiceDetailsInput = {
  studioId: string | number;
  serviceId: string | number;
};

export type AdminPanelStatsServiceDetailsRow = {
  service_id: string;
  service_name: string;
  duration_minutes: number;
  base_price: string;
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
  clients_served_month: number;
  avg_check_month: string;
};

export type AdminPanelStatsServiceTopMasterRow = {
  master_id: string;
  display_name: string;
  completed_count: number;
};

export type AdminPanelStatsServiceTopMasterItem = {
  masterId: string;
  displayName: string;
  completedCount: number;
};

export type AdminPanelStatsServiceDetails = {
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  basePrice: number;
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
  clientsServedMonth: number;
  avgCheckMonth: number;
  topMasters: AdminPanelStatsServiceTopMasterItem[];
};

export type AdminPanelStatsMonthlyFeedRow = {
  month_code: string;
  currency_code: string;
  gross_month: string;
  salon_month: string;
  completed_procedures_month: number;
  total_count: number;
};

export type AdminPanelStatsMonthlyFeedItem = {
  monthCode: string;
  currencyCode: string;
  grossMonth: number;
  salonMonth: number;
  completedProceduresMonth: number;
};

export type AdminPanelStatsMonthlyFeedPage = {
  limit: number;
  offset: number;
  total: number;
  currencyCode: string;
  items: AdminPanelStatsMonthlyFeedItem[];
  hasPrevPage: boolean;
  hasNextPage: boolean;
};

export type ListAdminPanelStatsMonthlyFeedInput = {
  studioId: string | number;
  limit?: number;
  offset?: number;
};

export type GetAdminPanelStatsMonthlyReportDetailsInput = {
  studioId: string | number;
  monthCode: string;
};

export type AdminPanelStatsMonthlyReportDetailsRow = {
  month_code: string;
  currency_code: string;
  gross_month: string;
  salon_month: string;
  master_earnings_month: string;
  completed_procedures_month: number;
  clients_count_month: number;
  avg_check_month: string;
};

export type AdminPanelStatsMonthlyTopServiceRow = {
  service_id: string;
  service_name: string;
  gross_amount: string;
};

export type AdminPanelStatsMonthlyTopMasterRow = {
  master_id: string;
  display_name: string;
  gross_amount: string;
};

export type AdminPanelStatsMonthlyTopServiceItem = {
  serviceId: string;
  serviceName: string;
  grossAmount: number;
};

export type AdminPanelStatsMonthlyTopMasterItem = {
  masterId: string;
  displayName: string;
  grossAmount: number;
};

export type AdminPanelStatsMonthlyReportDetails = {
  monthCode: string;
  currencyCode: string;
  grossMonth: number;
  salonMonth: number;
  masterEarningsMonth: number;
  completedProceduresMonth: number;
  clientsCountMonth: number;
  avgCheckMonth: number;
  topServices: AdminPanelStatsMonthlyTopServiceItem[];
  topMasters: AdminPanelStatsMonthlyTopMasterItem[];
};

export type AdminPanelStatsClientFeedRow = {
  client_id: string;
  first_name: string;
  last_name: string | null;
  currency_code: string;
  spent_total: string;
  procedures_total: number;
  avg_check: string;
  total_count: number;
};

export type AdminPanelStatsClientFeedItem = {
  clientId: string;
  fullName: string;
  currencyCode: string;
  spentTotal: number;
  proceduresTotal: number;
  avgCheck: number;
};

export type AdminPanelStatsClientsFeedPage = {
  limit: number;
  offset: number;
  total: number;
  currencyCode: string;
  items: AdminPanelStatsClientFeedItem[];
  hasPrevPage: boolean;
  hasNextPage: boolean;
};

export type ListAdminPanelStatsClientsFeedInput = {
  studioId: string | number;
  limit?: number;
  offset?: number;
};

export type GetAdminPanelStatsClientDetailsInput = {
  studioId: string | number;
  clientId: string | number;
};

export type AdminPanelStatsClientDetailsRow = {
  client_id: string;
  first_name: string;
  last_name: string | null;
  currency_code: string;
  spent_month: string;
  spent_3m: string;
  spent_6m: string;
  spent_year: string;
  spent_total: string;
  salon_month: string;
  salon_3m: string;
  salon_6m: string;
  salon_year: string;
  salon_total: string;
  avg_check: string;
  procedures_total: number;
  last_visit_at: Date | null;
  most_expensive_service_name: string | null;
  most_expensive_service_amount: string;
};

export type AdminPanelStatsClientDetails = {
  clientId: string;
  fullName: string;
  currencyCode: string;
  spentMonth: number;
  spent3m: number;
  spent6m: number;
  spentYear: number;
  spentTotal: number;
  salonMonth: number;
  salon3m: number;
  salon6m: number;
  salonYear: number;
  salonTotal: number;
  avgCheck: number;
  proceduresTotal: number;
  lastVisitAt: Date | null;
  mostExpensiveServiceName: string | null;
  mostExpensiveServiceAmount: number;
};
