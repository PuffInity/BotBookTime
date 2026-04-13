import type { LanguageCode } from '../types/db/dbEnums.type.js';
import { translateSchemaConfig } from '../validator/translate.schema.js';
import { loggerTranslateConfig } from '../utils/logger/loggers-list.js';

/**
 * @file translate.config.ts
 * @summary Translation config + UI language feature gate.
 */

// uk: Доступні UI мови / en: UI languages / cz: UI jazyky
const AVAILABLE_UI_LANGUAGES: LanguageCode[] = ['uk', 'en', 'cs'];
// uk: Мови автоперекладу / en: Auto-translate targets / cz: Cíle auto-překladu
const AUTO_TRANSLATION_TARGET_LANGUAGES: LanguageCode[] = ['en', 'cs'];

// uk: Нормалізований translate config / en: Normalized translate config / cz: Normalizovaný translate config
export const translateConfig = Object.freeze({
  enabled: translateSchemaConfig.TRANSLATE_ENABLED,
  provider: translateSchemaConfig.TRANSLATE_PROVIDER,
  googleApiKey: translateSchemaConfig.GOOGLE_TRANSLATE_API_KEY ?? null,
  cacheTtlSec: translateSchemaConfig.TRANSLATE_CACHE_TTL_SEC,
  timeoutMs: translateSchemaConfig.TRANSLATE_TIMEOUT_MS,
  maxTextLength: translateSchemaConfig.TRANSLATE_MAX_TEXT_LENGTH,
  defaultSourceLanguage: translateSchemaConfig.TRANSLATE_DEFAULT_SOURCE as LanguageCode,
});

/**
 * uk: Чи є доступи провайдера.
 * en: Checks provider credentials.
 * cz: Kontroluje přístupové údaje poskytovatele.
 * @returns uk/en/cz: Наявні/Present/K dispozici.
 */
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

/**
 * uk: Гейт фічі перекладу.
 * en: Translation feature gate.
 * cz: Feature gate pro překlad.
 * @returns uk/en/cz: Увімкнено/Enabled/Povoleno.
 */
export function isTranslationFeatureEnabled(): boolean {
  return translateConfig.enabled && hasProviderCredentials();
}

/**
 * uk: Гейт перемикання мови UI.
 * en: UI language switch gate.
 * cz: Gate přepnutí UI jazyka.
 * @returns uk/en/cz: Доступно/Available/Dostupné.
 */
export function isLanguageSwitchEnabled(): boolean {
  return isTranslationFeatureEnabled();
}

/**
 * uk: Повертає мови UI.
 * en: Returns UI languages.
 * cz: Vrací UI jazyky.
 */
export function getAvailableUiLanguages(): LanguageCode[] {
  return AVAILABLE_UI_LANGUAGES;
}

/**
 * uk: Повертає мови автоперекладу.
 * en: Returns auto-translate target languages.
 * cz: Vrací cílové jazyky auto-překladu.
 */
export function getAutoTranslationTargetLanguages(): LanguageCode[] {
  if (!isTranslationFeatureEnabled()) return [];
  return AUTO_TRANSLATION_TARGET_LANGUAGES;
}

/**
 * uk: Перевірка дозволеної UI мови.
 * en: Validates allowed UI language.
 * cz: Ověří povolený UI jazyk.
 * @param language uk/en/cz: Мова/Language/Jazyk.
 */
export function isUiLanguageAllowed(language: LanguageCode): boolean {
  if (!AVAILABLE_UI_LANGUAGES.includes(language)) return false;
  if (!isLanguageSwitchEnabled() && language !== 'uk') return false;
  return true;
}

/**
 * uk: Нормалізує мову з урахуванням gate.
 * en: Resolves language with gate rules.
 * cz: Normalizuje jazyk podle gate pravidel.
 * @param requestedLanguage uk/en/cz: Запитана мова/Requested language/Požadovaný jazyk.
 */
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

/**
 * uk: Чи потрібен автопереклад на мову.
 * en: Checks if auto-translation applies.
 * cz: Ověří, zda se má auto-překládat.
 * @param language uk/en/cz: Мова/Language/Jazyk.
 */
export function shouldAutoTranslateToLanguage(language: LanguageCode): boolean {
  return getAutoTranslationTargetLanguages().includes(language);
}
