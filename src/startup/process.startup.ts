import {ILogger} from "../utils/logger/types.logger.js";
import {Shutdown} from "./shutdown.startup.js";
import {handleError} from "../utils/error.utils.js";

/**
 * @class ProcessHandlers
 * @summary Клас який обробляє системні події
 */
export class ProcessHandlers {
    constructor(
        private readonly logger: ILogger,
        private readonly shutdownServer: Shutdown
    ) {
        /** SIGINT - Подія яка викликається в випадку Ctrl+C або зупинки процесу в Docker/PM2 */
        process.on('SIGINT', async () => {
            this.logger.info('[process] Отримано сигнал SIGINT (Ctrl+C)')
            try {
                await this.shutdownServer.stop('SIGINT')
                process.exit(0)
            } catch (err) {
                handleError({
                    logger: this.logger,
                    scope: "process",
                    action: "Помилка обробки SIGINT",
                    error: err,
                })
                process.exit(1)
            }
        })

        /** SIGTERM - Подія яка викликається в випадку зупинки контейнера або завершення процесу */
        process.on('SIGTERM', async () => {
            this.logger.info('[process] Отримано сигнал SIGTERM')
            try {
                await this.shutdownServer.stop('SIGTERM')
                process.exit(0)
            } catch (err) {
                handleError({
                    logger: this.logger,
                    scope: "process",
                    action: "Помилка обробки SIGTERM",
                    error: err,
                })
                process.exit(1)
            }
        })

        /** uncaughtException - Подія викликається в випадку необробленої синхроної помилки */
        process.on('uncaughtException', async (error) => {
            handleError({
                logger: this.logger,
                scope: "process",
                action: "Неочікувана помилка (uncaughtException)",
                error,
            })
            try {
                await this.shutdownServer.stop('uncaughtException')
            } catch(err) {
                handleError({
                    logger: this.logger,
                    scope: "process",
                    action: "Помилка shutdown після uncaughtException",
                    error: err,
                })
            } finally {
                process.exit(1)
            }
        })

        /** unhandledRejection - Подія яка викликається в випадку необробленої асинхроної помилки */
        process.on('unhandledRejection', async (reason,_promise) => {
            handleError({
                logger: this.logger,
                scope: "process",
                action: "Неочікувана помилка (unhandledRejection)",
                error: reason,
            })
            try {
                await this.shutdownServer.stop('unhandledRejection')
            } catch(err) {
                handleError({
                    logger: this.logger,
                    scope: "process",
                    action: "Помилка shutdown після unhandledRejection",
                    error: err,
                })
            } finally {
                process.exit(1)
            }
        })
    }
}
