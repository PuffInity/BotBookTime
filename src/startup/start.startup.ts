import {ILogger} from "../utils/logger/types.logger.js";
import {AppInstance} from "../types/bot.types.js";
import {initRedis, redis} from "./life-cycle/redis.lifeCycle.js";
import {initDb} from "./life-cycle/dataBase.lifeCycle.js";
import {handleError, InternalServerError} from "../utils/error.utils.js";
import {redisConfig} from "../config/redis.config.js";
import {RedisClient, SessionConfig} from "../types/redis.types.js";
import {startBookingExpirationWorker} from "./life-cycle/booking-expiration.lifeCycle.js";
import {startReminderWorker} from "./life-cycle/reminder.lifeCycle.js";
import { isTwilioConfigured, twilioMissingFields } from "../config/twilio.config.js";

/**
 * uk: Фабрика AppInstance після Redis.
 * en: AppInstance factory after Redis.
 * cz: AppInstance factory po Redis.
 */
type CreateAppInstance = (redis: RedisClient, config: SessionConfig) => AppInstance;

/**
 * @file start.startup.ts
 * @summary Startup orchestrator (Redis -> Postgres -> Bot -> workers).
 */

/**
 * uk: Оркестратор запуску застосунку.
 * en: Application startup orchestrator.
 * cz: Orchestrátor spuštění aplikace.
 */
export class StartApp {
    private started: boolean = false
    private starting: boolean = false
    private app: AppInstance | null = null

    /**
     * uk: Конструктор стартового оркестратора.
     * en: Startup orchestrator constructor.
     * cz: Konstruktor startup orchestrátoru.
     * @param logger uk/en/cz: Логер/Logger/Logger.
     * @param botInit uk/en/cz: Фабрика бота/Bot factory/Bot factory.
     */
    constructor(
        private logger: ILogger,
        private botInit: CreateAppInstance
    ) {
    }

    /**
     * uk: Повертає поточний AppInstance.
     * en: Returns current AppInstance.
     * cz: Vrací aktuální AppInstance.
     */
    public getApp(): AppInstance | null {
        return this.app
    }

    /**
     * uk: Виконує один крок startup.
     * en: Executes one startup step.
     * cz: Provede jeden startup krok.
     * @param stepName uk/en/cz: Назва кроку/Step name/Název kroku.
     * @param action uk/en/cz: Дія/Action/Akce.
     */
    private async runStep(stepName: string, action: () => Promise<void>) {
        try {
            this.logger.info(`[startup] Починаємо крок "${stepName}"`)
            await action()
            this.logger.info(`[startup] Крок "${stepName}" завершено успішно`)
        } catch (error) {
            handleError({
                logger: this.logger,
                scope: "startup",
                action: `Крок запуску "${stepName}" завершився помилкою`,
                error,
            })
            throw error;
        }
    }

    /**
     * uk: Запускає повний lifecycle застосунку.
     * en: Starts full application lifecycle.
     * cz: Spouští celý lifecycle aplikace.
     */
    async start() {
        if (this.starting) {
            this.logger.warn('[startup] Запуск уже виконується, повторний виклик проігноровано')
            return
        }

        if (this.started) {
            this.logger.warn('[startup] Застосунок уже запущений, повторний виклик проігноровано')
            return
        }
        this.starting = true
        this.logger.info('[startup] Запуск застосунку розпочато')
        if (!isTwilioConfigured()) {
            this.logger.warn('[startup] Twilio не налаштовано: підтвердження телефону через SMS тимчасово недоступне', {
                missingFields: twilioMissingFields,
            })
        }


        try {
            await this.runStep('Redis', initRedis)

            if (!redis) {
                this.logger.error('[startup] Redis не ініціалізовано, запуск зупинено')
                throw new InternalServerError('[startup] Redis не ініціалізовано')
            }

            await this.runStep('PostgreSQL', initDb)

            this.app = this.botInit(redis, redisConfig)
            const app = this.app

            if (!app) {
                throw new InternalServerError('[startup] AppInstance бота не створено, запуск зупинено')
            }

            await this.runStep('Telegram-Бот', () => app.start())
            await this.runStep('Booking-expiration-worker', startBookingExpirationWorker)
            await this.runStep('Reminder-worker', startReminderWorker)

        } finally {
            this.starting = false
        }


        this.started = true
        this.logger.info('[startup] Застосунок успішно запущено')
    }
}
