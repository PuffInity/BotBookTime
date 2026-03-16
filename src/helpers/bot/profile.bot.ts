import type { AppUsersEntity, AppUsersRow } from '../../types/db/index.js';
import { appUsersRowToEntity } from '../../utils/mappers/appUsers.mapp.js';
import { queryOne, withTransaction } from '../db.helper.js';

/**
 * @file profile.bot.ts
 * @summary Читання і форматування профілю клієнта для Telegram-бота.
 */

/**
 * Повертає профіль користувача за Telegram user id.
 */
export async function getClientProfileByTelegramUserId(
  telegramUserId: number,
): Promise<AppUsersEntity | null> {
  return withTransaction(async (client) => {
    const sql = `
      SELECT
        id,
        studio_id,
        telegram_user_id,
        telegram_username,
        first_name,
        last_name,
        phone_e164,
        phone_verified_at,
        email,
        email_verified_at,
        preferred_language,
        timezone,
        is_active,
        created_at,
        updated_at
      FROM app_users
      WHERE telegram_user_id = $1
      LIMIT 1
    `;

    return queryOne<AppUsersRow, AppUsersEntity>(
      sql,
      [String(telegramUserId)],
      appUsersRowToEntity,
      client,
    );
  });
}

/**
 * Форматує read-only картку профілю для відповіді користувачу.
 */
export function formatClientProfileText(profile: AppUsersEntity): string {
  const phone = profile.phoneE164 ?? 'Не вказано';
  const email = profile.email ?? 'Не вказано';
  const phoneVerified = profile.phoneVerifiedAt ? 'підтверджено' : 'не підтверджено';
  const emailVerified = profile.emailVerifiedAt ? 'підтверджено' : 'не підтверджено';
  const username = profile.telegramUsername ? `@${profile.telegramUsername}` : 'Не вказано';
  const fullName = `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ''}`;

  return (
    '👤 Профіль\n' +
    `Ім'я: ${fullName}\n` +
    `Telegram: ${username}\n` +
    `Телефон: ${phone} (${phoneVerified})\n` +
    `Email: ${email} (${emailVerified})\n` +
    `Мова: ${profile.preferredLanguage}\n` +
    `Часовий пояс: ${profile.timezone}`
  );
}

