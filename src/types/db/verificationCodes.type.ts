import type { VerificationChannel, VerificationPurpose } from './dbEnums.type.js';

export type VerificationCodesRow = {
    id: string,
    user_id: string,
    channel: VerificationChannel,
    purpose: VerificationPurpose,
    destination: string,
    code_hash: string,
    attempts_used: number,
    max_attempts: number,
    expires_at: Date,
    consumed_at: Date | null,
    last_sent_at: Date,
    created_at: Date,
}

export type VerificationCodesEntity = {
    id: string,
    userId: string,
    channel: VerificationChannel,
    purpose: VerificationPurpose,
    destination: string,
    codeHash: string,
    attemptsUsed: number,
    maxAttempts: number,
    expiresAt: Date,
    consumedAt: Date | null,
    lastSentAt: Date,
    createdAt: Date,
}

export type VerificationCodesInsert = {
    userId: string,
    channel: VerificationChannel,
    purpose: VerificationPurpose,
    destination: string,
    codeHash: string,
    attemptsUsed?: number,
    maxAttempts?: number,
    expiresAt: Date,
    consumedAt?: Date | null,
    lastSentAt?: Date,
}

export type VerificationCodesUpdate = Partial<{
    userId: string,
    channel: VerificationChannel,
    purpose: VerificationPurpose,
    destination: string,
    codeHash: string,
    attemptsUsed: number,
    maxAttempts: number,
    expiresAt: Date,
    consumedAt: Date | null,
    lastSentAt: Date,
}>
