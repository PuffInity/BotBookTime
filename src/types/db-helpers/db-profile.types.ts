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

