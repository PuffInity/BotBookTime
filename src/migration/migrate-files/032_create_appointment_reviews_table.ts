import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 032_create_appointment_reviews_table.ts
 * @summary Створення таблиці appointment_reviews з індексами і тригерами.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `032_create_appointment_reviews_table` для керування структурою БД.
 */
export class Migration032CreateAppointmentReviewsTable extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE TABLE IF NOT EXISTS appointment_reviews (
  appointment_id BIGINT PRIMARY KEY REFERENCES appointments(id) ON DELETE CASCADE,
  client_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  master_id BIGINT NOT NULL REFERENCES masters(user_id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (client_id <> master_id)
);
`);

            migrationLogger.info('Міграція 032_create_appointment_reviews_table виконана');
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
DROP TABLE IF EXISTS appointment_reviews;
`);

            migrationLogger.info('Міграція 032_create_appointment_reviews_table скинута');
        } finally {}
    }
}

export default Migration032CreateAppointmentReviewsTable;
