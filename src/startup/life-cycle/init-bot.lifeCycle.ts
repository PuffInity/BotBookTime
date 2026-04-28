import {botConfig} from '../../validator/bot.schema.js';
import {createBot} from '../../bot/createBot.js';
import {createRedisSessionStore} from '../../helpers/bot/redis-session-store.bot.js';
import type {AppInstance} from '../../types/bot.types.js';
import {handleError, InternalServerError} from "../../utils/error.utils.js";

import {RedisClient, SessionConfig} from '../../types/redis.types.js';
import {loggerBotInit} from '../../utils/logger/loggers-list.js';

/**
 * @file init-bot.lifeCycle.ts
 * @summary Bot lifecycle factory (start/stop API).
 */

/**
 * uk: Створює AppInstance бота.
 * en: Creates bot AppInstance.
 * cz: Vytváří bot AppInstance.
 * @param redis uk/en/cz: Redis client.
 * @param config uk/en/cz: Session config.
 * @returns uk/en/cz: App lifecycle instance.
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
         * uk: Старт бота з preflight getMe().
         * en: Starts bot with getMe preflight.
         * cz: Spustí bota s getMe preflight.
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
         * uk: Зупинка бота за сигналом.
         * en: Stops bot by signal.
         * cz: Zastaví bota podle signálu.
         * @param signal uk/en/cz: Сигнал/Signal/Signál.
         */
        async stop(signal: string) {
            loggerBotInit.info('[bot] Починаємо зупинку Telegram-бота', {signal});
            bot.stop(signal);
            loggerBotInit.info('[bot] Telegram-бот зупинено');
        },
    };

    return instance
}
