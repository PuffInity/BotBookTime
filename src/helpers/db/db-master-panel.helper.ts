import type {
  MasterPanelAccess,
  MasterPanelAccessRow,
} from '../../types/db-helpers/db-master-panel.types.js';
import { queryOne, withTransaction } from '../db.helper.js';
import { handleError } from '../../utils/error.utils.js';
import { loggerDb } from '../../utils/logger/loggers-list.js';
import { normalizeTelegramId } from '../../utils/db/db-profile.js';
import { SQL_GET_MASTER_PANEL_ACCESS_BY_TELEGRAM_ID } from '../db-sql/db-master-panel.sql.js';

/**
 * @file db-master-panel.helper.ts
 * @summary uk: DB helper для перевірки доступу і контексту панелі майстра.
 * en: DB helper module.
 * cz: DB helper module.
 */

/**
 * uk: Внутрішній helper метод mapMasterPanelAccessRow.
 * en: Internal helper method mapMasterPanelAccessRow.
 * cz: Interní helper metoda mapMasterPanelAccessRow.
 */
function mapMasterPanelAccessRow(row: MasterPanelAccessRow): MasterPanelAccess {
  return {
    userId: row.user_id,
    telegramUserId: row.telegram_user_id,
    studioId: row.studio_id,
    masterId: row.master_id,
    displayName: row.display_name,
    isBookable: row.is_bookable,
    firstName: row.first_name,
    lastName: row.last_name,
  };
}

/**
 * @summary Повертає контекст доступу до панелі майстра за Telegram ID.
 * @returns `MasterPanelAccess`, якщо доступ є, або `null`, якщо ролі/звʼязки немає.
 */
export async function getMasterPanelAccessByTelegramId(
  telegramId: string | number,
): Promise<MasterPanelAccess | null> {
  const telegramUserId = normalizeTelegramId(telegramId);

  try {
    return await withTransaction(async (client) =>
      queryOne<MasterPanelAccessRow, MasterPanelAccess>(
        SQL_GET_MASTER_PANEL_ACCESS_BY_TELEGRAM_ID,
        [telegramUserId],
        mapMasterPanelAccessRow,
        client,
      ),
    );
  } catch (error) {
    handleError({
      logger: loggerDb,
      scope: 'db-master-panel.helper',
      action: 'Failed to get master panel access by telegram id',
      error,
      meta: { telegramUserId },
    });
    throw error;
  }
}
