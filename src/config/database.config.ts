import {Pool} from 'pg'
import {dbConfig} from "../validator/database.schema.js";
import {PoolClient} from "pg";
import {handleError} from "../utils/error.utils.js";
import {loggerDb} from "../utils/logger/loggers-list.js";

/**
 * @file database.config.ts
 * @summary PostgreSQL pool config + session defaults.
 */

/**
 * uk: Конфіг пулу PostgreSQL.
 * en: PostgreSQL pool configuration.
 * cz: Konfigurace PostgreSQL poolu.
 */
export const pool = new Pool({
    // uk: Хост БД / en: DB host / cz: DB host
    host: dbConfig.PG_HOST,
    // uk: Порт БД / en: DB port / cz: DB port
    port: dbConfig.PG_PORT,
    // uk: Назва БД / en: DB name / cz: Název DB
    database: dbConfig.PG_DATABASE,
    // uk: Користувач БД / en: DB user / cz: Uživatel DB
    user: dbConfig.PG_USER,
    // uk: Пароль БД / en: DB password / cz: Heslo DB
    password: dbConfig.PG_PASSWORD,
    // uk: SSL режим / en: SSL mode / cz: SSL režim
    ssl: undefined, // In production use: { ca: <CA certificate>, rejectUnauthorized: true }
    // uk: Ліміт зʼєднань / en: Pool max / cz: Max spojení
    max: dbConfig.PG_POOL_MAX,
    // uk: Idle timeout / en: Idle timeout / cz: Idle timeout
    idleTimeoutMillis: dbConfig.PG_IDLE_TIMEOUT_MS,
    // uk: Connect timeout / en: Connect timeout / cz: Connect timeout
    connectionTimeoutMillis: dbConfig.PG_CONN_TIMEOUT_MS,
    // uk: Timeout statement / en: Statement timeout / cz: Statement timeout
    statement_timeout: dbConfig.PG_STATEMENT_TIMEOUT_MS,
    // uk: Timeout query / en: Query timeout / cz: Query timeout
    query_timeout: dbConfig.PG_QUERY_TIMEOUT_MS,

    // uk: Назва застосунку / en: App name / cz: Název aplikace
    application_name: dbConfig.APP_NAME,

    // uk: TCP keep-alive / en: TCP keep-alive / cz: TCP keep-alive
    keepAlive: true,
    // uk: Старт keep-alive / en: Keep-alive initial delay / cz: Počáteční keep-alive delay
    keepAliveInitialDelayMillis: 30000,
    // uk: Max uses / en: Max uses / cz: Max použití
    maxUses: 7500,
    // uk: TTL зʼєднання / en: Connection TTL / cz: TTL spojení
    maxLifetimeSeconds: 3600,
});

// uk: Timeout shutdown / en: Shutdown timeout / cz: Timeout vypnutí
export const SHUTDOWN_TIMEOUT_MS = 10000

// uk: DB логер / en: DB logger / cz: DB logger
export const dbLogger = loggerDb;

/**
 * uk: Безпечне звільнення клієнта пулу.
 * en: Safely releases pooled client.
 * cz: Bezpečně uvolní klienta poolu.
 * @param client uk/en/cz: Клієнт/Client/Klient.
 * @param broken uk/en/cz: Статус зʼєднання/Broken flag/Příznak poškození.
 */
export function safeRelease(client: PoolClient, broken: boolean) {
    try {
        (client as unknown as PoolClient & { release(broken?: boolean): void }).release(broken)
    } catch (error) {
        handleError({
            logger: dbLogger,
            level: "warn",
            scope: "postgres-config",
            action: "Не вдалося звільнити клієнта",
            error,
            meta: { broken },
        })
    }
}

/**
 * uk: Застосовує session defaults.
 * en: Applies session defaults.
 * cz: Aplikuje session defaults.
 * @param client uk/en/cz: Клієнт/Client/Klient.
 */
async function applySessionDefaults(client: PoolClient) {
    await client.query(`
    SET TIME ZONE 'UTC';
    SET idle_in_transaction_session_timeout = '30000ms';
    SET lock_timeout = '5000ms';
    `)
}

/**
 * uk: Retry-обгортка для session defaults.
 * en: Retry wrapper for session defaults.
 * cz: Retry obal pro session defaults.
 * @param client uk/en/cz: Клієнт/Client/Klient.
 * @param retries uk/en/cz: Спроби/Retries/Pokusy.
 * @param delayMs uk/en/cz: Затримка/Delay/Zpoždění.
 */
async function applyWithRetry(client: PoolClient, retries = 1,delayMs = 150) {
    let lastErr: unknown = null;
    for(let attempt = 0; attempt <= retries;attempt ++) {
        try{
            await applySessionDefaults(client);
            return;
        }catch(error) {
            lastErr = error
            handleError({
                logger: dbLogger,
                level: "warn",
                scope: "postgres-config",
                action: "Не вдалося застосувати session defaults",
                error,
                meta: { attempt: attempt + 1, retries: retries + 1, delayMs },
            })
            if(attempt === retries) break;
            await new Promise(r =>setTimeout(r, delayMs * (attempt + 1)))
        }
    }
    throw lastErr;
}

/**
 * uk: Хук нового клієнта пулу.
 * en: Pool client connect hook.
 * cz: Hook připojení klienta poolu.
 */
pool.on('connect',async (client) => {
    try {
        await applyWithRetry(client,1, 150)
    }catch(error) {
        handleError({
            logger: dbLogger,
            scope: "postgres-config",
            action: "Помилка застосування session defaults під час pool.connect",
            error,
        })
        safeRelease(client,true)
    }
})

pool.on('error',(err) => {
    handleError({
        logger: dbLogger,
        scope: "postgres-config",
        action: "Несподівана помилка клієнта пулу",
        error: err,
    })
})
