import {PoolClient} from 'pg';
import {BaseMigration, migrationLogger} from '../base.migration.js';

/**
 * @file 035_add_duration_minutes_to_service_steps.ts
 * @summary Додає поле `duration_minutes` для етапів послуг.
 */
export class Migration035AddDurationMinutesToServiceSteps extends BaseMigration {
    /**
     * @summary Додає тривалість етапу в хвилинах.
     */
    async up(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
ALTER TABLE service_steps
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 10
CHECK (duration_minutes BETWEEN 1 AND 720);
`);

            migrationLogger.info('Міграція 035_add_duration_minutes_to_service_steps виконана');
        } finally {}
    }

    /**
     * @summary Видаляє поле тривалості етапу.
     */
    async down(client: PoolClient): Promise<void> {
        try {
            await this.executeQuery(client, `
ALTER TABLE service_steps
DROP COLUMN IF EXISTS duration_minutes;
`);

            migrationLogger.info('Міграція 035_add_duration_minutes_to_service_steps скинута');
        } finally {}
    }
}

export default Migration035AddDurationMinutesToServiceSteps;
