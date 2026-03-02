import dotenv from "dotenv";
import {StartApp} from "./startup/start.startup.js";
import {ProcessHandlers} from "./startup/process.startup.js";
import {botInit} from "./startup/life-cycle/init-bot.lifeCycle.js";
import {loggerInitApp} from "./utils/logger/loggers-list.js";
import {Shutdown} from "./startup/shutdown.startup.js";
import {handleError} from "./utils/error.utils.js";

dotenv.config()
try {
    loggerInitApp.info('[bootstrap] Ініціалізація застосунку розпочата')
    const app = new StartApp(
        loggerInitApp,
        botInit,
    )
    loggerInitApp.info('[bootstrap] StartApp створено')

    const shutdown = new Shutdown(
        loggerInitApp,
        () => app.getApp()
    )
    loggerInitApp.info('[bootstrap] Shutdown створено')


    new ProcessHandlers(
        loggerInitApp,
        shutdown
    )
    loggerInitApp.info('[bootstrap] Process handlers зареєстровано')

    await app.start()
    loggerInitApp.info('[bootstrap] Bootstrap завершено успішно')

} catch (error) {
    handleError({
        logger: loggerInitApp,
        scope: "bootstrap",
        action: "Фатальна помилка запуску застосунку",
        error,
    })
    process.exit(1)
}
