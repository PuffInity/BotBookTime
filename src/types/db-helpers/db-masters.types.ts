/**
 * @file db-masters.types.ts
 * @summary Типи для DB helper модуля каталогу майстрів.
 */

export type MasterCatalogItem = {
  userId: string;
  studioId: string;
  displayName: string;
  bio: string | null;
  experienceYears: number | null;
  proceduresDoneTotal: number;
  ratingAvg: string;
  ratingCount: number;
  isBookable: boolean;
};

export type MasterSpecializationItem = {
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  priceAmount: string;
  currencyCode: string;
};

export type MasterCatalogCertificate = {
  id: string;
  title: string;
  issuer: string | null;
  issuedOn: Date | null;
  expiresOn: Date | null;
  documentUrl: string | null;
};

export type MasterWeeklyScheduleItem = {
  weekday: number;
  isWorking: boolean;
  openTime: string | null;
  closeTime: string | null;
};

export type MasterUpcomingScheduleException =
  | {
      type: 'day_off';
      offDate: Date;
      reason: string | null;
    }
  | {
      type: 'vacation';
      dateFrom: Date;
      dateTo: Date;
      reason: string | null;
    }
  | {
      type: 'temporary';
      dateFrom: Date;
      dateTo: Date;
      weekday: number;
      isWorking: boolean;
      openTime: string | null;
      closeTime: string | null;
      note: string | null;
    };

export type MasterCatalogDetails = {
  master: MasterCatalogItem;
  specializations: MasterSpecializationItem[];
  certificates: MasterCatalogCertificate[];
  weeklySchedule: MasterWeeklyScheduleItem[];
  upcomingScheduleExceptions: MasterUpcomingScheduleException[];
  contactPhoneE164: string | null;
  contactEmail: string | null;
  materialsInfo: string | null;
};

export type ListMastersCatalogInput = {
  studioId?: string | null;
  limit?: number;
};

export type GetMasterCatalogDetailsInput = {
  masterId: string | number;
  studioId?: string | null;
};

export type MasterBookingOption = {
  userId: string;
  studioId: string;
  displayName: string;
  experienceYears: number | null;
  proceduresDoneTotal: number;
  ratingAvg: string;
  ratingCount: number;
};

export type ListMastersByServiceInput = {
  serviceId: string | number;
  studioId?: string | null;
  limit?: number;
};

type MasterSpecializationRow = {
  service_id: string;
  service_name: string;
  duration_minutes: number;
  price_amount: string;
  currency_code: string;
};

export type MastersCatalogRow = {
  user_id: string;
  studio_id: string;
  display_name: string;
  bio: string | null;
  experience_years: number | null;
  procedures_done_total: number;
  rating_avg: string;
  rating_count: number;
  is_bookable: boolean;
  contact_phone_e164: string | null;
  contact_email: string | null;
  materials_info: string | null;
};

export type MasterBookingOptionRow = {
  user_id: string;
  studio_id: string;
  display_name: string;
  experience_years: number | null;
  procedures_done_total: number;
  rating_avg: string;
  rating_count: number;
};

export type { MasterSpecializationRow };
