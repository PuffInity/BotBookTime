import type {
  MasterOwnProfileCertificateRow,
  MasterOwnProfileData,
  MasterOwnProfileOverviewRow,
  MasterOwnProfileServiceRow,
  UpdateMasterOwnProfileBioInput,
  UpdateMasterOwnProfileDisplayNameInput,
  UpdateMasterOwnProfileEmailInput,
  UpdateMasterOwnProfileMaterialsInput,
  UpdateMasterOwnProfilePhoneInput,
  UpdateMasterOwnProfileProceduresDoneTotalInput,
  UpdateMasterOwnProfileStartedOnInput,
} from '../../types/db-helpers/db-master-profile.types.js';
import { executeOne, queryMany, queryOne, withTransaction } from '../db.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import {
  SQL_GET_MASTER_OWN_PROFILE_OVERVIEW,
  SQL_LIST_MASTER_OWN_PROFILE_CERTIFICATES,
  SQL_LIST_MASTER_OWN_PROFILE_SERVICES,
  SQL_UPDATE_MASTER_OWN_PROFILE_BIO,
  SQL_UPDATE_MASTER_OWN_PROFILE_DISPLAY_NAME,
  SQL_UPDATE_MASTER_OWN_PROFILE_EMAIL,
  SQL_UPDATE_MASTER_OWN_PROFILE_MATERIALS,
  SQL_UPDATE_MASTER_OWN_PROFILE_PHONE,
  SQL_UPDATE_MASTER_OWN_PROFILE_PROCEDURES_DONE_TOTAL,
  SQL_UPDATE_MASTER_OWN_PROFILE_STARTED_ON,
} from '../db-sql/db-master-profile.sql.js';
import {
  normalizeMasterBio,
  normalizeMasterDisplayName,
  normalizeMasterContactEmail,
  normalizeMasterContactPhone,
  normalizeMasterMaterialsInfo,
  normalizeMasterProceduresDoneTotal,
  normalizeMasterStartedOn,
} from '../../utils/db/db-master-profile.js';

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

type UpdatedMasterIdRow = {
  user_id: string;
};

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

/**
 * @summary Оновлює поле `bio` у профілі майстра.
 */
export async function updateMasterOwnProfileBio(data: UpdateMasterOwnProfileBioInput): Promise<void> {
  const masterId = normalizeMasterId(data.masterId);
  const bio = normalizeMasterBio(data.bio);

  try {
    await withTransaction(async (client) => {
      await executeOne<UpdatedMasterIdRow, string>(
        SQL_UPDATE_MASTER_OWN_PROFILE_BIO,
        [masterId, bio],
        (row) => row.user_id,
        client,
      );
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-profile.helper',
      action: 'Failed to update master bio',
      error,
      meta: { masterId },
    });
    throw error;
  }
}

/**
 * @summary Оновлює поле `materials_info` у профілі майстра.
 */
export async function updateMasterOwnProfileMaterials(
  data: UpdateMasterOwnProfileMaterialsInput,
): Promise<void> {
  const masterId = normalizeMasterId(data.masterId);
  const materialsInfo = normalizeMasterMaterialsInfo(data.materialsInfo);

  try {
    await withTransaction(async (client) => {
      await executeOne<UpdatedMasterIdRow, string>(
        SQL_UPDATE_MASTER_OWN_PROFILE_MATERIALS,
        [masterId, materialsInfo],
        (row) => row.user_id,
        client,
      );
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-profile.helper',
      action: 'Failed to update master materials',
      error,
      meta: { masterId },
    });
    throw error;
  }
}

/**
 * @summary Оновлює поле `contact_phone_e164` у профілі майстра.
 */
export async function updateMasterOwnProfilePhone(
  data: UpdateMasterOwnProfilePhoneInput,
): Promise<void> {
  const masterId = normalizeMasterId(data.masterId);
  const contactPhoneE164 = normalizeMasterContactPhone(data.contactPhoneE164);

  try {
    await withTransaction(async (client) => {
      await executeOne<UpdatedMasterIdRow, string>(
        SQL_UPDATE_MASTER_OWN_PROFILE_PHONE,
        [masterId, contactPhoneE164],
        (row) => row.user_id,
        client,
      );
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-profile.helper',
      action: 'Failed to update master contact phone',
      error,
      meta: { masterId },
    });
    throw error;
  }
}

/**
 * @summary Оновлює поле `contact_email` у профілі майстра.
 */
export async function updateMasterOwnProfileEmail(
  data: UpdateMasterOwnProfileEmailInput,
): Promise<void> {
  const masterId = normalizeMasterId(data.masterId);
  const contactEmail = normalizeMasterContactEmail(data.contactEmail);

  try {
    await withTransaction(async (client) => {
      await executeOne<UpdatedMasterIdRow, string>(
        SQL_UPDATE_MASTER_OWN_PROFILE_EMAIL,
        [masterId, contactEmail],
        (row) => row.user_id,
        client,
      );
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-profile.helper',
      action: 'Failed to update master contact email',
      error,
      meta: { masterId },
    });
    throw error;
  }
}

/**
 * @summary Оновлює поле `display_name` у профілі майстра.
 */
export async function updateMasterOwnProfileDisplayName(
  data: UpdateMasterOwnProfileDisplayNameInput,
): Promise<void> {
  const masterId = normalizeMasterId(data.masterId);
  const displayName = normalizeMasterDisplayName(data.displayName);

  try {
    await withTransaction(async (client) => {
      await executeOne<UpdatedMasterIdRow, string>(
        SQL_UPDATE_MASTER_OWN_PROFILE_DISPLAY_NAME,
        [masterId, displayName],
        (row) => row.user_id,
        client,
      );
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-profile.helper',
      action: 'Failed to update master display name',
      error,
      meta: { masterId },
    });
    throw error;
  }
}

/**
 * @summary Оновлює поле `started_on` у профілі майстра.
 */
export async function updateMasterOwnProfileStartedOn(
  data: UpdateMasterOwnProfileStartedOnInput,
): Promise<void> {
  const masterId = normalizeMasterId(data.masterId);
  const startedOn = normalizeMasterStartedOn(data.startedOn);

  try {
    await withTransaction(async (client) => {
      await executeOne<UpdatedMasterIdRow, string>(
        SQL_UPDATE_MASTER_OWN_PROFILE_STARTED_ON,
        [masterId, startedOn],
        (row) => row.user_id,
        client,
      );
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-profile.helper',
      action: 'Failed to update master started on',
      error,
      meta: { masterId },
    });
    throw error;
  }
}

/**
 * @summary Оновлює поле `procedures_done_total` у профілі майстра.
 */
export async function updateMasterOwnProfileProceduresDoneTotal(
  data: UpdateMasterOwnProfileProceduresDoneTotalInput,
): Promise<void> {
  const masterId = normalizeMasterId(data.masterId);
  const proceduresDoneTotal = normalizeMasterProceduresDoneTotal(data.proceduresDoneTotal);

  try {
    await withTransaction(async (client) => {
      await executeOne<UpdatedMasterIdRow, string>(
        SQL_UPDATE_MASTER_OWN_PROFILE_PROCEDURES_DONE_TOTAL,
        [masterId, proceduresDoneTotal],
        (row) => row.user_id,
        client,
      );
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-profile.helper',
      action: 'Failed to update master procedures done total',
      error,
      meta: { masterId },
    });
    throw error;
  }
}
