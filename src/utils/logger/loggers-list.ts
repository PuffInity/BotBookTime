import {createAppLogger} from "./logger.js";

/**
 * @file loggers-list.ts
 * @summary Попередньо налаштовані логери для основних модулів застосунку.
 */

/** Логер Redis lifecycle-модуля. */
export const loggerR = createAppLogger({service: 'redis-life-cycle'})

/** Логер Redis config-модуля. */
export const loggerRedisConfig = createAppLogger({service: 'redis-config'})

/** Логер ініціалізації Telegram-бота. */
export const loggerBotInit = createAppLogger({service: 'init-bot'})

/** Логер core Telegraf-бота (middleware/updates). */
export const loggerTelegramBot = createAppLogger({service: 'telegram-bot'})

/** Логер bootstrap/startup рівня застосунку. */
export const loggerInitApp = createAppLogger({service: 'init-app'})

/** Логер email/mailer модуля. */
export const loggerMailer = createAppLogger({service: 'mailer'})

/** Логер PostgreSQL config/lifecycle/helper модулів. */
export const loggerDb = createAppLogger({service: 'database'})

/** Логер модуля сповіщень (policy/dispatch/channels). */
export const loggerNotification = createAppLogger({service: 'notification'})

/** Логер migration engine (runner/tracker/base). */
export const loggerMigration = createAppLogger({service: 'migration'})

/** Логер централізованого error-utils модуля. */
export const loggerErrorUtils = createAppLogger({service: 'error-utils'})

/** Логер адмін-панелі (критичні дії адміністратора). */
export const loggerAdminPanel = createAppLogger({service: 'admin-panel'})
