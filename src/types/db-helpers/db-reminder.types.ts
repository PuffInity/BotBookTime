import type { AppointmentSource, AppointmentStatus } from '../db/dbEnums.type.js';

/**
 * @file db-reminder.types.ts
 * @summary uk: Типи reminder helper.
 * en: Types for reminder helper.
 * cz: Typy pro reminder helper.
 */

export type StudioReminderSettingsRow = {
  reminder_before_hours: number;
};

export type ReminderAppointmentRow = {
  id: string;
  studio_id: string;
  client_id: string;
  booked_for_user_id: string | null;
  master_id: string;
  service_id: string;
  source: AppointmentSource;
  status: AppointmentStatus;
  attendee_name: string | null;
  attendee_phone_e164: string | null;
  attendee_email: string | null;
  client_comment: string | null;
  internal_comment: string | null;
  start_at: string | Date;
  end_at: string | Date;
  slot: string | null;
  price_amount: string;
  currency_code: string;
  created_by: string | null;
  updated_by: string | null;
  confirmed_at: string | Date | null;
  canceled_at: string | Date | null;
  completed_at: string | Date | null;
  transferred_at: string | Date | null;
  canceled_reason: string | null;
  deleted_at: string | Date | null;
  deleted_by: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  studio_name: string;
  studio_timezone: string;
  service_name: string;
  master_display_name: string;
};

export type ActiveStudioIdRow = {
  studio_id: string | number;
};
