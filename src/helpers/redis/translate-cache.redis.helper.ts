import { createHash } from 'node:crypto';
import { redis } from '../../startup/life-cycle/redis.lifeCycle.js';
import { translateConfig } from '../../config/translate.config.js';
import type { TranslateCacheKeyInput } from '../../types/translate.types.js';
import { handleError } from '../../utils/error.utils.js';
import { loggerTranslate } from '../../utils/logger/loggers-list.js';

/**
 * @file translate-cache.redis.helper.ts
 * @summary Redis кеш перекладів для зменшення вартості і зовнішніх API викликів.
 */

// uk: helper константа TRANSLATE_CACHE_KEY_PREFIX / en: helper constant TRANSLATE_CACHE_KEY_PREFIX / cz: helper konstanta TRANSLATE_CACHE_KEY_PREFIX
const TRANSLATE_CACHE_KEY_PREFIX = 'translate:cache:v1:';

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
 * uk: Внутрішня helper функція hashText.
 * en: Internal helper function hashText.
 * cz: Interní helper funkce hashText.
 */
function hashText(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/**
 * uk: Публічна helper функція buildTranslateCacheKey.
 * en: Public helper function buildTranslateCacheKey.
 * cz: Veřejná helper funkce buildTranslateCacheKey.
 */
export function buildTranslateCacheKey(input: TranslateCacheKeyInput): string {
  const textHash = hashText(input.text);
  return `${TRANSLATE_CACHE_KEY_PREFIX}${input.provider}:${input.sourceLanguage}:${input.targetLanguage}:${textHash}`;
}

/**
 * uk: Публічна helper функція getCachedTranslation.
 * en: Public helper function getCachedTranslation.
 * cz: Veřejná helper funkce getCachedTranslation.
 */
export async function getCachedTranslation(input: TranslateCacheKeyInput): Promise<string | null> {
  const client = getReadyRedisClient();
  if (!client) return null;

  const key = buildTranslateCacheKey(input);
  try {
    return await client.get(key);
  } catch (error) {
    handleError({
      logger: loggerTranslate,
      scope: 'translate-cache-redis-helper',
      action: 'Failed to read cached translation',
      error,
      meta: {
        provider: input.provider,
        sourceLanguage: input.sourceLanguage,
        targetLanguage: input.targetLanguage,
      },
    });
    return null;
  }
}

/**
 * uk: Публічна helper функція setCachedTranslation.
 * en: Public helper function setCachedTranslation.
 * cz: Veřejná helper funkce setCachedTranslation.
 */
export async function setCachedTranslation(
  input: TranslateCacheKeyInput,
  translatedText: string,
): Promise<void> {
  const client = getReadyRedisClient();
  if (!client) return;

  const key = buildTranslateCacheKey(input);
  try {
    await client.set(key, translatedText, { EX: translateConfig.cacheTtlSec });
  } catch (error) {
    handleError({
      logger: loggerTranslate,
      scope: 'translate-cache-redis-helper',
      action: 'Failed to write cached translation',
      error,
      meta: {
        provider: input.provider,
        sourceLanguage: input.sourceLanguage,
        targetLanguage: input.targetLanguage,
      },
    });
  }
}

