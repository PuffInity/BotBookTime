/**
 * @file db-profile.types.ts
 * @summary Shared types for db-profile helper and normalization utils.
 */

export type CreateUserInput = {
  telegramId: number | string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export type NormalizedTelegramProfile = {
  telegramUserId: string;
  telegramUsername: string | null;
  firstName: string;
  lastName: string | null;
};

export type UpdateUserNameInput = {
  telegramId: number | string;
  firstName: string;
};

export type SaveEmailOtpInput = {
  userId: string;
  destination: string;
  codeHash: string;
  expiresAt: Date;
  maxAttempts?: number;
};

export type VerifyEmailOtpInput = {
  telegramId: number | string;
  code: string;
};

export type VerifyEmailOtpStatus =
  | 'VERIFIED'
  | 'INVALID'
  | 'EXPIRED'
  | 'BLOCKED'
  | 'NO_ACTIVE_OTP'
  | 'ALREADY_VERIFIED'
  | 'EMAIL_MISSING';
