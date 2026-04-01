import type { LanguageCode } from '../../types/db/dbEnums.type.js';
import {
  isLanguageSwitchEnabled,
  isUiLanguageAllowed,
  resolveUiLanguageByFeatureGate,
} from '../../config/translate.config.js';

/**
 * @file language-feature.bot.ts
 * @summary Feature-gate helper для керування доступністю зміни мови в Telegram UI.
 */

export function shouldShowLanguageControls(): boolean {
  return isLanguageSwitchEnabled();
}

export function canUseLanguageActions(): boolean {
  return isLanguageSwitchEnabled();
}

export function isSelectableLanguage(language: LanguageCode): boolean {
  return isUiLanguageAllowed(language);
}

export function resolveFeatureGatedUiLanguage(language?: LanguageCode | null): LanguageCode {
  return resolveUiLanguageByFeatureGate(language);
}

