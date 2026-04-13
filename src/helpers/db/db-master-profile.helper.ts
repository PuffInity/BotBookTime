import type {
  AddMasterOwnCertificateInput,
  AddMasterOwnServiceInput,
  DeleteMasterOwnCertificateInput,
  MasterOwnProfileCertificateRow,
  MasterOwnProfileCertificateManageItem,
  MasterOwnProfileCertificateManageRow,
  MasterOwnProfileData,
  MasterOwnProfileOverviewRow,
  RemoveMasterOwnServiceInput,
  MasterOwnProfileServiceManageItem,
  MasterOwnProfileServiceManageRow,
  MasterOwnProfileServiceRow,
  ToggleMasterOwnServiceAvailabilityInput,
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
  SQL_ADD_MASTER_OWN_SERVICE,
  SQL_DELETE_MASTER_OWN_CERTIFICATE,
  SQL_FIND_MASTER_OWN_CERTIFICATE_BY_TITLE,
  SQL_GET_MASTER_OWN_PROFILE_OVERVIEW,
  SQL_INSERT_MASTER_OWN_CERTIFICATE,
  SQL_LIST_MASTER_OWN_PROFILE_CERTIFICATES_MANAGE,
  SQL_LIST_MASTER_OWN_PROFILE_SERVICES_ADD_CANDIDATES,
  SQL_LIST_MASTER_OWN_PROFILE_CERTIFICATES,
  SQL_LIST_MASTER_OWN_PROFILE_SERVICES_REMOVE_CANDIDATES,
  SQL_LIST_MASTER_OWN_PROFILE_SERVICES_MANAGE,
  SQL_LIST_MASTER_OWN_PROFILE_SERVICES,
  SQL_REMOVE_MASTER_OWN_SERVICE,
  SQL_TOGGLE_MASTER_OWN_SERVICE_AVAILABILITY,
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
  normalizeMasterCertificateTitle,
  normalizeMasterDisplayName,
  normalizeMasterContactEmail,
  normalizeMasterContactPhone,
  normalizeMasterMaterialsInfo,
  normalizeMasterProceduresDoneTotal,
  normalizeMasterStartedOn,
} from '../../utils/db/db-master-profile.js';

/**
 * @file db-master-profile.helper.ts
 * @summary uk: DB helper для розділу "Мій профіль" у master panel.
 * en: DB helper module.
 * cz: DB helper module.
 */

/**
 * uk: Внутрішній helper метод normalizeMasterId.
 * en: Internal helper method normalizeMasterId.
 * cz: Interní helper metoda normalizeMasterId.
 */
function normalizeMasterId(masterIdInput: string | number): string {
  const normalized = String(masterIdInput).trim();
  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError('Некоректний masterId', { masterId: masterIdInput });
  }
  return normalized;
}

/**
 * uk: Внутрішній helper метод normalizeServiceId.
 * en: Internal helper method normalizeServiceId.
 * cz: Interní helper metoda normalizeServiceId.
 */
function normalizeServiceId(serviceIdInput: string | number): string {
  const normalized = String(serviceIdInput).trim();
  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError('Некоректний serviceId', { serviceId: serviceIdInput });
  }
  return normalized;
}

/**
 * uk: Внутрішній helper метод normalizeCertificateId.
 * en: Internal helper method normalizeCertificateId.
 * cz: Interní helper metoda normalizeCertificateId.
 */
function normalizeCertificateId(certificateIdInput: string | number): string {
  const normalized = String(certificateIdInput).trim();
  if (!/^\d+$/.test(normalized) || normalized === '0') {
    throw new ValidationError('Некоректний certificateId', { certificateId: certificateIdInput });
  }
  return normalized;
}

type UpdatedMasterIdRow = {
  user_id: string;
};

type ToggledMasterOwnServiceRow = {
  service_id: string;
  service_name: string;
  is_active: boolean;
};

type AddedOrRemovedMasterOwnServiceRow = {
  service_id: string;
  service_name: string;
  is_active: boolean;
};

type CreatedOrDeletedMasterOwnCertificateRow = {
  certificate_id: string;
  title: string;
};

