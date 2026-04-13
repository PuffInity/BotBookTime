import {ILogger} from "../utils/logger/types.logger.js";
import {AppInstance} from "../types/bot.types.js";
import {redisShutdown} from "./life-cycle/redis.lifeCycle.js";
import {shutDownDb} from "./life-cycle/dataBase.lifeCycle.js";
import {stopBookingExpirationWorker} from "./life-cycle/booking-expiration.lifeCycle.js";
import {stopReminderWorker} from "./life-cycle/reminder.lifeCycle.js";
import {handleError} from "../utils/error.utils.js";

/**
 * uk: Getter поточного AppInstance.
 * en: Getter for current AppInstance.
 * cz: Getter aktuálního AppInstance.
 */
type getApp = () => AppInstance | null

/**
 * @file shutdown.startup.ts
 * @summary Graceful shutdown orchestrator.
 */

/**
 * uk: Оркестратор вимкнення застосунку.
 * en: Application shutdown orchestrator.
 * cz: Orchestrátor vypnutí aplikace.
 */
export class Shutdown {
    private shutdownPromise: Promise<void> | null = null
    private isShuttingDown: boolean = false

    /**
     * uk: Конструктор shutdown оркестратора.
     * en: Shutdown orchestrator constructor.
     * cz: Konstruktor shutdown orchestrátoru.
     * @param logger uk/en/cz: Логер/Logger/Logger.
     * @param app uk/en/cz: Getter app/Get app/Getter app.
     */
    constructor(
        private logger: ILogger,
        private app: getApp
    ) {}


    /**
     * uk: Виконує один крок shutdown.
     * en: Executes one shutdown step.
     * cz: Provede jeden shutdown krok.
     * @param stepName uk/en/cz: Назва кроку/Step name/Název kroku.
     * @param action uk/en/cz: Дія/Action/Akce.
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
     * uk: Запускає graceful shutdown.
     * en: Starts graceful shutdown.
     * cz: Spustí graceful shutdown.
     * @param signal uk/en/cz: Сигнал/Signal/Signál.
     */
    async stop(signal: string) {
        if (this.isShuttingDown) {
            this.logger.warn('[shutdown] Shutdown already in progress, ignoring', { signal })
            return this.shutdownPromise!
        }
        this.isShuttingDown = true
        this.shutdownPromise = this.performShutdown(signal)
        return this.shutdownPromise
    }

    /**
     * uk: Внутрішній сценарій shutdown.
     * en: Internal shutdown flow.
     * cz: Interní shutdown flow.
     * @param signal uk/en/cz: Сигнал/Signal/Signál.
     */
    private async performShutdown(signal: string) {
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
        await this.runStep('Reminder-worker', stopReminderWorker)
        await this.runStep('PostgreSQL', shutDownDb)
        await this.runStep('Redis', redisShutdown)

        // Логуємо фінальний статус перед закриттям логера
        if ((process.exitCode ?? 0) === 0) {
            this.logger.info('[shutdown] Завершення роботи виконано успішно', { signal })
        } else {
            this.logger.warn('[shutdown] Завершення роботи виконано з помилками', { signal, exitCode: process.exitCode ?? 1 })
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
            this.isShuttingDown = false
            this.shutdownPromise = null
        }
    }
}
