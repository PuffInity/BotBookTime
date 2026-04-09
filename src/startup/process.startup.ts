import {ILogger} from "../utils/logger/types.logger.js";
import {Shutdown} from "./shutdown.startup.js";
import {handleError} from "../utils/error.utils.js";

/**
 * @class ProcessHandlers
 * @summary Клас який обробляє системні події
 */
export class ProcessHandlers {
    private isExiting: boolean = false;

    constructor(
        private readonly logger: ILogger,
        private readonly shutdownServer: Shutdown
    ) {
        const shutdownAndExit = async (signal: string, defaultExitCode: number = 0) => {
            if (this.isExiting) return;
            this.isExiting = true;

            try {
                await this.shutdownServer.stop(signal);
            } catch (error) {
                handleError({
                    logger: this.logger,
                    scope: "process",
                    action: `Помилка під час shutdown (${signal})`,
                    error,
                });
                process.exitCode = 1;
            }

            process.exit(process.exitCode ?? defaultExitCode);
        };

        /** SIGINT - Подія яка викликається в випадку Ctrl+C або зупинки процесу в Docker/PM2 */
        process.once('SIGINT', async () => {
            this.logger.info('[process] Отримано сигнал SIGINT (Ctrl+C)')
            await shutdownAndExit('SIGINT', 0);
        })

        /** SIGTERM - Подія яка викликається в випадку зупинки контейнера або завершення процесу */
        process.once('SIGTERM', async () => {
            this.logger.info('[process] Отримано сигнал SIGTERM')
            await shutdownAndExit('SIGTERM', 0);
        })

        /** uncaughtException - Подія викликається в випадку необробленої синхроної помилки */
        process.once('uncaughtException', async (error) => {
            handleError({
                logger: this.logger,
                scope: "process",
                action: "Неочікувана помилка (uncaughtException)",
                error,
            })
            await shutdownAndExit('uncaughtException', 1);
        })

        /** unhandledRejection - Подія яка викликається в випадку необробленої асинхроної помилки */
        process.once('unhandledRejection', async (reason,_promise) => {
            handleError({
                logger: this.logger,
                scope: "process",
                action: "Неочікувана помилка (unhandledRejection)",
                error: reason,
            })
            await shutdownAndExit('unhandledRejection', 1);
        })
    }
}
