/**
 * @file db-admin-schedule.types.ts
 * @summary Типи для DB helper блоку "Розклад" в адмін-панелі.
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

