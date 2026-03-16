import {
    MasterCertificatesRow,
    MasterCertificatesEntity,
    MasterCertificatesInsert,
    MasterCertificatesUpdate
} from '../../types/db/masterCertificates.type.js';

import { toDate } from './helper.mapp.js';

/**
 * @file masterCertificates.mapp.ts
 * @summary Mapper для таблиці `masterCertificates` (Row <-> Entity, Insert, Update).
 */

/**
 * @summary Перетворює запис БД (Row) у доменну сутність (Entity).
 * @param {MasterCertificatesRow} row - Запис з PostgreSQL у форматі snake_case.
 * @returns {MasterCertificatesEntity}
 */
export const masterCertificatesRowToEntity = (row: MasterCertificatesRow): MasterCertificatesEntity => {
    return {
        id: row.id,
        masterId: row.master_id,
        title: row.title,
        issuer: row.issuer,
        issuedOn: row.issued_on ? toDate(row.issued_on) : null,
        expiresOn: row.expires_on ? toDate(row.expires_on) : null,
        documentUrl: row.document_url,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
};

/**
 * @summary Готує payload для INSERT у форматі Partial<Row>.
 * @param {MasterCertificatesInsert} d - Дані для створення запису.
 * @returns {Partial<MasterCertificatesRow>}
 */
export const toInsertMasterCertificates = (d: MasterCertificatesInsert) => {
    const out: Partial<MasterCertificatesRow> = {
        master_id: d.masterId,
        title: d.title,
        issuer: d.issuer ?? null,
        issued_on: d.issuedOn ? toDate(d.issuedOn) : null,
        expires_on: d.expiresOn ? toDate(d.expiresOn) : null,
        document_url: d.documentUrl ?? null,
    };

    return out satisfies Partial<MasterCertificatesRow>;
};

/**
 * @summary Готує payload для UPDATE у форматі Partial<Row>.
 * @param {MasterCertificatesUpdate} [patch] - Часткові дані для оновлення.
 * @returns {Partial<MasterCertificatesRow>}
 */
export const toUpdateMasterCertificates = (patch?: MasterCertificatesUpdate) => {
    const out: Partial<MasterCertificatesRow> = {};

    if (!patch) return out;

    if ("masterId" in patch && patch.masterId !== undefined) {
        out.master_id = patch.masterId;
    }

    if ("title" in patch && patch.title !== undefined) {
        out.title = patch.title;
    }

    if ("issuer" in patch && patch.issuer !== undefined) {
        out.issuer = patch.issuer;
    }

    if ("issuedOn" in patch && patch.issuedOn !== undefined) {
        out.issued_on = patch.issuedOn ? toDate(patch.issuedOn) : null;
    }

    if ("expiresOn" in patch && patch.expiresOn !== undefined) {
        out.expires_on = patch.expiresOn ? toDate(patch.expiresOn) : null;
    }

    if ("documentUrl" in patch && patch.documentUrl !== undefined) {
        out.document_url = patch.documentUrl;
    }

    return out satisfies Partial<MasterCertificatesRow>;
};
