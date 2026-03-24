/**
 * @file db-master-profile.types.ts
 * @summary Типи для DB helper блоку "Мій профіль майстра" у master panel.
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

export type MasterOwnProfileCertificateRow = {
  certificate_id: string;
  title: string;
  issuer: string | null;
  issued_on: Date | null;
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

