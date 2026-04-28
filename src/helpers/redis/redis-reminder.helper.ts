import { redis } from '../../startup/life-cycle/redis.lifeCycle.js';
import { handleError } from '../../utils/error.utils.js';
import { loggerR } from '../../utils/logger/loggers-list.js';

/**
 * @file redis-reminder.helper.ts
 * @summary Redis tracking for sent reminders.
 */

// uk: helper константа REMINDER_SENT_MIN_TTL_SECONDS / en: helper constant REMINDER_SENT_MIN_TTL_SECONDS / cz: helper konstanta REMINDER_SENT_MIN_TTL_SECONDS
const REMINDER_SENT_MIN_TTL_SECONDS = 60 * 60; // 1 hour
// uk: helper константа REMINDER_SENT_POST_START_BUFFER_SECONDS / en: helper constant REMINDER_SENT_POST_START_BUFFER_SECONDS / cz: helper konstanta REMINDER_SENT_POST_START_BUFFER_SECONDS
const REMINDER_SENT_POST_START_BUFFER_SECONDS = 24 * 60 * 60; // keep dedupe 24h after visit start

/**
 * uk: Внутрішня helper функція getReminderSentKey.
 * en: Internal helper function getReminderSentKey.
 * cz: Interní helper funkce getReminderSentKey.
 */
function getReminderSentKey(appointmentId: string | number): string {
  return `reminder:sent:${String(appointmentId)}`;
}

/**
 * uk: Внутрішня helper функція resolveReminderSentTtlSeconds.
 * en: Internal helper function resolveReminderSentTtlSeconds.
 * cz: Interní helper funkce resolveReminderSentTtlSeconds.
 */
function resolveReminderSentTtlSeconds(startAt: Date): number {
  const nowMs = Date.now();
  const keepUntilMs = startAt.getTime() + REMINDER_SENT_POST_START_BUFFER_SECONDS * 1000;
  const diffMs = keepUntilMs - nowMs;
  const dynamicTtl = Math.ceil(diffMs / 1000);
  return Math.max(REMINDER_SENT_MIN_TTL_SECONDS, dynamicTtl);
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
 * uk: Публічна helper функція isReminderSent.
 * en: Public helper function isReminderSent.
 * cz: Veřejná helper funkce isReminderSent.
 */
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

/**
 * uk: Публічна helper функція markReminderSent.
 * en: Public helper function markReminderSent.
 * cz: Veřejná helper funkce markReminderSent.
 */
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
