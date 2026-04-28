/**
 * @file faqEntryTranslations.type.ts
 * @summary Database table type definitions.
 */
import type { LanguageCode } from './dbEnums.type.js';

export type FaqEntryTranslationsRow = {
    faq_id: string,
    language: LanguageCode,
    question: string,
    answer: string,
    updated_at: Date,
}

export type FaqEntryTranslationsEntity = {
    faqId: string,
    language: LanguageCode,
    question: string,
    answer: string,
    updatedAt: Date,
}

export type FaqEntryTranslationsInsert = {
    faqId: string,
    language: LanguageCode,
    question: string,
    answer: string,
}

export type FaqEntryTranslationsUpdate = Partial<{
    faqId: string,
    language: LanguageCode,
    question: string,
    answer: string,
}>
