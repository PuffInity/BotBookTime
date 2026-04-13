import type { LanguageCode } from '../db/dbEnums.type.js';

/**
 * @file db-faq.types.ts
 * @summary uk: Типи для DB helper модуля FAQ каталогу.
 * en: DB helper type definitions.
 * cz: DB helper type definitions.
 */

export type FaqCatalogItem = {
  id: string;
  sortOrder: number;
  question: string;
  answer: string;
  language: LanguageCode;
};

export type ListFaqCatalogInput = {
  studioId?: string | null;
  language: LanguageCode;
  limit?: number;
};

export type GetFaqCatalogItemByIdInput = {
  faqId: string | number;
  studioId?: string | null;
  language: LanguageCode;
};

