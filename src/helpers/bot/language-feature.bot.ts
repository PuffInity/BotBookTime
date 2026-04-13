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

/**
 * uk: Публічна bot helper функція shouldShowLanguageControls.
 * en: Public bot helper function shouldShowLanguageControls.
 * cz: Veřejná bot helper funkce shouldShowLanguageControls.
 */
export function shouldShowLanguageControls(): boolean {
  return isLanguageSwitchEnabled();
}

/**
 * uk: Публічна bot helper функція canUseLanguageActions.
 * en: Public bot helper function canUseLanguageActions.
 * cz: Veřejná bot helper funkce canUseLanguageActions.
 */
export function canUseLanguageActions(): boolean {
  return isLanguageSwitchEnabled();
}

/**
 * uk: Публічна bot helper функція isSelectableLanguage.
 * en: Public bot helper function isSelectableLanguage.
 * cz: Veřejná bot helper funkce isSelectableLanguage.
 */
export function isSelectableLanguage(language: LanguageCode): boolean {
  return isUiLanguageAllowed(language);
}

/**
 * uk: Публічна bot helper функція resolveFeatureGatedUiLanguage.
 * en: Public bot helper function resolveFeatureGatedUiLanguage.
 * cz: Veřejná bot helper funkce resolveFeatureGatedUiLanguage.
 */
export function resolveFeatureGatedUiLanguage(language?: LanguageCode | null): LanguageCode {
  return resolveUiLanguageByFeatureGate(language);
}

