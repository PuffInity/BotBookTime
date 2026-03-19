/**
 * @file db-masters.types.ts
 * @summary Типи для DB helper модуля майстрів у сценаріях клієнта.
 */

export type MasterBookingOptionRow = {
  master_id: string;
  studio_id: string;
  display_name: string;
  rating_avg: string;
  rating_count: number;
  experience_years: number | null;
};

export type MasterBookingOption = {
  masterId: string;
  studioId: string;
  displayName: string;
  ratingAvg: string;
  ratingCount: number;
  experienceYears: number | null;
};

export type ListMastersByServiceInput = {
  studioId: string | number;
  serviceId: string | number;
  limit?: number;
};
