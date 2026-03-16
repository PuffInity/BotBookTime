import {migrationLogger} from "./base.migration.js";
import {pool} from "../config/database.config.js";
import {handleError} from "../utils/error.utils.js";

/**
 * @file table.migration.ts
 * @summary Файл який відповідає за створення таблиці міграцій
 */


/**
 * @summary Класс який керує станом таблиці міграцій
 */
export class MigrationTracker {
    /** TABLE_NAME - Константа в якій зберігаємо імʼя таблиці(Так як записана в базі) */
    private static readonly TABLE_NAME = 'schema_migrations';

    /**
     * @summary Функція яка створює таблицю міграцій
     */
    static async createMigrationTable(): Promise<void> {
        /** Беремо 1 зʼєднання */
        const client = await pool.connect()

        /** Пишемо SQL запит до бази для створення таблиці міграцій */
        const query = `
        CREATE TABLE IF NOT EXISTS ${this.TABLE_NAME}(
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`;

        try {
            /** Запускаємо транзакцію */
            await client.query(`BEGIN`)
            /** Запускамо наш SQL запит  */
            await client.query(query)
            migrationLogger.info(`Таблиця міграцій - ${this.TABLE_NAME}, Створена або уже існувала`)
            /** Завершуємо транзакцію */
            await client.query(`COMMIT`)
        } catch (error) {
            handleError({
                logger: migrationLogger,
                scope: "migration-tracker",
                action: `Помилка створення таблиці міграцій ${this.TABLE_NAME}`,
                error,
            })
            /** Якщо виникла помилка робимо Rollback та повертаємо до початкового стану транзакції */
            await client.query(`ROLLBACK`)
            throw error
        } finally {
            /** В любому випадку (Помилка чи успіх) ми виконуємо client.release - Повертаємо зʼєднання базі  */
            client.release()
        }
    };

    /**
     * @summary Функція яка повертає уже виконаній міграції з таблиці міграцій
     */
    static async getExecutedMigrations(): Promise<string[]> {
        /** Беремо 1 зʼєднання */
        const client = await pool.connect()
        /** Пишемо SQL запит до бази щоб дістати всі поля filename та сортуємо  */
        const query = `
            SELECT filename
            FROM ${this.TABLE_NAME}
            ORDER BY executed_at
        `
        try {
            /** Виконуємо SQL запит */
            const result = await client.query(query)
            /** Повертаємо масив в якому зберігаються тільки готові міграції */
            return result.rows.map((row: {filename: string}) => row.filename)
        } catch (error) {
            handleError({
                logger: migrationLogger,
                scope: "migration-tracker",
                action: `Помилка отримання виконаних міграцій з ${this.TABLE_NAME}`,
                error,
            })
            throw error
        } finally {
            /** В любому випадку (Помилка чи успіх) ми виконуємо client.release - Повертаємо зʼєднання базі  */
            client.release()
        }
    }

    /**
     * @summary Функція яка виконує дію запису в таблицю міграцій виконаних міграцій
     */
    static async recordMigration(filename: string): Promise<void> {
        /** Беремо 1 зʼєднання */
        const client = await pool.connect()
        /** Пишемо SQL запит до бази щоб вставити в таблицю міграцій готову маграцію */
        const query = `
            INSERT INTO ${this.TABLE_NAME} (filename)
            VALUES ($1)
        `
        try {
            /** Запускаємо міграцію */
            await client.query(`BEGIN`)
            /** Виконуємо SQL запит */
            await client.query(query, [filename])
            migrationLogger.info('Успішно записали виконану міграцію в таблицю міграцій')
            /** Закінчуємо міграцію */
            await client.query(`COMMIT`)
        } catch (error) {
            handleError({
                logger: migrationLogger,
                scope: "migration-tracker",
                action: "Помилка запису виконаної міграції",
                error,
                meta: { filename },
            })
            /** Якщо виникла помилка повертаємо міграцію в початковий стан  */
            await client.query(`ROLLBACK`)
            throw error
        }finally {
            /** В любому випадку (Помилка чи успіх) ми виконуємо client.release - Повертаємо зʼєднання базі  */
            client.release()
        }
    }

    /**
     * @summary Функція яка видаляє міграцію з таблиці міграцій
     */
    static async removeMigration(filename: string): Promise<void> {
        /** Беремо 1 зʼєднання */
        const client = await pool.connect()
        /** Пишемо SQL запит до бази щоб видалити якусь міграцію з таблиці міграцій */
        const query = `
            DELETE
            FROM ${this.TABLE_NAME}
            WHERE filename = $1
        `;
        try {
            /** Запускаємо транзакцію */
            await client.query(`BEGIN`)
            /** Викогуємо SQL запит */
            await client.query(query, [filename])
            migrationLogger.info(`Міграція ${filename} Була видалена з таблиці [${this.TABLE_NAME}]`)
            /** Закінчуємо транзакцію */
            await client.query(`COMMIT`)
        } catch (error) {
            handleError({
                logger: migrationLogger,
                scope: "migration-tracker",
                action: `Помилка видалення міграції ${filename} з ${this.TABLE_NAME}`,
                error,
                meta: { filename },
            })
            /** Якщо виникла помилка повертаємо міграцію в початковий стан  */
            await client.query(`ROLLBACK`)
            throw error
        }finally {
            /** В любому випадку (Помилка чи успіх) ми виконуємо client.release - Повертаємо зʼєднання базі  */
            client.release()
        }
    }


}
