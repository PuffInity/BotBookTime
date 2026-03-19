import type { AppointmentStatus } from '../db/index.js';

/**
 * @file db-profile-booking.types.ts
 * @summary Типи для DB helper розділу "Статус бронювання" у профілі.
 */

export type ProfileBookingStatusRow = {
  appointment_id: string;
  status: AppointmentStatus;
  start_at: Date;
  end_at: Date;
  studio_name: string;
  service_name: string;
  master_name: string;
  price_amount: string;
  currency_code: string;
};

export type ProfileBookingStatusItem = {
  appointmentId: string;
  status: AppointmentStatus;
  startAt: Date;
  endAt: Date;
  studioName: string;
  serviceName: string;
  masterName: string;
  priceAmount: string;
  currencyCode: string;
};

export type ProfileBookingStatusData = {
  upcoming: ProfileBookingStatusItem | null;
  recent: ProfileBookingStatusItem[];
};
