import { redis } from '../../startup/life-cycle/redis.lifeCycle.js';
import { normalizeTelegramId } from '../../utils/db/db-profile.js';
import { handleError } from '../../utils/error.utils.js';
import { loggerR } from '../../utils/logger/loggers-list.js';

/**
 * @file profile-name.redis.helper.ts
 * @summary Redis helper for profile-name blocking/cooldown keys.
 */

// uk: helper константа NAME_CHANGE_BLOCK_SECONDS / en: helper constant NAME_CHANGE_BLOCK_SECONDS / cz: helper konstanta NAME_CHANGE_BLOCK_SECONDS
const NAME_CHANGE_BLOCK_SECONDS = 5 * 60;
// uk: helper константа NAME_CHANGE_COOLDOWN_SECONDS / en: helper constant NAME_CHANGE_COOLDOWN_SECONDS / cz: helper konstanta NAME_CHANGE_COOLDOWN_SECONDS
const NAME_CHANGE_COOLDOWN_SECONDS = 24 * 60 * 60;

/**
 * uk: Внутрішня helper функція getNameChangeBlockKey.
 * en: Internal helper function getNameChangeBlockKey.
 * cz: Interní helper funkce getNameChangeBlockKey.
 */
function getNameChangeBlockKey(telegramUserId: string): string {
  return `profile:name-change:block:${telegramUserId}`;
}

/**
 * uk: Внутрішня helper функція getNameChangeCooldownKey.
 * en: Internal helper function getNameChangeCooldownKey.
 * cz: Interní helper funkce getNameChangeCooldownKey.
 */
function getNameChangeCooldownKey(telegramUserId: string): string {
  return `profile:name-change:cooldown:${telegramUserId}`;
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
 * uk: Внутрішня helper функція keyExists.
 * en: Internal helper function keyExists.
 * cz: Interní helper funkce keyExists.
 */
async function keyExists(key: string): Promise<boolean> {
  const client = getReadyRedisClient();
  if (!client) return false;
  return (await client.exists(key)) > 0;
}

/**
 * @summary Returns true when temporary 5-min name-change block is active.
 */
export async function isNameChangeBlocked(telegramId: number | string): Promise<boolean> {
  const telegramUserId = normalizeTelegramId(telegramId);
  const key = getNameChangeBlockKey(telegramUserId);

  try {
    return await keyExists(key);
  } catch (error) {
    handleError({
      logger: loggerR,
      scope: 'profile-name-redis-helper',
      action: 'Failed to check 5-min name-change block',
      error,
      meta: { telegramUserId },
    });
    return false;
  }
}

/**
 * @summary Activates temporary 5-min name-change block.
 */
export async function setNameChangeBlocked(telegramId: number | string): Promise<void> {
  const telegramUserId = normalizeTelegramId(telegramId);
  const key = getNameChangeBlockKey(telegramUserId);
  const client = getReadyRedisClient();
  if (!client) return;

  try {
    await client.set(key, '1', { EX: NAME_CHANGE_BLOCK_SECONDS });
  } catch (error) {
    handleError({
      logger: loggerR,
      scope: 'profile-name-redis-helper',
      action: 'Failed to set 5-min name-change block',
      error,
      meta: { telegramUserId },
    });
  }
}

/**
 * @summary Returns true when 24h cooldown after successful name change is active.
 */
export async function isNameChangeCooldownActive(telegramId: number | string): Promise<boolean> {
  const telegramUserId = normalizeTelegramId(telegramId);
  const key = getNameChangeCooldownKey(telegramUserId);

  try {
    return await keyExists(key);
  } catch (error) {
    handleError({
      logger: loggerR,
      scope: 'profile-name-redis-helper',
      action: 'Failed to check 24h name-change cooldown',
      error,
      meta: { telegramUserId },
    });
    return false;
  }
}

/**
 * @summary Activates 24h cooldown after successful name change.
 */
export async function setNameChangeCooldown(telegramId: number | string): Promise<void> {
  const telegramUserId = normalizeTelegramId(telegramId);
  const key = getNameChangeCooldownKey(telegramUserId);
  const client = getReadyRedisClient();
  if (!client) return;

  try {
    await client.set(key, '1', { EX: NAME_CHANGE_COOLDOWN_SECONDS });
  } catch (error) {
    handleError({
      logger: loggerR,
      scope: 'profile-name-redis-helper',
      action: 'Failed to set 24h name-change cooldown',
      error,
      meta: { telegramUserId },
    });
  }
}

