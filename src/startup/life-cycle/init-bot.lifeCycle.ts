import {botConfig} from '../../validator/bot.schema.js';
import {createBot} from '../../bot/createBot.js';
import {createRedisSessionStore} from '../../helpers/bot/redis-session-store.bot.js';
import type {AppInstance} from '../../types/bot.types.js';
import {handleError, InternalServerError} from "../../utils/error.utils.js";

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
        throw new InternalServerError(initErrorMessage);
    }

    loggerBotInit.info('[bot] Ініціалізація Telegram-бота розпочата')

    const sessionStore = createRedisSessionStore(redis, config);
    loggerBotInit.info('[bot] Redis session store створено')

    const bot = createBot({
        token: botConfig.BOT_TOKEN,
        sessionStore,
    });
    loggerBotInit.info('[bot] Інстанс Telegraf створено')

    const instance: AppInstance = {
        /**
         * Запускає Telegram-бота після попередньої перевірки токена через `getMe()`.
         *
         * @returns Promise, що завершується після успішного запуску бота.
         * @throws {Error} Якщо перевірка токена або запуск бота завершилися помилкою.
         */
        async start() {
            try {
                loggerBotInit.info('[bot] Перевіряємо токен через getMe()')
                const me = await bot.telegram.getMe(); // Додаткова перевірка токена перед launch
                loggerBotInit.info('[bot] Токен валідний', {
                    botId: me.id,
                    username: me.username,
                })
                loggerBotInit.info('[bot] Викликаємо launch()')
                await bot.launch();
                loggerBotInit.info('[bot] launch() завершено успішно')
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
