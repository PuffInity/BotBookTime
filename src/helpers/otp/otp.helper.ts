import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import type { AppUsersEntity } from '../../types/db/index.js';
import type {
  VerifyEmailOtpInput,
  VerifyEmailOtpStatus,
} from '../../types/db-helpers/db-profile.types.js';
import { sendOtpEmail } from '../email/mailer.helper.js';
import {
  clearEmailOtpGuards,
  getEmailOtpResendRetrySec,
  isEmailOtpVerifyBlocked,
  markEmailOtpResendCooldown,
  setEmailOtpVerifyBlocked,
} from '../redis/email-otp.redis.helper.js';
import {
  consumeOtpById,
  getActiveEmailOtp,
  getUserByTelegramId,
  markEmailVerified as markEmailVerifiedInDb,
  saveEmailOtp,
  incrementOtpAttempts,
} from '../db/db-profile.helper.js';
import { handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';

/**
 * @file otp.helper.ts
 * @summary OTP flow helper for email verification (generate/save/verify/resend).
 */

const OTP_LENGTH = 6;
const OTP_EXPIRES_MINUTES = 5;

function getOtpSecret(): string {
  return process.env.OTP_SECRET ?? process.env.BOT_TOKEN ?? 'dev-otp-secret';
}

function hashOtpCode(code: string, destinationEmail: string): string {
  return createHmac('sha256', getOtpSecret()).update(`${destinationEmail}:${code}`).digest('hex');
}

function safeHashEquals(actualHash: string, expectedHash: string): boolean {
  const a = Buffer.from(actualHash, 'hex');
  const b = Buffer.from(expectedHash, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * @summary Generates numeric OTP code.
 */
export function generateOTP(length = OTP_LENGTH): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += String(randomInt(0, 10));
  }
  return out;
}

/**
 * @summary Saves OTP in DB with TTL and returns created OTP entity.
 */
export async function saveOTP(user: AppUsersEntity, code: string) {
  if (!user.email) {
    throw new Error('Email is required to save OTP');
  }

  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60_000);
  const codeHash = hashOtpCode(code, user.email);

  return saveEmailOtp({
    userId: user.id,
    destination: user.email,
    codeHash,
    expiresAt,
    maxAttempts: 3,
  });
}

/**
 * @summary Marks user email as verified in DB.
 */
export async function markEmailVerified(userId: string, destination: string) {
  return markEmailVerifiedInDb(userId, destination);
}

/**
 * @summary Resends email OTP with resend-cooldown checks.
 */
export async function resendOTP(
  telegramId: number | string,
): Promise<{ status: 'SENT' | 'RESEND_LIMIT' | 'EMAIL_MISSING' | 'ALREADY_VERIFIED'; retryAfterSec?: number; email?: string }> {
  const user = await getUserByTelegramId(telegramId);
  if (!user || !user.email) return { status: 'EMAIL_MISSING' };
  if (user.emailVerifiedAt) return { status: 'ALREADY_VERIFIED' };

  const retryAfterSec = await getEmailOtpResendRetrySec(telegramId);
  if (retryAfterSec > 0) {
    return { status: 'RESEND_LIMIT', retryAfterSec };
  }

  const code = generateOTP();
  await saveOTP(user, code);
  await sendOtpEmail({
    to: user.email,
    code,
    purpose: 'email_verify',
    recipientName: user.firstName,
    expiresInMinutes: OTP_EXPIRES_MINUTES,
  });
  await markEmailOtpResendCooldown(telegramId);

  return { status: 'SENT', email: user.email };
}

/**
 * @summary Verifies input OTP and applies full security flow.
 */
export async function verifyOTP(
  input: VerifyEmailOtpInput,
): Promise<{ status: VerifyEmailOtpStatus; user?: AppUsersEntity }> {
  const user = await getUserByTelegramId(input.telegramId);
  if (!user || !user.email) return { status: 'EMAIL_MISSING' };
  if (user.emailVerifiedAt) return { status: 'ALREADY_VERIFIED', user };

  if (await isEmailOtpVerifyBlocked(input.telegramId)) {
    return { status: 'BLOCKED' };
  }

  const otp = await getActiveEmailOtp(user.id, user.email);
  if (!otp) {
    return { status: 'NO_ACTIVE_OTP' };
  }

  if (otp.expiresAt.getTime() <= Date.now()) {
    await consumeOtpById(otp.id);
    return { status: 'EXPIRED' };
  }

  const incomingHash = hashOtpCode(input.code, user.email);
  const isMatch = safeHashEquals(incomingHash, otp.codeHash);

  if (!isMatch) {
    const updatedOtp = await incrementOtpAttempts(otp.id);
    if (updatedOtp.attemptsUsed >= updatedOtp.maxAttempts) {
      await setEmailOtpVerifyBlocked(input.telegramId);
      await consumeOtpById(updatedOtp.id);
      return { status: 'BLOCKED' };
    }
    return { status: 'INVALID' };
  }

  try {
    await markEmailVerifiedInDb(user.id, user.email);
    await consumeOtpById(otp.id);
    await clearEmailOtpGuards(input.telegramId);
    const freshUser = await getUserByTelegramId(input.telegramId);
    return freshUser ? { status: 'VERIFIED', user: freshUser } : { status: 'VERIFIED' };
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'otp-helper',
      action: 'Failed to complete email verification flow',
      error,
      meta: { userId: user.id },
    });
    throw error;
  }
}

