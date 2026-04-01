import { translateConfig, shouldAutoTranslateToLanguage } from '../../config/translate.config.js';
import {
  getCachedTranslation,
  setCachedTranslation,
} from '../redis/translate-cache.redis.helper.js';
import type {
  RuntimeTranslateResult,
  TranslateCacheKeyInput,
  TranslateTextInput,
} from '../../types/translate.types.js';
import { handleError } from '../../utils/error.utils.js';
import { loggerTranslate } from '../../utils/logger/loggers-list.js';

/**
 * @file translate-provider.helper.ts
 * @summary Runtime переклад (Google) + Redis кеш + safe fallback на оригінальний текст.
 */

type GoogleTranslationResponse = {
  data?: {
    translations?: Array<{
      translatedText?: string;
      detectedSourceLanguage?: string;
    }>;
  };
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

function decodeHtmlEntities(input: string): string {
  return input
    .replaceAll('&#39;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

async function translateViaGoogleApi(input: {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  timeoutMs: number;
}): Promise<string | null> {
  const apiKey = translateConfig.googleApiKey;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), input.timeoutMs);

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          q: input.text,
          source: input.sourceLanguage,
          target: input.targetLanguage,
          format: 'text',
        }),
      },
    );

    const payload = (await response.json()) as GoogleTranslationResponse;
    if (!response.ok || payload.error) {
      loggerTranslate.warn('[translate] Provider returned non-ok response', {
        status: response.status,
        providerErrorCode: payload.error?.code,
        providerErrorStatus: payload.error?.status,
      });
      return null;
    }

    const translatedText = payload.data?.translations?.[0]?.translatedText;
    if (!translatedText || translatedText.trim().length === 0) return null;

    return decodeHtmlEntities(translatedText);
  } finally {
    clearTimeout(timer);
  }
}

function asOriginal(text: string, status: RuntimeTranslateResult['status']): RuntimeTranslateResult {
  return {
    text,
    status,
    translated: false,
  };
}

function createCacheInput(input: {
  text: string;
  sourceLanguage: TranslateTextInput['sourceLanguage'];
  targetLanguage: TranslateTextInput['targetLanguage'];
}): TranslateCacheKeyInput {
  return {
    provider: 'google',
    sourceLanguage: input.sourceLanguage ?? translateConfig.defaultSourceLanguage,
    targetLanguage: input.targetLanguage,
    text: input.text,
  };
}

/**
 * @summary Перекладає текст в runtime через кеш + provider.
 * Якщо переклад неможливий/вимкнений — повертає оригінальний текст.
 */
export async function translateTextWithCache(
  input: TranslateTextInput,
): Promise<RuntimeTranslateResult> {
  const text = input.text.trim();
  if (!text) return asOriginal(input.text, 'empty-text');

  const sourceLanguage = input.sourceLanguage ?? translateConfig.defaultSourceLanguage;
  const targetLanguage = input.targetLanguage;

  if (!translateConfig.enabled || !translateConfig.googleApiKey) {
    return asOriginal(input.text, 'disabled');
  }

  if (!shouldAutoTranslateToLanguage(targetLanguage)) {
    return asOriginal(input.text, 'unsupported-target');
  }

  if (sourceLanguage === targetLanguage) {
    return asOriginal(input.text, 'same-language');
  }

  if (text.length > translateConfig.maxTextLength) {
    return asOriginal(input.text, 'text-too-long');
  }

  const cacheInput = createCacheInput({
    text,
    sourceLanguage,
    targetLanguage,
  });

  const cached = await getCachedTranslation(cacheInput);
  if (cached && cached.trim().length > 0) {
    return {
      text: cached,
      status: 'cache-hit',
      translated: cached !== input.text,
    };
  }

  try {
    const translated = await translateViaGoogleApi({
      text,
      sourceLanguage,
      targetLanguage,
      timeoutMs: translateConfig.timeoutMs,
    });

    if (!translated) {
      return asOriginal(input.text, 'provider-failed');
    }

    await setCachedTranslation(cacheInput, translated);

    return {
      text: translated,
      status: 'provider-ok',
      translated: translated !== input.text,
    };
  } catch (error) {
    handleError({
      logger: loggerTranslate,
      level: 'warn',
      scope: 'translate-provider-helper',
      action: 'Translation provider failed, fallback to original text',
      error,
      meta: {
        sourceLanguage,
        targetLanguage,
        textLength: text.length,
        scope: input.scope ?? 'n/a',
      },
    });

    return asOriginal(input.text, 'provider-failed');
  }
}

