import {ILogger} from "../utils/logger/types.logger.js";
import {Shutdown} from "./shutdown.startup.js";
import {handleError} from "../utils/error.utils.js";

/**
 * @file process.startup.ts
 * @summary Process signal/error handlers for graceful shutdown.
 */

/**
 * uk: Обробники процесних подій.
 * en: Process event handlers.
 * cz: Handlery procesních událostí.
 */
export class ProcessHandlers {
    private isExiting: boolean = false;

    /**
     * uk: Реєструє process handlers.
     * en: Registers process handlers.
     * cz: Registruje process handlery.
     * @param logger uk/en/cz: Логер/Logger/Logger.
     * @param shutdownServer uk/en/cz: Shutdown сервіс/Shutdown service/Shutdown služba.
     */
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

        // uk: SIGINT / en: SIGINT / cz: SIGINT
        process.once('SIGINT', async () => {
            this.logger.info('[process] Отримано сигнал SIGINT (Ctrl+C)')
            await shutdownAndExit('SIGINT', 0);
        })

        // uk: SIGTERM / en: SIGTERM / cz: SIGTERM
        process.once('SIGTERM', async () => {
            this.logger.info('[process] Отримано сигнал SIGTERM')
            await shutdownAndExit('SIGTERM', 0);
        })

        // uk: uncaughtException / en: uncaughtException / cz: uncaughtException
        process.once('uncaughtException', async (error) => {
            handleError({
                logger: this.logger,
                scope: "process",
                action: "Неочікувана помилка (uncaughtException)",
                error,
            })
            await shutdownAndExit('uncaughtException', 1);
        })

        // uk: unhandledRejection / en: unhandledRejection / cz: unhandledRejection
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
