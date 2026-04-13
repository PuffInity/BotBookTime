import {AsyncLocalStorage} from "node:async_hooks";

/**
 * uk: Контекст request id
 * en: Request id context
 * cz: Kontext request id
 */

/**
 * uk: Тип контексту
 * en: Context type
 * cz: Typ kontextu
 */
export type Context = { requestId?: string};

/** uk: ALS сховище | en: ALS storage | cz: ALS úložiště */
const storage = new AsyncLocalStorage<Context>();

/**
 * uk: API контексту
 * en: Context API
 * cz: API kontextu
 */
export const RequestContext = {
    /**
     * uk: Запуск у контексті
     * en: Run in context
     * cz: Spustit v kontextu
     */
    run<T>(ctx: Context, cb: () => T):T {
        return storage.run(ctx, cb);
    },

    /**
     * uk: Отримати контекст
     * en: Get context
     * cz: Získat kontext
     */
    get(): Context {
        return storage.getStore() ?? {}
    },

    /**
     * uk: Отримати request id
     * en: Get request id
     * cz: Získat request id
     */
    getRequestId(): string | undefined {
        return storage.getStore()?.requestId;
    }
}
