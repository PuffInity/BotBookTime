import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 002_create_enum_types.ts
 * @summary Створення всіх ENUM-типів.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `002_create_enum_types` для керування структурою БД.
 */
export class Migration002CreateEnumTypes extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'language_code') THEN
    CREATE TYPE language_code AS ENUM ('uk', 'en', 'cs');
  END IF;
END $$;
`);

            await this.executeQuery(client, `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('client', 'master', 'admin');
  END IF;
END $$;
`);

            await this.executeQuery(client, `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
    CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'canceled', 'completed', 'transferred');
  END IF;
END $$;
`);

            await this.executeQuery(client, `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_source') THEN
    CREATE TYPE appointment_source AS ENUM ('telegram_bot', 'admin_panel', 'master_panel');
  END IF;
END $$;
`);

            await this.executeQuery(client, `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_channel') THEN
    CREATE TYPE verification_channel AS ENUM ('sms', 'email');
  END IF;
END $$;
`);

            await this.executeQuery(client, `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_purpose') THEN
    CREATE TYPE verification_purpose AS ENUM (
      'phone_verify',
      'email_verify',
      'phone_change_old',
      'phone_change_new',
      'appointment_cancel',
      'sensitive_action'
    );
  END IF;
END $$;
`);

            await this.executeQuery(client, `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM ('booking_confirmation', 'status_change', 'visit_reminder', 'promo_news');
  END IF;
END $$;
`);

            await this.executeQuery(client, `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_channel') THEN
    CREATE TYPE notification_channel AS ENUM ('telegram', 'sms', 'email');
  END IF;
END $$;
`);

            await this.executeQuery(client, `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'queue_status') THEN
    CREATE TYPE queue_status AS ENUM ('pending', 'sent', 'failed', 'canceled');
  END IF;
END $$;
`);

            await this.executeQuery(client, `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('unpaid', 'partially_paid', 'paid', 'refunded');
  END IF;
END $$;
`);

            await this.executeQuery(client, `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rate_limit_subject') THEN
    CREATE TYPE rate_limit_subject AS ENUM ('user', 'telegram_user', 'ip', 'phone', 'email');
  END IF;
END $$;
`);

            await this.executeQuery(client, `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_block_key') THEN
    CREATE TYPE content_block_key AS ENUM (
      'about',
      'booking_rules',
      'cancellation_policy',
      'preparation',
      'comfort',
      'guarantee_service',
      'contacts'
    );
  END IF;
END $$;
`);

            migrationLogger.info('Міграція 002_create_enum_types виконана');
        } finally {}
    }
    /**
     * @summary Виконує rollback міграції (down).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async down(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
DROP TYPE IF EXISTS content_block_key;
`);

            await this.executeQuery(client, `
DROP TYPE IF EXISTS rate_limit_subject;
`);

            await this.executeQuery(client, `
DROP TYPE IF EXISTS payment_status;
`);

            await this.executeQuery(client, `
DROP TYPE IF EXISTS queue_status;
`);

            await this.executeQuery(client, `
DROP TYPE IF EXISTS notification_channel;
`);

            await this.executeQuery(client, `
DROP TYPE IF EXISTS notification_type;
`);

            await this.executeQuery(client, `
DROP TYPE IF EXISTS verification_purpose;
`);

            await this.executeQuery(client, `
DROP TYPE IF EXISTS verification_channel;
`);

            await this.executeQuery(client, `
DROP TYPE IF EXISTS appointment_source;
`);

            await this.executeQuery(client, `
DROP TYPE IF EXISTS appointment_status;
`);

            await this.executeQuery(client, `
DROP TYPE IF EXISTS user_role;
`);

            await this.executeQuery(client, `
DROP TYPE IF EXISTS language_code;
`);

            migrationLogger.info('Міграція 002_create_enum_types скинута');
        } finally {}
    }
}

export default Migration002CreateEnumTypes;
