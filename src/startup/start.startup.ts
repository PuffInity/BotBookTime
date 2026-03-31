import {ILogger} from "../utils/logger/types.logger.js";
import {AppInstance} from "../types/bot.types.js";
import {initRedis, redis} from "./life-cycle/redis.lifeCycle.js";
import {initDb} from "./life-cycle/dataBase.lifeCycle.js";
import {handleError} from "../utils/error.utils.js";
import {redisConfig} from "../config/redis.config.js";
import {RedisClient, SessionConfig} from "../types/redis.types.js";
import {startBookingExpirationWorker} from "./life-cycle/booking-expiration.lifeCycle.js";

/**
 * Фабрика створення `AppInstance` після отримання готового Redis-клієнта.
 */
type CreateAppInstance = (redis: RedisClient, config: SessionConfig) => AppInstance;

/**
 * @file start.startup.ts
 * @summary Оркестратор старту застосунку (Redis -> PostgreSQL -> Telegram-бот -> booking-expiration worker).
 */

/**
 * Керує послідовністю запуску та захищає від повторних викликів `start()`.
 */
export class StartApp {
    private started: boolean = false
    private starting: boolean = false
    private app: AppInstance | null = null

    /**
     * @param logger Логер стартового процесу.
     * @param botInit Фабрика створення бота.
     */
    constructor(
        private logger: ILogger,
        private botInit: CreateAppInstance
    ) {
    }

    /**
     * Повертає поточний `AppInstance`, якщо він уже створений.
     *
     * @returns `AppInstance` або `null`, якщо бот ще не ініціалізовано.
     */
    public getApp(): AppInstance | null {
        return this.app
    }

    /**
     * Запускає один крок старту з уніфікованим логуванням помилок.
     *
     * @param stepName Назва кроку для логу.
     * @param action Асинхронна дія кроку.
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
     * Запускає застосунок у фіксованому порядку:
     * 1) Redis
     * 2) PostgreSQL
     * 3) Telegram-бот
     * 4) Booking-expiration worker
     *
     * @returns Promise, який завершується після успішного старту.
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


        try {
            await this.runStep('Redis', initRedis)

            if (!redis) {
                this.logger.error('[startup] Redis не ініціалізовано, запуск зупинено')
                throw new Error('[startup] Redis не ініціалізовано')
            }

            await this.runStep('PostgreSQL', initDb)

            this.app = this.botInit(redis, redisConfig)
            const app = this.app

            if (!app) {
                throw new Error('[startup] AppInstance бота не створено, запуск зупинено')
            }

            await this.runStep('Telegram-Бот', () => app.start())
            await this.runStep('Booking-expiration-worker', startBookingExpirationWorker)

        } finally {
            this.starting = false
        }


        this.started = true
        this.logger.info('[startup] Застосунок успішно запущено')
    }
}
