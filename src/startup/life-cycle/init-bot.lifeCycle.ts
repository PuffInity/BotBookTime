import {botConfig} from '../../validator/bot.schema.js';
import {createBot} from '../../bot/createBot.js';
import {createRedisSessionStore} from '../../helpers/bot/redis-session-store.bot.js';
import type {AppInstance} from '../../types/bot.types.js';
import {handleError} from "../../utils/error.utils.js";

import {RedisClient, SessionConfig} from '../../types/redis.types.js';
import {loggerBotInit} from '../../utils/logger/loggers-list.js';

/**
 * Ініціалізує Telegram-бота та повертає керуючий lifecycle API (`start`, `stop`).
 *
 * Створює Redis session store, інстанс бота та інкапсулює запуск/зупинку
 * застосунку в одному об'єкті.
 *
 * @param redis Підключений Redis-клієнт для зберігання сесій бота.
 * @param config Конфігурація Redis session store.
 * @returns Об'єкт застосунку з методами керування життєвим циклом бота.
 * @throws {Error} Якщо `redis` або `config` не передані.
 */
export function botInit(redis: RedisClient, config: SessionConfig): AppInstance {
    if (!redis || !config) {
        const initErrorMessage =
            '[bot] Redis не ініціалізовано перед запуском Telegram-бота';
        loggerBotInit.error(initErrorMessage);
        throw new Error(initErrorMessage);
    }

    const sessionStore = createRedisSessionStore(redis, config);

    const bot = createBot({
        token: botConfig.BOT_TOKEN,
        sessionStore,
    });

    const instance: AppInstance = {
        /**
         * Запускає Telegram-бота після попередньої перевірки токена через `getMe()`.
         *
         * @returns Promise, що завершується після успішного запуску бота.
         * @throws {Error} Якщо перевірка токена або запуск бота завершилися помилкою.
         */
        async start() {
            try {
                await bot.telegram.getMe(); // Додаткова перевірка токена перед launch
                await bot.launch();
                loggerBotInit.info('[bot] Telegram-бот запущено');
            } catch (error) {
                handleError({
                    logger: loggerBotInit,
                    scope: "bot",
                    action: "Помилка запуску Telegram-бота",
                    error,
                })
                throw error;
            }
        },

        /**
         * Зупиняє Telegram-бота.
         *
         * @param signal Назва сигналу/причини зупинки (наприклад, `SIGINT`, `SIGTERM`).
         * @returns Promise, що завершується після виклику зупинки бота.
         */
        async stop(signal: string) {
            loggerBotInit.info('[bot] Починаємо зупинку Telegram-бота', {signal});
            bot.stop(signal);
            loggerBotInit.info('[bot] Telegram-бот зупинено');
        },
    };

    return instance
}
