import { createAppLogger } from "../utils/logger/logger.js";
import {redisSchemaConfig} from "../validator/redis.schema.js";
import {BaseConfig,SessionConfig,ParamsForBaseConfig} from "../types/redis.types.js";

/**
 * @file redis.config.ts
 * @summary Базова конфігурація Redis + конфіг Redis для сесій Telegraf.
 */

/** Логер для подій конфігурації/перепідключення Redis. */
export const redisLogger = createAppLogger({service: 'Redis'});

/**
 * @summary Створюємо функцію яка буде повертати обʼєкт готового конфігу
 * @param {ParamsForBaseConfig} params - Нас інтерфейси який створений трошку вище для створення конф. файлу
 * @returns {BaseConfig} Базова конфігурація Redis client + службові параметри (keyPrefix, retries).
 */
export function makeBaseConfig(params: ParamsForBaseConfig): BaseConfig {
    /** Відразу для зручності створюємо констатнти та передаємо в них дані */
    const { host,port,name,password,
        database = 0,keyPrefix,
        maxReconnectRetries = 10
    } = params;
    return {
        maxReconnectRetries,
        keyPrefix,
        clientOptions: {
            socket: {
                host,
                port,
                connectTimeout: 10000,
                /** keepAlive - Підтримує постійне -TCP зʼєднання */
                keepAlive: 5000,
                /** Якщо зʼєднання буде встрачено або не буде підʼєднано з першого разу застосовується ця функія */
                reconnectStrategy: (retries: number) => {
                    /** Маємо обмеження кількості спроб */
                    if (retries > maxReconnectRetries) {
                        redisLogger.error(`[${name}] Перевищено максимальну кількість спроб підключення`);
                        return new Error(`[${name}] reconnect limit exceeded`);
                    }
                    /** кожен раз множино кілкьість спроб на 50 і щоб не перевищило 5000 (5 секунд) */
                    const base = Math.min(retries * 50, 5000);
                    /** Створюємо константу яка матиме рандомне число до 250 */
                    const jitter = Math.floor(Math.random() * 250);
                    /** Додаємо 1 константсу base до другої jitter = Виходить постійно рандомне число
                     * Для того щоб Redis не навантужувася під час перепідключення всіх користувачів
                     * в нашому випадку кожен користувач буде перепідключатись в рандомний час
                     */
                    const delay = base + jitter;
                    redisLogger.info(`[${name}] Перепідключення через ${delay}мс (спроба: ${retries})`);
                    return delay;
                },
            },
            password,
            database,
            name,
        },
    };
}

/**
 * Готова конфігурація Redis для Telegraf session store.
 * Включає:
 * - clientOptions для node-redis
 * - keyPrefix для ключів сесій
 * - sessionTTL / touchAfter для логіки запису сесій
 */
export const redisConfig: SessionConfig = {
    ...makeBaseConfig({
        host: redisSchemaConfig.REDIS_HOST,
        port: redisSchemaConfig.REDIS_PORT,
        name: 'redis-session',
        password: redisSchemaConfig.REDIS_PASSWORD || undefined,
        database: redisSchemaConfig.REDIS_DB,
        keyPrefix: 'sess:',
        maxReconnectRetries: 10,
    }),
    sessionTTL: redisSchemaConfig.REDIS_TTL,
    touchAfter: redisSchemaConfig.REDIS_TOUCH,
}
