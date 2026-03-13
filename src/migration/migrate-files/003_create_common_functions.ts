import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 003_create_common_functions.ts
 * @summary Створення глобальних SQL-функцій для тригерів.
 */
/**
 * @class
 * @extends BaseMigration
 * @summary Міграція `003_create_common_functions` для керування структурою БД.
 */
export class Migration003CreateCommonFunctions extends BaseMigration {
    /**
     * @summary Виконує застосування міграції (up).
     * @param {PoolClient} client - Активний клієнт PostgreSQL.
     * @returns {Promise<void>}
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
`);

            await this.executeQuery(client, `
CREATE OR REPLACE FUNCTION set_appointment_status_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'confirmed' AND NEW.confirmed_at IS NULL THEN
      NEW.confirmed_at = now();
    END IF;
    IF NEW.status = 'canceled' AND NEW.canceled_at IS NULL THEN
      NEW.canceled_at = now();
    END IF;
    IF NEW.status = 'completed' AND NEW.completed_at IS NULL THEN
      NEW.completed_at = now();
    END IF;
    IF NEW.status = 'transferred' AND NEW.transferred_at IS NULL THEN
      NEW.transferred_at = now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
`);

            await this.executeQuery(client, `
CREATE OR REPLACE FUNCTION log_appointment_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO appointment_status_history (appointment_id, old_status, new_status, changed_by, comment)
    VALUES (NEW.id, NULL, NEW.status, NEW.created_by, 'initial status');
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO appointment_status_history (appointment_id, old_status, new_status, changed_by, comment)
    VALUES (NEW.id, OLD.status, NEW.status, COALESCE(NEW.updated_by, NEW.created_by), NULL);
  END IF;
  RETURN NEW;
END;
$$;
`);

            migrationLogger.info('Міграція 003_create_common_functions виконана');
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
DROP FUNCTION IF EXISTS log_appointment_status_change();
`);

            await this.executeQuery(client, `
DROP FUNCTION IF EXISTS set_appointment_status_timestamps();
`);

            await this.executeQuery(client, `
DROP FUNCTION IF EXISTS set_updated_at();
`);

            migrationLogger.info('Міграція 003_create_common_functions скинута');
        } finally {}
    }
}

export default Migration003CreateCommonFunctions;
