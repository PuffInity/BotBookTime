/**
 * @file db-admin-panel.types.ts
 * @summary Типи для DB helper модуля доступу до адмін-панелі.
 */

/**
 * Сирий рядок з SQL запиту доступу до адмін-панелі.
 */
export type AdminPanelAccessRow = {
  user_id: string;
  telegram_user_id: string;
  studio_id: string | null;
  first_name: string;
  last_name: string | null;
};

/**
 * Нормалізована бізнес-модель доступу адміністратора.
 */
export type AdminPanelAccess = {
  userId: string;
  telegramUserId: string;
  studioId: string | null;
  firstName: string;
  lastName: string | null;
};
