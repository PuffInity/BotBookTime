/**
 * @file db-master-profile.types.ts
 * @summary uk: Типи для DB helper блоку "Мій профіль майстра" у master panel.
 * en: DB helper type definitions.
 * cz: DB helper type definitions.
 */

export type MasterOwnProfileOverviewRow = {
  user_id: string;
  studio_id: string;
  display_name: string;
  is_bookable: boolean;
  first_name: string;
  last_name: string | null;
  telegram_username: string | null;
  bio: string | null;
  started_on: Date | null;
  experience_years: number | null;
  procedures_done_total: number;
  materials_info: string | null;
  contact_phone_e164: string | null;
  contact_email: string | null;
  master_created_at: Date;
};

export type MasterOwnProfileServiceRow = {
  service_id: string;
  service_name: string;
};

export type MasterOwnProfileServiceManageRow = {
  service_id: string;
  service_name: string;
  is_active: boolean;
  duration_minutes: number;
  price_amount: string;
  currency_code: string;
};

export type MasterOwnProfileCertificateRow = {
  certificate_id: string;
  title: string;
  issuer: string | null;
  issued_on: Date | null;
};

export type MasterOwnProfileServiceManageItem = {
  serviceId: string;
  serviceName: string;
  isActive: boolean;
  durationMinutes: number;
  priceAmount: string;
  currencyCode: string;
};

export type MasterOwnProfileCertificateManageRow = {
  certificate_id: string;
  title: string;
  issuer: string | null;
  issued_on: Date | null;
};

export type MasterOwnProfileCertificateManageItem = {
  certificateId: string;
  title: string;
  issuer: string | null;
  issuedOn: Date | null;
};

export type MasterOwnProfileData = {
  userId: string;
  studioId: string;
  displayName: string;
  isBookable: boolean;
  firstName: string;
  lastName: string | null;
  telegramUsername: string | null;
  bio: string | null;
  startedOn: Date | null;
  experienceYears: number | null;
  proceduresDoneTotal: number;
  materialsInfo: string | null;
  contactPhoneE164: string | null;
  contactEmail: string | null;
  masterCreatedAt: Date;
  services: {
    serviceId: string;
    serviceName: string;
  }[];
  certificates: {
    certificateId: string;
    title: string;
    issuer: string | null;
    issuedOn: Date | null;
  }[];
};

export type UpdateMasterOwnProfileBioInput = {
  masterId: string | number;
  bio: string;
};

export type UpdateMasterOwnProfileMaterialsInput = {
  masterId: string | number;
  materialsInfo: string;
};

export type UpdateMasterOwnProfilePhoneInput = {
  masterId: string | number;
  contactPhoneE164: string;
};

export type UpdateMasterOwnProfileEmailInput = {
  masterId: string | number;
  contactEmail: string;
};

export type UpdateMasterOwnProfileDisplayNameInput = {
  masterId: string | number;
  displayName: string;
};

export type UpdateMasterOwnProfileStartedOnInput = {
  masterId: string | number;
  startedOn: string;
};

export type UpdateMasterOwnProfileProceduresDoneTotalInput = {
  masterId: string | number;
  proceduresDoneTotal: string | number;
};

export type ToggleMasterOwnServiceAvailabilityInput = {
  masterId: string | number;
  serviceId: string | number;
};

export type AddMasterOwnServiceInput = {
  masterId: string | number;
  serviceId: string | number;
};

export type RemoveMasterOwnServiceInput = {
  masterId: string | number;
  serviceId: string | number;
};

export type AddMasterOwnCertificateInput = {
  masterId: string | number;
  title: string;
};

export type DeleteMasterOwnCertificateInput = {
  masterId: string | number;
  certificateId: string | number;
};
