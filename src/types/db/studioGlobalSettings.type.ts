/**
 * @file studioGlobalSettings.type.ts
 * @summary Database table type definitions.
 */
import type { LanguageCode } from './dbEnums.type.js';

export type StudioGlobalSettingsRow = {
    studio_id: string,
    booking_horizon_days: number,
    min_cancel_notice_hours: number,
    reminder_before_hours: number,
    slot_step_minutes: number,
    allow_booking_without_phone_verification: boolean,
    no_show_limit: number,
    default_language: LanguageCode,
    created_at: Date,
    updated_at: Date,
}

export type StudioGlobalSettingsEntity = {
    studioId: string,
    bookingHorizonDays: number,
    minCancelNoticeHours: number,
    reminderBeforeHours: number,
    slotStepMinutes: number,
    allowBookingWithoutPhoneVerification: boolean,
    noShowLimit: number,
    defaultLanguage: LanguageCode,
    createdAt: Date,
    updatedAt: Date,
}

export type StudioGlobalSettingsInsert = {
    studioId: string,
    bookingHorizonDays?: number,
    minCancelNoticeHours?: number,
    reminderBeforeHours?: number,
    slotStepMinutes?: number,
    allowBookingWithoutPhoneVerification?: boolean,
    noShowLimit?: number,
    defaultLanguage?: LanguageCode,
}

export type StudioGlobalSettingsUpdate = Partial<{
    studioId: string,
    bookingHorizonDays: number,
    minCancelNoticeHours: number,
    reminderBeforeHours: number,
    slotStepMinutes: number,
    allowBookingWithoutPhoneVerification: boolean,
    noShowLimit: number,
    defaultLanguage: LanguageCode,
}>
