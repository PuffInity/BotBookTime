import {
    MastersRow,
    MastersEntity,
    MastersInsert,
    MastersUpdate
} from '../../types/db/masters.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file masters.mapp.ts
 * @summary Mapper для таблиці `masters` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {MastersRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {MastersEntity}
 */
export const mastersRowToEntity = (row: MastersRow): MastersEntity => {
    return {
        userId: row.user_id,
        studioId: row.studio_id,
        displayName: row.display_name,
        bio: row.bio,
        experienceYears: row.experience_years,
        proceduresDoneTotal: row.procedures_done_total,
        ratingAvg: row.rating_avg,
        ratingCount: row.rating_count,
        startedOn: row.started_on ? toDate(row.started_on) : null,
        materialsInfo: row.materials_info,
        contactPhoneE164: row.contact_phone_e164,
        contactEmail: row.contact_email,
        isBookable: row.is_bookable,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {MastersInsert} d - Дані для створення запису.
 * @returns {Partial<MastersRow>}
 */
export const toInsertMasters = (d: MastersInsert) => {
    const out: Partial<MastersRow> = {
        user_id: d.userId,
        studio_id: d.studioId,
        display_name: d.displayName,
        bio: d.bio ?? null,
        experience_years: d.experienceYears ?? null,
        procedures_done_total: d.proceduresDoneTotal ?? undefined,
        rating_avg: d.ratingAvg ?? undefined,
        rating_count: d.ratingCount ?? undefined,
        started_on: d.startedOn ? toDate(d.startedOn) : null,
        materials_info: d.materialsInfo ?? null,
        contact_phone_e164: d.contactPhoneE164 ?? null,
        contact_email: d.contactEmail ?? null,
        is_bookable: d.isBookable ?? undefined,
    };

    return out satisfies Partial<MastersRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {MastersUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<MastersRow>}
 */
export const toUpdateMasters = (patch?: MastersUpdate) => {
    const out: Partial<MastersRow> = {};

    if (!patch) return out;

    if ("userId" in patch && patch.userId !== undefined) {
        out.user_id = patch.userId;
    }

    if ("studioId" in patch && patch.studioId !== undefined) {
        out.studio_id = patch.studioId;
    }

    if ("displayName" in patch && patch.displayName !== undefined) {
        out.display_name = patch.displayName;
    }

    if ("bio" in patch && patch.bio !== undefined) {
        out.bio = patch.bio;
    }

    if ("experienceYears" in patch && patch.experienceYears !== undefined) {
        out.experience_years = patch.experienceYears;
    }

    if ("proceduresDoneTotal" in patch && patch.proceduresDoneTotal !== undefined) {
        out.procedures_done_total = patch.proceduresDoneTotal;
    }

    if ("ratingAvg" in patch && patch.ratingAvg !== undefined) {
        out.rating_avg = patch.ratingAvg;
    }

    if ("ratingCount" in patch && patch.ratingCount !== undefined) {
        out.rating_count = patch.ratingCount;
    }

    if ("startedOn" in patch && patch.startedOn !== undefined) {
        out.started_on = patch.startedOn ? toDate(patch.startedOn) : null;
    }

    if ("materialsInfo" in patch && patch.materialsInfo !== undefined) {
        out.materials_info = patch.materialsInfo;
    }

    if ("contactPhoneE164" in patch && patch.contactPhoneE164 !== undefined) {
        out.contact_phone_e164 = patch.contactPhoneE164;
    }

    if ("contactEmail" in patch && patch.contactEmail !== undefined) {
        out.contact_email = patch.contactEmail;
    }

    if ("isBookable" in patch && patch.isBookable !== undefined) {
        out.is_bookable = patch.isBookable;
    }

    return out satisfies Partial<MastersRow>;
};
