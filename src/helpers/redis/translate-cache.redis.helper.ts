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

const TRANSLATE_CACHE_KEY_PREFIX = 'translate:cache:v1:';

function getReadyRedisClient() {
  if (!redis || !redis.isOpen) return null;
  return redis;
}

function hashText(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

export function buildTranslateCacheKey(input: TranslateCacheKeyInput): string {
  const textHash = hashText(input.text);
  return `${TRANSLATE_CACHE_KEY_PREFIX}${input.provider}:${input.sourceLanguage}:${input.targetLanguage}:${textHash}`;
}

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

