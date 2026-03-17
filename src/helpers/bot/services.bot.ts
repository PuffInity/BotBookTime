import type { ServicesEntity, ServicesRow } from '../../types/db/index.js';
import { queryMany, withTransaction } from '../db.helper.js';
import { servicesRowToEntity } from '../../utils/mappers/services.mapp.js';

/**
 * @file services.bot.ts
 * @summary Read-only helper для каталогу послуг у Telegram-боті.
 */

const SERVICES_LIMIT = 8;

/**
 * Повертає активні послуги для клієнтського каталогу.
 */
export async function getActiveServicesCatalog(limit = SERVICES_LIMIT): Promise<ServicesEntity[]> {
  return withTransaction(async (client) => {
    const sql = `
      SELECT
        id,
        studio_id,
        name,
        description,
        duration_minutes,
        base_price,
        currency_code,
        result_description,
        is_active,
        created_at,
        updated_at
      FROM services
      WHERE is_active = TRUE
      ORDER BY name ASC
      LIMIT $1
    `;

    return queryMany<ServicesRow, ServicesEntity>(sql, [limit], servicesRowToEntity, client);
  });
}

/**
 * Форматує список послуг у зрозумілий текст для клієнта.
 */
export function formatServicesCatalogText(services: ServicesEntity[]): string {
  if (services.length === 0) {
    return (
      '💼 Послуги\n' +
      'Наразі активних послуг немає.\n' +
      'Спробуйте пізніше або зверніться до адміністратора.'
    );
  }

  const lines = services.map((service, index) => {
    const description = service.description ? `\n${service.description}` : '';
    return (
      `${index + 1}. ${service.name}\n` +
      `⏱ ${service.durationMinutes} хв • 💰 ${service.basePrice} ${service.currencyCode}${description}`
    );
  });

  return (
    '💼 Доступні послуги\n' +
    'Оберіть потрібну послугу на наступному кроці бронювання:\n\n' +
    lines.join('\n\n')
  );
}

