import type { AppointmentsEntity } from '../db/index.js';
import type { MasterBookingOption } from './db-masters.types.js';
import type { ServicesCatalogItem } from './db-services.types.js';

/**
 * @file db-booking.types.ts
 * @summary uk: Типи для DB бронювання.
 * en: Types for booking DB helper.
 * cz: Typy pro booking DB helper.
 */

export type MasterServiceBookingMetaRow = {
  studio_id: string;
  studio_name: string;
  studio_timezone: string;
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
  studioTimezone: string;
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

export type MasterScheduleAvailabilityRow = {
  is_available: boolean;
  reason_code: string | null;
};

export type BookingAvailableTimeCodeRow = {
  time_code: string;
};

export type BookingAvailableMasterRow = {
  master_id: string;
  studio_id: string;
  display_name: string;
  rating_avg: string;
  rating_count: number;
  experience_years: number | null;
};

export type ListBookableServicesForBookingInput = {
  studioId?: string | null;
  limit?: number;
};

export type ListAvailableTimeCodesForBookingDateInput = {
  studioId: string;
  serviceId: string;
  dateCode: string;
  timeCodes: string[];
};

export type ListAvailableMastersForBookingSlotInput = {
  studioId: string;
  serviceId: string;
  dateCode: string;
  timeCode: string;
};

export type ListBookableServicesForBookingResult = ServicesCatalogItem[];

export type ListAvailableMastersForBookingSlotResult = MasterBookingOption[];
