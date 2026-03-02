import {pool, SHUTDOWN_TIMEOUT_MS,safeRelease,dbLogger} from "../../config/database.config.js";
import type { PoolClient } from "pg";
/**
 * @file database.lifeCycle.ts
 * @summary Файл яки відповідає за життя Postgresql
 */

let poolStarted = false

/**
 * @summary Функція яка вмикає Postgresql
 */
export async function initDb(): Promise<void> {
    if (poolStarted) {
        dbLogger.warn('[postgres] Пул уже запущений, повторний старт проігноровано')
        return;
    }
    let client: PoolClient | null = null;
    /**
     * broken Індикатор теперішнього стану
     */
    let broken = false;
    try {
        /**
         * client - Одне зʼєднання до бази
         */
        client = await pool.connect();
        /** Відправляємо тестовий запит та чекаємо відповіді якщо все пройшло успішно база підʼєднана */
        await client.query('SELECT 1');
        dbLogger.info('[postgres] Підключення успішне');
        poolStarted = true
    } catch (err) {
        /**
         * broken: true - Встановлюємо true тобто зєʼднання бите
         */
        broken = true;
        const message = err instanceof Error ? err.message : String(err)
        dbLogger.error('[postgres] Помилка підключення', {message: message})
        throw err
    } finally {
        /** В будь якому випадку(Чи помилка чи успіх) обовʼязково виконати цю дію */
        if (client) {
            safeRelease(client, broken)
        }
    }
}
/**
 * @summary Функція яка вимикає postgresql
 */
export async function shutDownDb(): Promise<void> {
    /** Провірка чи postgresql працює чи вимкнута */
    if (!poolStarted) {
        dbLogger.info('[postgres] Пул уже закритий');
        return
    }
    try {
        /** Створюємо timeout який за 10 секунд викличе помилку якщо Postgresql не вимкнеться скоріше */
        const timeout = new Promise((_, rej) =>
            setTimeout(() => rej(new Error('pool.end() timeout')), SHUTDOWN_TIMEOUT_MS)
        );
        /** Створюємо гонку між функцією яка вимкне Postgresql та таймером який викличе помилку за 10 секнуд  */
        await Promise.race([pool.end(), timeout]);
        poolStarted = false;
        dbLogger.info('[postgres] Пул закрито')
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        dbLogger.error('[postgres] Помилка вимкнення', {message: message});
    }
}
