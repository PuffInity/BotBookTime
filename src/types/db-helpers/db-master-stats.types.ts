/**
 * @file db-master-stats.types.ts
 * @summary Типи для блоку статистики панелі майстра.
 */

export type MasterStatsOverviewRow = {
  completed_procedures_month: number;
  clients_served_month: number;
  workload_percent_month: number;
  repeat_clients_percent_month: number;
  new_clients_month: number;
  bookings_this_week: number;
  bookings_today: number;
};

export type MasterStatsTopServiceRow = {
  service_name: string;
  completed_count: number;
};

export type MasterStatsTopServiceItem = {
  serviceName: string;
  completedCount: number;
};

export type MasterPanelStatsData = {
  completedProceduresMonth: number;
  clientsServedMonth: number;
  workloadPercentMonth: number;
  repeatClientsPercentMonth: number;
  newClientsMonth: number;
  bookingsThisWeek: number;
  bookingsToday: number;
  topServices: MasterStatsTopServiceItem[];
};

