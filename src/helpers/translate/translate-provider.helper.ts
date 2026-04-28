import { translateConfig, shouldAutoTranslateToLanguage } from '../../config/translate.config.js';
import {
  getCachedTranslation,
  setCachedTranslation,
} from '../redis/translate-cache.redis.helper.js';
import { request as httpsRequest } from 'node:https';
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

/**
 * uk: Внутрішня helper функція decodeHtmlEntities.
 * en: Internal helper function decodeHtmlEntities.
 * cz: Interní helper funkce decodeHtmlEntities.
 */
function decodeHtmlEntities(input: string): string {
  return input
    .replaceAll('&#39;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

/**
 * uk: Внутрішня helper функція postJsonViaHttps.
 * en: Internal helper function postJsonViaHttps.
 * cz: Interní helper funkce postJsonViaHttps.
 */
async function postJsonViaHttps(
  url: string,
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<{
  ok: boolean;
  status: number;
  payload: GoogleTranslationResponse | null;
}> {
  return new Promise((resolve, reject) => {
    const encodedBody = JSON.stringify(body);
    const req = httpsRequest(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': String(Buffer.byteLength(encodedBody)),
        },
        timeout: timeoutMs,
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');

        res.on('data', (chunk) => {
          raw += chunk;
        });

        res.on('end', () => {
          const status = res.statusCode ?? 500;
          if (!raw) {
            resolve({
              ok: status >= 200 && status < 300,
              status,
              payload: null,
            });
            return;
          }

          try {
            const payload = JSON.parse(raw) as GoogleTranslationResponse;
            resolve({
              ok: status >= 200 && status < 300,
              status,
              payload,
            });
          } catch {
            resolve({
              ok: false,
              status,
              payload: null,
            });
          }
        });
      },
    );

    req.on('timeout', () => {
      req.destroy(new Error('Translation request timeout'));
    });
    req.on('error', reject);
    req.write(encodedBody);
    req.end();
  });
}

/**
 * uk: Внутрішня helper функція translateViaGoogleApi.
 * en: Internal helper function translateViaGoogleApi.
 * cz: Interní helper funkce translateViaGoogleApi.
 */
async function translateViaGoogleApi(input: {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  timeoutMs: number;
}): Promise<string | null> {
  const apiKey = translateConfig.googleApiKey;
  if (!apiKey) return null;

  const requestUrl =
    `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`;
  const requestBody = {
    q: input.text,
    source: input.sourceLanguage,
    target: input.targetLanguage,
    format: 'text',
  };

  let status = 500;
  let payload: GoogleTranslationResponse | null = null;

  if (typeof fetch === 'function') {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), input.timeoutMs);
    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(requestBody),
      });
      status = response.status;
      payload = (await response.json()) as GoogleTranslationResponse;
    } finally {
      clearTimeout(timer);
    }
  } else {
    const response = await postJsonViaHttps(requestUrl, requestBody, input.timeoutMs);
    status = response.status;
    payload = response.payload;
    if (!response.ok && !payload?.error) {
      loggerTranslate.warn('[translate] Provider returned non-ok response', {
        status,
        providerErrorCode: undefined,
        providerErrorStatus: undefined,
      });
      return null;
    }
  }

  if (status < 200 || status >= 300 || payload?.error) {
    loggerTranslate.warn('[translate] Provider returned non-ok response', {
      status,
      providerErrorCode: payload?.error?.code,
      providerErrorStatus: payload?.error?.status,
    });
    return null;
  }

  const translatedText = payload?.data?.translations?.[0]?.translatedText;
  if (!translatedText || translatedText.trim().length === 0) return null;

  return decodeHtmlEntities(translatedText);
}

/**
 * uk: Внутрішня helper функція asOriginal.
 * en: Internal helper function asOriginal.
 * cz: Interní helper funkce asOriginal.
 */
function asOriginal(text: string, status: RuntimeTranslateResult['status']): RuntimeTranslateResult {
  return {
    text,
    status,
    translated: false,
  };
}

/**
 * uk: Внутрішня helper функція createCacheInput.
 * en: Internal helper function createCacheInput.
 * cz: Interní helper funkce createCacheInput.
 */
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