type ExistingMasterOwnCertificateByTitleRow = {
  certificate_id: string;
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

/**
 * @summary Повертає список послуг майстра для керування активністю.
 */
export async function listMasterOwnServicesManage(
  masterIdInput: string | number,
): Promise<MasterOwnProfileServiceManageItem[]> {
  const masterId = normalizeMasterId(masterIdInput);

  try {
    return await withTransaction(async (client) =>
      queryMany<MasterOwnProfileServiceManageRow, MasterOwnProfileServiceManageItem>(
        SQL_LIST_MASTER_OWN_PROFILE_SERVICES_MANAGE,
        [masterId],
        (row) => ({
          serviceId: row.service_id,
          serviceName: row.service_name,
          isActive: row.is_active,
          durationMinutes: row.duration_minutes,
          priceAmount: row.price_amount,
          currencyCode: row.currency_code,
        }),
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-profile.helper',
      action: 'Failed to list own master services for manage',
      error,
      meta: { masterId },
    });
    throw error;
  }
}

/**
 * @summary Повертає послуги, які можна додати майстру (ще не активні у майстра).
 */
export async function listMasterOwnServicesAddCandidates(
  masterIdInput: string | number,
): Promise<MasterOwnProfileServiceManageItem[]> {
  const masterId = normalizeMasterId(masterIdInput);

  try {
    return await withTransaction(async (client) =>
      queryMany<MasterOwnProfileServiceManageRow, MasterOwnProfileServiceManageItem>(
        SQL_LIST_MASTER_OWN_PROFILE_SERVICES_ADD_CANDIDATES,
        [masterId],
        (row) => ({
          serviceId: row.service_id,
          serviceName: row.service_name,
          isActive: row.is_active,
          durationMinutes: row.duration_minutes,
          priceAmount: row.price_amount,
          currencyCode: row.currency_code,
        }),
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-profile.helper',
      action: 'Failed to list add-candidate services for master profile',
      error,
      meta: { masterId },
    });
    throw error;
  }
}

/**
 * @summary Повертає активні послуги майстра, які можна вимкнути.
 */
export async function listMasterOwnServicesRemoveCandidates(
  masterIdInput: string | number,
): Promise<MasterOwnProfileServiceManageItem[]> {
  const masterId = normalizeMasterId(masterIdInput);

  try {
    return await withTransaction(async (client) =>
      queryMany<MasterOwnProfileServiceManageRow, MasterOwnProfileServiceManageItem>(
        SQL_LIST_MASTER_OWN_PROFILE_SERVICES_REMOVE_CANDIDATES,
        [masterId],
        (row) => ({
          serviceId: row.service_id,
          serviceName: row.service_name,
          isActive: row.is_active,
          durationMinutes: row.duration_minutes,
          priceAmount: row.price_amount,
          currencyCode: row.currency_code,
        }),
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-profile.helper',
      action: 'Failed to list remove-candidate services for master profile',
      error,
      meta: { masterId },
    });
    throw error;
  }
}

/**
 * @summary Перемикає активність послуги майстра (`master_services.is_active`).
 */
export async function toggleMasterOwnServiceAvailability(
  data: ToggleMasterOwnServiceAvailabilityInput,
): Promise<{
  serviceId: string;
  serviceName: string;
  isActive: boolean;
}> {
  const masterId = normalizeMasterId(data.masterId);
  const serviceId = normalizeServiceId(data.serviceId);

  try {
    return await withTransaction(async (client) =>
      executeOne<ToggledMasterOwnServiceRow, { serviceId: string; serviceName: string; isActive: boolean }>(
        SQL_TOGGLE_MASTER_OWN_SERVICE_AVAILABILITY,
        [masterId, serviceId],
        (row) => ({
          serviceId: row.service_id,
          serviceName: row.service_name,
          isActive: row.is_active,
        }),
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-profile.helper',
      action: 'Failed to toggle own master service availability',
      error,
      meta: { masterId, serviceId },
    });
    throw error;
  }
}

/**
 * @summary Додає (або повторно активує) послугу майстра.
 */
export async function addMasterOwnService(
  data: AddMasterOwnServiceInput,
): Promise<{
  serviceId: string;
  serviceName: string;
  isActive: boolean;
}> {
  const masterId = normalizeMasterId(data.masterId);
  const serviceId = normalizeServiceId(data.serviceId);

  try {
    return await withTransaction(async (client) =>
      executeOne<AddedOrRemovedMasterOwnServiceRow, { serviceId: string; serviceName: string; isActive: boolean }>(
        SQL_ADD_MASTER_OWN_SERVICE,
        [masterId, serviceId],
        (row) => ({
          serviceId: row.service_id,
          serviceName: row.service_name,
          isActive: row.is_active,
        }),
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-profile.helper',
      action: 'Failed to add own master service',
      error,
      meta: { masterId, serviceId },
    });
    throw error;
  }
}

/**
 * @summary Вимикає послугу майстра (логічне видалення з публічного списку).
 */
export async function removeMasterOwnService(
  data: RemoveMasterOwnServiceInput,
): Promise<{
  serviceId: string;
  serviceName: string;
  isActive: boolean;
}> {
  const masterId = normalizeMasterId(data.masterId);
  const serviceId = normalizeServiceId(data.serviceId);

  try {
    return await withTransaction(async (client) =>
      executeOne<AddedOrRemovedMasterOwnServiceRow, { serviceId: string; serviceName: string; isActive: boolean }>(
        SQL_REMOVE_MASTER_OWN_SERVICE,
        [masterId, serviceId],
        (row) => ({
          serviceId: row.service_id,
          serviceName: row.service_name,
          isActive: row.is_active,
        }),
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-profile.helper',
      action: 'Failed to remove own master service',
      error,
      meta: { masterId, serviceId },
    });
    throw error;
  }
}

/**
 * @summary Повертає список дипломів/сертифікатів майстра для керування.
 */
export async function listMasterOwnCertificatesManage(
  masterIdInput: string | number,
): Promise<MasterOwnProfileCertificateManageItem[]> {
  const masterId = normalizeMasterId(masterIdInput);

  try {
    return await withTransaction(async (client) =>
      queryMany<MasterOwnProfileCertificateManageRow, MasterOwnProfileCertificateManageItem>(
        SQL_LIST_MASTER_OWN_PROFILE_CERTIFICATES_MANAGE,
        [masterId],
        (row) => ({
          certificateId: row.certificate_id,
          title: row.title,
          issuer: row.issuer,
          issuedOn: row.issued_on ? new Date(row.issued_on) : null,
        }),
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-profile.helper',
      action: 'Failed to list own master certificates for manage',
      error,
      meta: { masterId },
    });
    throw error;
  }
}

/**
 * @summary Додає новий сертифікат у профіль майстра.
 */
export async function addMasterOwnCertificate(
  data: AddMasterOwnCertificateInput,
): Promise<{ certificateId: string; title: string }> {
  const masterId = normalizeMasterId(data.masterId);
  const title = normalizeMasterCertificateTitle(data.title);

  try {
    return await withTransaction(async (client) => {
      const existing = await queryOne<
        ExistingMasterOwnCertificateByTitleRow,
        ExistingMasterOwnCertificateByTitleRow
      >(
        SQL_FIND_MASTER_OWN_CERTIFICATE_BY_TITLE,
        [masterId, title],
        (row) => row,
        client,
      );

      if (existing) {
        throw new ValidationError('Такий документ уже додано', { title });
      }

      return executeOne<CreatedOrDeletedMasterOwnCertificateRow, { certificateId: string; title: string }>(
        SQL_INSERT_MASTER_OWN_CERTIFICATE,
        [masterId, title],
        (row) => ({
          certificateId: row.certificate_id,
          title: row.title,
        }),
        client,
      );
    });
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-profile.helper',
      action: 'Failed to add own master certificate',
      error,
      meta: { masterId, title },
    });
    throw error;
  }
}

/**
 * @summary Видаляє сертифікат з профілю майстра.
 */
export async function deleteMasterOwnCertificate(
  data: DeleteMasterOwnCertificateInput,
): Promise<{ certificateId: string; title: string }> {
  const masterId = normalizeMasterId(data.masterId);
  const certificateId = normalizeCertificateId(data.certificateId);

  try {
    return await withTransaction(async (client) =>
      executeOne<CreatedOrDeletedMasterOwnCertificateRow, { certificateId: string; title: string }>(
        SQL_DELETE_MASTER_OWN_CERTIFICATE,
        [masterId, certificateId],
        (row) => ({
          certificateId: row.certificate_id,
          title: row.title,
        }),
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-profile.helper',
      action: 'Failed to delete own master certificate',
      error,
      meta: { masterId, certificateId },
    });
    throw error;
  }
}
