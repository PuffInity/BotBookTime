import type { AppointmentsEntity } from '../../types/db/index.js';
import { queryMany, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import { SQL_GET_STUDIO_REMINDER_SETTINGS, SQL_LIST_UPCOMING_CONFIRMED_APPOINTMENTS_FOR_REMINDER } from '../db-sql/db-reminder.sql.js';

/**
 * @file db-reminder.helper.ts
 * @summary DB helper для нагадувань про візити.
 */

export type ReminderAppointment = {
  appointment: AppointmentsEntity;
  studioName: string;
  studioTimezone: string;
  serviceName: string;
  masterDisplayName: string;
  attendeeName: string | null;
  attendeePhoneE164: string | null;
  attendeeEmail: string | null;
};

export type StudioReminderSettings = {
  reminderBeforeHours: number;
};

/**
 * @summary Повертає налаштування нагадувань для студії.
 */
export async function getStudioReminderSettings(studioId: string): Promise<StudioReminderSettings> {
  const normalizedStudioId = studioId.trim();
  if (!/^\d+$/.test(normalizedStudioId) || normalizedStudioId === '0') {
    throw new ValidationError('Некоректний studioId', { studioId });
  }

  try {
    return await withTransaction(async (client) => {
      const rows = await queryMany<any, StudioReminderSettings>(
        SQL_GET_STUDIO_REMINDER_SETTINGS,
        [normalizedStudioId],
        (row) => ({
          reminderBeforeHours: row.reminder_before_hours,
        }),
        client,
      );

      if (rows.length === 0) {
        throw new ValidationError('Налаштування студії не знайдені');
      }

      return rows[0];
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-reminder.helper',
      action: 'Failed to get studio reminder settings',
      error,
      meta: { studioId },
    });
    throw error;
  }
}

/**
 * @summary Повертає список підтверджених візитів, які наближаються до часу нагадування.
 */
export async function listUpcomingConfirmedAppointmentsForReminder(
  studioId: string,
  reminderBeforeHours: number,
): Promise<ReminderAppointment[]> {
  const normalizedStudioId = studioId.trim();
  if (!/^\d+$/.test(normalizedStudioId) || normalizedStudioId === '0') {
    throw new ValidationError('Некоректний studioId', { studioId });
  }

  if (!Number.isFinite(reminderBeforeHours) || reminderBeforeHours < 1 || reminderBeforeHours > 168) {
    throw new ValidationError('Некоректний reminderBeforeHours', { reminderBeforeHours });
  }

  try {
    return await withTransaction(async (client) => {
      const now = new Date();
      const reminderWindowEnd = new Date(now.getTime() + reminderBeforeHours * 60 * 60 * 1000);

      return await queryMany<any, ReminderAppointment>(
        SQL_LIST_UPCOMING_CONFIRMED_APPOINTMENTS_FOR_REMINDER,
        [normalizedStudioId, now.toISOString(), reminderWindowEnd.toISOString()],
        (row) => ({
          appointment: {
            id: row.id,
            studioId: row.studio_id,
            clientId: row.client_id,
            bookedForUserId: row.booked_for_user_id,
            masterId: row.master_id,
            serviceId: row.service_id,
            source: row.source,
            status: row.status,
            attendeeName: row.attendee_name,
            attendeePhoneE164: row.attendee_phone_e164,
            attendeeEmail: row.attendee_email,
            clientComment: row.client_comment,
            internalComment: row.internal_comment,
            startAt: new Date(row.start_at),
            endAt: new Date(row.end_at),
            slot: row.slot,
            priceAmount: row.price_amount,
            currencyCode: row.currency_code,
            createdBy: row.created_by,
            updatedBy: row.updated_by,
            confirmedAt: row.confirmed_at ? new Date(row.confirmed_at) : null,
            canceledAt: row.canceled_at ? new Date(row.canceled_at) : null,
            completedAt: row.completed_at ? new Date(row.completed_at) : null,
            transferredAt: row.transferred_at ? new Date(row.transferred_at) : null,
            canceledReason: row.canceled_reason,
            deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
            deletedBy: row.deleted_by,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
          },
          studioName: row.studio_name,
          studioTimezone: row.studio_timezone,
          serviceName: row.service_name,
          masterDisplayName: row.master_display_name,
          attendeeName: row.attendee_name,
          attendeePhoneE164: row.attendee_phone_e164,
          attendeeEmail: row.attendee_email,
        }),
        client,
      );
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-reminder.helper',
      action: 'Failed to list upcoming confirmed appointments for reminder',
      error,
      meta: { studioId, reminderBeforeHours },
    });
    throw error;
  }
}

/**
 * @summary Повертає список всіх активних студій для обробки нагадувань.
 */
export async function getAllActiveStudioIds(): Promise<string[]> {
  try {
    return await withTransaction(async (client) => {
      const rows = await queryMany<any, string>(
        `
          SELECT DISTINCT sgs.studio_id
          FROM studio_global_settings sgs
          INNER JOIN studios st ON st.id = sgs.studio_id
          WHERE st.is_active = true
        `,
        [],
        (row) => String(row.studio_id),
        client,
      );
      return rows;
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-reminder.helper',
      action: 'Failed to get all active studio ids',
      error,
    });
    throw error;
  }
}
