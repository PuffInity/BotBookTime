import type { LanguageCode } from '../../types/db/dbEnums.type.js';
import { resolveFeatureGatedUiLanguage } from './language-feature.bot.js';
import { COMMON_PANEL_DICTIONARY } from './i18n-common-panel.bot.js';
import { MAIN_PANEL_DICTIONARY } from './i18n-main-panel.bot.js';
import { ADMIN_PANEL_DICTIONARY } from './i18n-admin-panel.bot.js';
import { MASTER_PANEL_DICTIONARY } from './i18n-master-panel.bot.js';

/**
 * @file i18n.bot.ts
 * @summary Централізований словник UI-текстів бота (uk/en/cs) на базі 4 панельних словників.
 */

export type BotUiLanguage = 'uk' | 'en' | 'cs';

// uk: UI константа BOT_DICTIONARY / en: UI constant BOT_DICTIONARY / cz: UI konstanta BOT_DICTIONARY
const BOT_DICTIONARY = {
  uk: {
    ...COMMON_PANEL_DICTIONARY.uk,
    ...MAIN_PANEL_DICTIONARY.uk,
    ...ADMIN_PANEL_DICTIONARY.uk,
    ...MASTER_PANEL_DICTIONARY.uk,
  },
  en: {
    ...COMMON_PANEL_DICTIONARY.en,
    ...MAIN_PANEL_DICTIONARY.en,
    ...ADMIN_PANEL_DICTIONARY.en,
    ...MASTER_PANEL_DICTIONARY.en,
  },
  cs: {
    ...COMMON_PANEL_DICTIONARY.cs,
    ...MAIN_PANEL_DICTIONARY.cs,
    ...ADMIN_PANEL_DICTIONARY.cs,
    ...MASTER_PANEL_DICTIONARY.cs,
  },
} as const;

export type BotDictionaryKey = keyof (typeof BOT_DICTIONARY)['uk'];

// uk: UI константа BOT_DICTIONARY_KEYS / en: UI constant BOT_DICTIONARY_KEYS / cz: UI konstanta BOT_DICTIONARY_KEYS
const BOT_DICTIONARY_KEYS = new Set<BotDictionaryKey>(
  Object.keys(BOT_DICTIONARY.uk) as BotDictionaryKey[],
);

/**
 * uk: Внутрішня bot helper функція buildReverseDictionary.
 * en: Internal bot helper function buildReverseDictionary.
 * cz: Interní bot helper funkce buildReverseDictionary.
 */
function buildReverseDictionary(
  language: BotUiLanguage,
): Map<string, BotDictionaryKey> {
  const reverse = new Map<string, BotDictionaryKey>();
  const dictionary = BOT_DICTIONARY[language] as Record<BotDictionaryKey, string>;

  for (const [key, value] of Object.entries(dictionary) as Array<[BotDictionaryKey, string]>) {
    const normalized = value.trim();
    if (!normalized || reverse.has(normalized)) continue;
    reverse.set(normalized, key);
  }

  return reverse;
}

// uk: UI константа BOT_DICTIONARY_REVERSE / en: UI constant BOT_DICTIONARY_REVERSE / cz: UI konstanta BOT_DICTIONARY_REVERSE
const BOT_DICTIONARY_REVERSE = {
  uk: buildReverseDictionary('uk'),
  en: buildReverseDictionary('en'),
  cs: buildReverseDictionary('cs'),
} as const;

/**
 * @summary Повертає UI-мову з урахуванням feature-gate перекладу.
 */
export function resolveBotUiLanguage(language?: LanguageCode | null): BotUiLanguage {
  return resolveFeatureGatedUiLanguage(language);
}

/**
 * @summary Повертає текст словника за ключем.
 */
export function tBot(language: BotUiLanguage, key: BotDictionaryKey): string {
  const dictionary = BOT_DICTIONARY[language] as Partial<Record<BotDictionaryKey, string>>;
  const fallbackDictionary = BOT_DICTIONARY.uk as Record<BotDictionaryKey, string>;
  return dictionary[key] ?? fallbackDictionary[key];
}

/**
 * @summary Перевіряє, чи є рядок валідним ключем словника.
 */
export function isBotDictionaryKey(value: string): value is BotDictionaryKey {
  return BOT_DICTIONARY_KEYS.has(value as BotDictionaryKey);
}

/**
 * @summary Повертає ключ словника за точним текстом (для зворотної локалізації помилок).
 */
export function findBotDictionaryKeyByText(
  text: string,
  sourceLanguage: BotUiLanguage = 'uk',
): BotDictionaryKey | null {
  const normalized = text.trim();
  if (!normalized) return null;
  return BOT_DICTIONARY_REVERSE[sourceLanguage].get(normalized) ?? null;
}

/**
 * @summary Повертає текст словника з підстановкою шаблонів виду `{name}`.
 */
export function tBotTemplate(
  language: BotUiLanguage,
  key: BotDictionaryKey,
  params: Record<string, string | number>,
): string {
  let text = tBot(language, key);
  for (const [paramKey, paramValue] of Object.entries(params)) {
    text = text.replaceAll(`{${paramKey}}`, String(paramValue));
  }
  return text;
}

/**
 * @summary Повертає локалізований label мови.
 */
export function getLanguageLabel(language: LanguageCode, uiLanguage: BotUiLanguage): string {
  if (language === 'en') return tBot(uiLanguage, 'LANGUAGE_EN');
  if (language === 'cs') return tBot(uiLanguage, 'LANGUAGE_CS');
  return tBot(uiLanguage, 'LANGUAGE_UK');
}
