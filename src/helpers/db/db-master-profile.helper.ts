import type {
  MasterOwnProfileCertificateRow,
  MasterOwnProfileData,
  MasterOwnProfileOverviewRow,
  MasterOwnProfileServiceRow,
} from '../../types/db-helpers/db-master-profile.types.js';
import { queryMany, queryOne, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import {
  SQL_GET_MASTER_OWN_PROFILE_OVERVIEW,
  SQL_LIST_MASTER_OWN_PROFILE_CERTIFICATES,
  SQL_LIST_MASTER_OWN_PROFILE_SERVICES,
} from '../db-sql/db-master-profile.sql.js';

/**
 * @file db-master-profile.helper.ts
 * @summary DB helper для розділу "Мій профіль" у master panel.
 */

function normalizeMasterId(masterIdInput: string | number): string {
  const normalized = String(masterIdInput).trim();
  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError('Некоректний masterId', { masterId: masterIdInput });
  }
  return normalized;
}

/**
 * @summary Повертає повний snapshot власного профілю майстра.
 */
export async function getMasterOwnProfile(masterIdInput: string | number): Promise<MasterOwnProfileData> {
  const masterId = normalizeMasterId(masterIdInput);

  try {
    return await withTransaction(async (client) => {
      const overview = await queryOne<MasterOwnProfileOverviewRow, MasterOwnProfileOverviewRow>(
        SQL_GET_MASTER_OWN_PROFILE_OVERVIEW,
        [masterId],
        (row) => row,
        client,
      );

      if (!overview) {
        throw new ValidationError('Профіль майстра не знайдено', { masterId });
      }

      const [services, certificates] = await Promise.all([
        queryMany<MasterOwnProfileServiceRow, MasterOwnProfileData['services'][number]>(
          SQL_LIST_MASTER_OWN_PROFILE_SERVICES,
          [masterId],
          (row) => ({
            serviceId: row.service_id,
            serviceName: row.service_name,
          }),
          client,
        ),
        queryMany<MasterOwnProfileCertificateRow, MasterOwnProfileData['certificates'][number]>(
          SQL_LIST_MASTER_OWN_PROFILE_CERTIFICATES,
          [masterId],
          (row) => ({
            certificateId: row.certificate_id,
            title: row.title,
            issuer: row.issuer,
            issuedOn: row.issued_on ? new Date(row.issued_on) : null,
          }),
          client,
        ),
      ]);

      return {
        userId: overview.user_id,
        studioId: overview.studio_id,
        displayName: overview.display_name,
        isBookable: overview.is_bookable,
        firstName: overview.first_name,
        lastName: overview.last_name,
        telegramUsername: overview.telegram_username,
        bio: overview.bio,
        startedOn: overview.started_on ? new Date(overview.started_on) : null,
        experienceYears: overview.experience_years,
        proceduresDoneTotal: overview.procedures_done_total,
        materialsInfo: overview.materials_info,
        contactPhoneE164: overview.contact_phone_e164,
        contactEmail: overview.contact_email,
        masterCreatedAt: new Date(overview.master_created_at),
        services,
        certificates,
      };
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-profile.helper',
      action: 'Failed to load own master profile',
      error,
      meta: { masterId },
    });
    throw error;
  }
}

