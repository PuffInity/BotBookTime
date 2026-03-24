import type { LanguageCode } from '../db/index.js';

/**
 * @file db-master-clients.types.ts
 * @summary Типи для DB helper блоку "Профіль клієнта" у панелі майстра.
 */

export type MasterClientProfileRow = {
  client_id: string;
  first_name: string;
  last_name: string | null;
  telegram_username: string | null;
  phone_e164: string | null;
  phone_verified: boolean;
  email: string | null;
  email_verified: boolean;
  preferred_language: LanguageCode;
  profile_created_at: Date;
  notifications_enabled: boolean;
  bookings_total: number;
  bookings_confirmed: number;
  bookings_completed: number;
  bookings_canceled: number;
  last_visit_at: Date | null;
};

export type MasterClientProfileItem = {
  clientId: string;
  firstName: string;
  lastName: string | null;
  telegramUsername: string | null;
  phoneE164: string | null;
  phoneVerified: boolean;
  email: string | null;
  emailVerified: boolean;
  preferredLanguage: LanguageCode;
  profileCreatedAt: Date;
  notificationsEnabled: boolean;
  bookingsTotal: number;
  bookingsConfirmed: number;
  bookingsCompleted: number;
  bookingsCanceled: number;
  lastVisitAt: Date | null;
};

export type GetMasterClientProfileByBookingInput = {
  masterId: string | number;
  appointmentId: string | number;
};

export type MasterClientBookingsHistoryRow = {
  appointment_id: string;
  service_name: string;
  price_amount: string;
  currency_code: string;
  start_at: Date;
  end_at: Date;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed' | 'transferred';
};

export type MasterClientBookingsHistoryItem = {
  appointmentId: string;
  serviceName: string;
  priceAmount: string;
  currencyCode: string;
  startAt: Date;
  endAt: Date;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed' | 'transferred';
};

export type GetMasterClientBookingsHistoryByBookingInput = {
  masterId: string | number;
  appointmentId: string | number;
  limit?: number;
};
