import type { ContentBlockKey, LanguageCode } from '../db/dbEnums.type.js';

/**
 * @file db-admin-studio-settings.types.ts
 * @summary Типи для DB helper блоку "Параметри салону" в адмін-панелі.
 */

export type AdminStudioSettingsStudioRow = {
  id: string;
  name: string;
  city: string | null;
  address_line: string | null;
  phone_e164: string | null;
  email: string | null;
  timezone: string;
  currency_code: string;
  is_active: boolean;
};

export type AdminStudioSettingsWeeklyHoursRow = {
  weekday: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
};

export type AdminStudioSettingsContentBlockRow = {
  block_key: ContentBlockKey;
  content: string;
  language: LanguageCode;
  updated_at: Date;
};

export type AdminStudioSettingsStudio = {
  id: string;
  name: string;
  city: string | null;
  addressLine: string | null;
  phoneE164: string | null;
  email: string | null;
  timezone: string;
  currencyCode: string;
  isActive: boolean;
};

export type AdminStudioSettingsWeeklyHours = {
  weekday: number;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
};

export type AdminStudioSettingsContentBlock = {
  blockKey: ContentBlockKey;
  content: string;
  language: LanguageCode;
  updatedAt: Date;
};

export type AdminStudioProfileSettings = {
  studio: AdminStudioSettingsStudio;
  weeklyHours: AdminStudioSettingsWeeklyHours[];
  contentBlocks: Record<ContentBlockKey, string>;
  language: LanguageCode;
};

export type GetAdminStudioProfileSettingsInput = {
  studioId: string | number;
  language?: LanguageCode;
};

export type UpsertAdminStudioContentBlockInput = {
  studioId: string | number;
  blockKey: ContentBlockKey;
  content: string;
  language?: LanguageCode;
  updatedBy: string | number;
};
