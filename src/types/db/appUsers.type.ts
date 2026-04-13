/**
 * @file appUsers.type.ts
 * @summary Database table type definitions.
 */
import type { LanguageCode } from './dbEnums.type.js';

export type AppUsersRow = {
    id: string,
    studio_id: string | null,
    telegram_user_id: string,
    telegram_username: string | null,
    first_name: string,
    last_name: string | null,
    phone_e164: string | null,
    phone_verified_at: Date | null,
    email: string | null,
    email_verified_at: Date | null,
    preferred_language: LanguageCode,
    timezone: string,
    is_active: boolean,
    created_at: Date,
    updated_at: Date,
}

export type AppUsersEntity = {
    id: string,
    studioId: string | null,
    telegramUserId: string,
    telegramUsername: string | null,
    firstName: string,
    lastName: string | null,
    phoneE164: string | null,
    phoneVerifiedAt: Date | null,
    email: string | null,
    emailVerifiedAt: Date | null,
    preferredLanguage: LanguageCode,
    timezone: string,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
}

export type AppUsersInsert = {
    studioId?: string | null,
    telegramUserId: string,
    telegramUsername?: string | null,
    firstName: string,
    lastName?: string | null,
    phoneE164?: string | null,
    phoneVerifiedAt?: Date | null,
    email?: string | null,
    emailVerifiedAt?: Date | null,
    preferredLanguage?: LanguageCode,
    timezone?: string,
    isActive?: boolean,
}

export type AppUsersUpdate = Partial<{
    studioId: string | null,
    telegramUserId: string,
    telegramUsername: string | null,
    firstName: string,
    lastName: string | null,
    phoneE164: string | null,
    phoneVerifiedAt: Date | null,
    email: string | null,
    emailVerifiedAt: Date | null,
    preferredLanguage: LanguageCode,
    timezone: string,
    isActive: boolean,
}>
