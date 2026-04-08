import {ILogger} from "../utils/logger/types.logger.js";
import {AppInstance} from "../types/bot.types.js";
import {redisShutdown} from "./life-cycle/redis.lifeCycle.js";
import {shutDownDb} from "./life-cycle/dataBase.lifeCycle.js";
import {stopBookingExpirationWorker} from "./life-cycle/booking-expiration.lifeCycle.js";
import {handleError} from "../utils/error.utils.js";

/**
 * Getter, який повертає актуальний `AppInstance` або `null`,
 * якщо бот ще не був створений.
 */
type getApp = () => AppInstance | null

/**
 * @file shutdown.startup.ts
 * @summary Оркестратор коректного завершення роботи застосунку.
 */

/**
 * Виконує поетапний shutdown:
 * 1) Telegram-бот
 * 2) Booking-expiration worker
 * 3) PostgreSQL
 * 4) Redis
 * 5) flush/close логера
 */
export class Shutdown {
    private isStopping: boolean = false

    /**
     * @param logger Логер для shutdown-процесу.
     * @param app Getter для доступу до актуального `AppInstance`.
     */
    constructor(
        private logger: ILogger,
        private app: getApp
    ) {}


    /**
     * Виконує один крок shutdown з уніфікованим логуванням помилок.
     *
     * @param stepName Назва кроку для логу.
     * @param action Асинхронна дія кроку.
     */
    private async runStep(stepName: string, action:  () => Promise<void>) {
        try {
         await action()
        }catch(error){
            handleError({
                logger: this.logger,
                scope: "shutdown",
                action: `Крок вимкнення "${stepName}" завершився помилкою`,
                error,
            })
            process.exitCode = 1 // Встановлюємо код помилки, якщо крок завершився невдачею
        }
    }

    /**
     * Коректно зупиняє застосунок.
     *
     * @param signal Сигнал завершення (`SIGINT`, `SIGTERM`, `uncaughtException`, ...).
     * @returns Promise, який завершується після виконання всіх кроків shutdown.
     */
    async stop(signal: string) {
        if (this.isStopping) {
            this.logger.warn('[shutdown] Вимкнення вже виконується, повторний виклик проігноровано',{ signal })
            return
        }
        this.isStopping = true

        // Якщо сигнал є фатальною помилкою, гарантуємо exitCode = 1
        if (signal === 'uncaughtException' || signal === 'unhandledRejection') {
            process.exitCode = 1
        }

        this.logger.info('[shutdown] Розпочато коректне завершення роботи', { signal })

        const app = this.app()

        if(app) {
            await this.runStep('Telegram-Бот', () => app.stop(signal))
        } else {
            this.logger.warn('[shutdown] AppInstance відсутній, крок вимкнення Telegram-бота пропущено', { signal })
        }

        await this.runStep('Booking-expiration-worker', stopBookingExpirationWorker)
        await this.runStep('PostgreSQL', shutDownDb)
        await this.runStep('Redis', redisShutdown)

        // Логуємо фінальний статус перед закриттям логера
        if (process.exitCode === 0) {
            this.logger.info('[shutdown] Завершення роботи виконано успішно', { signal })
        } else {
            this.logger.warn('[shutdown] Завершення роботи виконано з помилками', { signal, exitCode: process.exitCode })
        }

        // Закриття логера
        try {
            await this.logger.flush?.()
            await this.logger.close?.()
        } catch (error) {
            console.error('[shutdown] Помилка під час закриття logger', error);
            // Якщо логер не закрився, це теж проблема
            process.exitCode = 1
        } finally {
            this.isStopping = false
        }

        // Для фатальних сигналів гарантуємо вихід після завершення shutdown
        if (signal === 'uncaughtException' || signal === 'unhandledRejection') {
            process.exit(process.exitCode || 1)
        }
    }
}
