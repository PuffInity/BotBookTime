import {
    FaqEntryTranslationsRow,
    FaqEntryTranslationsEntity,
    FaqEntryTranslationsInsert,
    FaqEntryTranslationsUpdate
} from '../../types/db/faqEntryTranslations.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file faqEntryTranslations.mapp.ts
 * @summary Mapper для таблиці `faqEntryTranslations` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {FaqEntryTranslationsRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {FaqEntryTranslationsEntity}
 */
export const faqEntryTranslationsRowToEntity = (row: FaqEntryTranslationsRow): FaqEntryTranslationsEntity => {
    return {
        faqId: row.faq_id,
        language: row.language,
        question: row.question,
        answer: row.answer,
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {FaqEntryTranslationsInsert} d - Дані для створення запису.
 * @returns {Partial<FaqEntryTranslationsRow>}
 */
export const toInsertFaqEntryTranslations = (d: FaqEntryTranslationsInsert) => {
    const out: Partial<FaqEntryTranslationsRow> = {
        faq_id: d.faqId,
        language: d.language,
        question: d.question,
        answer: d.answer,
    };

    return out satisfies Partial<FaqEntryTranslationsRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {FaqEntryTranslationsUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<FaqEntryTranslationsRow>}
 */
export const toUpdateFaqEntryTranslations = (patch?: FaqEntryTranslationsUpdate) => {
    const out: Partial<FaqEntryTranslationsRow> = {};

    if (!patch) return out;

    if ("faqId" in patch && patch.faqId !== undefined) {
        out.faq_id = patch.faqId;
    }

    if ("language" in patch && patch.language !== undefined) {
        out.language = patch.language;
    }

    if ("question" in patch && patch.question !== undefined) {
        out.question = patch.question;
    }

    if ("answer" in patch && patch.answer !== undefined) {
        out.answer = patch.answer;
    }

    return out satisfies Partial<FaqEntryTranslationsRow>;
};
