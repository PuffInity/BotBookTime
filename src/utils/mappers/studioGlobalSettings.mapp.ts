import {
    StudioGlobalSettingsRow,
    StudioGlobalSettingsEntity,
    StudioGlobalSettingsInsert,
    StudioGlobalSettingsUpdate
} from '../../types/db/studioGlobalSettings.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file studioGlobalSettings.mapp.ts
 * @summary Mapper для таблиці `studioGlobalSettings` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {StudioGlobalSettingsRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {StudioGlobalSettingsEntity}
 */
export const studioGlobalSettingsRowToEntity = (row: StudioGlobalSettingsRow): StudioGlobalSettingsEntity => {
    return {
        studioId: row.studio_id,
        bookingHorizonDays: row.booking_horizon_days,
        minCancelNoticeHours: row.min_cancel_notice_hours,
        reminderBeforeHours: row.reminder_before_hours,
        slotStepMinutes: row.slot_step_minutes,
        allowBookingWithoutPhoneVerification: row.allow_booking_without_phone_verification,
        noShowLimit: row.no_show_limit,
        defaultLanguage: row.default_language,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {StudioGlobalSettingsInsert} d - Дані для створення запису.
 * @returns {Partial<StudioGlobalSettingsRow>}
 */
export const toInsertStudioGlobalSettings = (d: StudioGlobalSettingsInsert) => {
    const out: Partial<StudioGlobalSettingsRow> = {
        studio_id: d.studioId,
        booking_horizon_days: d.bookingHorizonDays ?? undefined,
        min_cancel_notice_hours: d.minCancelNoticeHours ?? undefined,
        reminder_before_hours: d.reminderBeforeHours ?? undefined,
        slot_step_minutes: d.slotStepMinutes ?? undefined,
        allow_booking_without_phone_verification: d.allowBookingWithoutPhoneVerification ?? undefined,
        no_show_limit: d.noShowLimit ?? undefined,
        default_language: d.defaultLanguage ?? undefined,
    };

    return out satisfies Partial<StudioGlobalSettingsRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {StudioGlobalSettingsUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<StudioGlobalSettingsRow>}
 */
export const toUpdateStudioGlobalSettings = (patch?: StudioGlobalSettingsUpdate) => {
    const out: Partial<StudioGlobalSettingsRow> = {};

    if (!patch) return out;

    if ("studioId" in patch && patch.studioId !== undefined) {
        out.studio_id = patch.studioId;
    }

    if ("bookingHorizonDays" in patch && patch.bookingHorizonDays !== undefined) {
        out.booking_horizon_days = patch.bookingHorizonDays;
    }

    if ("minCancelNoticeHours" in patch && patch.minCancelNoticeHours !== undefined) {
        out.min_cancel_notice_hours = patch.minCancelNoticeHours;
    }

    if ("reminderBeforeHours" in patch && patch.reminderBeforeHours !== undefined) {
        out.reminder_before_hours = patch.reminderBeforeHours;
    }

    if ("slotStepMinutes" in patch && patch.slotStepMinutes !== undefined) {
        out.slot_step_minutes = patch.slotStepMinutes;
    }

    if ("allowBookingWithoutPhoneVerification" in patch && patch.allowBookingWithoutPhoneVerification !== undefined) {
        out.allow_booking_without_phone_verification = patch.allowBookingWithoutPhoneVerification;
    }

    if ("noShowLimit" in patch && patch.noShowLimit !== undefined) {
        out.no_show_limit = patch.noShowLimit;
    }

    if ("defaultLanguage" in patch && patch.defaultLanguage !== undefined) {
        out.default_language = patch.defaultLanguage;
    }

    return out satisfies Partial<StudioGlobalSettingsRow>;
};
