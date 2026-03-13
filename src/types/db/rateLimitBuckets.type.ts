import type { RateLimitSubject } from './dbEnums.type.js';

export type RateLimitBucketsRow = {
    id: string,
    subject_type: RateLimitSubject,
    subject_key: string,
    action_key: string,
    window_started_at: Date,
    window_ends_at: Date,
    attempts: number,
    max_attempts: number,
    blocked_until: Date | null,
    created_at: Date,
    updated_at: Date,
}

export type RateLimitBucketsEntity = {
    id: string,
    subjectType: RateLimitSubject,
    subjectKey: string,
    actionKey: string,
    windowStartedAt: Date,
    windowEndsAt: Date,
    attempts: number,
    maxAttempts: number,
    blockedUntil: Date | null,
    createdAt: Date,
    updatedAt: Date,
}

export type RateLimitBucketsInsert = {
    subjectType: RateLimitSubject,
    subjectKey: string,
    actionKey: string,
    windowStartedAt: Date,
    windowEndsAt: Date,
    attempts?: number,
    maxAttempts: number,
    blockedUntil?: Date | null,
}

export type RateLimitBucketsUpdate = Partial<{
    subjectType: RateLimitSubject,
    subjectKey: string,
    actionKey: string,
    windowStartedAt: Date,
    windowEndsAt: Date,
    attempts: number,
    maxAttempts: number,
    blockedUntil: Date | null,
}>
