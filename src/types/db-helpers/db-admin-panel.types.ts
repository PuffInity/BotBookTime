/**
 * @file db-admin-panel.types.ts
 * @summary uk: Типи для DB helper модуля доступу до адмін-панелі.
 * en: DB helper type definitions.
 * cz: DB helper type definitions.
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
