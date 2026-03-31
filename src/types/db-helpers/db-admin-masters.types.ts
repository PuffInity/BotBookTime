/**
 * @file db-admin-masters.types.ts
 * @summary Типи для DB helper блоку "Майстри" в адмін-панелі.
 */

export type AdminMasterCandidateLookupRow = {
  user_id: string;
  telegram_user_id: string;
  telegram_username: string | null;
  first_name: string;
  last_name: string | null;
  is_active: boolean;
  is_master: boolean;
};

export type AdminMasterCandidateLookup = {
  userId: string;
  telegramUserId: string;
  telegramUsername: string | null;
  firstName: string;
  lastName: string | null;
  displayName: string;
  isActive: boolean;
  isMaster: boolean;
};

export type FindAdminMasterCandidateByTelegramInput = {
  studioId: string | number;
  telegramId: string | number;
};

export type AdminMasterCreateScheduleDayInput = {
  weekday: number;
  isWorking: boolean;
  openTime: string | null;
  closeTime: string | null;
};

export type CreateAdminMasterInput = {
  studioId: string | number;
  targetUserId: string | number;
  createdByUserId: string | number;
  displayName: string;
  bio: string;
  experienceYears: number;
  proceduresDoneTotal: number;
  materialsInfo: string;
  contactPhoneE164: string;
  contactEmail: string;
  serviceIds: Array<string | number>;
  weeklySchedule: AdminMasterCreateScheduleDayInput[];
};

export type CreatedAdminMasterResult = {
  masterId: string;
  telegramUserId: string;
  displayName: string;
  assignedServicesCount: number;
};

export type DeleteAdminMasterInput = {
  studioId: string | number;
  masterId: string | number;
};

export type DeletedAdminMasterRow = {
  master_id: string;
  display_name: string;
};

export type DeletedAdminMasterResult = {
  masterId: string;
  displayName: string;
};
