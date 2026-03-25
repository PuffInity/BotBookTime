import type {
  AdminPanelAccess,
  AdminPanelAccessRow,
} from '../../types/db-helpers/db-admin-panel.types.js';
import { queryOne, withTransaction } from '../db.helper.js';
import { handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import { normalizeTelegramId } from '../../utils/db/db-profile.js';
import { SQL_GET_ADMIN_PANEL_ACCESS_BY_TELEGRAM_ID } from '../db-sql/db-admin-panel.sql.js';

/**
 * @file db-admin-panel.helper.ts
 * @summary DB helper для перевірки доступу і контексту адмін-панелі.
 */

function mapAdminPanelAccessRow(row: AdminPanelAccessRow): AdminPanelAccess {
  return {
    userId: row.user_id,
    telegramUserId: row.telegram_user_id,
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

  try {
    return await withTransaction(async (client) =>
      queryOne<AdminPanelAccessRow, AdminPanelAccess>(
        SQL_GET_ADMIN_PANEL_ACCESS_BY_TELEGRAM_ID,
        [telegramUserId],
        mapAdminPanelAccessRow,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-admin-panel.helper',
      action: 'Failed to get admin panel access by telegram id',
      error,
      meta: { telegramUserId },
    });
    throw error;
  }
}
