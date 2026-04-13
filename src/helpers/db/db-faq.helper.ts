import type {
  FaqEntriesEntity,
  FaqEntriesRow,
  FaqEntryTranslationsEntity,
  FaqEntryTranslationsRow,
  LanguageCode,
} from '../../types/db/index.js';
import type {
  FaqCatalogItem,
  GetFaqCatalogItemByIdInput,
  ListFaqCatalogInput,
} from '../../types/db-helpers/db-faq.types.js';
import { queryMany, withTransaction } from '../db.helper.js';
import { faqEntriesRowToEntity } from '../../utils/mappers/faqEntries.mapp.js';
import { faqEntryTranslationsRowToEntity } from '../../utils/mappers/faqEntryTranslations.mapp.js';
import { ValidationError } from '../../utils/error.utils.js';
import {
  SQL_LIST_ACTIVE_FAQ_ENTRIES,
  SQL_LIST_FAQ_TRANSLATIONS_BY_IDS_AND_LANG,
} from '../db-sql/db-faq.sql.js';

/**
 * @file db-faq.helper.ts
 * @summary DB helper для FAQ каталогу у Telegram-боті.
 */

const DEFAULT_FAQ_LIMIT = 50;
const MAX_FAQ_LIMIT = 100;

/**
 * uk: Внутрішній helper метод normalizePositiveBigintId.
 * en: Internal helper method normalizePositiveBigintId.
 * cz: Interní helper metoda normalizePositiveBigintId.
 */
function normalizePositiveBigintId(value: string | number, fieldName: string): string {
  const normalized = String(value).trim();

  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError(`Некоректний ${fieldName}`, { [fieldName]: value });
  }

  return normalized;
}

/**
 * uk: Внутрішній helper метод normalizeOptionalStudioId.
 * en: Internal helper method normalizeOptionalStudioId.
 * cz: Interní helper metoda normalizeOptionalStudioId.
 */
function normalizeOptionalStudioId(studioId?: string | null): string | null {
  if (studioId == null) return null;
  return normalizePositiveBigintId(studioId, 'studioId');
}

/**
 * uk: Внутрішній helper метод normalizeFaqLimit.
 * en: Internal helper method normalizeFaqLimit.
 * cz: Interní helper metoda normalizeFaqLimit.
 */
function normalizeFaqLimit(limit?: number): number {
  if (limit == null) return DEFAULT_FAQ_LIMIT;
  if (!Number.isFinite(limit)) return DEFAULT_FAQ_LIMIT;

  const normalized = Math.trunc(limit);
  if (normalized < 1) return DEFAULT_FAQ_LIMIT;
  if (normalized > MAX_FAQ_LIMIT) return MAX_FAQ_LIMIT;
  return normalized;
}

/**
 * uk: Внутрішній helper метод pickTranslationForEntry.
 * en: Internal helper method pickTranslationForEntry.
 * cz: Interní helper metoda pickTranslationForEntry.
 */
function pickTranslationForEntry(
  entryId: string,
  language: LanguageCode,
  translationsByFaqId: Map<string, FaqEntryTranslationsEntity[]>,
): FaqEntryTranslationsEntity | null {
  const translations = translationsByFaqId.get(entryId);
  if (!translations || translations.length === 0) return null;

  return (
    translations.find((translation) => translation.language === language) ??
    translations.find((translation) => translation.language === 'uk') ??
    null
  );
}

/**
 * uk: Внутрішній helper метод buildFaqCatalogItems.
 * en: Internal helper method buildFaqCatalogItems.
 * cz: Interní helper metoda buildFaqCatalogItems.
 */
function buildFaqCatalogItems(
  entries: FaqEntriesEntity[],
  translations: FaqEntryTranslationsEntity[],
  language: LanguageCode,
): FaqCatalogItem[] {
  const translationsByFaqId = new Map<string, FaqEntryTranslationsEntity[]>();

  for (const translation of translations) {
    const bucket = translationsByFaqId.get(translation.faqId) ?? [];
    bucket.push(translation);
    translationsByFaqId.set(translation.faqId, bucket);
  }

  const catalog: FaqCatalogItem[] = [];
  for (const entry of entries) {
    const translation = pickTranslationForEntry(entry.id, language, translationsByFaqId);
    if (!translation) continue;

    catalog.push({
      id: entry.id,
      sortOrder: entry.sortOrder,
      question: translation.question,
      answer: translation.answer,
      language: translation.language,
    });
  }

  return catalog.sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * @summary Повертає FAQ каталог для конкретної мови (fallback: uk).
 */
export async function listFaqCatalog(input: ListFaqCatalogInput): Promise<FaqCatalogItem[]> {
  const studioId = normalizeOptionalStudioId(input.studioId);
  const limit = normalizeFaqLimit(input.limit);
  const language = input.language;

  return await withTransaction(async (client) => {
    const entries = await queryMany<FaqEntriesRow, FaqEntriesEntity>(
      SQL_LIST_ACTIVE_FAQ_ENTRIES,
      [studioId, limit],
      faqEntriesRowToEntity,
      client,
    );

    if (entries.length === 0) {
      return [];
    }

    const faqIds = entries.map((entry) => entry.id);

    const translations = await queryMany<FaqEntryTranslationsRow, FaqEntryTranslationsEntity>(
      SQL_LIST_FAQ_TRANSLATIONS_BY_IDS_AND_LANG,
      [faqIds, language],
      faqEntryTranslationsRowToEntity,
      client,
    );

    return buildFaqCatalogItems(entries, translations, language);
  });
}

/**
 * @summary Повертає один FAQ пункт за id для потрібної мови (fallback: uk).
 */
export async function getFaqCatalogItemById(
  input: GetFaqCatalogItemByIdInput,
): Promise<FaqCatalogItem | null> {
  const faqId = normalizePositiveBigintId(input.faqId, 'faqId');
  const items = await listFaqCatalog({
    studioId: input.studioId,
    language: input.language,
    limit: MAX_FAQ_LIMIT,
  });

  return items.find((item) => item.id === faqId) ?? null;
}
