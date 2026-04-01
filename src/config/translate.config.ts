import type { LanguageCode } from '../types/db/dbEnums.type.js';
import { translateSchemaConfig } from '../validator/translate.schema.js';
import { loggerTranslateConfig } from '../utils/logger/loggers-list.js';

/**
 * @file translate.config.ts
 * @summary Нормалізований конфіг перекладу + feature-gate для UI мови.
 */

const AVAILABLE_UI_LANGUAGES: LanguageCode[] = ['uk', 'en', 'cs'];
const AUTO_TRANSLATION_TARGET_LANGUAGES: LanguageCode[] = ['en', 'cs'];

export const translateConfig = Object.freeze({
  enabled: translateSchemaConfig.TRANSLATE_ENABLED,
  provider: translateSchemaConfig.TRANSLATE_PROVIDER,
  googleApiKey: translateSchemaConfig.GOOGLE_TRANSLATE_API_KEY ?? null,
  cacheTtlSec: translateSchemaConfig.TRANSLATE_CACHE_TTL_SEC,
  timeoutMs: translateSchemaConfig.TRANSLATE_TIMEOUT_MS,
  maxTextLength: translateSchemaConfig.TRANSLATE_MAX_TEXT_LENGTH,
  defaultSourceLanguage: translateSchemaConfig.TRANSLATE_DEFAULT_SOURCE as LanguageCode,
});

function hasProviderCredentials(): boolean {
  if (translateConfig.provider === 'google') {
    return Boolean(translateConfig.googleApiKey);
  }
  return false;
}

loggerTranslateConfig.info('[translate-config] Loaded', {
  enabled: translateConfig.enabled,
  provider: translateConfig.provider,
  hasApiKey: Boolean(translateConfig.googleApiKey),
  cacheTtlSec: translateConfig.cacheTtlSec,
  timeoutMs: translateConfig.timeoutMs,
  maxTextLength: translateConfig.maxTextLength,
  defaultSourceLanguage: translateConfig.defaultSourceLanguage,
  isConfigured: hasProviderCredentials(),
});

if (translateConfig.enabled && !hasProviderCredentials()) {
  loggerTranslateConfig.warn(
    '[translate-config] Feature requested but provider credentials are missing. Translation is disabled.',
    { provider: translateConfig.provider },
  );
}

export function isTranslationFeatureEnabled(): boolean {
  return translateConfig.enabled && hasProviderCredentials();
}

export function isLanguageSwitchEnabled(): boolean {
  return isTranslationFeatureEnabled();
}

export function getAvailableUiLanguages(): LanguageCode[] {
  return AVAILABLE_UI_LANGUAGES;
}

export function getAutoTranslationTargetLanguages(): LanguageCode[] {
  if (!isTranslationFeatureEnabled()) return [];
  return AUTO_TRANSLATION_TARGET_LANGUAGES;
}

export function isUiLanguageAllowed(language: LanguageCode): boolean {
  if (!AVAILABLE_UI_LANGUAGES.includes(language)) return false;
  if (!isLanguageSwitchEnabled() && language !== 'uk') return false;
  return true;
}

export function resolveUiLanguageByFeatureGate(
  requestedLanguage?: LanguageCode | null,
): LanguageCode {
  if (!requestedLanguage) return 'uk';
  if (!AVAILABLE_UI_LANGUAGES.includes(requestedLanguage)) return 'uk';

  if (!isLanguageSwitchEnabled() && requestedLanguage !== 'uk') {
    return 'uk';
  }

  return requestedLanguage;
}

export function shouldAutoTranslateToLanguage(language: LanguageCode): boolean {
  return getAutoTranslationTargetLanguages().includes(language);
}
