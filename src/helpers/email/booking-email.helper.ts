import { sendEmail } from './mailer.helper.js';
import { handleError } from '../../utils/error.utils.js';
import { loggerMailer } from '../../utils/logger/loggers-list.js';
import type { LanguageCode } from '../../types/db/dbEnums.type.js';

/**
 * @file booking-email.helper.ts
 * @summary Helper-и для email-сповіщень клієнта по життєвому циклу бронювання.
 */

export type SendClientBookingCreatedEmailInput = {
  to: string;
  language?: LanguageCode;
  recipientName?: string;
  bookingId: string;
  studioName: string;
  serviceName: string;
  masterName: string;
  startAt: Date;
};

export type SendClientBookingConfirmedEmailInput = {
  to: string;
  language?: LanguageCode;
  recipientName?: string;
  bookingId: string;
  studioName: string;
  serviceName: string;
  masterName: string;
  startAt: Date;
};

export type SendClientBookingCancelledEmailInput = {
  to: string;
  language?: LanguageCode;
  recipientName?: string;
  bookingId: string;
  studioName: string;
  serviceName: string;
  masterName?: string;
  startAt: Date;
  cancelReason?: string;
};

/**
 * @summary Надсилає клієнту email про створення запису зі статусом "очікує підтвердження".
 * @returns {Promise<boolean>} true, якщо лист надіслано; false, якщо відправка завершилась помилкою.
 */
export async function sendClientBookingCreatedEmail(
  input: SendClientBookingCreatedEmailInput,
): Promise<boolean> {
  try {
    await sendEmail({
      to: input.to,
      language: input.language,
      template: 'bookingCreated',
      data: {
        recipientName: input.recipientName,
        recipientRole: 'client',
        bookingId: input.bookingId,
        studioName: input.studioName,
        serviceName: input.serviceName,
        masterName: input.masterName,
        startAt: input.startAt,
      },
    });
    return true;
  } catch (error) {
    handleError({
      logger: loggerMailer,
      level: 'warn',
      scope: 'booking-email.helper',
      action: 'Failed to send booking created email',
      error,
      meta: { bookingId: input.bookingId, to: input.to },
    });
    return false;
  }
}

/**
 * @summary Надсилає клієнту email про підтвердження запису майстром.
 * @returns {Promise<boolean>} true, якщо лист надіслано; false, якщо відправка завершилась помилкою.
 */
export async function sendClientBookingConfirmedEmail(
  input: SendClientBookingConfirmedEmailInput,
): Promise<boolean> {
  try {
    await sendEmail({
      to: input.to,
      language: input.language,
      template: 'bookingConfirmed',
      data: {
        recipientName: input.recipientName,
        bookingId: input.bookingId,
        studioName: input.studioName,
        serviceName: input.serviceName,
        masterName: input.masterName,
        startAt: input.startAt,
      },
    });
    return true;
  } catch (error) {
    handleError({
      logger: loggerMailer,
      level: 'warn',
      scope: 'booking-email.helper',
      action: 'Failed to send booking confirmed email',
      error,
      meta: { bookingId: input.bookingId, to: input.to },
    });
    return false;
  }
}

/**
 * @summary Надсилає клієнту email про успішне скасування запису.
 * @returns {Promise<boolean>} true, якщо лист надіслано; false, якщо відправка завершилась помилкою.
 */
export async function sendClientBookingCancelledEmail(
  input: SendClientBookingCancelledEmailInput,
): Promise<boolean> {
  try {
    await sendEmail({
      to: input.to,
      language: input.language,
      template: 'bookingCancelled',
      data: {
        recipientName: input.recipientName,
        bookingId: input.bookingId,
        studioName: input.studioName,
        serviceName: input.serviceName,
        masterName: input.masterName,
        startAt: input.startAt,
        cancelReason: input.cancelReason,
      },
    });
    return true;
  } catch (error) {
    handleError({
      logger: loggerMailer,
      level: 'warn',
      scope: 'booking-email.helper',
      action: 'Failed to send booking cancelled email',
      error,
      meta: { bookingId: input.bookingId, to: input.to },
    });
    return false;
  }
}
