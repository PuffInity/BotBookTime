import type { LanguageCode } from '../db/dbEnums.type.js';

/**
 * @file db-booking-expiration.types.ts
 * @summary Типи для DB helper автоматичного скасування прострочених pending-бронювань.
 */

export type ExpiredPendingBookingRow = {
  appointment_id: string;
  client_id: string;
  start_at: Date;
  recipient_name: string;
  recipient_email: string | null;
  preferred_language: LanguageCode;
  studio_name: string;
  service_name: string;
  master_name: string;
};

export type ExpiredPendingBookingItem = {
  appointmentId: string;
  clientId: string;
  startAt: Date;
  recipientName: string;
  recipientEmail: string | null;
  preferredLanguage: LanguageCode;
  studioName: string;
  serviceName: string;
  masterName: string;
};

export type ExpirePendingBookingsInput = {
  limit?: number;
  cancelReason?: string;
};
