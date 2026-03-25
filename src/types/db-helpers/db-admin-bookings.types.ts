/**
 * @file db-admin-bookings.types.ts
 * @summary Типи для блоку записів адмін-панелі.
 */

export type AdminBookingsCategory = 'pending' | 'today' | 'tomorrow' | 'all' | 'canceled';

export type AdminBookingRow = {
  appointment_id: string;
  client_id: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed' | 'transferred';
  start_at: string;
  end_at: string;
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

export type AdminBookingFeedRow = AdminBookingRow & {
  total_count: number;
};

export type AdminBookingItem = {
  appointmentId: string;
  clientId: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed' | 'transferred';
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

export type ListAdminBookingsFeedInput = {
  studioId: string | number;
  category: AdminBookingsCategory;
  limit?: number;
  offset?: number;
};

export type AdminBookingsFeedPage = {
  category: AdminBookingsCategory;
  limit: number;
  offset: number;
  total: number;
  items: AdminBookingItem[];
  hasPrevPage: boolean;
  hasNextPage: boolean;
};

export type GetAdminBookingCardByIdInput = {
  studioId: string | number;
  appointmentId: string | number;
};
