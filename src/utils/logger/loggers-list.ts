import {createAppLogger} from "./logger.js";

/**
 * uk: Список логерів
 * en: Logger list
 * cz: Seznam loggerů
 */

/** uk: Redis lifecycle | en: Redis lifecycle | cz: Redis lifecycle */
export const loggerR = createAppLogger({service: 'redis-life-cycle'})

/** uk: Redis config | en: Redis config | cz: Redis config */
export const loggerRedisConfig = createAppLogger({service: 'redis-config'})

/** uk: Bot init | en: Bot init | cz: Bot init */
export const loggerBotInit = createAppLogger({service: 'init-bot'})

/** uk: Bot core | en: Bot core | cz: Bot core */
export const loggerTelegramBot = createAppLogger({service: 'telegram-bot'})

/** uk: App startup | en: App startup | cz: App startup */
export const loggerInitApp = createAppLogger({service: 'init-app'})

/** uk: Mailer | en: Mailer | cz: Mailer */
export const loggerMailer = createAppLogger({service: 'mailer'})

/** uk: Database | en: Database | cz: Databáze */
export const loggerDb = createAppLogger({service: 'database'})

/** uk: Notification | en: Notification | cz: Notifikace */
export const loggerNotification = createAppLogger({service: 'notification'})

/** uk: Migration | en: Migration | cz: Migrace */
export const loggerMigration = createAppLogger({service: 'migration'})

/** uk: Error utils | en: Error utils | cz: Error utils */
export const loggerErrorUtils = createAppLogger({service: 'error-utils'})

/** uk: Admin panel | en: Admin panel | cz: Admin panel */
export const loggerAdminPanel = createAppLogger({service: 'admin-panel'})

/** uk: Translate config | en: Translate config | cz: Translate config */
export const loggerTranslateConfig = createAppLogger({service: 'translate-config'})

/** uk: Translate runtime | en: Translate runtime | cz: Translate runtime */
export const loggerTranslate = createAppLogger({service: 'translate'})

/** uk: Ops scripts | en: Ops scripts | cz: Ops skripty */
export const loggerScripts = createAppLogger({service: 'scripts'})
