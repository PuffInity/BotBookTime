import { redis } from '../../startup/life-cycle/redis.lifeCycle.js';
import { normalizeTelegramId } from '../../utils/db/db-profile.js';
import { handleError } from '../../utils/error.utils.js';
import { loggerR } from '../../utils/logger/loggers-list.js';

/**
 * @file email-otp.redis.helper.ts
 * @summary Redis guards for email OTP flow (resend cooldown + brute-force block).
 */

// uk: helper константа OTP_RESEND_COOLDOWN_SECONDS / en: helper constant OTP_RESEND_COOLDOWN_SECONDS / cz: helper konstanta OTP_RESEND_COOLDOWN_SECONDS
const OTP_RESEND_COOLDOWN_SECONDS = 60;
// uk: helper константа OTP_VERIFY_BLOCK_SECONDS / en: helper constant OTP_VERIFY_BLOCK_SECONDS / cz: helper konstanta OTP_VERIFY_BLOCK_SECONDS
const OTP_VERIFY_BLOCK_SECONDS = 5 * 60;

/**
 * uk: Внутрішня helper функція getOtpResendCooldownKey.
 * en: Internal helper function getOtpResendCooldownKey.
 * cz: Interní helper funkce getOtpResendCooldownKey.
 */
function getOtpResendCooldownKey(telegramUserId: string): string {
  return `profile:email-otp:resend:${telegramUserId}`;
}

/**
 * uk: Внутрішня helper функція getOtpVerifyBlockKey.
 * en: Internal helper function getOtpVerifyBlockKey.
 * cz: Interní helper funkce getOtpVerifyBlockKey.
 */
function getOtpVerifyBlockKey(telegramUserId: string): string {
  return `profile:email-otp:block:${telegramUserId}`;
}

/**
 * uk: Внутрішня helper функція getReadyRedisClient.
 * en: Internal helper function getReadyRedisClient.
 * cz: Interní helper funkce getReadyRedisClient.
 */
function getReadyRedisClient() {
  if (!redis || !redis.isOpen) return null;
  return redis;
}

/**
 * uk: Публічна helper функція isEmailOtpVerifyBlocked.
 * en: Public helper function isEmailOtpVerifyBlocked.
 * cz: Veřejná helper funkce isEmailOtpVerifyBlocked.
 */
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

/**
 * uk: Публічна helper функція setEmailOtpVerifyBlocked.
 * en: Public helper function setEmailOtpVerifyBlocked.
 * cz: Veřejná helper funkce setEmailOtpVerifyBlocked.
 */
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

/**
 * uk: Публічна helper функція getEmailOtpResendRetrySec.
 * en: Public helper function getEmailOtpResendRetrySec.
 * cz: Veřejná helper funkce getEmailOtpResendRetrySec.
 */
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

/**
 * uk: Публічна helper функція markEmailOtpResendCooldown.
 * en: Public helper function markEmailOtpResendCooldown.
 * cz: Veřejná helper funkce markEmailOtpResendCooldown.
 */
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

/**
 * uk: Публічна helper функція clearEmailOtpGuards.
 * en: Public helper function clearEmailOtpGuards.
 * cz: Veřejná helper funkce clearEmailOtpGuards.
 */
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
