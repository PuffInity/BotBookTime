import {pool, SHUTDOWN_TIMEOUT_MS,safeRelease,dbLogger} from "../../config/database.config.js";
import type { PoolClient } from "pg";
import {handleError} from "../../utils/error.utils.js";
/**
 * @file database.lifeCycle.ts
 * @summary PostgreSQL lifecycle (init/shutdown).
 */

// uk: Стан пулу / en: Pool state / cz: Stav poolu
let poolStarted = false

/**
 * uk: Ініціалізація PostgreSQL.
 * en: Initializes PostgreSQL.
 * cz: Inicializuje PostgreSQL.
 */
export async function initDb(): Promise<void> {
    if (poolStarted) {
        dbLogger.warn('[postgres] Пул уже запущений, повторний старт проігноровано')
        return;
    }
    let client: PoolClient | null = null;
    // uk: Стан клієнта / en: Client health flag / cz: Stav klienta
    let broken = false;
    try {
        // uk: Тест-клієнт / en: Probe client / cz: Test klient
        client = await pool.connect();
        // uk: Health check / en: Health check / cz: Health check
        await client.query('SELECT 1');
        dbLogger.info('[postgres] Підключення успішне');
        poolStarted = true
    } catch (err) {
        // uk: Клієнт зламано / en: Mark client broken / cz: Označit klienta jako poškozený
        broken = true;
        handleError({
            logger: dbLogger,
            scope: "postgres-lifecycle",
            action: "Помилка підключення Postgresql",
            error: err,
        })
        throw err
    } finally {
        // uk: Safe release / en: Safe release / cz: Safe release
        if (client) {
            safeRelease(client, broken)
        }
    }
}
/**
 * uk: Завершення PostgreSQL.
 * en: Shuts down PostgreSQL.
 * cz: Vypne PostgreSQL.
 */
export async function shutDownDb(): Promise<void> {
    // uk: Already stopped / en: Already stopped / cz: Už zastaveno
    if (!poolStarted) {
        dbLogger.info('[postgres] Пул уже закритий');
        return
    }
    try {
        // uk: Timeout guard / en: Timeout guard / cz: Timeout guard
        const timeout = new Promise((_, rej) =>
            setTimeout(() => rej(new Error('pool.end() timeout')), SHUTDOWN_TIMEOUT_MS)
        );
        // uk: Race end/timeout / en: Race end/timeout / cz: Race end/timeout
        await Promise.race([pool.end(), timeout]);
        poolStarted = false;
        dbLogger.info('[postgres] Пул закрито')
    } catch (err) {
        handleError({
            logger: dbLogger,
            scope: "postgres-lifecycle",
            action: "Помилка вимкнення Postgresql",
            error: err,
        })
    }
}
