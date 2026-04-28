import {redisConfig} from "../../config/redis.config.js";
import {RedisClient} from "../../types/redis.types.js"
import {loggerR} from "../../utils/logger/loggers-list.js";
import {createClient} from "redis";
import {handleError} from "../../utils/error.utils.js";

/**
 * @file redis.lifeCycle.ts
 * @summary Життєвий цикл Redis-клієнта (init/shutdown) для застосунку.
 */

// uk: Стан Redis / en: Redis state / cz: Stav Redis
let redisStarted = false;
// uk: Глобальний client / en: Global client / cz: Globální klient
export let redis: RedisClient | null = null;

/**
 * uk: Підписує Redis на події.
 * en: Attaches Redis event listeners.
 * cz: Připojí Redis event listenery.
 * @param client uk/en/cz: Redis client.
 */
function attachLogs(client: RedisClient) {
    // uk: ready / en: ready / cz: ready
    client.on('ready', () => {
        loggerR.info('[redis] Клієнт готовий')
    });
    // uk: error / en: error / cz: error
    client.on('error', (error: unknown) => {
        handleError({
            logger: loggerR,
            scope: "redis-lifecycle",
            action: "Подія error у Redis-клієнта",
            error,
        })
    });
    // uk: reconnecting / en: reconnecting / cz: reconnecting
    client.on('reconnecting', () => {
        loggerR.warn(`[redis] Перепідключення...`)
    })
    // uk: end / en: end / cz: end
    client.on('end', () => {
        loggerR.warn('[redis] Підключення завершено')
    })
}

/**
 * uk: Завершує Redis з timeout guard.
 * en: Closes Redis with timeout guard.
 * cz: Ukončí Redis s timeout guard.
 * @param client uk/en/cz: Redis client.
 * @param ms uk/en/cz: Timeout ms.
 */
async function quitWithTimeout(client: RedisClient, ms = 5000): Promise<void> {
    let timer: NodeJS.Timeout | null = null
    try {
        // uk: Race quit/timeout / en: Race quit/timeout / cz: Race quit/timeout
        await Promise.race([
            client.quit(),
            new Promise<void>((_, reject) => {
                timer = setTimeout(() => reject(new Error(`quit() Таймаут після ${ms} мл.`)), ms)
            })
        ])
    } finally {
        // uk: Clear timeout / en: Clear timeout / cz: Clear timeout
        if (timer) clearTimeout(timer)
    }
}

/**
 * uk: Ініціалізує Redis client.
 * en: Initializes Redis client.
 * cz: Inicializuje Redis klienta.
 */
export async function initRedis() {
    if (redisStarted) {
        loggerR.warn('[redis] Клієнт уже запущений, повторний старт проігноровано')
        return
    }
    const r = createClient(redisConfig.clientOptions)
    attachLogs(r)

    try {

        await r.connect();
        await r.ping();

        redis = r

        redisStarted = true
        loggerR.info('[redis] Клієнт успішно запущений')
    } catch (error) {
        handleError({
            logger: loggerR,
            scope: "redis-lifecycle",
            action: "Помилка запуску Redis-клієнта",
            error,
        })
        throw error
    }
}

/**
 * uk: Коректно вимикає Redis client.
 * en: Gracefully shuts down Redis client.
 * cz: Korektně vypne Redis klienta.
 */
export async function redisShutdown(): Promise<void> {
    /**
     * uk: Закриває один Redis інстанс.
     * en: Closes single Redis instance.
     * cz: Zavře jeden Redis instanci.
     * @param cl uk/en/cz: Redis client.
     * @param label uk/en/cz: Label.
     */
    const close = async (cl: RedisClient | null, label: string) => {
        // uk: Is running / en: Is running / cz: Is running
        if (!cl) {
            loggerR.warn(`[${label}] Клієнт не запущений, крок закриття пропущено`)
            return;
        }
        try {
            // uk: Try quit / en: Try quit / cz: Try quit
            await quitWithTimeout(cl, 5000)
            loggerR.info(`[${label}] quit() успішно`);

        } catch (error: unknown) {
            handleError({
                logger: loggerR,
                scope: "redis-lifecycle",
                action: `Помилка quit() для ${label}, виконуємо disconnect()`,
                error,
                meta: { label },
            })
            try {
                // uk: Fallback disconnect / en: Fallback disconnect / cz: Fallback disconnect
                await cl.disconnect();
                loggerR.warn(`[${label}] disconnect() успішно`);
            } catch (err: unknown) {
                handleError({
                    logger: loggerR,
                    scope: "redis-lifecycle",
                    action: `Помилка disconnect() для ${label}`,
                    error: err,
                    meta: { label },
                })
            }
        }
    };
    // uk: Wait all closes / en: Wait all closes / cz: Wait all closes
    const results = await Promise.allSettled([
        close(redis, 'redis'),
    ])
    // uk: Count failures / en: Count failures / cz: Count failures
    const rejected = results.filter((r) => r.status === 'rejected');
    if (rejected.length > 0) {
        loggerR.error(`[redis] Завершення роботи зіткнулося з ${rejected.length} відмовами`)
    }
    // uk: Reset state / en: Reset state / cz: Reset state
    redis = null;
    redisStarted = false;

    loggerR.info('[redis] Клієнт закрито');
}
