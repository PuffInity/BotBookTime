/**
 * @file db-master-panel.types.ts
 * @summary Типи для DB helper модуля доступу до панелі майстра.
 */

/**
 * Сирий рядок з SQL запиту доступу до панелі майстра.
 */
export type MasterPanelAccessRow = {
  user_id: string;
  telegram_user_id: string;
  studio_id: string;
  master_id: string;
  display_name: string;
  first_name: string;
  last_name: string | null;
};

/**
 * Нормалізована бізнес-модель доступу майстра.
 */
export type MasterPanelAccess = {
  userId: string;
  telegramUserId: string;
  studioId: string;
  masterId: string;
  displayName: string;
  firstName: string;
  lastName: string | null;
};

