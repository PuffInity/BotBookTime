import { redis } from '../../startup/life-cycle/redis.lifeCycle.js';
import { handleError } from '../../utils/error.utils.js';
import { loggerR } from '../../utils/logger/loggers-list.js';

/**
 * @file redis-reminder.helper.ts
 * @summary Redis tracking for sent reminders.
 */

const REMINDER_SENT_MIN_TTL_SECONDS = 60 * 60; // 1 hour
const REMINDER_SENT_POST_START_BUFFER_SECONDS = 24 * 60 * 60; // keep dedupe 24h after visit start

function getReminderSentKey(appointmentId: string | number): string {
  return `reminder:sent:${String(appointmentId)}`;
}

function resolveReminderSentTtlSeconds(startAt: Date): number {
  const nowMs = Date.now();
  const keepUntilMs = startAt.getTime() + REMINDER_SENT_POST_START_BUFFER_SECONDS * 1000;
  const diffMs = keepUntilMs - nowMs;
  const dynamicTtl = Math.ceil(diffMs / 1000);
  return Math.max(REMINDER_SENT_MIN_TTL_SECONDS, dynamicTtl);
}

function getReadyRedisClient() {
  if (!redis || !redis.isOpen) return null;
  return redis;
}

export async function isReminderSent(appointmentId: string | number): Promise<boolean> {
  const key = getReminderSentKey(appointmentId);
  const client = getReadyRedisClient();
  if (!client) return false;

  try {
    return (await client.exists(key)) > 0;
  } catch (error) {
    handleError({
      logger: loggerR,
      scope: 'redis-reminder-helper',
      action: 'Failed to check if reminder sent',
      error,
      meta: { appointmentId },
    });
    return false;
  }
}

export async function markReminderSent(input: {
  appointmentId: string | number;
  startAt: Date;
}): Promise<void> {
  const key = getReminderSentKey(input.appointmentId);
  const client = getReadyRedisClient();
  if (!client) return;

  try {
    const ttlSeconds = resolveReminderSentTtlSeconds(input.startAt);
    await client.set(key, '1', { EX: ttlSeconds });
  } catch (error) {
    handleError({
      logger: loggerR,
      scope: 'redis-reminder-helper',
      action: 'Failed to mark reminder sent',
      error,
      meta: { appointmentId: input.appointmentId, startAt: input.startAt.toISOString() },
    });
  }
}
