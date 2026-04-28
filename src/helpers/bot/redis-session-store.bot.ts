import type { SessionStore } from 'telegraf';
import type {RedisClient} from "../../types/redis.types.js";
import type { MySession } from '../../types/bot.types.js';
import type { SessionConfig } from '../../types/redis.types.js';

/**
 * @file redis-session-store.bot.ts
 * @summary Створює Redis-сховище для Telegraf session middleware на базі вже готового Redis client.
 */

/**
 * Ми НЕ створюємо новий Redis client всередині store.
 * Store працює через той самий client, який уже створений в init-bot.lifeCycle.ts.
 *
 * Це дає:
 * - один контрольований Redis client
 * - один source of truth для конфігу
 * - усі reconnect/timeout/logging опції застосовуються реально
 */
export function createRedisSessionStore(
    client: RedisClient,
    config: SessionConfig,
): SessionStore<MySession> {
    /**
     * Локальний кеш останнього запису потрібен для `touchAfter`:
     * якщо сесія не змінилась, ми можемо не робити повний SET щоразу,
     * а лише оновити TTL (EXPIRE).
     */
    const lastSerializedByKey = new Map<string, string>();
    const lastWriteAtMsByKey = new Map<string, number>();

    /**
     * Формує Redis-ключ для конкретної Telegraf session.
     * @param {string} sessionKey - Ключ сесії, який генерує Telegraf.
     * @returns {string} Ключ з префіксом (наприклад `sess:123:456`).
     */
    const makeKey = (sessionKey: string): string => `${config.keyPrefix}${sessionKey}`;

    return {
        /**
         * Читає сесію з Redis та десеріалізує JSON в об'єкт сесії.
         * @param {string} sessionKey - Ключ сесії від Telegraf.
         * @returns {Promise<MySession | undefined>} Сесія або undefined, якщо даних немає/JSON битий.
         */
        async get(sessionKey) {
            const key = makeKey(sessionKey);
            const raw = await client.get(key);

            if (!raw) {
                lastSerializedByKey.delete(key);
                lastWriteAtMsByKey.delete(key);
                return undefined;
            }

            try {
                const parsed = JSON.parse(raw) as MySession;
                lastSerializedByKey.set(key, raw);
                return parsed;
            } catch {
                // Якщо в Redis з якихось причин лежить битий JSON — не валимо бота.
                return undefined;
            }
        },

        /**
         * Зберігає/оновлює сесію в Redis з TTL.
         * Якщо значення не змінилося і ще не минув `touchAfter`,
         * робить тільки `EXPIRE`, щоб зменшити кількість повних записів.
         *
         * @param {string} sessionKey - Ключ сесії від Telegraf.
         * @param {MySession} value - Значення сесії, яке треба зберегти.
         * @returns {Promise<void>}
         */
        async set(sessionKey, value) {
            const key = makeKey(sessionKey);
            const serialized = JSON.stringify(value);
            const now = Date.now();

            const lastSerialized = lastSerializedByKey.get(key);
            const lastWriteAt = lastWriteAtMsByKey.get(key) ?? 0;
            const touchWindowMs = config.touchAfter * 1000;

            /**
             * Якщо значення не змінилось і минуло мало часу — просто "оновлюємо життя" ключа.
             * Це зменшує кількість повних записів у Redis.
             */
            if (lastSerialized === serialized && now - lastWriteAt < touchWindowMs) {
                await client.expire(key, config.sessionTTL);
                return;
            }

            await client.set(key, serialized, {
                EX: config.sessionTTL,
            });

            lastSerializedByKey.set(key, serialized);
            lastWriteAtMsByKey.set(key, now);
        },

        /**
         * Видаляє сесію з Redis та чистить локальний службовий кеш для цього ключа.
         * @param {string} sessionKey - Ключ сесії від Telegraf.
         * @returns {Promise<void>}
         */
        async delete(sessionKey) {
            const key = makeKey(sessionKey);
            lastSerializedByKey.delete(key);
            lastWriteAtMsByKey.delete(key);
            await client.del(key);
        },
    };
}
