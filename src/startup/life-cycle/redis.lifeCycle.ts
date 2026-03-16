import {redisConfig} from "../../config/redis.config.js";
import {RedisClient} from "../../types/redis.types.js"
import {loggerR} from "../../utils/logger/loggers-list.js";
import {createClient} from "redis";
import {handleError} from "../../utils/error.utils.js";

/**
 * @file redis.lifeCycle.ts
 * @summary Життєвий цикл Redis-клієнта (init/shutdown) для застосунку.
 */

/** Індикатор стану Redis-інстанса, щоб не робити повторний init. */
let redisStarted = false;
/** Глобальне посилання на Redis client після успішної ініціалізації. */
export let redis: RedisClient | null = null;

/**
 * Підписує Redis client на базові події та пише їх у лог.
 * @param {RedisClient} client - Уже створений Redis client.
 */
function attachLogs(client: RedisClient) {
    /** Якщо Redis підключений */
    client.on('ready', () => {
        loggerR.info('[redis] Клієнт готовий')
    });
    /** Якщо виникла помилка в Redis */
    client.on('error', (error: unknown) => {
        handleError({
            logger: loggerR,
            scope: "redis-lifecycle",
            action: "Подія error у Redis-клієнта",
            error,
        })
    });
    /** Якщо Redis переподключається */
    client.on('reconnecting', () => {
        loggerR.warn(`[redis] Перепідключення...`)
    })
    /** Якщо Redis відключився */
    client.on('end', () => {
        loggerR.warn('[redis] Підключення завершено')
    })
}

/**
 * Коректно завершує Redis-клієнт з таймаутом, щоб shutdown не "завис".
 * @param {RedisClient} client - Активний Redis client.
 * @param {number} [ms=5000] - Максимальний час очікування quit() у мілісекундах.
 * @returns {Promise<void>}
 */
async function quitWithTimeout(client: RedisClient, ms = 5000): Promise<void> {
    let timer: NodeJS.Timeout | null = null
    try {
        /**
         * Створюємо гонку між client.quit() та Таймаутом який викликає помилку через 5 секунд
         * робимо для того щоб метод вимкнення Інстанса не завис
         */
        await Promise.race([
            client.quit(),
            new Promise<void>((_, reject) => {
                timer = setTimeout(() => reject(new Error(`quit() Таймаут після ${ms} мл.`)), ms)
            })
        ])
    } finally {
        /** Очищаємо Таймаут в любому випадку якщо він існує */
        if (timer) clearTimeout(timer)
    }
}

/**
 * Ініціалізує Redis-клієнт:
 * 1) створює client з конфігу
 * 2) реєструє логи подій
 * 3) підключається та перевіряє зв'язок через PING
 * 4) зберігає інстанс у глобальну змінну `redis`
 *
 * Викликається один раз на старті застосунку.
 * Повторний виклик буде проігнорований через `redisStarted`.
 *
 * @returns {Promise<void>}
 * @throws {unknown} Якщо підключення або PING Redis завершиться помилкою.
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
 * Завершує роботу Redis-клієнта застосунку.
 * Спочатку пробує `quit()`, а при помилці робить fallback на `disconnect()`.
 *
 * Після завершення очищає глобальні змінні стану (`redis`, `redisStarted`).
 *
 * @returns {Promise<void>}
 */
export async function redisShutdown(): Promise<void> {
    /**
     * Допоміжне закриття одного Redis client з логуванням.
     * @param {RedisClient | null} cl - Redis client або null, якщо не ініціалізований.
     * @param {string} label - Назва інстанса для логів.
     */
    const close = async (cl: RedisClient | null, label: string) => {
        /** Провірка чи Інсанс запущений */
        if (!cl) {
            loggerR.warn(`[${label}] Клієнт не запущений, крок закриття пропущено`)
            return;
        }
        try {
            /** Викликаємо функцію яка вимикає Інстанс */
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
                /** Викликаємо метод disconnect() */
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
    /** Створюємо масив обʼєктів в яких зберігяються всі результати промісів */
    const results = await Promise.allSettled([
        close(redis, 'redis'),
    ])
    /** фільтруємо всі reject щоб бачити скільки сталось відмов  */
    const rejected = results.filter((r) => r.status === 'rejected');
    if (rejected.length > 0) {
        loggerR.error(`[redis] Завершення роботи зіткнулося з ${rejected.length} відмовами`)
    }
    /** Очищає всі змінні з інстансами та змінну з запущеною програмою чим позначаємо що вона вимкнута */
    redis = null;
    redisStarted = false;

    loggerR.info('[redis] Клієнт закрито');
}
