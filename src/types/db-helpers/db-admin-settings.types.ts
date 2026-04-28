/**
 * @file db-admin-settings.types.ts
 * @summary uk: Типи для DB helper блоку "Налаштування" адмін-панелі.
 * en: DB helper type definitions.
 * cz: DB helper type definitions.
 */
import type { LanguageCode } from '../db/dbEnums.type.js';

export type AdminStudioAdminRow = {
  user_id: string;
  telegram_user_id: string;
  telegram_username: string | null;
  first_name: string;
  last_name: string | null;
  granted_at: Date;
  granted_by: string | null;
};

export type AdminStudioAdminMember = {
  userId: string;
  telegramUserId: string;
  telegramUsername: string | null;
  firstName: string;
  lastName: string | null;
  displayName: string;
  grantedAt: Date;
  grantedBy: string | null;
};

export type AdminStudioUserLookupRow = {
  user_id: string;
  telegram_user_id: string;
  telegram_username: string | null;
  first_name: string;
  last_name: string | null;
  is_admin: boolean;
  is_active: boolean;
};

export type AdminStudioUserLookup = {
  userId: string;
  telegramUserId: string;
  telegramUsername: string | null;
  firstName: string;
  lastName: string | null;
  displayName: string;
  isAdmin: boolean;
  isActive: boolean;
};

export type AdminStudioAdminsCountRow = {
  total: string | number;
};

export type ListAdminStudioAdminsInput = {
  studioId: string | number;
};

export type FindAdminStudioUserByTelegramInput = {
  studioId: string | number;
  telegramId: string | number;
};

export type GrantStudioAdminRoleInput = {
  studioId: string | number;
  telegramId: string | number;
  grantedByUserId: string | number;
};

export type RevokeStudioAdminRoleInput = {
  studioId: string | number;
  telegramId: string | number;
  revokedByUserId: string | number;
};

export type AdminPanelLanguageRow = {
  preferred_language: LanguageCode;
};

export type GetAdminPanelLanguageInput = {
  userId: string | number;
};

export type SetAdminPanelLanguageInput = {
  userId: string | number;
  language: LanguageCode;
};
