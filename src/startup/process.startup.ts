import {Shutdown} from "./shutdown.startup.js";
import {ILogger} from "../utils/logger/types.logger.js";
import {handleError} from "../utils/error.utils.js";

/**
 * @summary Класс який відповідає за процесси вимикання
 * @param {ILogger} logger - Логер яким ми записуємо логи в файли або консоль
 * @param {Shutdown} shutdownServer - Класс який вимикає сервер
 * @example const example = new ProcessHandlers(logger,Shutdown)
 */
export class ProcessHandlers {

    constructor(
        private logger: ILogger,
        private shutdownServer: Shutdown,
    ) {
        this.handlersProcess()
    }

    /**
     * @summary Функція яка реєструє 4 події
     */
    public handlersProcess(){
        /**
         * SIGTERM - Подія яка викливається сторонім додатком по типу Docker або чимось іншим
         * викликає звичайне ретельне вимкнення сервера
         */
        process.once('SIGTERM',async () => {
            try{
                await this.shutdownServer.stop('SIGTERM')
            }catch(err) {
                handleError({
                    logger: this.logger,
                    scope: "process",
                    action: "Помилка обробки SIGTERM",
                    error: err,
                })
                /** Якщо this.shutdownServer.shutdown не спрацював, викликаємо жорстоке відключення  */
                process.exit(1)
            }
        })
        /** SIGINT - Це теж саме що і SIGTERM тільки SIGINT викликається нами за допомогою клавіш Ctrl+C на Windows або control+C на Mac*/
        process.once('SIGINT', async () => {
            try {
                await this.shutdownServer.stop('SIGINT')
            }catch(err) {
                handleError({
                    logger: this.logger,
                    scope: "process",
                    action: "Помилка обробки SIGINT",
                    error: err,
                })
                /** Якщо this.shutdownServer.shutdown не спрацював, викликаємо жорстоке відключення  */
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
                /** Якщо this.shutdownServer.shutdown не спрацював, викликаємо жорстоке відключення  */
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
                /** Якщо this.shutdownServer.shutdown не спрацював, викликаємо жорстоке відключення  */
                process.exit(1)
            }
        })
    }
}
