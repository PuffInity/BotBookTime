import {createAppLogger} from "./logger.js";

/**
 * @file loggers-list.ts
 * @summary Попередньо налаштовані логери для основних модулів застосунку.
 */

/** Логер Redis lifecycle-модуля. */
export const loggerR = createAppLogger({service: 'redis-life-cycle'})

/** Логер ініціалізації Telegram-бота. */
export const loggerBotInit = createAppLogger({service: 'init-bot'})

/** Логер bootstrap/startup рівня застосунку. */
export const loggerInitApp = createAppLogger({service: 'init-app'})
