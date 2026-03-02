import dotenv from "dotenv";
import {StartApp} from "./startup/start.startup.js";
import {ProcessHandlers} from "./startup/process.startup.js";
import {botInit} from "./startup/life-cycle/init-bot.lifeCycle.js";
import {loggerInitApp} from "./utils/logger/loggers-list.js";
import {Shutdown} from "./startup/shutdown.startup.js";
import {handleError} from "./utils/error.utils.js";

dotenv.config()
try {
    const app = new StartApp(
        loggerInitApp,
        botInit,
    )

    const shutdown = new Shutdown(
        loggerInitApp,
        () => app.getApp()
    )


    new ProcessHandlers(
        loggerInitApp,
        shutdown
    )

    await app.start()

} catch (error) {
    handleError({
        logger: loggerInitApp,
        scope: "bootstrap",
        action: "Фатальна помилка запуску застосунку",
        error,
    })
    process.exit(1)
}
