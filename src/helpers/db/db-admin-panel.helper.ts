import type {
  AdminPanelAccess,
  AdminPanelAccessRow,
} from '../../types/db-helpers/db-admin-panel.types.js';
import { queryOne, withTransaction } from '../db.helper.js';
import { normalizeTelegramId } from '../../utils/db/db-profile.js';
import { SQL_GET_ADMIN_PANEL_ACCESS_BY_TELEGRAM_ID } from '../db-sql/db-admin-panel.sql.js';

/**
 * @file db-admin-panel.helper.ts
 * @summary DB helper для перевірки доступу і контексту адмін-панелі.
 */

/**
 * uk: Внутрішній helper метод mapAdminPanelAccessRow.
 * en: Internal helper method mapAdminPanelAccessRow.
 * cz: Interní helper metoda mapAdminPanelAccessRow.
 */
function mapAdminPanelAccessRow(row: AdminPanelAccessRow): AdminPanelAccess {
  return {
    userId: row.user_id,
    telegramUserId: row.telegram_user_id,
    studioId: row.studio_id,
    firstName: row.first_name,
    lastName: row.last_name,
  };
}

/**
 * @summary Повертає контекст доступу до адмін-панелі за Telegram ID.
 * @returns `AdminPanelAccess`, якщо доступ є, або `null`, якщо ролі немає.
 */
export async function getAdminPanelAccessByTelegramId(
  telegramId: string | number,
): Promise<AdminPanelAccess | null> {
  const telegramUserId = normalizeTelegramId(telegramId);

  return await withTransaction(async (client) =>
    queryOne<AdminPanelAccessRow, AdminPanelAccess>(
      SQL_GET_ADMIN_PANEL_ACCESS_BY_TELEGRAM_ID,
      [telegramUserId],
      mapAdminPanelAccessRow,
      client,
    ),
  );
}
