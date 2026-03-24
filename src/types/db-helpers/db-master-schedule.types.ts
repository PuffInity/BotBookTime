/**
 * @file db-master-schedule.types.ts
 * @summary Типи для DB helper блоку "Мій розклад" у панелі майстра.
 */

export type MasterScheduleWeeklyRow = {
  weekday: number;
  is_working: boolean;
  open_time: string | null;
  close_time: string | null;
};

export type MasterScheduleDayOffRow = {
  off_date: Date;
  reason: string | null;
};

export type MasterScheduleVacationRow = {
  date_from: Date;
  date_to: Date;
  reason: string | null;
};

export type MasterScheduleTemporaryHoursRow = {
  date_from: Date;
  date_to: Date;
  weekday: number;
  is_working: boolean;
  open_time: string | null;
  close_time: string | null;
  note: string | null;
};

export type MasterScheduleWeeklyItem = {
  weekday: number;
  isWorking: boolean;
  openTime: string | null;
  closeTime: string | null;
};

export type MasterScheduleDayOffItem = {
  offDate: Date;
  reason: string | null;
};

export type MasterScheduleVacationItem = {
  dateFrom: Date;
  dateTo: Date;
  reason: string | null;
};

export type MasterScheduleTemporaryHoursItem = {
  dateFrom: Date;
  dateTo: Date;
  weekday: number;
  isWorking: boolean;
  openTime: string | null;
  closeTime: string | null;
  note: string | null;
};

export type MasterPanelScheduleData = {
  weeklyHours: MasterScheduleWeeklyItem[];
  upcomingDaysOff: MasterScheduleDayOffItem[];
  upcomingVacations: MasterScheduleVacationItem[];
  upcomingTemporaryHours: MasterScheduleTemporaryHoursItem[];
};

export type MasterScheduleDayOffExistsRow = {
  already_exists: boolean;
};

export type MasterScheduleActiveBookingsCountRow = {
  active_count: number;
};

export type MasterScheduleVacationOverlapRow = {
  already_exists: boolean;
};

export type MasterInsertedDayOffRow = {
  id: string;
  off_date: Date;
  reason: string | null;
};

export type CreateMasterDayOffInput = {
  masterId: string | number;
  offDate: Date | string;
  reason?: string | null;
  createdBy?: string | number | null;
};

export type CreatedMasterDayOffItem = {
  id: string;
  offDate: Date;
  reason: string | null;
};

export type MasterInsertedVacationRow = {
  id: string;
  date_from: Date;
  date_to: Date;
  reason: string | null;
};

export type CreateMasterVacationInput = {
  masterId: string | number;
  dateFrom: Date | string;
  dateTo: Date | string;
  reason?: string | null;
  createdBy?: string | number | null;
};

export type CreatedMasterVacationItem = {
  id: string;
  dateFrom: Date;
  dateTo: Date;
  reason: string | null;
};
