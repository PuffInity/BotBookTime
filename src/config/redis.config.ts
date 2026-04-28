import {redisSchemaConfig} from "../validator/redis.schema.js";
import {BaseConfig,SessionConfig,ParamsForBaseConfig} from "../types/redis.types.js";
import {loggerRedisConfig} from "../utils/logger/loggers-list.js";

/**
 * @file redis.config.ts
 * @summary Redis base config + Telegraf session config.
 */

// uk: Redis логер / en: Redis logger / cz: Redis logger
export const redisLogger = loggerRedisConfig;

/**
 * uk: Будує базовий Redis-конфіг.
 * en: Builds base Redis config.
 * cz: Sestaví základní Redis config.
 * @param params uk/en/cz: Параметри/Params/Parametry.
 * @returns uk/en/cz: Базовий конфіг/Base config/Základní config.
 */
export function makeBaseConfig(params: ParamsForBaseConfig): BaseConfig {
    // uk: Деструктуризація / en: Destructure params / cz: Rozklad parametrů
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
                // uk: TCP keep-alive / en: TCP keep-alive / cz: TCP keep-alive
                keepAlive: 5000,
                // uk: Стратегія reconnect / en: Reconnect strategy / cz: Reconnect strategie
                reconnectStrategy: (retries: number) => {
                    // uk: Ліміт спроб / en: Retry limit / cz: Limit pokusů
                    if (retries > maxReconnectRetries) {
                        redisLogger.error(`[${name}] Перевищено максимальну кількість спроб підключення`);
                        return new Error(`[${name}] reconnect limit exceeded`);
                    }
                    // uk: Базова затримка / en: Base backoff / cz: Základní backoff
                    const base = Math.min(retries * 50, 5000);
                    // uk: Випадковий джиттер / en: Random jitter / cz: Náhodný jitter
                    const jitter = Math.floor(Math.random() * 250);
                    // uk: Фінальна затримка / en: Final delay / cz: Finální zpoždění
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
 * uk: Готовий session config для Telegraf.
 * en: Ready Telegraf session config.
 * cz: Hotový session config pro Telegraf.
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
