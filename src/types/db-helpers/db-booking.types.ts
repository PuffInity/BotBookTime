import type { AppointmentsEntity } from '../db/index.js';

/**
 * @file db-booking.types.ts
 * @summary Типи для DB helper модуля створення бронювання.
 */

export type MasterServiceBookingMetaRow = {
  studio_id: string;
  studio_name: string;
  service_id: string;
  service_name: string;
  master_id: string;
  master_display_name: string;
  duration_minutes: number;
  price_amount: string;
  currency_code: string;
};

export type MasterServiceBookingMeta = {
  studioId: string;
  studioName: string;
  serviceId: string;
  serviceName: string;
  masterId: string;
  masterDisplayName: string;
  durationMinutes: number;
  priceAmount: string;
  currencyCode: string;
};

export type CreatePendingBookingInput = {
  clientId: string;
  studioId: string;
  serviceId: string;
  masterId: string;
  attendeeName: string;
  attendeePhoneE164: string;
  startAt: Date;
};

export type CreatePendingBookingResult = {
  appointment: AppointmentsEntity;
  meta: MasterServiceBookingMeta;
};

export type BookingConflictRow = {
  has_conflict: boolean;
};
