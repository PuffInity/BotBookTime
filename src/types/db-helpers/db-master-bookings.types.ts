/**
 * @file db-master-bookings.types.ts
 * @summary Типи для DB helper модуля "записи майстра" (панель майстра).
 */

export type MasterPendingBookingRow = {
  appointment_id: string;
  client_id: string;
  status: 'pending' | 'confirmed' | 'canceled';
  start_at: Date;
  end_at: Date;
  price_amount: string;
  currency_code: string;
  attendee_name: string | null;
  attendee_phone_e164: string | null;
  attendee_email: string | null;
  client_first_name: string;
  client_last_name: string | null;
  client_telegram_username: string | null;
  client_comment: string | null;
  service_name: string;
  studio_name: string;
  master_name: string;
};

export type MasterPendingBookingItem = {
  appointmentId: string;
  clientId: string;
  status: 'pending' | 'confirmed' | 'canceled';
  startAt: Date;
  endAt: Date;
  priceAmount: string;
  currencyCode: string;
  attendeeName: string | null;
  attendeePhoneE164: string | null;
  attendeeEmail: string | null;
  clientFirstName: string;
  clientLastName: string | null;
  clientTelegramUsername: string | null;
  clientComment: string | null;
  serviceName: string;
  studioName: string;
  masterName: string;
};

export type ListMasterPendingBookingsInput = {
  masterId: string | number;
  limit?: number;
};

export type ConfirmMasterPendingBookingInput = {
  masterId: string | number;
  appointmentId: string | number;
};

export type CancelMasterPendingBookingInput = {
  masterId: string | number;
  appointmentId: string | number;
  cancelReason?: string;
};
