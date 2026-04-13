/**
 * @file db-admin-schedule.types.ts
 * @summary uk: Типи для DB helper блоку "Розклад" в адмін-панелі.
 * en: DB helper type definitions.
 * cz: DB helper type definitions.
 */

export type AdminStudioWeeklyHoursRow = {
  weekday: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
};

export type AdminStudioDayOffRow = {
  id: string;
  off_date: Date;
  reason: string | null;
};

export type AdminStudioHolidayRow = {
  id: string;
  holiday_date: Date;
  holiday_name: string;
};

export type AdminStudioTemporaryHoursRow = {
  id: string;
  date_from: Date;
  date_to: Date;
  weekday: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  note: string | null;
};

export type AdminStudioWeeklyHoursItem = {
  weekday: number;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
};

export type AdminStudioDayOffItem = {
  id: string;
  offDate: Date;
  reason: string | null;
};

export type AdminStudioHolidayItem = {
  id: string;
  holidayDate: Date;
  holidayName: string;
};

export type AdminStudioTemporaryHoursItem = {
  id: string;
  dateFrom: Date;
  dateTo: Date;
  weekday: number;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
  note: string | null;
};

export type AdminStudioScheduleData = {
  weeklyHours: AdminStudioWeeklyHoursItem[];
  upcomingDaysOff: AdminStudioDayOffItem[];
  upcomingHolidays: AdminStudioHolidayItem[];
  upcomingTemporaryHours: AdminStudioTemporaryHoursItem[];
};

export type AdminStudioExistsForDateRow = {
  already_exists: boolean;
};

export type AdminStudioActiveBookingsCountRow = {
  active_count: number;
};

export type CreateAdminStudioDayOffInput = {
  studioId: string | number;
  offDate: Date | string;
  reason?: string | null;
  createdBy?: string | number | null;
};

export type CreateAdminStudioHolidayInput = {
  studioId: string | number;
  holidayDate: Date | string;
  holidayName: string;
  createdBy?: string | number | null;
};

export type DeleteAdminStudioDayOffInput = {
  studioId: string | number;
  dayOffId: string | number;
};

export type DeleteAdminStudioHolidayInput = {
  studioId: string | number;
  holidayId: string | number;
};

export type AdminStudioTemporaryScheduleDayInput = {
  weekday: number;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
};

export type CreateAdminStudioTemporaryScheduleInput = {
  studioId: string | number;
  dateFrom: Date | string;
  dateTo: Date | string;
  days: AdminStudioTemporaryScheduleDayInput[];
  note?: string | null;
  createdBy?: string | number | null;
};

export type DeleteAdminStudioTemporarySchedulePeriodInput = {
  studioId: string | number;
  dateFrom: Date | string;
  dateTo: Date | string;
};

export type AdminStudioTemporaryHoursOverlapRow = {
  already_exists: boolean;
};

export type AdminInsertedStudioDayOffRow = {
  id: string;
  off_date: Date;
  reason: string | null;
};

export type AdminInsertedStudioHolidayRow = {
  id: string;
  holiday_date: Date;
  holiday_name: string;
};

export type AdminUpsertedStudioWeeklyHoursRow = {
  weekday: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
};

export type UpdateAdminStudioWeeklyDayInput = {
  studioId: string | number;
  weekday: number;
  isOpen: boolean;
  openTime?: string | null;
  closeTime?: string | null;
};
