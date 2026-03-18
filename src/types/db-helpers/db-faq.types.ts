import type { LanguageCode } from '../db/dbEnums.type.js';

/**
 * @file db-faq.types.ts
 * @summary Типи для DB helper модуля FAQ каталогу.
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

