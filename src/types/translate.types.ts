import type { LanguageCode } from './db/dbEnums.type.js';

/**
 * @file translate.types.ts
 * @summary Типи для runtime перекладу і кешу перекладів.
 */

export type TranslateProvider = 'google';

export type TranslateTextInput = {
  text: string;
  targetLanguage: LanguageCode;
  sourceLanguage?: LanguageCode;
  scope?: string;
};

export type TranslateCacheKeyInput = {
  provider: TranslateProvider;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  text: string;
};

export type RuntimeTranslateStatus =
  | 'disabled'
  | 'same-language'
  | 'unsupported-target'
  | 'empty-text'
  | 'text-too-long'
  | 'cache-hit'
  | 'provider-ok'
  | 'provider-failed';

export type RuntimeTranslateResult = {
  text: string;
  status: RuntimeTranslateStatus;
  translated: boolean;
};

