import type { MyContext } from '../../types/bot.types.js';
import type {
  CreateUserInput,
  NormalizedTelegramProfile,
} from '../../types/db-helpers/db-profile.types.js';
import { telegramUserIdSchema } from '../../validator/bot-input.schema.js';
import { ValidationError } from '../error.utils.js';

/**
 * @file db-profile.ts
 * @summary Normalization/validation helpers for Telegram profile payload.
 */

export function normalizeTelegramUsername(username?: string | null): string | null {
  if (!username) return null;
  const normalized = username.trim().replace(/^@+/, '');
  return normalized.length > 0 ? normalized : null;
}

export function normalizeFirstName(firstName?: string | null): string {
  const normalized = (firstName ?? '').trim();
  return normalized.length > 0 ? normalized : 'User';
}

export function normalizeLastName(lastName?: string | null): string | null {
  const normalized = (lastName ?? '').trim();
  return normalized.length > 0 ? normalized : null;
}

export function normalizeTelegramId(telegramId: number | string): string {
  const value = typeof telegramId === 'string' ? Number(telegramId) : telegramId;
  const parsed = telegramUserIdSchema.safeParse(value);

  if (!parsed.success) {
    throw new ValidationError('Invalid telegram user id', { telegramId });
  }

  return String(parsed.data);
}

export function normalizeCreateUserInput(input: CreateUserInput): NormalizedTelegramProfile {
  return {
    telegramUserId: normalizeTelegramId(input.telegramId),
    telegramUsername: normalizeTelegramUsername(input.username),
    firstName: normalizeFirstName(input.firstName),
    lastName: normalizeLastName(input.lastName),
  };
}

export function normalizeCtxFrom(ctx: MyContext): NormalizedTelegramProfile {
  if (!ctx.from) {
    throw new ValidationError('Telegram user payload is missing in context');
  }

  return {
    telegramUserId: normalizeTelegramId(ctx.from.id),
    telegramUsername: normalizeTelegramUsername(ctx.from.username),
    firstName: normalizeFirstName(ctx.from.first_name),
    lastName: normalizeLastName(ctx.from.last_name),
  };
}

