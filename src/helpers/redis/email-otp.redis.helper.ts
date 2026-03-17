import { redis } from '../../startup/life-cycle/redis.lifeCycle.js';
import { normalizeTelegramId } from '../../utils/db/db-profile.js';
import { handleError } from '../../utils/error.utils.js';
import { loggerR } from '../../utils/logger/loggers-list.js';

/**
 * @file email-otp.redis.helper.ts
 * @summary Redis guards for email OTP flow (resend cooldown + brute-force block).
 */

const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_VERIFY_BLOCK_SECONDS = 5 * 60;

function getOtpResendCooldownKey(telegramUserId: string): string {
  return `profile:email-otp:resend:${telegramUserId}`;
}

function getOtpVerifyBlockKey(telegramUserId: string): string {
  return `profile:email-otp:block:${telegramUserId}`;
}

function getReadyRedisClient() {
  if (!redis || !redis.isOpen) return null;
  return redis;
}

export async function isEmailOtpVerifyBlocked(telegramId: number | string): Promise<boolean> {
  const telegramUserId = normalizeTelegramId(telegramId);
  const key = getOtpVerifyBlockKey(telegramUserId);
  const client = getReadyRedisClient();
  if (!client) return false;

  try {
    return (await client.exists(key)) > 0;
  } catch (error) {
    handleError({
      logger: loggerR,
      scope: 'email-otp-redis-helper',
      action: 'Failed to check otp verify block',
      error,
      meta: { telegramUserId },
    });
    return false;
  }
}

export async function setEmailOtpVerifyBlocked(telegramId: number | string): Promise<void> {
  const telegramUserId = normalizeTelegramId(telegramId);
  const key = getOtpVerifyBlockKey(telegramUserId);
  const client = getReadyRedisClient();
  if (!client) return;

  try {
    await client.set(key, '1', { EX: OTP_VERIFY_BLOCK_SECONDS });
  } catch (error) {
    handleError({
      logger: loggerR,
      scope: 'email-otp-redis-helper',
      action: 'Failed to set otp verify block',
      error,
      meta: { telegramUserId },
    });
  }
}

export async function getEmailOtpResendRetrySec(telegramId: number | string): Promise<number> {
  const telegramUserId = normalizeTelegramId(telegramId);
  const key = getOtpResendCooldownKey(telegramUserId);
  const client = getReadyRedisClient();
  if (!client) return 0;

  try {
    const ttl = await client.ttl(key);
    return ttl > 0 ? ttl : 0;
  } catch (error) {
    handleError({
      logger: loggerR,
      scope: 'email-otp-redis-helper',
      action: 'Failed to read resend cooldown TTL',
      error,
      meta: { telegramUserId },
    });
    return 0;
  }
}

export async function markEmailOtpResendCooldown(telegramId: number | string): Promise<void> {
  const telegramUserId = normalizeTelegramId(telegramId);
  const key = getOtpResendCooldownKey(telegramUserId);
  const client = getReadyRedisClient();
  if (!client) return;

  try {
    await client.set(key, '1', { EX: OTP_RESEND_COOLDOWN_SECONDS });
  } catch (error) {
    handleError({
      logger: loggerR,
      scope: 'email-otp-redis-helper',
      action: 'Failed to set resend cooldown',
      error,
      meta: { telegramUserId },
    });
  }
}

export async function clearEmailOtpGuards(telegramId: number | string): Promise<void> {
  const telegramUserId = normalizeTelegramId(telegramId);
  const resendKey = getOtpResendCooldownKey(telegramUserId);
  const blockKey = getOtpVerifyBlockKey(telegramUserId);
  const client = getReadyRedisClient();
  if (!client) return;

  try {
    await client.del([resendKey, blockKey]);
  } catch (error) {
    handleError({
      logger: loggerR,
      scope: 'email-otp-redis-helper',
      action: 'Failed to clear otp guard keys',
      error,
      meta: { telegramUserId },
    });
  }
}
